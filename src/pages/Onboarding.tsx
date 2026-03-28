import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, Check, Eye, Stethoscope, Search, Camera, ShieldCheck, ImageIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { computeHistoricalRisk } from '@/utils/triageLogic';
import type { CheckInData } from '@/contexts/AppContext';
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
  'Bald / shaved', 'Other',
];

const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness',
  'I just want to stay on top of things', 'Not sure',
];

// ─── CHEMICAL PROCESSING ─────────────────────────────────────────────────────
const chemicalOptions = [
  { id: 'natural', label: 'No, fully natural' },
  { id: 'current', label: 'Yes, currently' },
  { id: 'growing-out', label: 'Previously, growing out' },
  { id: 'unsure', label: 'Not sure' },
];

const chemicalTypeOptions = ['Relaxer', 'Texturiser', 'Keratin treatment', 'Other'];
const chemicalBrandOptions = [
  'Dark and Lovely', 'ORS Olive Oil', 'TCB', 'Just for Me', 'Affirm',
  'Mizani', 'SoftSheen-Carson', 'Motions', 'Hawaiian Silky', 'Namaste',
  'Design Essentials', 'Other',
];
const lastTreatmentOptions = [
  'Less than 4 weeks ago', '4 to 8 weeks ago', '2 to 3 months ago',
  '3 to 6 months ago', 'More than 6 months ago', 'Currently growing out',
];
const chemicalFreqOptions = [
  'Every 4 to 6 weeks', 'Every 8 to 12 weeks', 'Every 3 to 6 months',
  'Less often', 'Stopped / growing out',
];

