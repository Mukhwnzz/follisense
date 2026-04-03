import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, Check, Eye, Stethoscope, Search, Camera, ShieldCheck, ImageIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { computeHistoricalRisk, getTriageGuidance } from '@/utils/triageLogic';
import type { CheckInData, HealthProfileData } from '@/contexts/AppContext';
import { Leaf } from 'lucide-react';
import ScalpBaselineCapture from '@/components/ScalpBaselineCapture';

// ─── Image imports ───────────────────────────────────────────────────────────
import hairType4Hero from '@/assets/hair-type4-hero.png';
import hairType3Hero from '@/assets/hair-type3-hero.png';
import hair4aBack from '@/assets/hair-4a-back.png';
import hair4bBack from '@/assets/hair-4b-back.png';
import hair4cBack from '@/assets/hair-4c-back.png';
import hair3bBack from '@/assets/hair-3b-back.png';
import hair3cBack from '@/assets/hair-3c-back.png';

import scalpFrontFemale from '@/assets/scalp-front-female.jpeg';
import scalpSideFemale from '@/assets/scalp-side-female.jpeg';
import scalpBackFemale from '@/assets/scalp-back-female.jpeg';
import scalpTopFemale from '@/assets/scalp-top-female.jpeg';
import scalpSideMaleA from '@/assets/scalp-side-male-a.jpeg';
import scalpSideMaleB from '@/assets/scalp-side-male-b.jpeg';
import scalpBackMale from '@/assets/scalp-back-male.png';
import scalpTopMale from '@/assets/scalp-top-male.png';

