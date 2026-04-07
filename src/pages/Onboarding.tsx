import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, HelpCircle, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Camera, ImagePlus, X, Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
<<<<<<< HEAD
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
=======
import { computeHistoricalRisk, getTriageGuidance } from '@/utils/triageLogic';
import type { CheckInData, HealthProfileData } from '@/contexts/AppContext';
import { Leaf } from 'lucide-react';
import ScalpBaselineCapture from '@/components/ScalpBaselineCapture';
import NorwoodScale from '@/components/NorwoodScale';
import { computeMaleTriageRisk, getMaleTriageMessage, getMaleTriageReasoning, getSeverityTransitionText, computeSeverityDotSummary, getInterimCareSteps, getSeverityLevel } from '@/utils/maleTriageLogic';
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:           '#FAF8F5',
  card:         '#FFFFFF',
  cardBorder:   '#E8DED1',
  cardFill:     '#D4A866',
  cardFillText: '#FFFFFF',
  cardBorderSel:'#B8893E',
  ink:          '#1C1C1C',
  heading:      '#4A4540',
  gold:         '#D4A866',
  goldDeep:     '#B8893E',
  gold10:       'rgba(212,168,102,0.10)',
  goldBorder:   'rgba(212,168,102,0.30)',
  muted:        '#999999',
  warm:         '#666666',
  mid:          '#E8DED1',
};

<<<<<<< HEAD
const dm = "'DM Sans', sans-serif";

// ─── HAIR REFERENCE PHOTOS ───────────────────────────────────────────────────
const hairPhotos: Record<string, Record<string, { src: string; label: string }[]>> = {
  type3: {
    female: [
      { src: 'https://i.pinimg.com/736x/99/59/67/995967923455cf9abd0b8ef9d4e4ba81.jpg', label: 'Type 3: S-shaped curls, bouncy' },
      { src: 'https://i.pinimg.com/1200x/59/e2/50/59e250e2cbe1244e3e2196678551b14b.jpg', label: 'Type 3: Tighter curls, voluminous' },
    ],
    male: [
      { src: 'https://i.pinimg.com/736x/a2/24/c0/a224c05d0dfbda56c5e6841df83067ef.jpg', label: 'Type 3: Defined curls, medium density' },
    ],
  },
  type4: {
    female: [
      { src: 'https://i.pinimg.com/1200x/35/a3/1c/35a31cd46add2f0f7c933f348c60420e.jpg', label: 'Type 4a: Defined coils, springy' },
      { src: 'https://i.pinimg.com/1200x/1b/47/2c/1b472c56063b6145d0945cc232fd056d.jpg', label: 'Type 4b: Z-pattern coils, dense' },
      { src: 'https://i.pinimg.com/736x/a7/e7/9a/a7e79acc50020c6f6d793291e1c4c2e9.jpg', label: 'Type 4c: Tight coils, significant shrinkage' },
    ],
    male: [
      { src: 'https://i.pinimg.com/1200x/c1/f8/13/c1f8138c7a1b36c682dd42554dc9b227.jpg', label: 'Type 4: Tight coils, dense, afro' },
      { src: 'https://i.pinimg.com/736x/f5/ea/1e/f5ea1e1fe243495ddf4c22800791e0c6.jpg', label: 'Type 4: Coily texture, fade' },
    ],
  },
};
=======
import refFemaleFront from '@/assets/ref-female-front.jpg';
import scalpSideFemale from '@/assets/scalp-side-female.jpeg';
import scalpBackFemale from '@/assets/scalp-back-female.jpeg';
import refFemaleTop from '@/assets/ref-female-top.jpg';
import refMaleFront from '@/assets/ref-male-front.jpg';
import scalpSideMaleB from '@/assets/scalp-side-male-b.jpeg';
import scalpBackMale from '@/assets/scalp-back-male.png';
import refMaleTop from '@/assets/ref-male-top.png';
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8

