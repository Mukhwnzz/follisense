import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronLeft, ChevronRight, Camera, ImageIcon, Check, Play } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

// Reference images
import refFemaleFront from '@/assets/ref-female-front.jpg';
import refFemaleSide from '@/assets/ref-female-side.jpg';
import refFemaleBack from '@/assets/ref-female-back.jpg';
import refFemaleTop from '@/assets/ref-female-top.jpg';
import refMaleFront from '@/assets/ref-male-front.jpg';
import refMaleSide from '@/assets/ref-male-side.jpg';
import refMaleBack from '@/assets/ref-male-back.jpg';
import refMaleTop from '@/assets/ref-male-top.jpg';
import refLengthFront from '@/assets/ref-length-front.png';
import refLengthSide from '@/assets/ref-length-side.png';
import refLengthBack from '@/assets/ref-length-back.png';

// ─── DATA ───────────────────────────────────────────────────────────────────
const hairTypes = [
  { id: 'type4', label: 'Type 4: Coily', desc: 'Tight coils or zig-zag pattern, dense texture, significant shrinkage' },
  { id: 'type3', label: 'Type 3: Curly', desc: 'Visible curl pattern, S-shaped curls, looser texture' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay. We'll use the most inclusive experience" },
];

const subTypes: Record<string, { id: string; label: string }[]> = {
  type4: [
    { id: '4a', label: '4a: Soft, defined coils' },
    { id: '4b', label: '4b: Z-shaped, tightly coiled' },
    { id: '4c', label: '4c: Very tight, densely packed' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  type3: [
    { id: '3a', label: '3a: Loose, wide curls' },
    { id: '3b', label: '3b: Springy, defined curls' },
    { id: '3c', label: '3c: Tight corkscrew curls' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
};

const femaleStyleOptions = [
  'Braids', 'Locs', 'Twists', 'Twist out / braid out',
  'Wig', 'Weave / sew-in', 'Silk press', 'Blow out',
  'Loose natural', 'Wash and go', 'Cornrows / flat twists',
  'Other',
];

const maleStyleOptions = [
  'Low cut / fade', 'Waves', 'Locs', 'Twists',
  'Cornrows', 'Afro', 'Bald / shaved', 'Other',
];

const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Use a scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness',
  'I just want to stay on top of things', 'Not sure',
];

const sectionExplainers: Record<number, string> = {
  0: '',
  1: "This helps us tailor scalp check-in questions to your hair's needs.",
  2: "Different styles create different tension and coverage patterns. This helps us know what to watch for.",
  3: "This is how we time your check-ins and reminders to your actual routine.",
  4: "This personalises your experience so we focus on what matters to you.",
};

const scalpPhotoSteps = [
  { title: 'Front hairline', instruction: 'Keep your forehead visible. Pull hair back to show your hairline and temples.', step: '1 of 4' },
  { title: 'Side view', instruction: 'Turn to show one side of your head. Include the temple area and ear.', step: '2 of 4' },
  { title: 'Back and nape', instruction: 'Show the back of your head. Include your nape and crown. Use a second mirror or ask someone to help.', step: '3 of 4' },
  { title: 'Top of head', instruction: 'Hold your phone above your head and point the camera down at your crown. This is where we check for thinning or changes you might not notice.', step: '4 of 4' },
];

const lengthPhotoSteps = [
  { title: 'Front length check', instruction: 'Gently pull a front section of hair straight down alongside your face. This shows your true length past shrinkage.', step: '1 of 3' },
  { title: 'Side length check', instruction: 'Pull a section over your ear and down to show your length from the side.', step: '2 of 3' },
  { title: 'Back length check', instruction: 'Reach back and pull a section straight down your back. Ask someone to take this one if you can.', step: '3 of 3' },
];

// ─── CURL ICON ──────────────────────────────────────────────────────────────
const CurlIcon = ({ type }: { type: string }) => {
  if (type === 'unsure') return <HelpCircle size={24} className="text-muted-foreground" strokeWidth={1.5} />;
  if (type === 'type3') return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>;
  if (type === 'type4') return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>;
  return null;
};

// ─── SCREENS ────────────────────────────────────────────────────────────────
// 0: Gender
// 1: Hair type
// 2: Styles + frequency
// 3: Cycle length + between-wash
// 4: Top concerns
// 5: Photo guidelines + consent
// 6: Scalp photos (4 sub-steps)
// 7: Length transition
// 8: Length photos (3 sub-steps)
// 9: Completion
const TOTAL_SCREENS = 10;

const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setOnboardingComplete, setBaselinePhotos } = useApp();

  const [step, setStep] = useState(0);

  // Gender
  const [gender, setGender] = useState(onboardingData.gender || '');

  // Hair type
  const [hairType, setHairType] = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);

  // Styles
  const [styles, setStyles] = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle] = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  // Cycle
  const [cycleLength, setCycleLength] = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash] = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');

  // Concerns
  const [concerns, setConcerns] = useState<string[]>(onboardingData.goals || []);

  // Consent
  const [consentChecked, setConsentChecked] = useState(false);

  // Photos
  const [scalpPhotoIndex, setScalpPhotoIndex] = useState(0);
  const [scalpPhotos, setScalpPhotos] = useState<Record<number, boolean>>({});
  const [lengthPhotoIndex, setLengthPhotoIndex] = useState(0);
  const [lengthPhotos, setLengthPhotos] = useState<Record<number, boolean>>({});
  const [skippedLengthPhotos, setSkippedLengthPhotos] = useState(false);

  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;

  const toggleStyle = (s: string) => setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleBetweenWash = (v: string) => {
    if (v === 'Nothing') { setBetweenWash(prev => prev.includes(v) ? [] : [v]); }
    else { setBetweenWash(prev => { const w = prev.filter(x => x !== 'Nothing'); return w.includes(v) ? w.filter(x => x !== v) : [...w, v]; }); }
  };
  const toggleConcern = (c: string) => setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const getRefImage = (area: 'front' | 'side' | 'back' | 'top') => {
    if (isMale) {
      if (area === 'front') return refMaleFront;
      if (area === 'side') return refMaleSide;
      if (area === 'back') return refMaleBack;
      return refMaleTop;
    }
    if (area === 'front') return refFemaleFront;
    if (area === 'side') return refFemaleSide;
    if (area === 'back') return refFemaleBack;
    return refFemaleTop;
  };

  const getLengthRefImage = (area: 'front' | 'side' | 'back') => {
    if (isMale) {
      if (area === 'front') return refMaleFront;
      if (area === 'side') return refMaleSide;
      return refMaleBack;
    }
    if (area === 'front') return refLengthFront;
    if (area === 'side') return refLengthSide;
    return refLengthBack;
  };

  const scalpRefAreas: ('front' | 'side' | 'back' | 'top')[] = ['front', 'side', 'back', 'top'];
  const lengthRefAreas: ('front' | 'side' | 'back')[] = ['front', 'side', 'back'];

  const canProceed = () => {
    switch (step) {
      case 0: return !!gender;
      case 1: return !!hairType;
      case 2: return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
      case 3: return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
      case 4: return concerns.length > 0;
      case 5: return consentChecked;
      case 6: return !!scalpPhotos[scalpPhotoIndex]; // require photo before advancing
      case 7: return true;
      case 8: return true;
      case 9: return true;
      default: return false;
    }
  };

  const saveOnboardingData = () => {
    const effectiveHairType = hairSubType || hairType;
    setOnboardingData({
      ...onboardingData,
      gender,
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
  };

  const handleSimulateCapture = () => {
    if (step === 6) {
      setScalpPhotos(prev => ({ ...prev, [scalpPhotoIndex]: true }));
    } else if (step === 8) {
      setLengthPhotos(prev => ({ ...prev, [lengthPhotoIndex]: true }));
    }
    toast({ title: 'Photo captured', description: 'Your photo has been saved.' });
  };

  const handleNext = () => {
    // Scalp photo sub-steps
    if (step === 6 && scalpPhotoIndex < 3) {
      setScalpPhotoIndex(scalpPhotoIndex + 1);
      return;
    }
    // Length photo sub-steps
    if (step === 8 && lengthPhotoIndex < 2 && !skippedLengthPhotos) {
      setLengthPhotoIndex(lengthPhotoIndex + 1);
      return;
    }

    if (step < TOTAL_SCREENS - 1) {
      // Save data before leaving data screens
      if (step === 4) saveOnboardingData();
      setStep(step + 1);
    } else {
      // Completion
      saveOnboardingData();
      const capturedAreas = Object.keys(scalpPhotos).filter(k => scalpPhotos[Number(k)]);
      if (capturedAreas.length > 0) {
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        setBaselinePhotos(capturedAreas.map(k => ({
          area: scalpPhotoSteps[Number(k)].title,
          captured: true,
          date: today,
        })));
      }
      sessionStorage.setItem('follisense-just-onboarded', 'true');
      setOnboardingComplete(true);
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step === 6 && scalpPhotoIndex > 0) { setScalpPhotoIndex(scalpPhotoIndex - 1); return; }
    if (step === 8 && lengthPhotoIndex > 0) { setLengthPhotoIndex(lengthPhotoIndex - 1); return; }
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  };


  const handleSkipLengthPhotos = () => {
    setSkippedLengthPhotos(true);
    setStep(9); // go to completion
  };

  // Progress bar: screens 0-4 are main onboarding, 5-9 are photo/completion
  const progressScreens = 10;
  const currentProgress = step;

  const hasAnyCapturedPhotos = Object.keys(scalpPhotos).length > 0 || Object.keys(lengthPhotos).length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col w-full">

        {/* Header with progress */}
        <div className="flex items-center justify-between py-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: progressScreens }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${i <= currentProgress ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step === 6 ? `6-${scalpPhotoIndex}` : step === 8 ? `8-${lengthPhotoIndex}` : step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 pb-8"
            >

              {/* ── Screen 0: Gender ── */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Welcome to FolliSense.</h2>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Let's personalise your experience.</h2>
                  <p className="text-sm text-muted-foreground mb-6">How do you identify?</p>
                  <div className="space-y-3">
                    {[
                      { id: 'woman', label: 'Female' },
                      { id: 'man', label: 'Male' },
                      { id: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setGender(opt.id)}
                        className={`selection-card w-full text-center py-5 ${gender === opt.id ? 'selected' : ''}`}
                      >
                        <p className="font-semibold text-foreground text-lg">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    This helps us show you the right content, symptoms, and reference images.
                  </p>
                </div>
              )}

              {/* ── Screen 1: Hair Texture ── */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">What's your hair texture?</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[1]}</p>
                  <div className="space-y-3">
                    {hairTypes.map(ht => (
                      <button
                        key={ht.id}
                        onClick={() => { setHairType(ht.id); setHairSubType(''); setShowSubType(false); }}
                        className={`selection-card w-full text-left !p-3 ${hairType === ht.id ? 'selected' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                            <CurlIcon type={ht.id} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{ht.label}</p>
                            <p className="text-sm text-muted-foreground">{ht.desc}</p>
                          </div>
                        </div>

                        {/* Reference image for selected type */}
                        {hairType === ht.id && ht.id !== 'unsure' && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-border">
                            <img
                              src={isMale ? refMaleFront : refFemaleFront}
                              alt={`${ht.label} reference`}
                              className="w-full h-[180px] object-cover object-top"
                            />
                            <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-accent/40">
                              {isMale ? 'Male' : 'Female'} {ht.label.toLowerCase()} reference
                            </p>
                          </div>
                        )}

                        {/* Sub-type expansion directly below selected card */}
                        {hairType === ht.id && (ht.id === 'type3' || ht.id === 'type4') && !showSubType && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowSubType(true); }}
                            className="mt-3 text-sm text-primary font-medium flex items-center gap-1"
                          >
                            Want to be more specific? <ChevronDown size={14} />
                          </button>
                        )}

                        {hairType === ht.id && showSubType && subTypes[hairType] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-sm font-semibold text-foreground mb-2">Which sub-type?</p>
                            <div className="flex flex-wrap gap-2">
                              {subTypes[hairType].map(st => (
                                <button
                                  key={st.id}
                                  onClick={(e) => { e.stopPropagation(); setHairSubType(st.id); }}
                                  className={`pill-option ${hairSubType === st.id ? 'selected' : ''}`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Screen 2: Styles + Frequency ── */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">How do you usually wear your hair?</h2>
                  <p className="text-xs text-muted-foreground mb-3">{sectionExplainers[2]}</p>
                  <p className="text-muted-foreground mb-4 text-sm">Select everything you rotate between</p>

                  {(() => {
                    const defaultCount = isMale ? 6 : 8;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          {rawStyleOptions.slice(0, defaultCount).map(s => (
                            <button key={s} onClick={() => toggleStyle(s)} className={`selection-card text-center py-4 ${styles.includes(s) ? 'selected' : ''}`}>
                              <p className="font-medium text-foreground text-sm">{s}</p>
                            </button>
                          ))}
                        </div>
                        {rawStyleOptions.length > defaultCount && !showMoreStyles && (
                          <button onClick={() => setShowMoreStyles(true)} className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary mt-3 py-2">
                            Show more styles <ChevronDown size={16} strokeWidth={2} />
                          </button>
                        )}
                        {showMoreStyles && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {rawStyleOptions.slice(defaultCount).map(s => (
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
                    <input
                      type="text"
                      value={otherStyle}
                      onChange={e => setOtherStyle(e.target.value)}
                      placeholder="Describe your style"
                      className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                    />
                  )}

                  {styles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
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

              {/* ── Screen 3: Cycle Length + Between-Wash Care ── */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Your routine</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[3]}</p>

                  <p className="font-semibold text-foreground mb-3">How long do you usually keep a style in?</p>
                  <div className="flex flex-wrap gap-2 mb-8">
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
                    <input
                      type="text"
                      value={otherBetweenWash}
                      onChange={e => setOtherBetweenWash(e.target.value)}
                      placeholder="What else do you do?"
                      className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                    />
                  )}
                </div>
              )}

              {/* ── Screen 4: Top Concerns ── */}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">What matters most to you right now?</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[4]}</p>
                  <p className="text-muted-foreground mb-5 text-sm">Select all that apply</p>
                  <div className="space-y-3">
                    {concernOptions.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleConcern(c)}
                        className={`selection-card w-full text-left ${concerns.includes(c) ? 'selected' : ''}`}
                      >
                        <p className="font-medium text-foreground text-sm">{c}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Screen 5: Photo Guidelines + Consent ── */}
              {step === 5 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Get ready to take your photos</h2>
                  <p className="text-sm text-muted-foreground mb-5">To get the best results, follow these simple guidelines:</p>

                  <div className="card-elevated p-4 mb-4">
                    <ul className="space-y-3">
                      {[
                        'Take your photos in good lighting, without flash',
                        'Use a plain background (a wall works best)',
                        'Keep your head steady',
                        'Hair and scalp should be dry and clearly visible',
                        'Ideally take photos on wash day or takedown day when your hair is in its most natural state',
                      ].map((tip, i) => (
                        <li key={i} className="flex gap-3 text-sm text-foreground">
                          <div className="w-5 h-5 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-primary" strokeWidth={2.5} />
                          </div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-accent border border-border p-4 mb-4">
                    <p className="text-sm text-foreground font-medium">This tool provides personalised scalp health insights, not medical diagnoses.</p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <button
                      onClick={() => setConsentChecked(!consentChecked)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${consentChecked ? 'bg-primary border-primary' : 'border-border'}`}
                    >
                      {consentChecked && <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />}
                    </button>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      I consent to the collection and processing of my images and personal data for personalised scalp and hair health tracking in accordance with the{' '}
                      <button onClick={() => toast({ title: 'Privacy Policy', description: 'Full privacy policy coming soon.' })} className="text-primary underline">Privacy Policy</button>.
                    </span>
                  </label>
                </div>
              )}

              {/* ── Screen 6: Scalp Baseline Photos ── */}
              {step === 6 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Let's check your starting point</h2>
                  <p className="text-sm text-muted-foreground mb-1">{scalpPhotoSteps[scalpPhotoIndex].step}</p>
                  <h3 className="text-base font-semibold text-foreground mb-2">{scalpPhotoSteps[scalpPhotoIndex].title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{scalpPhotoSteps[scalpPhotoIndex].instruction}</p>

                  {/* Reference image */}
                  <div className="rounded-xl overflow-hidden border border-border mb-4">
                    <img
                      src={getRefImage(scalpRefAreas[scalpPhotoIndex])}
                      alt={`Reference: ${scalpPhotoSteps[scalpPhotoIndex].title}`}
                      className="w-full h-[220px] object-cover object-top"
                    />
                    <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-accent/40">Reference photo</p>
                  </div>

                  {scalpPhotoIndex === 0 && (
                    <p className="text-xs text-muted-foreground mb-4 italic">
                      These photos stay private to you. They help you see changes that happen too slowly to notice day to day.
                    </p>
                  )}

                  {scalpPhotos[scalpPhotoIndex] ? (
                    <div className="card-elevated p-4 mb-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center">
                        <Check size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Photo captured</p>
                      </div>
                      <button onClick={() => setScalpPhotos(prev => { const n = { ...prev }; delete n[scalpPhotoIndex]; return n; })} className="text-xs text-primary font-medium">Retake</button>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <button onClick={handleSimulateCapture} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press flex items-center justify-center gap-2">
                        <Camera size={18} /> Take photo
                      </button>
                      <button onClick={handleSimulateCapture} className="w-full h-12 rounded-xl border-2 border-border text-foreground font-medium text-sm btn-press flex items-center justify-center gap-2">
                        <ImageIcon size={18} /> Choose photo
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ── Screen 7: Length Transition ── */}
              {step === 7 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Want to track your hair length too?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    These photos show your full hair so you can see growth over time. Pull a section straight to show your true length past shrinkage.
                  </p>

                  {/* Show a length reference image */}
                  <div className="rounded-xl overflow-hidden border border-border mb-6">
                    <img
                      src={isMale ? refMaleFront : refLengthFront}
                      alt="Length check reference"
                      className="w-full h-[250px] object-cover object-center"
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setStep(8)}
                      className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base btn-press"
                    >
                      Yes, let's do it
                    </button>
                    <button
                      onClick={() => setStep(9)}
                      className="w-full h-14 rounded-xl border-2 border-border text-foreground font-medium text-base btn-press"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {/* ── Screen 8: Length Photos ── */}
              {step === 8 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Hair length check</h2>
                  <p className="text-sm text-muted-foreground mb-1">{lengthPhotoSteps[lengthPhotoIndex].step}</p>
                  <h3 className="text-base font-semibold text-foreground mb-2">{lengthPhotoSteps[lengthPhotoIndex].title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{lengthPhotoSteps[lengthPhotoIndex].instruction}</p>

                  <div className="rounded-xl overflow-hidden border border-border mb-4">
                    <img
                      src={getLengthRefImage(lengthRefAreas[lengthPhotoIndex])}
                      alt={`Reference: ${lengthPhotoSteps[lengthPhotoIndex].title}`}
                      className="w-full h-[250px] object-cover object-center"
                    />
                    <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-accent/40">Reference photo</p>
                  </div>

                  {lengthPhotos[lengthPhotoIndex] ? (
                    <div className="card-elevated p-4 mb-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center">
                        <Check size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Photo captured</p>
                      </div>
                      <button onClick={() => setLengthPhotos(prev => { const n = { ...prev }; delete n[lengthPhotoIndex]; return n; })} className="text-xs text-primary font-medium">Retake</button>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <button onClick={handleSimulateCapture} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press flex items-center justify-center gap-2">
                        <Camera size={18} /> Take photo
                      </button>
                      <button onClick={handleSimulateCapture} className="w-full h-12 rounded-xl border-2 border-border text-foreground font-medium text-sm btn-press flex items-center justify-center gap-2">
                        <ImageIcon size={18} /> Choose photo
                      </button>
                    </div>
                  )}

                  <button onClick={handleSkipLengthPhotos} className="w-full text-center text-sm text-muted-foreground py-2">
                    Skip for now
                  </button>
                </div>
              )}

              {/* ── Screen 9: Completion ── */}
              {step === 9 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mb-6">
                    <Check size={36} className="text-primary" strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground text-center mb-2">
                    {hasAnyCapturedPhotos ? 'Baseline set. You\'re ready to go.' : 'You\'re all set.'}
                  </h2>

                  {hasAnyCapturedPhotos && (
                    <div className="flex gap-2 mt-4 mb-6">
                      {Object.keys(scalpPhotos).filter(k => scalpPhotos[Number(k)]).map(k => (
                        <div key={k} className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                          <Camera size={18} className="text-muted-foreground" />
                        </div>
                      ))}
                      {Object.keys(lengthPhotos).filter(k => lengthPhotos[Number(k)]).map(k => (
                        <div key={`l-${k}`} className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                          <Camera size={18} className="text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom button */}
        <div className="flex-shrink-0 py-4">
          {step !== 7 && ( // Length transition has its own buttons
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
              }`}
            >
              {step === 9 ? 'Take me to my dashboard' : step === 6 && scalpPhotos[scalpPhotoIndex] ? 'Next' : step === 8 && lengthPhotos[lengthPhotoIndex] ? 'Next' : step === 6 || step === 8 ? 'Next' : step === 5 ? 'Continue' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