// ─── HAIR TYPE DATA ──────────────────────────────────────────────────────────
const hairTypes = [
  { id: 'type4', label: 'Type 4: Coily', desc: 'Tight coils or zig-zag pattern, dense texture, significant shrinkage' },
  { id: 'type3', label: 'Type 3: Curly', desc: 'Visible curl pattern, S-shaped curls, looser texture' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay. We'll use the most inclusive settings" },
];

const heroImages: Record<string, string> = {
  type4: hairType4Hero,
  type3: hairType3Hero,
};

interface SubTypeOption {
  id: string;
  label: string;
  image?: string;
}

const subTypes: Record<string, SubTypeOption[]> = {
  type4: [
    { id: '4a', label: '4A', image: hair4aBack },
    { id: '4b', label: '4B', image: hair4bBack },
    { id: '4c', label: '4C', image: hair4cBack },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  type3: [
    { id: '3a', label: '3A', image: '' },
    { id: '3b', label: '3B', image: hair3bBack },
    { id: '3c', label: '3C', image: hair3cBack },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
};

// ─── STYLE OPTIONS ───────────────────────────────────────────────────────────
const femaleStyleOptions = [
  'Braids', 'Locs', 'Twists', 'Twist out', 'Wig', 'Weave', 'Silk press',
  'Blow out', 'Loose natural', 'Wash and go', 'Cornrows', 'Other',
];

const maleStyleOptions = [
  'Low cut / fade', 'Waves', 'Locs', 'Twists', 'Cornrows', 'Afro',
  'High top', 'Bald / shaved', 'Other',
];

const maleShortStyleNames = ['Low cut / fade', 'Waves', 'Bald / shaved', 'High top'];
const maleLongStyleNames = ['Locs', 'Twists', 'Cornrows'];

const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const barberFreqOptions = ['Every 1-2 weeks', 'Every 3-4 weeks', 'Monthly', 'Less often', 'I cut my own hair'];
const cycleLengthOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness',
  'Going grey or premature greying',
  'I just want to stay on top of things', 'Not sure',
];
const maleShortHairConcerns = [
  'Itching', 'Flaking', 'Thinning', 'Razor bumps or ingrowns', 'Irritation after cuts',
  'Dryness', 'Going grey or premature greying',
  'I just want to stay on top of things', 'Not sure',
];

const maleShortHairSymptoms = [
  { key: 'itch', label: 'Itching', question: 'Have you noticed any scalp itching in the last few weeks?' },
  { key: 'flaking', label: 'Flaking', question: 'Have you noticed any flaking or dandruff in the last few weeks?' },
  { key: 'tenderness', label: 'Tenderness', question: 'Have you noticed any scalp tenderness or pain in the last few weeks?' },
  { key: 'hairline', label: 'Thinning', question: 'Have you noticed any thinning or hair loss in the last few weeks?' },
  { key: 'razorBumps', label: 'Razor bumps or ingrowns', question: 'Have you noticed any razor bumps or ingrown hairs in the last few weeks?' },
  { key: 'barberIrritation', label: 'Irritation after barber visits', question: 'Have you noticed any irritation after barber visits in the last few weeks?' },
  { key: 'bumps', label: 'Bumps or irritation', question: 'Have you noticed any bumps or raised areas on your scalp in the last few weeks?' },
  { key: 'dryness', label: 'Dryness', question: 'Have you noticed any scalp dryness in the last few weeks?' },
];

const maleShortHairDescriptorOverrides: Record<string, Record<string, string>> = {
  flaking: { None: 'No flaking', Mild: 'A few flakes when you scratch or rub', Moderate: 'Visible flakes on your scalp or collar', Severe: "Heavy, persistent flaking that won't clear" },
  tenderness: { None: 'No tenderness', Mild: 'Slight sensitivity when you touch or press', Moderate: 'Sore to touch, especially after a cut', Severe: 'Painful without touching, or sharp pain when pressed' },
  hairline: { None: 'No thinning', Mild: 'Slightly thinner at the crown or temples', Moderate: 'Noticeably thinner areas, scalp more visible', Severe: 'Scalp clearly visible, hairline receding' },
  razorBumps: { None: 'No razor bumps', Mild: 'A few bumps after a cut, go away on their own', Moderate: 'Regular bumps after cuts, some painful or inflamed', Severe: 'Persistent bumps, painful, some with pus or scarring' },
  barberIrritation: { None: 'No irritation after cuts', Mild: 'Slight redness or sensitivity for a day or two', Moderate: 'Burning, stinging, or rash lasting several days', Severe: 'Intense reaction every time, open sores or lasting marks' },
  dryness: { None: 'No dryness', Mild: 'Slightly dry or tight between washes', Moderate: 'Dry and ashy despite moisturising', Severe: 'Extremely dry, flaking, or painful tightness' },
};

// ─── CHEMICAL PROCESSING ─────────────────────────────────────────────────────
const chemicalOptions = [
  { id: 'natural', label: 'No, fully natural' },
  { id: 'current', label: 'Yes, currently' },
  { id: 'growing-out', label: 'Previously, growing out' },
  { id: 'unsure', label: 'Not sure' },
];

const chemicalTypeOptions = ['Relaxer', 'Texturiser', 'Keratin treatment', 'Other'];
const lastTreatmentOptions = [
  'Less than 4 weeks ago', '4 to 8 weeks ago', '2 to 3 months ago',
  '3 to 6 months ago', 'More than 6 months ago', 'Currently growing out',
];
const chemicalFreqOptions = [
  'Every 4 to 6 weeks', 'Every 8 to 12 weeks', 'Every 3 to 6 months',
  'Less often', 'Stopped',
];

// ─── GENDER OPTIONS ──────────────────────────────────────────────────────────
const genderOptions = [
  { id: 'woman', label: 'Female', icon: '♀' },
  { id: 'man', label: 'Male', icon: '♂' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', icon: '—' },
];

// ─── SYMPTOM CHECKLIST (with timeframes for onboarding) ──────────────────────
const onboardingSymptoms = [
  { key: 'itch', label: 'Itching', question: 'Have you noticed any scalp itching in the last few weeks?' },
  { key: 'flaking', label: 'Flaking', question: 'Have you noticed any flaking or dandruff in the last few weeks?' },
  { key: 'tenderness', label: 'Tenderness', question: 'Have you noticed any scalp tenderness or pain in the last few weeks?' },
  { key: 'hairline', label: 'Thinning', question: 'Have you noticed any thinning or hair loss in the last few weeks?' },
  { key: 'edgeLoss', label: 'Edge loss', question: 'Have you noticed any edge loss or hairline thinning in the last few weeks, especially after removing a style?' },
  { key: 'shedding', label: 'Breakage', question: 'Have you noticed any breakage or excessive shedding in the last few weeks?' },
  { key: 'bumps', label: 'Bumps', question: 'Have you noticed any bumps or raised areas on your scalp in the last few weeks?' },
  { key: 'dryness', label: 'Dryness', question: 'Have you noticed any scalp dryness in the last few weeks?' },
];
const severityOptions = ['None', 'Mild', 'Moderate', 'Severe'];

// ─── WARM ACKNOWLEDGMENTS ────────────────────────────────────────────────────
const symptomAcks: Record<string, { mild: string; moderate: string; severe: string }> = {
  itch: {
    mild: "Noted. We'll keep an eye on this one.",
    moderate: "That level of itching is worth tracking. We'll watch how it changes.",
    severe: "Constant itching can really affect your day. Let's make this a priority.",
  },
  flaking: {
    mild: "Noted. We'll factor this in.",
    moderate: "More flaking than usual. Worth monitoring over your next few check-ins.",
    severe: "Heavy flaking like that needs attention. We'll stay on top of this with you.",
  },
  tenderness: {
    mild: "Good that you flagged it. We'll check on this next time.",
    moderate: "Tenderness like that can signal something underneath. We'll keep tracking.",
    severe: "Pain on your scalp shouldn't be ignored. That's important information.",
  },
  hairline: {
    mild: "Slight changes in density are hard to spot. Good that you noticed.",
    moderate: "Noticeable thinning is worth paying attention to. We'll track this closely.",
    severe: "Significant thinning deserves professional input. We'll help you take the right next step.",
  },
  edgeLoss: {
    mild: "Noted. We'll track this one closely.",
    moderate: "Edge thinning at this level is worth watching closely. Good that you flagged it.",
    severe: "Significant edge loss needs attention soon. A professional can help before it progresses.",
  },
  shedding: {
    mild: "Noted. We'll see how this tracks over time.",
    moderate: "More breakage than expected. Could be worth looking at your routine.",
    severe: "That level of breakage can signal something deeper going on. Good that you're telling us.",
  },
  bumps: {
    mild: "Noted. We'll see if they persist.",
    moderate: "Multiple bumps are worth keeping an eye on. Noted.",
    severe: "That sounds really uncomfortable. A professional should take a look at this soon.",
  },
  dryness: {
    mild: "Noted. We'll factor this into your profile.",
    moderate: "Persistent dryness can affect your scalp barrier. We'll track this.",
    severe: "Severe dryness can lead to other problems if left unchecked. We're noting this carefully.",
  },
  razorBumps: {
    mild: "Noted. We'll track whether these are recurring.",
    moderate: "Regular bumps after cuts are worth investigating. We're on it.",
    severe: "Persistent razor bumps can lead to scarring. A professional can help.",
  },
  barberIrritation: {
    mild: "Noted. We'll see if there's a pattern.",
    moderate: "Reactions like that aren't something you should just live with. We'll track this.",
    severe: "That kind of reaction every time needs professional attention.",
  },
};

// ─── SEVERITY DESCRIPTORS ────────────────────────────────────────────────────
const severityDescriptors: Record<string, Record<string, string>> = {
  itch: { None: 'No itching', Mild: 'Occasional itch, easy to ignore', Moderate: 'Frequent itching, hard to leave alone', Severe: 'Constant itching, disrupts your day' },
  flaking: { None: 'No flaking', Mild: 'A few flakes when you scratch or part', Moderate: 'Visible flakes on your scalp or clothes', Severe: 'Heavy, persistent flaking that won\'t clear' },
  tenderness: { None: 'No tenderness', Mild: 'Slight sensitivity when you touch or press', Moderate: 'Sore to touch, especially around edges or parting', Severe: 'Painful without touching, or sharp pain when pressed' },
  hairline: { None: 'No thinning', Mild: 'Slightly less volume than usual', Moderate: 'Noticeably thinner areas, wider parting', Severe: 'Scalp clearly visible through hair, patches appearing' },
  edgeLoss: { None: 'No edge loss', Mild: 'Edges slightly thinner than before', Moderate: 'Visible thinning at temples or hairline', Severe: 'Significant recession, hairline has pulled back' },
  shedding: { None: 'No breakage', Mild: 'A few short pieces when styling or detangling', Moderate: 'Noticeable snapping, uneven lengths appearing', Severe: 'Significant breakage daily, hair visibly thinning from it' },
  bumps: { None: 'No bumps', Mild: 'A few small bumps, not painful', Moderate: 'Multiple bumps, some tenderness or redness', Severe: 'Widespread, painful, or spreading bumps' },
  dryness: { None: 'No dryness', Mild: 'Slightly dry or tight between washes', Moderate: 'Dry and flaky despite moisturising', Severe: 'Extremely dry, cracking, or painful tightness' },
};
const getAck = (severity: string, _label: string, _index: number, key?: string): string | null => {
  if (severity === 'None') return null;
  const sevKey = severity.toLowerCase() as 'mild' | 'moderate' | 'severe';
  const ackKey = key || _label.toLowerCase();
  const entry = symptomAcks[ackKey];
  if (entry && entry[sevKey]) return entry[sevKey];
  if (severity === 'Mild') return `Noted. Mild ${_label.toLowerCase()} is common, especially between washes.`;
  if (severity === 'Moderate') return `Thanks for flagging that. We'll keep a close eye on this for you.`;
  if (severity === 'Severe') return `We hear you. That sounds uncomfortable. We'll make sure this gets the attention it deserves.`;
  return null;
};

// ─── EXPLAINERS ──────────────────────────────────────────────────────────────
const sectionExplainers: Record<number, string> = {
  1: "This helps us tailor scalp check-in questions to your hair's needs.",
  2: "Chemical processing changes how your scalp and hair respond to styling and products. This helps us tailor your check-ins.",
  3: "Different styles create different tension and coverage patterns. This helps us know what to watch for.",
  4: "This is how we time your check-ins and reminders to your actual routine.",
  5: "This personalises your experience so we focus on what matters to you.",
};

const CurlIcon = ({ type }: { type: string }) => {
  if (type === 'unsure') return <HelpCircle size={20} className="text-muted-foreground" strokeWidth={1.5} />;
  if (type === 'type3') return <svg width="22" height="22" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>;
  if (type === 'type4') return <svg width="22" height="22" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>;
  return null;
};

// Total main screens: -1=welcome, 0=gender, 1=hair type, 2=chemical, 3=styles, 4=routine, 5=concerns,
// 6=photo guidelines, 7=scalp photos, 8=symptoms, 9=length check transition, 10=length photos, 11=completion
const TOTAL_PROGRESS_SEGMENTS_FEMALE = 8; // gender, hair, chemical, styles, routine, concerns, guidelines+photos, symptoms
const TOTAL_PROGRESS_SEGMENTS_MALE = 7; // gender, styles, routine, concerns, guidelines+photos, symptoms, length

const Onboarding = () => {
  const navigate = useNavigate();
  const {
    onboardingData, setOnboardingData, setOnboardingComplete,
    addToCheckInHistory, setCurrentCheckIn, setBaselineRisk, setBaselineDate, setBaselinePhotos,
    healthProfile,
  } = useApp();

  const [step, setStep] = useState(-1); // Start at welcome screen (-1)
  const [symptomAck, setSymptomAck] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const consentButtonRef = useRef<HTMLButtonElement>(null);
  const gender = onboardingData.gender;
  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  // Hair type
  const [hairType, setHairType] = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);
  const [hairContinueVisible, setHairContinueVisible] = useState(false);

  // Chemical processing
  const [chemicalStatus, setChemicalStatus] = useState(onboardingData.chemicalProcessing || '');
  const [chemicalStep, setChemicalStep] = useState(0); // 0=status, 1=type, 2=timing, 3=frequency
  const [chemicalTypes, setChemicalTypes] = useState<string[]>(onboardingData.chemicalProcessingMultiple || []);
  const [chemicalOtherType, setChemicalOtherType] = useState('');
  const [lastTreatment, setLastTreatment] = useState(onboardingData.lastChemicalTreatment || '');
  const [chemicalFreq, setChemicalFreq] = useState(onboardingData.chemicalFrequency || '');

  // Styles
  const [styles, setStyles] = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle] = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  // Routine
  const [cycleLength, setCycleLength] = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash] = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');

  // Concerns
  const [concerns, setConcerns] = useState<string[]>(onboardingData.goals || []);

  // Symptom flow
  const [symptomPhase, setSymptomPhase] = useState<'transition' | 'symptoms' | 'thanks' | 'result'>('transition');
  const [symptomIndex, setSymptomIndex] = useState(0);
  const [symptomResponses, setSymptomResponses] = useState<Record<string, string>>({});
  const [triageResult, setTriageResult] = useState<'green' | 'amber' | 'red' | null>(null);

  // Length check
  const [lengthStep, setLengthStep] = useState(0);
  const [lengthPhotos, setLengthPhotos] = useState<{ area: string; dataUrl: string }[]>([]);
  const [lengthPreview, setLengthPreview] = useState<string | null>(null);
  const lengthCameraRef = useRef<HTMLInputElement | null>(null);
  const lengthGalleryRef = useRef<HTMLInputElement | null>(null);

  const [showProtectiveInfo, setShowProtectiveInfo] = useState(false);
  const [barberFreq, setBarberFreq] = useState('');

  // Male style classification
  const maleHasLongStyles = isMale && styles.some(s => maleLongStyleNames.includes(s));
  const maleIsShortHairOnly = isMale && !maleHasLongStyles;
  const maleNeedsProtectiveQ = isMale && styles.some(s => [...maleLongStyleNames, 'Afro'].includes(s));

  // Active symptoms and descriptors based on gender/style
  const activeSymptoms = maleIsShortHairOnly ? maleShortHairSymptoms : onboardingSymptoms;
  const activeDescriptors = maleIsShortHairOnly
    ? { ...severityDescriptors, ...maleShortHairDescriptorOverrides }
    : severityDescriptors;
  const activeBetweenWashOptions = betweenWashOptions;
  const activeConcernOptions = maleIsShortHairOnly ? maleShortHairConcerns : concernOptions;

  // Auto-scroll to Let's go button after consent checked
  useEffect(() => {
    if (consentChecked && consentButtonRef.current) {
      setTimeout(() => {
        consentButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [consentChecked]);

  // Auto-advance transition screens
  useEffect(() => {
    if (step === 8 && symptomPhase === 'transition') {
      const timer = setTimeout(() => {
        setSymptomPhase('symptoms');
        setSymptomIndex(0);
        setSymptomAck(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (step === 8 && symptomPhase === 'thanks') {
      const timer = setTimeout(() => {
        setSymptomPhase('result');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, symptomPhase]);

  // Compute style options with chemical filtering
  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;
  const isRelaxedOrTexturised = chemicalStatus === 'current' && (chemicalTypes.includes('Relaxer') || chemicalTypes.includes('Texturiser'));
  const filteredStyleOptions = isRelaxedOrTexturised
    ? rawStyleOptions.filter(s => s !== 'Loose natural' && s !== 'Wash and go')
    : rawStyleOptions;

  const toggleStyle = (s: string) => setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleBetweenWash = (v: string) => {
    if (v === 'Nothing') {
      setBetweenWash(prev => prev.includes(v) ? [] : [v]);
    } else {
      setBetweenWash(prev => {
        const without = prev.filter(x => x !== 'Nothing');
        return without.includes(v) ? without.filter(x => x !== v) : [...without, v];
      });
    }
  };
  const toggleConcern = (c: string) => setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleChemicalType = (t: string) => setChemicalTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const totalProgressSegments = isMale ? TOTAL_PROGRESS_SEGMENTS_MALE : TOTAL_PROGRESS_SEGMENTS_FEMALE;

  const getProgressSegment = () => {
    if (isMale) {
      if (step <= 0) return 0;
      if (step === 3) return 1;
      if (step === 4) return 2;
      if (step === 5) return 3;
      if (step === 6 || step === 7) return 4;
      if (step === 8) return 5;
      if (step >= 9) return 6;
      return 0;
    }
    if (step <= 0) return 0;
    if (step === 1) return 1;
    if (step === 2) return 2;
    if (step === 3) return 3;
    if (step === 4) return 4;
    if (step === 5) return 5;
    if (step === 6 || step === 7) return 6;
    if (step >= 8) return 7;
    return 0;
  };

  const canProceed = () => {
    switch (step) {
      case -1: return true; // welcome
      case 0: return !!gender;
      case 1: return !!hairType;
      case 2: {
        if (chemicalStep === 0) return false;
        if (chemicalStep === 1) return chemicalTypes.length > 0;
        if (chemicalStep === 2) return false;
        if (chemicalStep === 3) return false;
        return false;
      }
      case 3: {
        const styleOk = styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0);
        if (isMale && !maleNeedsProtectiveQ) return styleOk;
        return styleOk && !!protectiveFreq;
      }
      case 4: {
        const washOk = betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
        if (maleIsShortHairOnly) return !!barberFreq && washOk;
        return !!cycleLength && washOk;
      }
      case 5: return concerns.length > 0;
      case 6: return consentChecked;
      case 7: return false;
      case 8: {
        if (symptomPhase === 'transition' || symptomPhase === 'thanks') return false;
        if (symptomPhase === 'symptoms') return !!symptomResponses[activeSymptoms[symptomIndex].key];
        if (symptomPhase === 'result') return true;
        return false;
      }
      case 9: return true;
      case 10: return true;
      case 11: return true;
      default: return false;
    }
  };

  const buildCheckInFromSymptoms = (responses: Record<string, string>): CheckInData => ({
    itch: responses.itch || 'None',
    tenderness: responses.tenderness || 'None',
    hairline: responses.hairline || 'None',
    flaking: responses.flaking || 'None',
    shedding: responses.shedding || 'None',
    bumps: responses.bumps || 'None',
    dryness: responses.dryness || 'None',
    razorBumps: responses.razorBumps || 'None',
    barberIrritation: responses.barberIrritation || 'None',
    type: 'baseline',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  });

  const saveAndComplete = (checkIn: CheckInData, risk: 'green' | 'amber' | 'red') => {
    const effectiveHairType = hairSubType || hairType;
    setOnboardingData({
      ...onboardingData,
      hairType: effectiveHairType,
      chemicalProcessing: chemicalStatus,
      chemicalProcessingMultiple: chemicalTypes,
      chemicalFrequency: chemicalFreq,
      lastChemicalTreatment: lastTreatment,
      protectiveStyles: styles,
      otherStyle,
      protectiveStyleFrequency: protectiveFreq,
      barberFrequency: barberFreq,
      isWornOutOnly: false,
      cycleLength,
      betweenWashCare: betweenWash,
      otherBetweenWashCare: otherBetweenWash,
      goals: concerns,
    });
    setCurrentCheckIn(checkIn);
    addToCheckInHistory(checkIn);
    setBaselineRisk(risk);
    setBaselineDate(new Date().toISOString());
    sessionStorage.setItem('follisense-just-onboarded', 'true');
    setOnboardingComplete(true);
    navigate('/home');
  };

  const handleSkipSymptoms = () => {
    const cleanCheckIn: CheckInData = {
      itch: 'None', tenderness: 'None', hairline: 'None',
      flaking: 'None', shedding: 'None', bumps: 'None', dryness: 'None',
      type: 'baseline',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    };
    setTriageResult('green');
    setSymptomPhase('result');
    setSymptomResponses({});
    setStep(8);
    setTimeout(() => {
      setTriageResult('green');
      setSymptomPhase('result');
    }, 0);
  };

  const finishOnboarding = () => {
    const checkIn = buildCheckInFromSymptoms(symptomResponses);
    const risk = triageResult || 'green';
    saveAndComplete(checkIn, risk);
  };

  const handlePhotosComplete = (photos: { area: string; dataUrl: string }[]) => {
    setBaselinePhotos(photos.map(p => ({ area: p.area, captured: true, date: new Date().toISOString() })));
    setStep(8);
    setSymptomPhase('transition');
  };

  const handleNext = () => {
    if (step === -1) {
      setStep(0);
      return;
    }
    if (step === 2) {
      if (chemicalStep === 1) {
        setChemicalStep(2);
        return;
      }
    }
    if (step < 7) {
      setStep(step + 1);
    } else if (step === 8) {
      if (symptomPhase === 'symptoms') {
        if (symptomAck) {
          setSymptomAck(null);
          if (symptomIndex < activeSymptoms.length - 1) {
            setSymptomIndex(symptomIndex + 1);
          } else {
            const checkIn = buildCheckInFromSymptoms(symptomResponses);
            const risk = computeHistoricalRisk(checkIn, []);
            setTriageResult(risk);
            setSymptomPhase('result');
          }
          return;
        }
        const currentSymptom = activeSymptoms[symptomIndex];
        const severity = symptomResponses[currentSymptom.key];
        const ack = getAck(severity, currentSymptom.label, symptomIndex, currentSymptom.key);
        if (ack) {
          setSymptomAck(ack);
          return;
        }
        if (symptomIndex < activeSymptoms.length - 1) {
          setSymptomIndex(symptomIndex + 1);
        } else {
          const checkIn = buildCheckInFromSymptoms(symptomResponses);
          const risk = computeHistoricalRisk(checkIn, []);
          setTriageResult(risk);
          setSymptomPhase('result');
        }
      } else if (symptomPhase === 'result') {
        setStep(9);
      }
    } else if (step === 9 || step === 10) {
      setStep(step + 1);
    } else if (step === 11) {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step === -1) {
      navigate(-1);
      return;
    }
    if (step === 0) {
      setStep(-1);
      return;
    }
    if (step === 8) {
      if (symptomPhase === 'thanks') {
        setSymptomPhase('symptoms');
        setSymptomIndex(activeSymptoms.length - 1);
        setSymptomAck(null);
      } else if (symptomPhase === 'result') {
        setSymptomPhase('symptoms');
        setSymptomIndex(activeSymptoms.length - 1);
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomAck) {
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomIndex > 0) {
        setSymptomIndex(symptomIndex - 1);
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomIndex === 0) {
        setStep(7);
        setSymptomAck(null);
      } else if (symptomPhase === 'transition') {
        setStep(7);
      } else {
        setStep(7);
      }
    } else if (step === 2 && chemicalStep > 0) {
      setChemicalStep(chemicalStep - 1);
    } else if (step > 0) {
      if (step === 2) setChemicalStep(0);
      if (isMale && step === 3) { setStep(0); return; }
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const isShortHairStyle = styles.some(s =>
    ['Low cut / fade', 'Bald / shaved', 'Afro', 'High top'].includes(s) ||
    s.toLowerCase().includes('twa')
  );

  const getButtonText = () => {
    if (step === -1) return ''; // welcome has its own button
    if (step === 2 && chemicalStep === 1) return 'Next';
    if (step === 6) return ''; // handled by sticky button
    if (step === 8) {
      if (symptomPhase === 'transition') return '';
      if (symptomPhase === 'symptoms') return '';
      if (symptomPhase === 'thanks') return '';
      if (symptomPhase === 'result') return '';
    }
    if (step === 9) return '';
    if (step === 11) return 'Take me to my dashboard';
    return 'Next';
  };

  // Hide bottom button on welcome, auto-advance screens, photo capture, consent, and symptom flow
  const showBottomButton = step !== -1 && step !== 0 && step !== 1 && step !== 6 && step !== 7 && step !== 9
    && !(step === 8 && (symptomPhase === 'transition' || symptomPhase === 'symptoms' || symptomPhase === 'thanks' || symptomPhase === 'result'))
    && !(step === 2 && chemicalStep !== 1);

  const activeSegment = getProgressSegment();

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundImage: 'url(https://i.pinimg.com/1200x/21/df/fe/21dffea6ca5d2c69edb5c8b926e41b50.jpg)',
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <style>{`
        .selection-card { border: 1.5px solid #E8DED1 !important; border-radius: 14px; padding: 14px; background: #F5F0EB; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(45,45,45,0.04); }
        .selection-card:hover { border-color: #d4c5b5 !important; }
        .selection-card.selected { border: 1.5px solid #7C9A8E !important; background: rgba(124,154,142,0.08); }
        .pill-option { border: 1.5px solid #E8DED1 !important; border-radius: 100px; padding: 10px 18px; background: #F5F0EB; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease; }
        .pill-option:hover { border-color: #d4c5b5 !important; }
        .pill-option.selected { border: 1.5px solid #7C9A8E !important; background: rgba(124,154,142,0.08); color: #5a8f74; }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '560px' }}
      >
        <div style={{
          backgroundColor: '#FAF8F5', borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '24px 28px 28px', display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 48px)', overflow: 'hidden',
        }}>

          {/* Header with progress - hide on welcome */}
          {step >= 0 && (
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
                <ArrowLeft size={22} strokeWidth={1.8} />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalProgressSegments }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-colors duration-300 ${i <= activeSegment ? 'bg-primary' : 'bg-border'}`}
                    style={{ width: '28px' }}
                  />
                ))}
              </div>
              <div className="w-10" />
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: showBottomButton ? '0' : '12px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step === 8 ? `${step}-${symptomPhase}-${symptomIndex}-${symptomAck ? 'ack' : ''}` : step === 2 ? `${step}-${chemicalStep}` : step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-2 pb-4"
              >

                {/* ── Screen -1: Welcome ── */}
                {step === -1 && (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/11847/11847144.png"
                        alt="FolliSense logo"
                        style={{ width: '32px', height: '32px', filter: 'invert(60%) sepia(0%) saturate(0%) brightness(40%) contrast(85%)' }}
                      />
                      <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>FolliSense</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to FolliSense</h2>
                    <p className="text-base text-muted-foreground mb-3">Your scalp health, tracked around your routine.</p>
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      We'll ask a few quick questions to personalise your experience. It takes about 3 minutes.
                    </p>
                    <button
                      onClick={() => setStep(0)}
                      className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                    >
                      Let's get started
                    </button>
                  </div>
                )}

                {/* ── Screen 0: Gender Selection (auto-advance) ── */}
                {step === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Let's personalise your experience.</h2>
                    <p className="text-sm text-muted-foreground mb-6">How do you identify?</p>
                    <div className="space-y-3">
                      {genderOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                          setOnboardingData({ ...onboardingData, gender: opt.id });
                            setStep(opt.id === 'man' ? 3 : 1);
                          }}
                          className="selection-card w-full text-left flex items-center gap-4"
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                            <span className="text-xl text-foreground">{opt.icon}</span>
                          </div>
                          <p className="font-semibold text-foreground text-base">{opt.label}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      This helps us show you the right content, symptoms, and reference images.
                    </p>
                  </div>
                )}

                {/* ── Screen 1: Hair Type (show subtypes + Continue) ── */}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">What's your hair type?</h2>
                    <p className="text-xs text-muted-foreground mb-4">{sectionExplainers[1]}</p>

                    <div className="space-y-3">
                      {/* Type 4 card */}
                      <button
                        onClick={() => {
                          setHairType('type4');
                          setHairSubType('');
                          setShowSubType(false);
                          setHairContinueVisible(true);
                        }}
                        className="w-full text-left rounded-2xl overflow-hidden relative cursor-pointer"
                        style={{ border: hairType === 'type4' ? '2px solid hsl(var(--primary))' : '2px solid transparent' }}
                      >
                        <div className="relative bg-muted" style={{ height: '180px' }}>
                          <img src={hairType4Hero} alt="Type 4: Coily" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
                            <p className="font-semibold text-sm" style={{ color: 'white' }}>Type 4: Coily</p>
                          </div>
                        </div>
                      </button>
                      <p className="text-xs px-1 -mt-1" style={{ color: '#7A7570' }}>Tight coils and kinks. Shrinks significantly when wet.</p>

                      {/* Sub-type expansion for Type 4 */}
                      {hairType === 'type4' && !showSubType && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                          <button onClick={() => setShowSubType(true)} className="text-sm text-primary font-medium flex items-center gap-1">
                            Want to be more specific? <ChevronDown size={14} />
                          </button>
                        </motion.div>
                      )}
                      {hairType === 'type4' && showSubType && subTypes.type4 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {subTypes.type4.map(st => (
                              <button
                                key={st.id}
                                onClick={() => { setHairSubType(st.id); }}
                                className="flex-shrink-0 rounded-xl overflow-hidden text-center"
                                style={{ width: '100px', border: hairSubType === st.id ? '2px solid hsl(var(--primary))' : '1.5px solid hsl(var(--border))', borderRadius: '8px' }}
                              >
                                {st.image ? (
                                  <img src={st.image} alt={st.label} className="bg-muted" style={{ width: '100%', height: '130px', objectFit: 'cover', objectPosition: 'center', display: 'block', borderRadius: '8px 8px 0 0' }} />
                                ) : (
                                  <div className="bg-muted" style={{ width: '100%', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="text-xs text-muted-foreground">{st.label}</span>
                                  </div>
                                )}
                                <p className="text-xs font-medium text-foreground py-1.5">{st.label}</p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Type 3 card */}
                      <button
                        onClick={() => {
                          setHairType('type3');
                          setHairSubType('');
                          setShowSubType(false);
                          setHairContinueVisible(true);
                        }}
                        className="w-full text-left rounded-2xl overflow-hidden relative cursor-pointer"
                        style={{ border: hairType === 'type3' ? '2px solid hsl(var(--primary))' : '2px solid transparent' }}
                      >
                        <div className="relative bg-muted" style={{ height: '180px' }}>
                          <img src={hairType3Hero} alt="Type 3: Curly" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
                            <p className="font-semibold text-sm" style={{ color: 'white' }}>Type 3: Curly</p>
                          </div>
                        </div>
                      </button>
                      <p className="text-xs px-1 -mt-1" style={{ color: '#7A7570' }}>Defined curls and waves. Visible curl pattern.</p>

                      {/* Sub-type expansion for Type 3 */}
                      {hairType === 'type3' && !showSubType && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                          <button onClick={() => setShowSubType(true)} className="text-sm text-primary font-medium flex items-center gap-1">
                            Want to be more specific? <ChevronDown size={14} />
                          </button>
                        </motion.div>
                      )}
                      {hairType === 'type3' && showSubType && subTypes.type3 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {subTypes.type3.map(st => (
                              <button
                                key={st.id}
                                onClick={() => { setHairSubType(st.id); }}
                                className="flex-shrink-0 rounded-xl overflow-hidden text-center"
                                style={{ width: '100px', border: hairSubType === st.id ? '2px solid hsl(var(--primary))' : '1.5px solid hsl(var(--border))', borderRadius: '8px' }}
                              >
                                {st.image ? (
                                  <img src={st.image} alt={st.label} className="bg-muted" style={{ width: '100%', height: '130px', objectFit: 'cover', objectPosition: 'center', display: 'block', borderRadius: '8px 8px 0 0' }} />
                                ) : (
                                  <div className="bg-muted" style={{ width: '100%', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="text-xs text-muted-foreground">{st.label}</span>
                                  </div>
                                )}
                                <p className="text-xs font-medium text-foreground py-1.5">{st.label}</p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Not sure */}
                      <button
                        onClick={() => { setHairType('unsure'); setHairSubType(''); setStep(2); }}
                        className="w-full rounded-2xl py-4 px-4 text-left cursor-pointer"
                        style={{ border: '1.5px solid hsl(var(--border))', background: 'hsl(var(--accent) / 0.3)' }}
                      >
                        <p className="font-semibold text-foreground text-sm">Not sure</p>
                      </button>
                      <p className="text-xs px-1 -mt-1" style={{ color: '#7A7570' }}>That's okay. We'll still personalise your experience.</p>
                    </div>

                    {/* Continue button appears after selection */}
                    {(hairType === 'type4' || hairType === 'type3') && hairContinueVisible && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <button
                          onClick={() => setStep(2)}
                          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                        >
                          Continue
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 2: Chemical Processing (sequential sub-steps) ── */}
                {step === 2 && chemicalStep === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Is your hair chemically processed?</h2>
                    <p className="text-xs text-muted-foreground mb-4">
                      This means treatments that permanently change your hair's natural texture.
                    </p>
                    <div className="space-y-3">
                      {chemicalOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setChemicalStatus(opt.id);
                            if (opt.id === 'natural' || opt.id === 'unsure') {
                              setTimeout(() => setStep(3), 150);
                            } else {
                              setTimeout(() => setChemicalStep(1), 150);
                            }
                          }}
                          className={`selection-card w-full text-left ${chemicalStatus === opt.id ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{opt.label}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">{sectionExplainers[2]}</p>
                  </div>
                )}

                {step === 2 && chemicalStep === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">What type of processing?</h2>
                    <p className="text-xs text-muted-foreground mb-4">Select all that apply.</p>
                    <div className="space-y-3">
                      {chemicalTypeOptions.map(t => (
                        <button key={t} onClick={() => toggleChemicalType(t)} className={`selection-card w-full text-left ${chemicalTypes.includes(t) ? 'selected' : ''}`}>
                          <p className="font-medium text-foreground text-sm">{t}</p>
                        </button>
                      ))}
                    </div>
                    {chemicalTypes.includes('Other') && (
                      <input
                        type="text" value={chemicalOtherType}
                        onChange={e => setChemicalOtherType(e.target.value)}
                        placeholder="Describe treatment"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-3"
                      />
                    )}
                  </div>
                )}

                {step === 2 && chemicalStep === 2 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">When was your last treatment?</h2>
                    <p className="text-xs text-muted-foreground mb-4">Tap to select.</p>
                    <div className="space-y-3">
                      {lastTreatmentOptions.map(o => (
                        <button
                          key={o}
                          onClick={() => {
                            setLastTreatment(o);
                            setTimeout(() => setChemicalStep(3), 150);
                          }}
                          className={`selection-card w-full text-left ${lastTreatment === o ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{o}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && chemicalStep === 3 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">How often do you get it done?</h2>
                    <p className="text-xs text-muted-foreground mb-4">Tap to select.</p>
                    <div className="space-y-3">
                      {chemicalFreqOptions.map(o => (
                        <button
                          key={o}
                          onClick={() => {
                            setChemicalFreq(o);
                            setTimeout(() => { setChemicalStep(0); setStep(3); }, 150);
                          }}
                          className={`selection-card w-full text-left ${chemicalFreq === o ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{o}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Screen 3: Styles + Frequency ── */}
                {step === 3 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">How do you usually wear your hair?</h2>
                    <p className="text-xs text-muted-foreground mb-3">{sectionExplainers[3]}</p>
                    <p className="text-muted-foreground mb-4 text-sm">Select everything you rotate between</p>
                    {(() => {
                      const defaultCount = isMale ? 6 : 8;
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {filteredStyleOptions.slice(0, defaultCount).map(s => (
                              <button key={s} onClick={() => toggleStyle(s)} className={`selection-card text-center py-4 ${styles.includes(s) ? 'selected' : ''}`}>
                                <p className="font-medium text-foreground text-sm">{s}</p>
                              </button>
                            ))}
                          </div>
                          {filteredStyleOptions.length > defaultCount && !showMoreStyles && (
                            <button onClick={() => setShowMoreStyles(true)} className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary mt-3 py-2">
                              Show more styles <ChevronDown size={16} strokeWidth={2} />
                            </button>
                          )}
                          {showMoreStyles && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              {filteredStyleOptions.slice(defaultCount).map(s => (
                                <button key={s} onClick={() => toggleStyle(s)} className={`selection-card text-center py-4 ${styles.includes(s) ? 'selected' : ''}`}>
                                  <p className="font-medium text-foreground text-sm">{s}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {styles.includes('Other') && (
                      <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style" className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-3" />
                    )}
                    {styles.length > 0 && (!isMale || maleNeedsProtectiveQ) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <p className="font-semibold text-foreground">{isMale ? 'How often do you wear longer or covered styles?' : 'How often are you in protective styles?'}</p>
                          <button
                            onClick={() => setShowProtectiveInfo(!showProtectiveInfo)}
                            className="text-xs font-medium shrink-0"
                            style={{ color: '#7C9A8E' }}
                          >
                            What's this?
                          </button>
                        </div>
                        {showProtectiveInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-border p-3 mb-3"
                            style={{ background: 'hsl(var(--accent) / 0.3)' }}
                            onClick={() => setShowProtectiveInfo(false)}
                          >
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Styles like braids, twists, wigs, weaves, and cornrows that tuck your ends away and are usually kept in for days or weeks.
                            </p>
                          </motion.div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {protectiveFreqOptions.map(o => (
                            <button key={o} onClick={() => setProtectiveFreq(o)} className={`pill-option ${protectiveFreq === o ? 'selected' : ''}`}>{o}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 4: Cycle + Between-Wash ── */}
                {step === 4 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Your routine</h2>
                    <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[4]}</p>

                    {maleIsShortHairOnly ? (
                      <>
                        <p className="font-semibold text-foreground mb-3">How often do you visit the barber?</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {barberFreqOptions.map(o => (
                            <button key={o} onClick={() => setBarberFreq(o)} className={`pill-option ${barberFreq === o ? 'selected' : ''}`}>{o}</button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground mb-3">How long do you usually keep a style in?</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {cycleLengthOptions.map(o => (
                            <button key={o} onClick={() => setCycleLength(o)} className={`pill-option ${cycleLength === o ? 'selected' : ''}`}>{o}</button>
                          ))}
                        </div>
                      </>
                    )}

                    <p className="font-semibold text-foreground mb-3">What do you do for your scalp between washes?</p>
                    <div className="flex flex-wrap gap-2">
                      {activeBetweenWashOptions.map(o => (
                        <button key={o} onClick={() => toggleBetweenWash(o)} className={`pill-option ${betweenWash.includes(o) ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                    {betweenWash.includes('Other') && (
                      <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?" className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-3" />
                    )}
                  </div>
                )}

                {/* ── Screen 5: Top Concerns ── */}
                {step === 5 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">What matters most to you right now?</h2>
                    <p className="text-xs text-muted-foreground mb-4">{sectionExplainers[5]}</p>
                    <p className="text-muted-foreground mb-4 text-sm">Select all that apply</p>
                    <div className="space-y-3">
                      {activeConcernOptions.map(c => (
                        <button key={c} onClick={() => toggleConcern(c)} className={`selection-card w-full text-left ${concerns.includes(c) ? 'selected' : ''}`}>
                          <p className="font-medium text-foreground text-sm">{c}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Screen 6: Photo Guidelines + Consent ── */}
                {step === 6 && (
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera size={26} className="text-primary" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground text-center mb-1">Let's capture your starting point</h2>
                    <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                      {maleIsShortHairOnly
                        ? "No need to move anything, just show your hairline clearly. We'll compare these to future check-ins so you can see changes over time. Only you can see these."
                        : "These photos help you spot changes that happen too slowly to notice day to day. We'll compare them to future check-ins so you can see your progress over time. Only you can see these."}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">💡</span>
                        <p className="text-xs text-muted-foreground">Use good lighting, no flash</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">💡</span>
                        <p className="text-xs text-muted-foreground">Stand in front of a plain background</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">💡</span>
                        <p className="text-xs text-muted-foreground">Hair and scalp should be dry and clearly visible</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">💡</span>
                        <p className="text-xs text-muted-foreground">Use your front (selfie) camera. For back and top shots, use a mirror or ask someone to help</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">💡</span>
                        <p className="text-xs text-muted-foreground">Ideally take photos on wash day or takedown day</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border p-3 mb-4 bg-accent/20">
                      <p className="text-xs text-muted-foreground">
                        <ShieldCheck size={12} className="inline mr-1" strokeWidth={2} />
                        This tool provides personalised scalp health insights, not medical diagnoses.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={e => setConsentChecked(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-border accent-primary"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        I consent to my photos and personal data being stored securely for tracking my scalp and hair health over time.{' '}
                        <button className="text-primary font-medium underline">Privacy Policy</button>
                      </p>
                    </label>

                    {/* Sticky Let's go button - appears after consent */}
                    {consentChecked && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <button
                          ref={consentButtonRef}
                          onClick={() => setStep(7)}
                          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                        >
                          Let's go
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 7: Scalp Baseline Photos ── */}
                {step === 7 && (
                  <ScalpBaselineCapture
                    onComplete={handlePhotosComplete}
                    onBack={() => setStep(6)}
                    gender={gender}
                  />
                )}

                {/* ── Screen 8: Symptom Flow ── */}
                {step === 8 && symptomPhase === 'transition' && (
                  <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      style={{ color: '#2D2D2D', fontSize: '18px', textAlign: 'center' }}
                    >
                      Nearly there. A few quick questions about your scalp.
                    </motion.p>
                  </div>
                )}

                {step === 8 && symptomPhase === 'symptoms' && !symptomAck && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">Let's set your baseline</h3>
                    <p className="text-xs text-muted-foreground mb-4">This is your starting point, so we can track any changes over time.</p>
                    <p className="text-xs text-muted-foreground mb-1">{symptomIndex + 1} of {activeSymptoms.length}</p>
                    <h2 className="text-lg font-semibold text-foreground mb-6">{activeSymptoms[symptomIndex].question}</h2>
                    <div className="space-y-3">
                      {severityOptions.map(sev => (
                        <button
                          key={sev}
                          onClick={() => {
                            const currentSymptom = activeSymptoms[symptomIndex];
                            setSymptomResponses(prev => ({ ...prev, [currentSymptom.key]: sev }));
                            if (sev === 'None') {
                              if (symptomIndex < activeSymptoms.length - 1) {
                                setTimeout(() => setSymptomIndex(symptomIndex + 1), 150);
                              } else {
                                setTimeout(() => {
                                  const checkIn = buildCheckInFromSymptoms({ ...symptomResponses, [currentSymptom.key]: sev });
                                  const risk = computeHistoricalRisk(checkIn, []);
                                  setTriageResult(risk);
                                  setSymptomPhase('thanks');
                                }, 150);
                              }
                            } else {
                              const ack = getAck(sev, currentSymptom.label, symptomIndex, currentSymptom.key);
                              setSymptomAck(ack);
                              setTimeout(() => {
                                setSymptomAck(null);
                                if (symptomIndex < activeSymptoms.length - 1) {
                                  setSymptomIndex(symptomIndex + 1);
                                } else {
                                  const checkIn = buildCheckInFromSymptoms({ ...symptomResponses, [currentSymptom.key]: sev });
                                  const risk = computeHistoricalRisk(checkIn, []);
                                  setTriageResult(risk);
                                  setSymptomPhase('thanks');
                                }
                              }, 1500);
                            }
                          }}
                          className={`selection-card w-full text-left ${symptomResponses[activeSymptoms[symptomIndex].key] === sev ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{sev}</p>
                          {activeDescriptors[activeSymptoms[symptomIndex].key]?.[sev] && (
                            <p className="text-xs mt-0.5" style={{ color: '#7A7570', fontSize: '12px' }}>{activeDescriptors[activeSymptoms[symptomIndex].key][sev]}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 8 && symptomPhase === 'symptoms' && symptomAck && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <p className="text-sm text-muted-foreground mb-1">{symptomIndex + 1} of {activeSymptoms.length}</p>
                    <h2 className="text-lg font-semibold text-foreground mb-3">{activeSymptoms[symptomIndex].label}: {symptomResponses[activeSymptoms[symptomIndex].key]}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{symptomAck}</p>
                  </motion.div>
                )}

                {step === 8 && symptomPhase === 'thanks' && (
                  <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      style={{ color: '#7C9A8E', fontSize: '20px', textAlign: 'center', fontWeight: 500 }}
                    >
                      Thanks for sharing that
                    </motion.p>
                  </div>
                )}

                {step === 8 && symptomPhase === 'result' && triageResult && (
                  <OnboardingTriageResult
                    risk={triageResult}
                    symptomResponses={symptomResponses}
                    onboardingSymptoms={activeSymptoms}
                    isMale={isMale}
                    onContinue={() => setStep(9)}
                    navigate={navigate}
                    healthProfile={healthProfile}
                    goals={concerns}
                  />
                )}

                {/* ── Screen 9: Length Check Transition ── */}
                {step === 9 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">Want to track your hair length too?</h2>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {isShortHairStyle
                        ? "Take a photo of your hair as it is now. This tracks your growth over time."
                        : "Pull a section straight to show your true length past shrinkage."}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setLengthStep(0); setStep(10); }}
                        className="selection-card w-full text-left"
                      >
                        <p className="font-semibold text-foreground text-sm">Yes, let's do it</p>
                      </button>
                      <button
                        onClick={() => setStep(11)}
                        className="selection-card w-full text-left"
                      >
                        <p className="font-semibold text-foreground text-sm">Skip for now</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Screen 10: Length Check Photos ── */}
                {step === 10 && (
                  <LengthCheckPhotos
                    isShortHair={isShortHairStyle}
                    gender={gender}
                    onComplete={(photos) => {
                      setLengthPhotos(photos);
                      setStep(11);
                    }}
                    onSkip={() => setStep(11)}
                  />
                )}

                {/* ── Screen 11: Completion ── */}
                {step === 11 && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check size={32} className="text-primary" strokeWidth={1.8} />
                      </motion.div>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground text-center mb-3">
                      {lengthPhotos.length > 0 ? "Baseline set. You're ready to go." : "You're all set."}
                    </h2>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                      Tip: Tap 'My Routine' on your dashboard to add the products you use. This helps us spot what might be helping or irritating your scalp.
                    </p>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom button */}
          {showBottomButton && (step !== 2 || (chemicalStatus === 'current' || chemicalStatus === 'growing-out')) && getButtonText() && (
            <div className="flex-shrink-0 pt-2 pb-1" style={{ position: 'sticky', bottom: 0, background: 'white' }}>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`w-full h-14 rounded-xl font-semibold text-base transition-colors ${
                  canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                {getButtonText()}
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

// ─── Onboarding Triage Result (mirrors RiskOutput.tsx) ───────────────────────
const hasTelogenTriggers = (hp: HealthProfileData): string[] => {
  const triggers: string[] = [];
  if (hp.pregnancyStatus === 'Postpartum (within 12 months)') triggers.push('postpartum status');
  const validStressors = (hp.recentStressors || []).filter(s => s !== 'None of these' && s !== 'Prefer not to say');
  triggers.push(...validStressors);
  return triggers;
};

const getGoalMessage = (goals: string[], risk: 'green' | 'amber' | 'red'): string | null => {
  if (goals.length === 0) return null;
  const primaryConcern = goals[0];
  if (risk === 'green') return `You told us ${primaryConcern.toLowerCase()} is on your mind. Based on what you've shared, there are no red flags right now. We'll keep tracking this for you.`;
  if (risk === 'amber') return `You flagged ${primaryConcern.toLowerCase()} as a priority. We've noticed some patterns developing. Here's what to do next.`;
  return `You flagged ${primaryConcern.toLowerCase()} as a priority. Your symptoms suggest this needs attention. Here's what to do next.`;
};

interface OnboardingTriageResultProps {
  risk: 'green' | 'amber' | 'red';
  symptomResponses: Record<string, string>;
  onboardingSymptoms: { key: string; label: string; question: string }[];
  isMale: boolean;
  onContinue: () => void;
  navigate: (path: string) => void;
  healthProfile: HealthProfileData;
  goals: string[];
}

const getTriageReasoning = (risk: 'green' | 'amber' | 'red', responses: Record<string, string>, symptoms: { key: string; label: string }[]): string | null => {
  const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns'];
  const MILD_VALUES = ['Mild', 'A little', 'Some flaking', 'Slight concern', 'A bit dry', 'A little more breakage or dryness than usual'];
  const SEVERE_VALUES = ['Severe', 'Yes, painful', 'Very concerned', 'Alarming amount', 'Heavy flaking', "Concerned about my hair's condition", 'Significant'];

  const activeSymptoms = symptoms.filter(s => responses[s.key] && !NONE_VALUES.includes(responses[s.key]));
  const mildSymptoms = activeSymptoms.filter(s => MILD_VALUES.includes(responses[s.key]));
  const severeSymptoms = activeSymptoms.filter(s => SEVERE_VALUES.includes(responses[s.key]));

  if (risk === 'green') {
    if (activeSymptoms.length === 0) return null;
    if (activeSymptoms.length === 1 && mildSymptoms.length === 1) {
      return "You flagged one area as mild. On its own, that's not a concern, but we'll track it going forward.";
    }
    return null;
  }

  if (risk === 'amber') {
    const names = activeSymptoms.map(s => s.label.toLowerCase()).join(', ');
    return `You've flagged ${names} at a level worth watching. Let's see if these steps help.`;
  }

  if (risk === 'red') {
    if (severeSymptoms.length > 0) {
      return `${severeSymptoms[0].label} at this level needs professional attention.`;
    }
    if (activeSymptoms.length >= 3) {
      return `You've flagged ${activeSymptoms.length} areas of concern. While each one on its own may feel mild, experiencing several at once can sometimes point to something worth checking with a professional.`;
    }
    const names = activeSymptoms.map(s => s.label.toLowerCase()).join(', ');
    return `You've flagged ${names} at a level that needs attention.`;
  }

  return null;
};

const OnboardingTriageResult = ({ risk, symptomResponses, onboardingSymptoms: symptoms, isMale, onContinue, navigate, healthProfile: hp, goals }: OnboardingTriageResultProps) => {
  const checkIn: CheckInData = {
    itch: symptomResponses.itch || 'None', tenderness: symptomResponses.tenderness || 'None',
    hairline: symptomResponses.hairline || 'None', flaking: symptomResponses.flaking || 'None',
    shedding: symptomResponses.shedding || 'None', bumps: symptomResponses.bumps || 'None',
    dryness: symptomResponses.dryness || 'None', type: 'baseline',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  };
  const telogenTriggers = hasTelogenTriggers(hp);
  const triageGuidance = getTriageGuidance(risk, checkIn, []);
  const goalMessage = getGoalMessage(goals, risk);
  const triageReasoning = getTriageReasoning(risk, symptomResponses, symptoms);

  const circleColors: Record<string, string> = { green: 'bg-primary', amber: 'bg-warning', red: 'bg-destructive' };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`w-28 h-28 rounded-full ${circleColors[risk]} flex items-center justify-center`}
        >
          {risk === 'green' && <Check size={40} className="text-primary-foreground" strokeWidth={2} />}
          {risk === 'amber' && <Eye size={40} className="text-warning-foreground" strokeWidth={1.8} />}
          {risk === 'red' && <Stethoscope size={40} className="text-destructive-foreground" strokeWidth={1.8} />}
        </motion.div>
      </div>

      {risk === 'green' && (
        <>
          <h2 className="text-2xl font-semibold text-center mb-2">Looking good</h2>
          <p className="text-muted-foreground text-center mb-6">Based on what you've shared, there are no red flags right now. Your scalp is looking good.</p>
          {triageReasoning && <p className="text-center mb-6" style={{ color: '#7A7570', fontSize: '13px' }}>{triageReasoning}</p>}
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">Keep it up</h3>
            <p className="text-sm text-muted-foreground">Your current routine is working well. We'll check in again at your next scheduled time.</p>
          </div>
          {goalMessage && <div className="rounded-2xl bg-sage-light p-4 mb-4"><p className="text-sm text-foreground">{goalMessage}</p></div>}
          <div className="rounded-2xl bg-sage-light p-5 mb-8">
            <p className="text-sm text-foreground"><strong>Tip:</strong> A gentle scalp massage with your fingertips can help with circulation. You don't need to add product for this to work.</p>
          </div>
          <button onClick={onContinue} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">Continue</button>
        </>
      )}

      {risk === 'amber' && (
        <>
          <h2 className="text-2xl font-semibold text-center mb-2">Some patterns worth watching</h2>
          <p className="text-muted-foreground text-center mb-6">Nothing urgent, but let's keep an eye on a few things</p>
          {triageReasoning && <p className="text-center mb-6" style={{ color: '#7A7570', fontSize: '13px' }}>{triageReasoning}</p>}
          {triageGuidance.length > 0 && (
            <div className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-3">What we're seeing</h3>
              <div className="space-y-3">
                {triageGuidance.map((g, i) => (
                  <p key={i} className="text-sm text-muted-foreground"><strong className="text-foreground">{g.heading}:</strong> {g.message}</p>
                ))}
              </div>
            </div>
          )}
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-3">Recommended next steps</h3>
            <ol className="space-y-3">
              {['Gently cleanse your scalp mid-cycle with a sulphate-free rinse', "Avoid re-tightening your edges. If they're loose, leave them", 'If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help. Avoid heavy oils or butters directly on the scalp as these can clog follicles and worsen buildup.'].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">{i + 1}</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
          {telogenTriggers.length > 0 && (
            <div className="rounded-2xl bg-accent p-5 mb-4">
              <h3 className="font-semibold mb-2">Worth knowing</h3>
              <p className="text-sm text-muted-foreground">You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response, sometimes called telogen effluvium. It usually resolves within 6-12 months, but monitoring helps.</p>
            </div>
          )}
          {goalMessage && <div className="rounded-2xl bg-sage-light p-4 mb-4"><p className="text-sm text-foreground">{goalMessage}</p></div>}
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">We'll reassess</h3>
            <p className="text-sm text-muted-foreground">At your next check-in, we'll compare. If things get worse, check in anytime.</p>
          </div>
          <div className="card-elevated p-4 mb-4 border border-border">
            <h3 className="font-medium text-foreground text-sm mb-1">Want to get ahead of this?</h3>
            <p className="text-xs text-muted-foreground mb-2">Even though this isn't urgent, speaking to a specialist is never a bad idea.</p>
            <button onClick={() => navigate('/find-specialist')} className="text-xs font-medium text-primary">Find a specialist</button>
          </div>
          <button onClick={onContinue} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">Continue</button>
        </>
      )}

      {risk === 'red' && (
        <>
          <h2 className="text-2xl font-semibold text-center mb-2">We recommend professional advice</h2>
          <p className="text-muted-foreground text-center mb-6">Your symptoms suggest a pattern that would benefit from expert review</p>
          {triageReasoning && <p className="text-center mb-6" style={{ color: '#7A7570', fontSize: '13px' }}>{triageReasoning}</p>}
          {triageGuidance.length > 0 && (
            <div className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-3">Pattern analysis</h3>
              <div className="space-y-3">
                {triageGuidance.map((g, i) => (
                  <p key={i} className="text-sm text-muted-foreground"><strong className="text-foreground">{g.heading}:</strong> {g.message}</p>
                ))}
              </div>
            </div>
          )}
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">What this means</h3>
            <p className="text-sm text-muted-foreground">Persistent or worsening symptoms can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.</p>
          </div>
          {telogenTriggers.length > 0 && (
            <div className="rounded-2xl bg-accent p-5 mb-4">
              <h3 className="font-semibold mb-2">Worth knowing</h3>
              <p className="text-sm text-muted-foreground">You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response, sometimes called telogen effluvium. It usually resolves within 6-12 months, but monitoring helps.</p>
            </div>
          )}
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">Your clinical summary is ready</h3>
            <p className="text-sm text-muted-foreground mb-4">A structured summary you can share with a GP, trichologist, or dermatologist. This was generated automatically based on your symptom patterns.</p>
            <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press">View clinical summary</button>
          </div>
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">Who to see</h3>
            <p className="text-sm text-muted-foreground">A trichologist specialises in hair and scalp. A dermatologist can investigate further. Your GP can refer you.{isMale && ' Your barber may also notice changes. Ask them to flag anything they see.'}</p>
          </div>
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">Find a specialist</h3>
            <p className="text-sm text-muted-foreground mb-3">We're building a directory of professionals who understand textured hair.</p>
            <button onClick={() => navigate('/find-specialist')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2">
              <Search size={16} strokeWidth={1.8} /> Find someone near me
            </button>
          </div>
          {goalMessage && <div className="rounded-2xl bg-sage-light p-4 mb-4"><p className="text-sm text-foreground">{goalMessage}</p></div>}
          <button onClick={onContinue} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">Continue</button>
        </>
      )}
    </div>
  );
};

// ─── Length Check Photos Component ────────────────────────────────────────────
interface LengthCheckPhotosProps {
  isShortHair: boolean;
  gender: string;
  onComplete: (photos: { area: string; dataUrl: string }[]) => void;
  onSkip: () => void;
}

const lengthStepsLong = [
  { title: 'Front', instruction: 'Pull a section of hair straight down alongside your face. Show your true length past shrinkage.' },
  { title: 'Side', instruction: 'Pull a section over your ear to show side length.' },
  { title: 'Back', instruction: 'Pull a section down your back to show back length.' },
];

const lengthStepsShort = [
  { title: 'Front', instruction: 'Take a photo of your hair from the front as it is now.' },
  { title: 'Side', instruction: 'Take a photo from the side showing your hair profile.' },
  { title: 'Back', instruction: 'Take a photo from the back showing your hair.' },
];

const getLengthReferenceImage = (gender: string, index: number) => {
  const isMale = gender === 'man';
  const femaleRefs = [scalpFrontFemale, scalpSideFemale, scalpBackFemale];
  const maleRefs = [scalpSideMaleA, scalpSideMaleB, scalpBackMale];
  return (isMale ? maleRefs : femaleRefs)[index] || femaleRefs[index] || '';
};

const LengthCheckPhotos = ({ isShortHair, gender, onComplete, onSkip }: LengthCheckPhotosProps) => {
  const steps = isShortHair ? lengthStepsShort : lengthStepsLong;
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<{ area: string; dataUrl: string }[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const step = steps[currentStep];
  const referenceImage = getLengthReferenceImage(gender, currentStep);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUse = () => {
    if (!preview) return;
    const newPhotos = [...photos, { area: step.title, dataUrl: preview }];
    setPhotos(newPhotos);
    setPreview(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newPhotos);
    }
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{currentStep + 1} of {steps.length}</p>
      <h2 className="text-lg font-semibold text-foreground mb-1">{step.title}</h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{step.instruction}</p>

      {!preview ? (
        <>
          <div className="rounded-xl overflow-hidden border border-border mb-5 bg-accent/20">
            <img
              src={referenceImage}
              alt={`Reference: ${step.title}`}
              style={{ width: '100%', height: '200px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.15)' }}
            />
          </div>
          <div className="space-y-3">
            <label className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Camera size={18} strokeWidth={1.8} /> Take photo
              <input type="file" accept="image/*" capture="user" onChange={handleFile} className="hidden" />
            </label>
            <label className="w-full h-14 rounded-xl border-2 border-border font-semibold text-sm text-foreground flex items-center justify-center gap-2 cursor-pointer">
              <ImageIcon size={18} strokeWidth={1.8} /> Choose from gallery
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <button onClick={onSkip} className="w-full text-center text-sm text-muted-foreground mt-4 py-2">
            Skip length check
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl overflow-hidden border border-border mb-5">
            <img
              src={preview}
              alt={`Preview: ${step.title}`}
              style={{ width: '100%', height: '240px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.1)' }}
            />
          </div>
          <div className="space-y-3">
            <button onClick={handleUse} className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press">
              Use this photo
            </button>
            <button onClick={() => setPreview(null)} className="w-full h-14 rounded-xl border-2 border-border font-semibold text-sm text-foreground btn-press">
              Retake
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