const hairTypes = [
  { id: 'type4', label: 'Type 4: Coily', desc: 'Tight coils or zig-zag pattern, dense texture, significant shrinkage' },
  { id: 'type3', label: 'Type 3: Curly', desc: 'Visible curl pattern, S-shaped curls, looser texture' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay. We'll use the most inclusive settings" },
];

interface SubTypeOption { id: string; label: string; }
const subTypes: Record<string, SubTypeOption[]> = {
  type4: [{ id: '4a', label: '4A' }, { id: '4b', label: '4B' }, { id: '4c', label: '4C' }, { id: 'mixed', label: 'Mixed' }, { id: 'not-sure', label: 'Not sure' }],
  type3: [{ id: '3a', label: '3A' }, { id: '3b', label: '3B' }, { id: '3c', label: '3C' }, { id: 'mixed', label: 'Mixed' }, { id: 'not-sure', label: 'Not sure' }],
};

<<<<<<< HEAD
const femaleStyleOptions = ['Braids', 'Locs', 'Twists', 'Twist out', 'Wig', 'Weave', 'Silk press', 'Blow out', 'Loose natural', 'Wash and go', 'Cornrows', 'Other'];
const maleStyleOptions   = ['Low cut / fade', 'Waves', 'Locs', 'Twists', 'Cornrows', 'Afro', 'Bald / shaved', 'Other'];
const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions    = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions    = ['Nothing', 'Oil my scalp', 'Use a scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions        = ['Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness', 'I just want to stay on top of things', 'Not sure'];

interface CapturedPhoto { area: string; dataUrl: string; }

const PHOTO_AREAS = [
  { id: 'hairline', label: 'Hairline / edges', tip: 'Face camera towards your hairline, especially at the temples.' },
  { id: 'nape',     label: 'Nape',             tip: 'Photograph the back of your neck hairline.' },
  { id: 'crown',    label: 'Crown / top',       tip: 'Part your hair and photograph the scalp at the crown.' },
];

const TOTAL_SCREENS = 5;
=======
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
const cycleLengthOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'Not sure yet'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness',
  'Going grey or premature greying',
  'I just want to stay on top of things', 'Not sure',
];

const maleConcernOptions = [
  'Hairline recession', 'Thinning at the crown', 'Razor bumps or ingrowns',
  'Itching or flaking', 'Scalp irritation',
  'I just want to stay on top of things', 'Not sure',
];

// New male onboarding symptom questions
const maleCoreSymptomsNew = [
  { key: 'hairlineChange', label: 'Hairline changes', question: 'Have you noticed any changes to your hairline recently?' },
  { key: 'thinning', label: 'Thinning', question: 'Any thinning at your temples or crown?' },
  { key: 'scalpIssues', label: 'Scalp issues', question: 'Any itching, flaking, or dryness?' },
];

const maleSecondaryShortHair = [
  { key: 'razorBumps', label: 'Razor bumps', question: 'Any razor bumps or ingrown hairs?' },
  { key: 'barberIrritation', label: 'Barber irritation', question: 'Any scalp irritation after your last cut?' },
];

const maleSecondaryLongHair = [
  { key: 'buildup', label: 'Buildup', question: 'Any buildup or odour between washes?' },
  { key: 'tenderness', label: 'Tenderness', question: 'Any tenderness or tightness at the roots?' },
];

const maleSecondaryAfro = [
  { key: 'breakage', label: 'Breakage', question: 'Any breakage or excessive shedding?' },
];

const maleNewDescriptors: Record<string, Record<string, string>> = {
  hairlineChange: { None: 'No changes noticed', Mild: 'Something looks slightly different but hard to say', Moderate: 'Hairline has visibly moved back or thinned', Severe: 'Clear recession or thinning compared to a year ago' },
  thinning: { None: 'No thinning', Mild: 'Slightly thinner at the crown or temples', Moderate: 'Noticeably thinner areas, scalp more visible', Severe: 'Scalp clearly visible, hairline receding' },
  scalpIssues: { None: 'No scalp issues', Mild: 'Occasional itch or a few flakes', Moderate: 'Frequent itching, visible flaking, or persistent dryness', Severe: 'Constant discomfort, heavy flaking, or painful dryness' },
  razorBumps: { None: 'No razor bumps', Mild: 'A few bumps after a cut, go away on their own', Moderate: 'Regular bumps after cuts, some painful or inflamed', Severe: 'Persistent bumps, painful, some with pus or scarring' },
  barberIrritation: { None: 'No irritation after cuts', Mild: 'Slight redness or sensitivity for a day or two', Moderate: 'Burning, stinging, or rash lasting several days', Severe: 'Intense reaction every time, open sores or lasting marks' },
  buildup: { None: 'No buildup or odour', Mild: 'Slight buildup, no smell', Moderate: 'Noticeable buildup or faint odour', Severe: 'Heavy buildup, persistent odour despite washing' },
  tenderness: { None: 'No tenderness', Mild: 'Slight tightness, goes away quickly', Moderate: 'Sore to touch, especially after a fresh install', Severe: 'Painful without touching, constant tightness' },
  breakage: { None: 'No breakage', Mild: 'A few short pieces when styling', Moderate: 'Noticeable shedding, uneven lengths appearing', Severe: 'Significant breakage or shedding daily' },
};

// ─── CHEMICAL PROCESSING ─────────────────────────────────────────────────────
const chemicalOptions = [
  { id: 'natural', label: 'No, fully natural' },
  { id: 'current', label: 'Yes, currently' },
  { id: 'growing-out', label: 'Previously, growing out' },
  { id: 'unsure', label: 'Not sure' },
];
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8

// ─── SHARED STYLE HELPERS ────────────────────────────────────────────────────
const card = (selected: boolean): React.CSSProperties => ({
  width: '100%', textAlign: 'left', padding: '13px 15px', borderRadius: 14,
  border: `1.5px solid ${selected ? C.cardBorderSel : C.cardBorder}`,
  background: selected ? C.cardFill : C.card,
  cursor: 'pointer', transition: 'all 0.18s',
  boxShadow: selected ? '0 3px 12px rgba(212,168,102,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
  display: 'block', fontFamily: dm,
});

const pill = (selected: boolean): React.CSSProperties => ({
  padding: '9px 16px', borderRadius: 100, fontSize: 13, fontFamily: dm, fontWeight: 500,
  border: `1.5px solid ${selected ? C.cardBorderSel : C.cardBorder}`,
  background: selected ? C.cardFill : C.card,
  color: selected ? C.cardFillText : C.warm,
  cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' as const,
  boxShadow: selected ? '0 2px 8px rgba(212,168,102,0.25)' : 'none',
});

<<<<<<< HEAD
// ─── CURL ICON ────────────────────────────────────────────────────────────────
const CurlIcon = ({ type, selected }: { type: string; selected: boolean }) => {
  const color = selected ? '#FFFFFF' : C.muted;
  if (type === 'unsure') return <HelpCircle size={17} color={color} strokeWidth={1.5} />;
  if (type === 'type3')  return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>;
  if (type === 'type4')  return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return null;
};

// ─── TAP-TO-REVEAL PHOTO GALLERY ─────────────────────────────────────────────
const PhotoGallery = ({ photos }: { photos: { src: string; label: string }[] }) => {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;
  if (photos.length === 1) return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
      style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.cardBorder}` }}>
      <img src={photos[0].src} alt={photos[0].label} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', padding: '6px', background: '#F5F0EB' }}>{photos[0].label}</p>
    </motion.div>
=======
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
  hairlineChange: {
    mild: "Slight changes are hard to be sure about. Good that you're tracking.",
    moderate: "Visible changes to your hairline are worth monitoring closely.",
    severe: "That level of change deserves professional attention. We'll help you take the next step.",
  },
  thinning: {
    mild: "Slight thinning can be hard to spot. Good that you noticed.",
    moderate: "Noticeable thinning is worth paying attention to. We'll track this closely.",
    severe: "Significant thinning deserves professional input. We'll help you take the right next step.",
  },
  scalpIssues: {
    mild: "Noted. We'll factor this into your profile.",
    moderate: "Persistent scalp issues are worth investigating. We're tracking this.",
    severe: "Severe scalp discomfort needs attention. We're noting this carefully.",
  },
  buildup: {
    mild: "Noted. We'll track this.",
    moderate: "Noticeable buildup is worth addressing. We'll keep an eye on it.",
    severe: "Heavy buildup can affect scalp health. Good that you're telling us.",
  },
  breakage: {
    mild: "Noted. We'll see how this tracks over time.",
    moderate: "More breakage than expected. Could be worth looking at your routine.",
    severe: "That level of breakage can signal something deeper going on. Good that you're telling us.",
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

// Total main screens
const TOTAL_PROGRESS_SEGMENTS_FEMALE = 8;
const TOTAL_PROGRESS_SEGMENTS_MALE = 8; // gender, norwood, family, styles, cadence, concerns, guidelines+photos, symptoms

const Onboarding = () => {
  const navigate = useNavigate();
  const {
    onboardingData, setOnboardingData, setOnboardingComplete,
    addToCheckInHistory, setCurrentCheckIn, setBaselineRisk, setBaselineDate, setBaselinePhotos,
    healthProfile,
  } = useApp();

  const [step, setStep] = useState(-1);
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
  const [chemicalStep, setChemicalStep] = useState(0);
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

  // Male-specific onboarding state
  const [norwoodStage, setNorwoodStage] = useState(onboardingData.norwoodBaseline || '');
  const [mFamilyHistory, setMFamilyHistory] = useState(onboardingData.familyHistory || '');
  const [mCutCadence, setMCutCadence] = useState(onboardingData.cutCadence || '');

  // Male style classification
  const maleHasShortStyles = isMale && styles.some(s => ['Low cut / fade', 'Waves', 'Bald / shaved'].includes(s));
  const maleHasLongStyles = isMale && styles.some(s => maleLongStyleNames.includes(s));
  const maleHasAfroOnly = isMale && styles.includes('Afro') && !maleHasShortStyles && !maleHasLongStyles;
  const maleIsShortHairOnly = isMale && !maleHasLongStyles;
  const maleNeedsProtectiveQ = isMale && styles.some(s => [...maleLongStyleNames, 'Afro'].includes(s));

  // Compute male-specific active symptoms based on style selection
  const getMaleActiveSymptoms = () => {
    const core = [...maleCoreSymptomsNew];
    if (maleHasShortStyles) {
      return [...core, ...maleSecondaryShortHair];
    }
    if (maleHasLongStyles) {
      return [...core, ...maleSecondaryLongHair];
    }
    if (maleHasAfroOnly) {
      return [...core, ...maleSecondaryAfro];
    }
    return core;
  };

  // Active symptoms and descriptors based on gender/style
  const activeSymptoms = isMale ? getMaleActiveSymptoms() : onboardingSymptoms;
  const activeDescriptors = isMale
    ? { ...severityDescriptors, ...maleNewDescriptors }
    : severityDescriptors;
  const activeBetweenWashOptions = betweenWashOptions;

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
      if (step === 20) return 1; // Norwood
      if (step === 21) return 2; // Family history
      if (step === 22) return 3; // Styles
      if (step === 23) return 4; // Cut cadence
      if (step === 24) return 5; // Concerns
      if (step === 6 || step === 7) return 6; // Guidelines + photos
      if (step === 8) return 7; // Symptoms
      if (step >= 9) return 7;
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
      case -1: return true;
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
    itch: responses.itch || responses.scalpIssues || 'None',
    tenderness: responses.tenderness || 'None',
    hairline: responses.hairline || responses.hairlineChange || 'None',
    flaking: responses.flaking || 'None',
    shedding: responses.shedding || responses.breakage || 'None',
    bumps: responses.bumps || 'None',
    dryness: responses.dryness || 'None',
    razorBumps: responses.razorBumps || 'None',
    barberIrritation: responses.barberIrritation || 'None',
    type: 'baseline',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  });

  const computeRisk = (responses: Record<string, string>): 'green' | 'amber' | 'red' => {
    if (isMale) {
      const checkIn = buildCheckInFromSymptoms(responses);
      return computeMaleTriageRisk(checkIn, [], norwoodStage, norwoodStage);
    }
    const checkIn = buildCheckInFromSymptoms(responses);
    return computeHistoricalRisk(checkIn, []);
  };

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
      norwoodBaseline: norwoodStage,
      familyHistory: mFamilyHistory,
      cutCadence: mCutCadence,
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
            const risk = isMale ? computeMaleTriageRisk(checkIn, [], norwoodStage, norwoodStage) : computeHistoricalRisk(checkIn, []);
            setTriageResult(risk);
            setSymptomPhase('thanks');
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
          const risk = isMale ? computeMaleTriageRisk(checkIn, [], norwoodStage, norwoodStage) : computeHistoricalRisk(checkIn, []);
          setTriageResult(risk);
          setSymptomPhase('thanks');
        }
      } else if (symptomPhase === 'result') {
        if (isMale) {
          setStep(11); // Skip length check for males
        } else {
          setStep(9);
        }
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
    } else if (isMale) {
      // Male back navigation
      if (step === 20) { setStep(0); return; }
      if (step === 21) { setStep(20); return; }
      if (step === 22) { setStep(21); return; }
      if (step === 23) { setStep(22); return; }
      if (step === 24) { setStep(23); return; }
      if (step === 6) { setStep(24); return; }
      if (step === 7) { setStep(6); return; }
      if (step === 11) { setStep(8); return; }
      setStep(step - 1);
    } else if (step > 0) {
      if (step === 2) setChemicalStep(0);
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const isShortHairStyle = styles.some(s =>
    ['Low cut / fade', 'Bald / shaved', 'Afro', 'High top'].includes(s) ||
    s.toLowerCase().includes('twa')
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8
  );
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
      style={{ marginTop: 10, position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.cardBorder}` }}>
      <img src={photos[idx].src} alt={photos[idx].label} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', padding: '6px', background: '#F5F0EB' }}>{photos[idx].label}</p>
      {[{ side: 'left', fn: () => setIdx(i => (i - 1 + photos.length) % photos.length), Icon: ChevronLeft },
        { side: 'right', fn: () => setIdx(i => (i + 1) % photos.length), Icon: ChevronRight }].map(({ side, fn, Icon }) => (
        <button key={side} onClick={e => { e.stopPropagation(); fn(); }}
          style={{ position: 'absolute', [side]: 8, top: 95, transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon size={13} color={C.goldDeep} />
        </button>
      ))}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
        {photos.map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? C.goldDeep : 'rgba(184,137,62,0.3)' }} />)}
      </div>
    </motion.div>
  );
};