// ─── GENDER OPTIONS ──────────────────────────────────────────────────────────
const genderOptions = [
  { id: 'woman', label: 'Female', icon: '♀' },
  { id: 'man', label: 'Male', icon: '♂' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', icon: '—' },
];

// ─── SYMPTOM CHECKLIST ───────────────────────────────────────────────────────
const onboardingSymptoms = [
  { key: 'itch', label: 'Itching', question: 'Any scalp itching?' },
  { key: 'flaking', label: 'Flaking', question: 'Any flaking or dandruff?' },
  { key: 'tenderness', label: 'Tenderness', question: 'Any scalp tenderness or pain?' },
  { key: 'hairline', label: 'Thinning', question: 'Any thinning or hair loss?' },
  { key: 'shedding', label: 'Breakage', question: 'Any breakage or excessive shedding?' },
  { key: 'bumps', label: 'Bumps', question: 'Any bumps or raised areas on your scalp?' },
  { key: 'dryness', label: 'Dryness', question: 'Any scalp dryness?' },
];
const severityOptions = ['None', 'Mild', 'Moderate', 'Severe'];

// ─── WARM ACKNOWLEDGMENTS ────────────────────────────────────────────────────
const mildAcks = [
  (label: string) => `Noted. Mild ${label.toLowerCase()} is common, especially between washes.`,
  (label: string) => `Got it. A little ${label.toLowerCase()} now and then is quite normal.`,
  (label: string) => `Okay, mild ${label.toLowerCase()} - we'll keep that on file.`,
];
const moderateAcks = [
  () => `Thanks for flagging that. We'll keep a close eye on this for you.`,
  () => `Noted - that's exactly the kind of thing worth tracking over time.`,
  () => `Good to know. We'll watch how this changes at your next check-in.`,
];
const severeAcks = [
  () => `We hear you. That sounds uncomfortable. We'll make sure this gets the attention it deserves.`,
  () => `Thank you for being honest about that. We're going to make sure you get the right support.`,
  () => `That sounds really tough. We'll flag this as a priority for you.`,
];
const getAck = (severity: string, label: string, index: number): string | null => {
  if (severity === 'None') return null;
  if (severity === 'Mild') return mildAcks[index % mildAcks.length](label);
  if (severity === 'Moderate') return moderateAcks[index % moderateAcks.length]();
  if (severity === 'Severe') return severeAcks[index % severeAcks.length]();
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

// Total main screens: 0=gender, 1=hair type, 2=chemical, 3=styles, 4=routine, 5=concerns,
// 6=photo guidelines, 7=scalp photos, 8=symptoms, 9=length check transition, 10=length photos, 11=completion
const TOTAL_PROGRESS_SEGMENTS = 8; // gender, hair, chemical, styles, routine, concerns, guidelines+photos, symptoms

const Onboarding = () => {
  const navigate = useNavigate();
  const {
    onboardingData, setOnboardingData, setOnboardingComplete,
    addToCheckInHistory, setCurrentCheckIn, setBaselineRisk, setBaselineDate, setBaselinePhotos,
  } = useApp();

  const [step, setStep] = useState(0);
  const [symptomAck, setSymptomAck] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const gender = onboardingData.gender;
  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  // Hair type
  const [hairType, setHairType] = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);

  // Chemical processing
  const [chemicalStatus, setChemicalStatus] = useState(onboardingData.chemicalProcessing || '');
  const [chemicalTypes, setChemicalTypes] = useState<string[]>(onboardingData.chemicalProcessingMultiple || []);
  const [chemicalOtherType, setChemicalOtherType] = useState('');
  const [chemicalBrand, setChemicalBrand] = useState(onboardingData.chemicalBrand || '');
  const [chemicalBrandOther, setChemicalBrandOther] = useState(onboardingData.chemicalBrandOther || '');
  const [lastTreatment, setLastTreatment] = useState(onboardingData.lastChemicalTreatment || '');
  const [chemicalFreq, setChemicalFreq] = useState(onboardingData.chemicalFrequency || '');
  const [brandSearch, setBrandSearch] = useState('');

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
  const [symptomPhase, setSymptomPhase] = useState<'ask' | 'symptoms' | 'result'>('ask');
  const [symptomIndex, setSymptomIndex] = useState(0);
  const [symptomResponses, setSymptomResponses] = useState<Record<string, string>>({});
  const [triageResult, setTriageResult] = useState<'green' | 'amber' | 'red' | null>(null);

  // Length check
  const [lengthStep, setLengthStep] = useState(0);
  const [lengthPhotos, setLengthPhotos] = useState<{ area: string; dataUrl: string }[]>([]);
  const [lengthPreview, setLengthPreview] = useState<string | null>(null);
  const lengthCameraRef = useState<HTMLInputElement | null>(null);
  const lengthGalleryRef = useState<HTMLInputElement | null>(null);

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

  const getProgressSegment = () => {
    if (step <= 1) return step;
    if (step === 2) return 2; // chemical
    if (step === 3) return 3; // styles
    if (step === 4) return 4; // routine
    if (step === 5) return 5; // concerns
    if (step === 6 || step === 7) return 6; // guidelines + photos
    if (step >= 8) return 7; // symptoms + length + completion
    return 0;
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!gender;
      case 1: return !!hairType;
      case 2: {
        if (!chemicalStatus) return false;
        if (chemicalStatus === 'natural' || chemicalStatus === 'unsure') return true;
        // Need follow-up filled
        return chemicalTypes.length > 0 && (chemicalBrand || chemicalBrandOther) && lastTreatment && chemicalFreq;
      }
      case 3: return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
      case 4: return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
      case 5: return concerns.length > 0;
      case 6: return consentChecked;
      case 7: return false; // photo capture handled by component
      case 8: {
        if (symptomPhase === 'ask') return true;
        if (symptomPhase === 'symptoms') return !!symptomResponses[onboardingSymptoms[symptomIndex].key];
        if (symptomPhase === 'result') return true;
        return false;
      }
      case 9: return true; // length check transition
      case 10: return true; // length photos (skippable)
      case 11: return true; // completion
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
      chemicalBrand: chemicalBrand === 'Other' ? chemicalBrandOther : chemicalBrand,
      chemicalBrandOther,
      chemicalFrequency: chemicalFreq,
      lastChemicalTreatment: lastTreatment,
      protectiveStyles: styles,
      otherStyle,
      protectiveStyleFrequency: protectiveFreq,
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
    // We'll save on "Continue to dashboard"
    setStep(8);
    // Actually let's just go to result directly
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
    setSymptomPhase('ask');
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else if (step === 8) {
      if (symptomPhase === 'symptoms') {
        if (symptomAck) {
          setSymptomAck(null);
          if (symptomIndex < onboardingSymptoms.length - 1) {
            setSymptomIndex(symptomIndex + 1);
          } else {
            const checkIn = buildCheckInFromSymptoms(symptomResponses);
            const risk = computeHistoricalRisk(checkIn, []);
            setTriageResult(risk);
            setSymptomPhase('result');
          }
          return;
        }
        const currentSymptom = onboardingSymptoms[symptomIndex];
        const severity = symptomResponses[currentSymptom.key];
        const ack = getAck(severity, currentSymptom.label, symptomIndex);
        if (ack) {
          setSymptomAck(ack);
          return;
        }
        if (symptomIndex < onboardingSymptoms.length - 1) {
          setSymptomIndex(symptomIndex + 1);
        } else {
          const checkIn = buildCheckInFromSymptoms(symptomResponses);
          const risk = computeHistoricalRisk(checkIn, []);
          setTriageResult(risk);
          setSymptomPhase('result');
        }
      } else if (symptomPhase === 'result') {
        setStep(9); // length check transition
      }
    } else if (step === 9 || step === 10) {
      setStep(step + 1);
    } else if (step === 11) {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step === 8) {
      if (symptomPhase === 'result') {
        setSymptomPhase('symptoms');
        setSymptomIndex(onboardingSymptoms.length - 1);
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomAck) {
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomIndex > 0) {
        setSymptomIndex(symptomIndex - 1);
        setSymptomAck(null);
      } else if (symptomPhase === 'symptoms' && symptomIndex === 0) {
        setSymptomPhase('ask');
        setSymptomAck(null);
      } else {
        setStep(7);
      }
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const isShortHairStyle = styles.some(s =>
    ['Low cut / fade', 'Bald / shaved', 'Afro'].includes(s) ||
    s.toLowerCase().includes('twa')
  );

  const getButtonText = () => {
    if (step === 6) return "Let's go";
    if (step === 8) {
      if (symptomPhase === 'ask') return '';
      if (symptomPhase === 'symptoms') {
        if (symptomAck) return 'Continue';
        return symptomIndex < onboardingSymptoms.length - 1 ? 'Next' : 'See results';
      }
      if (symptomPhase === 'result') return 'Continue';
    }
    if (step === 9) return '';
    if (step === 11) return 'Take me to my dashboard';
    return 'Next';
  };

  // Hide bottom button on auto-advance screens and photo capture
  const showBottomButton = step !== 0 && step !== 1 && step !== 7 && step !== 9
    && !(step === 8 && symptomPhase === 'ask')
    && !(step === 2 && (chemicalStatus === '' || chemicalStatus === 'natural' || chemicalStatus === 'unsure'));

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
        .selection-card { border: 1.5px solid #E8DDD2 !important; border-radius: 14px; padding: 14px; background: white; cursor: pointer; transition: all 0.15s ease; }
        .selection-card:hover { border-color: #d4c5b5 !important; }
        .selection-card.selected { border: 1.5px solid #7fa896 !important; background: rgba(127,168,150,0.06); }
        .pill-option { border: 1.5px solid #E8DDD2 !important; border-radius: 100px; padding: 10px 18px; background: white; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease; }
        .pill-option:hover { border-color: #d4c5b5 !important; }
        .pill-option.selected { border: 1.5px solid #7fa896 !important; background: rgba(127,168,150,0.06); color: #5a8f74; }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '560px' }}
      >
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '24px 28px 28px', display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 48px)', overflow: 'hidden',
        }}>

          {/* Header with progress */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
              <ArrowLeft size={22} strokeWidth={1.8} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_PROGRESS_SEGMENTS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-colors duration-300 ${i <= activeSegment ? 'bg-primary' : 'bg-border'}`}
                  style={{ width: '28px' }}
                />
              ))}
            </div>
            <div className="w-10" />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: showBottomButton ? '0' : '12px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step === 8 ? `${step}-${symptomPhase}-${symptomIndex}-${symptomAck ? 'ack' : ''}` : step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-2 pb-4"
              >

                {/* ── Screen 0: Gender Selection (auto-advance) ── */}
                {step === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Welcome to FolliSense</h2>
                    <p className="text-base text-foreground mb-1">Let's personalise your experience.</p>
                    <p className="text-sm text-muted-foreground mb-6">How do you identify?</p>
                    <div className="space-y-3">
                      {genderOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setOnboardingData({ ...onboardingData, gender: opt.id });
                            setStep(1);
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

                {/* ── Screen 1: Hair Type (auto-advance) ── */}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">What's your hair texture?</h2>
                    <p className="text-xs text-muted-foreground mb-4">{sectionExplainers[1]}</p>
                    <div className="space-y-3">
                      {hairTypes.map(ht => {
                        const heroImg = heroImages[ht.id];
                        return (
                          <button
                            key={ht.id}
                            onClick={() => {
                              setHairType(ht.id);
                              setHairSubType('');
                              if (ht.id === 'unsure') {
                                setStep(2);
                              } else {
                                setShowSubType(false);
                              }
                            }}
                            className={`selection-card w-full text-left ${hairType === ht.id ? 'selected' : ''}`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                                <CurlIcon type={ht.id} />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{ht.label}</p>
                                <p className="text-xs text-muted-foreground leading-snug">{ht.desc}</p>
                              </div>
                            </div>
                            {heroImg && (
                              <div className="rounded-lg overflow-hidden border border-border mt-1">
                                <img
                                  src={heroImg}
                                  alt={ht.label}
                                  style={{ width: '100%', height: '180px', objectFit: 'contain', display: 'block', background: '#f5f3f0' }}
                                />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {(hairType === 'type3' || hairType === 'type4') && !showSubType && (
                      <div className="mt-3 flex flex-col items-start gap-1">
                        <button onClick={() => setShowSubType(true)} className="text-sm text-primary font-medium flex items-center gap-1">
                          Want to be more specific? <ChevronDown size={14} />
                        </button>
                        <button onClick={() => setStep(2)} className="text-sm text-muted-foreground font-medium">
                          Skip - continue →
                        </button>
                      </div>
                    )}

                    {showSubType && subTypes[hairType] && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                        <p className="text-sm font-semibold text-foreground mb-3">Which sub-type?</p>
                        <div className="grid grid-cols-3 gap-2">
                          {subTypes[hairType].filter(st => st.image !== undefined || st.id === 'mixed' || st.id === 'not-sure').map(st => (
                            <button
                              key={st.id}
                              onClick={() => {
                                setHairSubType(st.id);
                                setTimeout(() => setStep(2), 150);
                              }}
                              className={`selection-card text-center !p-2 ${hairSubType === st.id ? 'selected' : ''}`}
                            >
                              {st.image ? (
                                <div className="rounded-lg overflow-hidden mb-1">
                                  <img
                                    src={st.image}
                                    alt={st.label}
                                    style={{ width: '100%', height: '90px', objectFit: 'contain', display: 'block', background: '#f5f3f0' }}
                                  />
                                </div>
                              ) : st.id !== 'mixed' && st.id !== 'not-sure' ? (
                                <div className="w-full rounded-lg bg-accent/30 flex items-center justify-center mb-1" style={{ height: '90px' }}>
                                  <span className="text-xs text-muted-foreground">Coming soon</span>
                                </div>
                              ) : null}
                              <p className="text-xs font-medium text-foreground">{st.label}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Screen 2: Chemical Processing ── */}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Is your hair chemically processed?</h2>
                    <p className="text-xs text-muted-foreground mb-4">
                      This means treatments that permanently change your hair's natural texture.
                    </p>
                    <div className="space-y-3 mb-4">
                      {chemicalOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setChemicalStatus(opt.id);
                            if (opt.id === 'natural' || opt.id === 'unsure') {
                              setTimeout(() => setStep(3), 150);
                            }
                          }}
                          className={`selection-card w-full text-left ${chemicalStatus === opt.id ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{opt.label}</p>
                        </button>
                      ))}
                    </div>

                    {(chemicalStatus === 'current' || chemicalStatus === 'growing-out') && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        {/* Type */}
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-2">What type?</p>
                          <div className="flex flex-wrap gap-2">
                            {chemicalTypeOptions.map(t => (
                              <button key={t} onClick={() => toggleChemicalType(t)} className={`pill-option ${chemicalTypes.includes(t) ? 'selected' : ''}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                          {chemicalTypes.includes('Other') && (
                            <input
                              type="text" value={chemicalOtherType}
                              onChange={e => setChemicalOtherType(e.target.value)}
                              placeholder="Describe treatment"
                              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-2"
                            />
                          )}
                        </div>

                        {/* Brand */}
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-2">Which brand do you use?</p>
                          <input
                            type="text" value={brandSearch}
                            onChange={e => {
                              setBrandSearch(e.target.value);
                              // If they type, clear the selection
                              if (chemicalBrand !== 'Other') setChemicalBrand('');
                            }}
                            placeholder="Search brands..."
                            className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm mb-2"
                          />
                          <div className="flex flex-wrap gap-2">
                            {chemicalBrandOptions
                              .filter(b => !brandSearch || b.toLowerCase().includes(brandSearch.toLowerCase()))
                              .map(b => (
                                <button key={b} onClick={() => { setChemicalBrand(b); setBrandSearch(''); }} className={`pill-option text-xs ${chemicalBrand === b ? 'selected' : ''}`}>
                                  {b}
                                </button>
                              ))}
                          </div>
                          {chemicalBrand === 'Other' && (
                            <input
                              type="text" value={chemicalBrandOther}
                              onChange={e => setChemicalBrandOther(e.target.value)}
                              placeholder="Brand name"
                              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm mt-2"
                            />
                          )}
                        </div>

                        {/* Last treatment */}
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-2">When was your last treatment?</p>
                          <div className="flex flex-wrap gap-2">
                            {lastTreatmentOptions.map(o => (
                              <button key={o} onClick={() => setLastTreatment(o)} className={`pill-option text-xs ${lastTreatment === o ? 'selected' : ''}`}>
                                {o}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Frequency */}
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-2">How often?</p>
                          <div className="flex flex-wrap gap-2">
                            {chemicalFreqOptions.map(o => (
                              <button key={o} onClick={() => setChemicalFreq(o)} className={`pill-option text-xs ${chemicalFreq === o ? 'selected' : ''}`}>
                                {o}
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground italic">{sectionExplainers[2]}</p>
                      </motion.div>
                    )}
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
                    {styles.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <p className="font-semibold text-foreground mb-3">How often are you in protective styles?</p>
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
                    <p className="font-semibold text-foreground mb-3">How long do you usually keep a style in?</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {cycleLengthOptions.map(o => (
                        <button key={o} onClick={() => setCycleLength(o)} className={`pill-option ${cycleLength === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                    <p className="font-semibold text-foreground mb-3">What do you do for your scalp between washes?</p>
                    <div className="flex flex-wrap gap-2">
                      {betweenWashOptions.map(o => (
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
                      These photos stay private to you. They help you spot changes that happen too slowly to notice day to day.
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

                    <label className="flex items-start gap-3 cursor-pointer">
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
                {step === 8 && symptomPhase === 'ask' && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">While we're here...</h2>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      Is there anything about your scalp you'd like to flag?
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setSymptomPhase('symptoms'); setSymptomIndex(0); setSymptomAck(null); }}
                        className="selection-card w-full text-left"
                      >
                        <p className="font-semibold text-foreground text-sm">Yes, I'd like to note something</p>
                        <p className="text-xs text-muted-foreground mt-1">Quick checklist - takes about 30 seconds</p>
                      </button>
                      <button
                        onClick={() => {
                          const cleanCheckIn = buildCheckInFromSymptoms({});
                          setSymptomResponses({});
                          setTriageResult('green');
                          setSymptomPhase('result');
                        }}
                        className="selection-card w-full text-left"
                      >
                        <p className="font-semibold text-foreground text-sm">No, everything looks fine</p>
                        <p className="text-xs text-muted-foreground mt-1">We'll record a clean baseline</p>
                      </button>
                    </div>
                  </div>
                )}

                {step === 8 && symptomPhase === 'symptoms' && !symptomAck && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{symptomIndex + 1} of {onboardingSymptoms.length}</p>
                    <h2 className="text-lg font-semibold text-foreground mb-6">{onboardingSymptoms[symptomIndex].question}</h2>
                    <div className="space-y-3">
                      {severityOptions.map(sev => (
                        <button
                          key={sev}
                          onClick={() => setSymptomResponses(prev => ({ ...prev, [onboardingSymptoms[symptomIndex].key]: sev }))}
                          className={`selection-card w-full text-left ${symptomResponses[onboardingSymptoms[symptomIndex].key] === sev ? 'selected' : ''}`}
                        >
                          <p className="font-medium text-foreground text-sm">{sev}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 8 && symptomPhase === 'symptoms' && symptomAck && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <p className="text-sm text-muted-foreground mb-1">{symptomIndex + 1} of {onboardingSymptoms.length}</p>
                    <h2 className="text-lg font-semibold text-foreground mb-3">{onboardingSymptoms[symptomIndex].label}: {symptomResponses[onboardingSymptoms[symptomIndex].key]}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{symptomAck}</p>
                  </motion.div>
                )}

                {step === 8 && symptomPhase === 'result' && triageResult === 'green' && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check size={32} className="text-primary" strokeWidth={1.8} />
                      </motion.div>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground text-center mb-3">Your scalp is looking good</h2>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed">
                      We'll check in again at your next cycle. You're doing great.
                    </p>
                  </div>
                )}

                {step === 8 && symptomPhase === 'result' && triageResult === 'amber' && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 166, 35, 0.15)' }}>
                        <Eye size={32} style={{ color: '#F5A623' }} strokeWidth={1.8} />
                      </motion.div>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground text-center mb-3">We've noted a few things worth watching</h2>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed mb-5">
                      Here are some steps that might help, and if they don't improve, a professional can take a closer look.
                    </p>
                    <div className="rounded-xl border border-border p-4 mb-4">
                      <h3 className="font-semibold text-foreground text-sm mb-2">What you shared</h3>
                      <div className="space-y-1.5">
                        {onboardingSymptoms.filter(s => symptomResponses[s.key] && symptomResponses[s.key] !== 'None').map(s => (
                          <p key={s.key} className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">{s.label}:</span> {symptomResponses[s.key]}
                          </p>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => navigate('/find-specialist')} className="w-full text-center text-sm text-primary font-medium">
                      Find a specialist
                    </button>
                  </div>
                )}

                {step === 8 && symptomPhase === 'result' && triageResult === 'red' && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center">
                        <Stethoscope size={32} className="text-destructive" strokeWidth={1.8} />
                      </motion.div>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground text-center mb-3">We'd really recommend seeing a specialist</h2>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed mb-5">
                      Based on what you've shared, we'd really recommend seeing a trichologist or dermatologist. Getting a professional opinion early makes a real difference. Here's a summary you can take with you.
                    </p>
                    <div className="rounded-xl border border-border p-4 mb-4">
                      <h3 className="font-semibold text-foreground text-sm mb-2">What you shared</h3>
                      <div className="space-y-1.5">
                        {onboardingSymptoms.filter(s => symptomResponses[s.key] && symptomResponses[s.key] !== 'None').map(s => (
                          <p key={s.key} className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">{s.label}:</span> {symptomResponses[s.key]}
                          </p>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-border font-semibold text-sm flex items-center justify-center gap-2 mb-3">
                      <Stethoscope size={16} strokeWidth={1.8} /> View clinical summary
                    </button>
                    <button onClick={() => navigate('/find-specialist')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm flex items-center justify-center gap-2">
                      <Search size={16} strokeWidth={1.8} /> Find a specialist
                    </button>
                  </div>
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
          <button onClick={onSkip} className="w-full text-center text-sm text-muted-foreground font-medium mt-4 py-2">
            Skip for now
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl overflow-hidden border border-border mb-5">
            <img src={preview} alt={`Preview: ${step.title}`} style={{ width: '100%', height: '240px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.1)' }} />
          </div>
          <div className="space-y-3">
            <button onClick={handleUse} className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              Use this photo
            </button>
            <button onClick={() => setPreview(null)} className="w-full h-14 rounded-xl border-2 border-border font-semibold text-sm text-foreground">
              Retake
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