<<<<<<< HEAD
// ─── PHOTO CAPTURE STEP ───────────────────────────────────────────────────────
const PhotoCaptureStep = ({
  photos, onAdd, onRemove,
}: { photos: CapturedPhoto[]; onAdd: (p: CapturedPhoto) => void; onRemove: (i: number) => void }) => {
  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [activeArea, setActiveArea] = useState(PHOTO_AREAS[0].id);

  const handleFile = (file: File, area: string) => {
    const reader = new FileReader();
    reader.onload = e => { if (e.target?.result) onAdd({ area, dataUrl: e.target.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, area: string) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, area);
    e.target.value = '';
  };
=======
  const getButtonText = () => {
    if (step === -1) return '';
    if (step === 2 && chemicalStep === 1) return 'Next';
    if (step === 6) return '';
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

  // Hide bottom button on welcome, auto-advance screens, photo capture, consent, male-specific screens, and symptom flow
  const showBottomButton = step !== -1 && step !== 0 && step !== 1 && step !== 6 && step !== 7 && step !== 9
    && step !== 20 && step !== 21 && step !== 22 && step !== 23 && step !== 24
    && !(step === 8 && (symptomPhase === 'transition' || symptomPhase === 'symptoms' || symptomPhase === 'thanks' || symptomPhase === 'result'))
    && !(step === 2 && chemicalStep !== 1);
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8

  const activeAreaData = PHOTO_AREAS.find(a => a.id === activeArea)!;

  return (
    <div>
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleInput(e, activeArea)} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleInput(e, activeArea)} />

<<<<<<< HEAD
      {/* Area tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {PHOTO_AREAS.map(a => (
          <button key={a.id} onClick={() => setActiveArea(a.id)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 12, fontFamily: dm, fontSize: 11, fontWeight: 600,
            border: `1.5px solid ${activeArea === a.id ? C.cardBorderSel : C.cardBorder}`,
            background: activeArea === a.id ? C.cardFill : C.card,
            color: activeArea === a.id ? '#fff' : C.warm,
            cursor: 'pointer', transition: 'all 0.18s', textAlign: 'center',
          }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Tip */}
      <div style={{ background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 13, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
        <p style={{ fontFamily: dm, fontSize: 12, color: C.goldDeep, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{activeAreaData.tip}</p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Take photo', sub: 'Use camera', icon: <Camera size={20} color={C.goldDeep} strokeWidth={1.5} />, action: () => cameraRef.current?.click() },
          { label: 'From gallery', sub: 'Choose existing', icon: <ImagePlus size={20} color={C.goldDeep} strokeWidth={1.5} />, action: () => galleryRef.current?.click() },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '18px 12px', background: C.card, border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.cardBorderSel)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.cardBorder)}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.gold10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {btn.icon}
            </div>
            <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading }}>{btn.label}</span>
            <span style={{ fontFamily: dm, fontSize: 11, color: C.muted }}>{btn.sub}</span>
          </button>
        ))}
      </div>

      {/* Previews */}
      {photos.length > 0 && (
        <div>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>
            Added · {photos.length} photo{photos.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${C.cardBorder}` }}>
                <img src={p.dataUrl} alt={p.area} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 7px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                  <span style={{ fontFamily: dm, fontSize: 9, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.area}</span>
                </div>
                <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(28,28,28,0.75)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} color="#fff" />
                </button>
=======
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
                    className="h-1 rounded-full bg-border overflow-hidden"
                    style={{ width: '28px' }}
                  >
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: i <= activeSegment ? '100%' : '0%',
                        transition: 'width 300ms ease-out',
                      }}
                    />
                  </div>
                ))}
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setOnboardingComplete } = useApp();

  const [step, setStep]           = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const gender    = onboardingData.gender;
  const isMale    = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  const [hairType, setHairType]       = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const [chemicalStatus] = useState(onboardingData.chemicalProcessing || '');
  const [styles, setStyles]                 = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle]         = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const [cycleLength, setCycleLength]       = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash]       = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');
  const [concerns, setConcerns]             = useState<string[]>(onboardingData.goals || []);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;

  const toggleStyle       = (s: string) => setStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleBetweenWash = (v: string) => {
    if (v === 'Nothing') { setBetweenWash(p => p.includes(v) ? [] : [v]); return; }
    setBetweenWash(p => { const w = p.filter(x => x !== 'Nothing'); return w.includes(v) ? w.filter(x => x !== v) : [...w, v]; });
  };
  const toggleConcern = (c: string) => setConcerns(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const canProceed = () => {
    if (step === 0) return !!hairType;
    if (step === 1) return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
    if (step === 2) return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
    if (step === 3) return concerns.length > 0;
    if (step === 4) return true; // photos optional
    return false;
  };

  const handleNext = async () => {
    if (step < TOTAL_SCREENS - 1) { setStep(s => s + 1); return; }

    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No session found. Please log in again.');

      const effectiveHairType = hairSubType || hairType;
      const finalStyles       = styles.includes('Other') ? [...styles.filter(s => s !== 'Other'), otherStyle.trim()] : styles;
      const finalBetweenWash  = betweenWash.includes('Other') ? [...betweenWash.filter(b => b !== 'Other'), otherBetweenWash.trim()] : betweenWash;

      // 1. Save consumer profile
      const { error: saveError } = await supabase
        .from('consumer_profiles')
        .upsert({
          user_id:                    session.user.id,
          gender:                     gender || null,
          hair_texture:               effectiveHairType,
          current_styles:             finalStyles,
          protective_style_frequency: protectiveFreq || null,
          style_duration:             cycleLength || null,
          between_wash_care:          finalBetweenWash,
          between_wash_other:         betweenWash.includes('Other') ? otherBetweenWash.trim() : null,
          top_concerns:               concerns,
          chemical_processing:        chemicalStatus || null,
          current_style_start_date:   new Date().toISOString().split('T')[0],
          updated_at:                 new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (saveError) throw saveError;

      // 2. Save baseline photos if any were captured
      if (capturedPhotos.length > 0) {
        const result = await createCheckinWithPhotos({
          userId:     session.user.id,
          type:       'baseline',
          symptoms:   {},
          isBaseline: true,
          photos:     capturedPhotos.map(p => ({ dataUrl: p.dataUrl, area: p.area })),
        });

        if (!result.success) {
          // Non-fatal — log but don't block onboarding completion
          console.warn('Baseline photo upload partial failure:', result.error);
        }
      }

      // 3. Update local context and navigate
      setOnboardingData({
        ...onboardingData,
        hairType: effectiveHairType,
        protectiveStyles: styles,
        otherStyle,
        protectiveStyleFrequency: protectiveFreq,
        isWornOutOnly: false,
        cycleLength,
        betweenWashCare: betweenWash,
        otherBetweenWashCare: otherBetweenWash,
        goals: concerns,
      });
      sessionStorage.setItem('follisense-just-onboarded', 'true');
      setOnboardingComplete(true);
      navigate('/home');

    } catch (err ) {
      console.error('Onboarding save error:', err);
      toast({ title: 'Could not save your profile', description: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); else navigate(-1); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 16px 60px', fontFamily: dm }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 520 }}>

        <div style={{ backgroundColor: C.card, borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)', padding: '24px 28px 28px', display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={handleBack} style={{ padding: 8, marginLeft: -8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={22} strokeWidth={1.8} color={C.ink} />
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
                <div key={i} style={{ height: 4, width: i === step ? 22 : 7, borderRadius: 100, background: i < step ? C.gold : i === step ? C.ink : C.cardBorder, transition: 'all 0.3s ease' }} />
              ))}
            </div>
            <span style={{ fontFamily: dm, fontSize: 11, color: C.muted, fontWeight: 600 }}>{step + 1} / {TOTAL_SCREENS}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              style={{ paddingBottom: 24 }}>

              {/* ── Step 1: Hair Texture ── */}
              {step === 0 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 1 — Hair texture</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>What's your hair texture?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Type 4 coils are tighter than a pen spring. Type 3 curls wrap around a finger.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hairTypes.map(ht => {
                      const sel = hairType === ht.id;
                      const photos = ht.id !== 'unsure' && hairPhotos[ht.id]
                        ? isNeutral ? [...(hairPhotos[ht.id].female || []), ...(hairPhotos[ht.id].male || [])]
                          : isMale ? hairPhotos[ht.id].male || [] : hairPhotos[ht.id].female || []
                        : [];
                      const photoOpen = expandedPhoto === ht.id;

                      return (
                        <div key={ht.id} style={card(sel)}>
                          <button onClick={() => { setHairType(ht.id); setHairSubType(''); setShowSubType(false); }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: sel ? 'rgba(255,255,255,0.2)' : '#F5F0EB', border: `1px solid ${sel ? 'rgba(255,255,255,0.3)' : C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CurlIcon type={ht.id} selected={sel} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: sel ? '#fff' : C.heading, marginBottom: 2 }}>{ht.label}</p>
                                <p style={{ fontFamily: dm, fontSize: 11, color: sel ? 'rgba(255,255,255,0.75)' : C.muted, lineHeight: 1.45 }}>{ht.desc}</p>
                              </div>
                              {sel && (
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                </div>
                              )}
                            </div>
                          </button>

                          {photos.length > 0 && (
                            <button onClick={e => { e.stopPropagation(); setExpandedPhoto(photoOpen ? null : ht.id); }}
                              style={{ width: '100%', marginTop: 10, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: dm, fontSize: 11, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.85)' : C.goldDeep }}>
                              {photoOpen ? <><ChevronUp size={13} /> Hide examples</> : <><ChevronDown size={13} /> See examples</>}
                            </button>
                          )}
                          <AnimatePresence>
                            {photoOpen && <PhotoGallery photos={photos} />}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {(hairType === 'type3' || hairType === 'type4') && !showSubType && (
                    <button onClick={() => setShowSubType(true)} style={{ marginTop: 14, fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      Want to be more specific? <ChevronDown size={13} />
                    </button>
                  )}
                  {showSubType && subTypes[hairType] && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 10 }}>Which sub-type?</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {subTypes[hairType].map(st => <button key={st.id} onClick={() => setHairSubType(st.id)} style={pill(hairSubType === st.id)}>{st.label}</button>)}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 2: Styles ── */}
              {step === 1 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 2 — Your styles</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>How do you usually wear your hair?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Select everything you rotate between</p>

                  {(() => {
                    const defaultCount = isMale ? 6 : 8;
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {rawStyleOptions.slice(0, defaultCount).map(s => (
                            <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '13px 10px' }}>
                              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: styles.includes(s) ? '#fff' : C.warm, lineHeight: 1.35, margin: 0 }}>{s}</p>
                            </button>
                          ))}
                        </div>
                        {rawStyleOptions.length > defaultCount && !showMoreStyles && (
                          <button onClick={() => setShowMoreStyles(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, marginTop: 10, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                            Show more styles <ChevronDown size={14} />
                          </button>
                        )}
                        {showMoreStyles && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            {rawStyleOptions.slice(defaultCount).map(s => (
                              <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '13px 10px' }}>
                                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: styles.includes(s) ? '#fff' : C.warm, lineHeight: 1.35, margin: 0 }}>{s}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {styles.includes('Other') && (
                    <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style"
                      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${C.cardBorder}`, background: C.card, fontFamily: dm, fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box', marginTop: 8 }} />
                  )}

                  {styles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>How often are you in protective styles?</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {protectiveFreqOptions.map(o => <button key={o} onClick={() => setProtectiveFreq(o)} style={pill(protectiveFreq === o)}>{o}</button>)}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 3: Routine ── */}
              {step === 2 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 3 — Your routine</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Your wash routine</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>This is how we time your check-ins to your actual routine.</p>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>How long do you usually keep a style in?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                    {cycleLengthOptions.map(o => <button key={o} onClick={() => setCycleLength(o)} style={pill(cycleLength === o)}>{o}</button>)}
                  </div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>What do you do for your scalp between washes?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {betweenWashOptions.map(o => <button key={o} onClick={() => toggleBetweenWash(o)} style={pill(betweenWash.includes(o))}>{o}</button>)}
                  </div>
                  {betweenWash.includes('Other') && (
                    <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?"
                      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${C.cardBorder}`, background: C.card, fontFamily: dm, fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box', marginTop: 8 }} />
                  )}
                </div>
              )}

              {/* ── Step 4: Concerns ── */}
              {step === 3 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 4 — What matters</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>What matters most right now?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Select all that apply — this shapes your check-in focus.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {concernOptions.map(c => {
                      const sel = concerns.includes(c);
                      return (
                        <button key={c} onClick={() => toggleConcern(c)} style={{ ...card(sel), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: sel ? '#fff' : C.warm, margin: 0 }}>{c}</p>
                          {sel && (
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Step 5: Baseline Photos ── */}
              {step === 4 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 5 — Baseline photos</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Capture your baseline</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.6 }}>
                    Photos of your hairline and nape help us track changes over time. You can always add these later.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 100, marginBottom: 20 }}>
                    <Sparkles size={11} color={C.goldDeep} />
                    <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.goldDeep, letterSpacing: '0.03em' }}>Saved to your profile & analysed over time</span>
                  </div>
                  <PhotoCaptureStep
                    photos={capturedPhotos}
                    onAdd={p => setCapturedPhotos(prev => [...prev, p])}
                    onRemove={i => setCapturedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  />
                  <button onClick={handleNext} style={{ width: '100%', textAlign: 'center', fontFamily: dm, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0 0' }}>
                    {capturedPhotos.length > 0 ? 'Or skip for now' : 'Skip for now →'}
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ── CTA ── */}
          {step !== 4 && (
            <div style={{ paddingTop: 8 }}>
              <button onClick={handleNext} disabled={!canProceed() || isLoading} style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                fontFamily: dm, fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
                cursor: canProceed() && !isLoading ? 'pointer' : 'not-allowed',
                background: canProceed() && !isLoading ? C.ink : C.cardBorder,
                color: canProceed() && !isLoading ? '#fff' : C.muted,
                transition: 'all 0.2s ease',
                boxShadow: canProceed() && !isLoading ? '0 4px 14px rgba(28,28,28,0.2)' : 'none',
              }}>
                {isLoading ? 'Saving…' : 'Continue'}
              </button>
            </div>
          )}

<<<<<<< HEAD
          {/* Photos step — gold CTA when photos added */}
          {step === 4 && capturedPhotos.length > 0 && (
            <div style={{ paddingTop: 12 }}>
              <button onClick={handleNext} disabled={isLoading} style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                fontFamily: dm, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: C.ink, color: '#fff',
                boxShadow: '0 4px 14px rgba(28,28,28,0.2)',
              }}>
                {isLoading ? 'Uploading…' : `Save ${capturedPhotos.length} photo${capturedPhotos.length > 1 ? 's' : ''} & finish →`}
=======
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
                            setStep(opt.id === 'man' ? 20 : 1);
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

                {/* ── Screen 20 (MALE): Norwood Scale Self-Assessment ── */}
                {step === 20 && (
                  <div>
                    <NorwoodScale
                      selected={norwoodStage}
                      onSelect={(stage) => setNorwoodStage(stage)}
                    />
                    {norwoodStage && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <button
                          onClick={() => setStep(21)}
                          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                        >
                          Next
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 21 (MALE): Family History (auto-advance) ── */}
                {step === 21 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Does hair loss run in your family?</h2>
                    <p className="text-sm text-muted-foreground mb-6">Family history helps us understand your risk profile.</p>
                    <div className="space-y-3">
                      {["Yes, father's side", "Yes, mother's side", "Yes, both sides", "No", "Not sure"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            setMFamilyHistory(opt);
                            setTimeout(() => setStep(22), 200);
                          }}
                          className={`selection-card w-full text-left ${mFamilyHistory === opt ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{opt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Screen 22 (MALE): Hairstyles (multi-select + Next) ── */}
                {step === 22 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">How do you usually wear your hair?</h2>
                    <p className="text-sm text-muted-foreground mb-5">Select everything you rotate between.</p>
                    <div className="flex flex-wrap gap-2">
                      {maleStyleOptions.map(s => (
                        <button
                          key={s}
                          onClick={() => toggleStyle(s)}
                          className={`pill-option ${styles.includes(s) ? 'selected' : ''}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {styles.includes('Other') && (
                      <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style" className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-3" />
                    )}
                    {styles.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                        <button
                          onClick={() => setStep(23)}
                          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                        >
                          Next
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 23 (MALE): Cut/Maintenance Cadence (auto-advance) ── */}
                {step === 23 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">How often do you get your hair cut or maintained?</h2>
                    <p className="text-sm text-muted-foreground mb-6">This sets your check-in reminders.</p>
                    <div className="space-y-3">
                      {["Weekly", "Every 2 weeks", "Monthly", "Every 6+ weeks", "I maintain it myself"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            setMCutCadence(opt);
                            setTimeout(() => setStep(24), 200);
                          }}
                          className={`selection-card w-full text-left ${mCutCadence === opt ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{opt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Screen 24 (MALE): What matters most to you ── */}
                {step === 24 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">What matters most to you right now?</h2>
                    <p className="text-sm text-muted-foreground mb-4">This personalises your experience so we focus on what matters to you.</p>
                    <p className="text-muted-foreground mb-4 text-sm">Select all that apply</p>
                    <div className="space-y-3">
                      {maleConcernOptions.map(c => (
                        <button key={c} onClick={() => toggleConcern(c)} className={`selection-card w-full text-left ${concerns.includes(c) ? 'selected' : ''}`}>
                          <p className="font-medium text-foreground text-sm">{c}</p>
                        </button>
                      ))}
                    </div>
                    {concerns.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                        <button
                          onClick={() => setStep(6)}
                          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
                        >
                          Next
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}


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
                            style={{ color: '#7A7570', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            What counts?
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
                        <p className="font-semibold text-foreground mb-3">How long are you planning to keep your current style?</p>
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
                      {concernOptions.map(c => (
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
                      {isMale
                        ? "These photos help you spot hairline changes that happen too slowly to notice day to day. We'll compare them to future check-ins. Only you can see these."
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
                      {!isMale && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs mt-0.5">💡</span>
                          <p className="text-xs text-muted-foreground">Ideally take photos on wash day or takedown day</p>
                        </div>
                      )}
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
                      {severityOptions.map(sev => {
                        const isSelected = symptomResponses[activeSymptoms[symptomIndex].key] === sev;
                        const hasSelection = !!symptomResponses[activeSymptoms[symptomIndex].key];
                        return (
                          <motion.button
                            key={sev}
                            whileTap={{ scale: 1.02 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => {
                              const currentSymptom = activeSymptoms[symptomIndex];
                              setSymptomResponses(prev => ({ ...prev, [currentSymptom.key]: sev }));
                              if (sev === 'None') {
                                if (symptomIndex < activeSymptoms.length - 1) {
                                  setTimeout(() => setSymptomIndex(symptomIndex + 1), 150);
                                } else {
                                  setTimeout(() => {
                                    const allResponses = { ...symptomResponses, [currentSymptom.key]: sev };
                                    const checkIn = buildCheckInFromSymptoms(allResponses);
                                    const risk = isMale ? computeMaleTriageRisk(checkIn, [], norwoodStage, norwoodStage) : computeHistoricalRisk(checkIn, []);
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
                                    const allResponses = { ...symptomResponses, [currentSymptom.key]: sev };
                                    const checkIn = buildCheckInFromSymptoms(allResponses);
                                    const risk = isMale ? computeMaleTriageRisk(checkIn, [], norwoodStage, norwoodStage) : computeHistoricalRisk(checkIn, []);
                                    setTriageResult(risk);
                                    setSymptomPhase('thanks');
                                  }
                                }, 1500);
                              }
                            }}
                            className={`selection-card w-full text-left relative ${isSelected ? 'selected' : ''}`}
                            style={{
                              opacity: hasSelection && !isSelected ? 0.6 : 1,
                              transition: 'opacity 200ms ease, border-color 150ms ease',
                            }}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-3 right-3"
                              >
                                <Check size={16} className="text-primary" strokeWidth={2.5} />
                              </motion.div>
                            )}
                            <p className="font-medium text-foreground text-sm">{sev}</p>
                            {activeDescriptors[activeSymptoms[symptomIndex].key]?.[sev] && (
                              <p className="text-xs mt-0.5" style={{ color: '#7A7570', fontSize: '12px' }}>{activeDescriptors[activeSymptoms[symptomIndex].key][sev]}</p>
                            )}
                          </motion.button>
                        );
                      })}
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
                      {getSeverityTransitionText(symptomResponses)}
                    </motion.p>
                  </div>
                )}

                {step === 8 && symptomPhase === 'result' && triageResult && (
                  <UnifiedTriageResult
                    risk={triageResult}
                    symptomResponses={symptomResponses}
                    activeSymptoms={activeSymptoms}
                    isMale={isMale}
                    maleHasShortStyles={maleHasShortStyles}
                    maleHasLongStyles={maleHasLongStyles}
                    onContinue={() => {
                      if (isMale) {
                        setStep(11);
                      } else {
                        setStep(9);
                      }
                    }}
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
                      {isMale ? "You're all set." : (lengthPhotos.length > 0 ? "Baseline set. You're ready to go." : "You're all set.")}
                    </h2>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                      {isMale
                        ? "Tip: Tap 'My Routine' on your dashboard to add the products you use. This helps us spot what might be helping or irritating your scalp."
                        : "Tip: Tap 'My Routine' on your dashboard to add the products you use. This helps us spot what might be helping or irritating your scalp."}
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
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

<<<<<<< HEAD
export default Onboarding;
=======
// ─── UNIFIED TRIAGE RESULT (both male and female) ────────────────────────────
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

interface UnifiedTriageResultProps {
  risk: 'green' | 'amber' | 'red';
  symptomResponses: Record<string, string>;
  activeSymptoms: { key: string; label: string; question: string }[];
  isMale: boolean;
  maleHasShortStyles: boolean;
  maleHasLongStyles: boolean;
  onContinue: () => void;
  navigate: (path: string) => void;
  healthProfile: HealthProfileData;
  goals: string[];
}

const DOT_COLORS: Record<number, string> = {
  0: '#FAF8F5', // off-white (none)
  1: '#7C9A8E', // sage green (mild)
  2: '#C4967A', // terracotta (moderate)
  3: '#B85C5C', // dusty rose-red (severe)
};

const BANNER_COLORS: Record<string, string> = {
  green: '#7C9A8E',
  amber: '#C4967A',
  red: '#B85C5C',
};

const BANNER_LABELS: Record<string, string> = {
  green: 'Looking good',
  amber: 'Worth watching',
  red: 'Professional review recommended',
};

const UnifiedTriageResult = ({ risk, symptomResponses, activeSymptoms, isMale, maleHasShortStyles, maleHasLongStyles, onContinue, navigate, healthProfile: hp, goals }: UnifiedTriageResultProps) => {
  const symptomKeys = activeSymptoms.map(s => s.key);
  const dotSummary = computeSeverityDotSummary(symptomResponses, symptomKeys);
  const interimSteps = getInterimCareSteps(risk, symptomResponses, isMale);

  // Compute reasoning
  const reasoning = isMale
    ? getMaleTriageReasoning(risk, symptomResponses, goals, maleHasShortStyles, maleHasLongStyles)
    : getTriageReasoningFemale(risk, symptomResponses, activeSymptoms);

  const telogenTriggers = hasTelogenTriggers(hp);
  const goalMessage = getGoalMessage(goals, risk);

  // Flagged symptoms list
  const flaggedSymptoms = activeSymptoms.filter(s => {
    const level = getSeverityLevel(symptomResponses[s.key]);
    return level > 0;
  }).map(s => {
    const level = getSeverityLevel(symptomResponses[s.key]);
    const severityLabel = level === 1 ? 'mild' : level === 2 ? 'moderate' : 'severe';
    return { label: s.label, severity: severityLabel };
  });

  // Main message
  let mainMessage = '';
  if (risk === 'green') {
    mainMessage = isMale
      ? "Based on what you've shared, no concerning changes detected. Keep tracking."
      : "Based on what you've shared, your scalp is looking good. We'll check in again at your next cycle.";
  } else if (risk === 'amber') {
    mainMessage = isMale
      ? "You've reported some changes worth monitoring. We'll flag if this progresses."
      : "We've noted a few things worth watching. Here are some steps that might help.";
  } else {
    mainMessage = getMaleTriageMessage(risk, dotSummary.flaggedCount, dotSummary.severeCount);
  }

  // "What this means" for red
  const whatThisMeans = risk === 'red' ? (
    isMale
      ? (maleHasLongStyles && !maleHasShortStyles
        ? 'Persistent or worsening symptoms can sometimes indicate conditions like traction-related damage or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.'
        : 'Persistent or worsening symptoms can sometimes indicate conditions like male pattern hair loss or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.')
      : 'Persistent or worsening symptoms can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.'
  ) : null;

  return (
    <div>
      {/* Colour banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: BANNER_COLORS[risk],
          borderRadius: 16,
          padding: '20px 16px',
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          {risk === 'green' && <Check size={32} color="#fff" strokeWidth={2} />}
          {risk === 'amber' && <Eye size={32} color="#fff" strokeWidth={1.8} />}
          {risk === 'red' && <Stethoscope size={32} color="#fff" strokeWidth={1.8} />}
        </div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>{BANNER_LABELS[risk]}</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{mainMessage}</p>
      </motion.div>

      {/* Reasoning line */}
      {reasoning && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: '#7A7570', fontSize: 13, lineHeight: 1.6, marginBottom: 14, padding: '0 4px' }}
        >
          {reasoning}
        </motion.p>
      )}

      {/* Goal message */}
      {goalMessage && (
        <div style={{ background: 'rgba(124,154,142,0.08)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#2D2D2D', lineHeight: 1.5 }}>{goalMessage}</p>
        </div>
      )}

      {/* Symptom list card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: '#F5F0EB', border: '1.5px solid #E8DED1', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Here's what you reported
        </p>
        {flaggedSymptoms.length === 0 ? (
          <p style={{ fontSize: 13, color: '#666' }}>No symptoms flagged.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flaggedSymptoms.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: s.severity === 'mild' ? '#7C9A8E' : s.severity === 'moderate' ? '#C4967A' : '#B85C5C',
                }} />
                <p style={{ fontSize: 13, color: '#2D2D2D' }}>{s.label} <span style={{ color: '#999' }}>({s.severity})</span></p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Severity dot summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ padding: '0 4px', marginBottom: 16 }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, justifyContent: 'center' }}>
          {dotSummary.dots.map((level, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: DOT_COLORS[level] || DOT_COLORS[0],
              border: level === 0 ? '1px solid #E8DED1' : 'none',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#7A7570', textAlign: 'center', lineHeight: 1.5 }}>{dotSummary.summaryText}</p>
      </motion.div>

      {/* Interim care steps */}
      {interimSteps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: '#F5F0EB', border: '1.5px solid #E8DED1', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', marginBottom: 10 }}>
            {risk === 'red' ? 'While you find a specialist' : 'In the meantime'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interimSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(124,154,142,0.12)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: '#7C9A8E', marginTop: 1,
                }}>{i + 1}</div>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.55 }}>{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* What this means (RED only) */}
      {whatThisMeans && (
        <div style={{ background: '#F5F0EB', border: '1.5px solid #E8DED1', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', marginBottom: 6 }}>What this means</p>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.55 }}>{whatThisMeans}</p>
        </div>
      )}

      {/* Telogen triggers */}
      {telogenTriggers.length > 0 && !isMale && (
        <div style={{ background: 'hsl(var(--accent))', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', marginBottom: 6 }}>Worth knowing</p>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.55 }}>You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response, sometimes called telogen effluvium. It usually resolves within 6-12 months, but monitoring helps.</p>
        </div>
      )}

      {/* Clinician summary (RED only) */}
      {risk === 'red' && (
        <button
          onClick={() => navigate('/clinician-summary')}
          style={{
            width: '100%', height: 52, borderRadius: 14,
            background: '#7C9A8E', color: '#fff',
            border: 'none', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', marginBottom: 10,
          }}
        >
          Generate clinician summary
        </button>
      )}

      {/* Find specialist (AMBER and RED) */}
      {(risk === 'amber' || risk === 'red') && (
        <button
          onClick={() => navigate('/find-specialist')}
          style={{
            width: '100%', height: 44, borderRadius: 14,
            background: 'transparent', color: '#7C9A8E',
            border: '1.5px solid #7C9A8E', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', marginBottom: 14,
          }}
        >
          Find a specialist
        </button>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        style={{
          width: '100%', height: 52, borderRadius: 14,
          background: risk === 'green' ? '#7C9A8E' : '#F5F0EB',
          color: risk === 'green' ? '#fff' : '#2D2D2D',
          border: risk === 'green' ? 'none' : '1.5px solid #E8DED1',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Continue to dashboard
      </button>
    </div>
  );
};

// Female triage reasoning (constellation-aware)
const getTriageReasoningFemale = (risk: 'green' | 'amber' | 'red', responses: Record<string, string>, symptoms: { key: string; label: string }[]): string | null => {
  const activeSymptoms = symptoms.filter(s => {
    const level = getSeverityLevel(responses[s.key]);
    return level > 0;
  });
  const severeSymptoms = activeSymptoms.filter(s => getSeverityLevel(responses[s.key]) >= 3);

  if (risk === 'green') {
    if (activeSymptoms.length === 0) return null;
    if (activeSymptoms.length === 1) {
      return "You flagged one area as mild. On its own, that's not a concern, but we'll track it going forward.";
    }
    return null;
  }

  const names = activeSymptoms.map(s => `${s.label} (${getSeverityLevel(responses[s.key]) === 1 ? 'mild' : getSeverityLevel(responses[s.key]) === 2 ? 'moderate' : 'severe'})`).join(', ');

  if (risk === 'amber') {
    return `You reported: ${names}. Let's see if these steps help.`;
  }

  if (risk === 'red') {
    if (severeSymptoms.length > 0) {
      return `You reported: ${names}. The combination of these, particularly ${severeSymptoms.map(s => s.label.toLowerCase()).join(' and ')}, is why we're recommending a professional review.`;
    }
    if (activeSymptoms.length >= 3) {
      return `You reported: ${names}. Experiencing several symptoms at once can sometimes point to something worth checking with a professional.`;
    }
    return `You reported: ${names}. This pattern needs attention.`;
  }

  return null;
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
  const femaleRefs = [refFemaleFront, scalpSideFemale, scalpBackFemale];
  const maleRefs = [refMaleFront, scalpSideMaleB, scalpBackMale];
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
>>>>>>> 7f6f42d3a862210af52ee4f6472c47f44dc758b8
