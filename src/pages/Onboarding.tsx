import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronLeft, ChevronRight, Camera, ImagePlus, RotateCcw, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

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
// ─────────────────────────────────────────────────────────────────────────────

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
  'Worn out / loose (natural)', 'Worn out / loose (relaxed or straightened)',
  'Silk press / blowout', 'Twist out / braid out',
  'Wash and go', 'Box braids',
  'Knotless braids', 'Cornrows / flat twists',
  'Twists (two-strand)', 'Crochet braids',
  'Locs / faux locs', 'Weave / sew-in',
  'Wig (lace front)', 'Wig (other)',
  'Hair extensions (k-tips, micro links, etc.)', 'Bantu knots',
  'Other',
];

const maleStyleOptions = [
  'Fade or low cut (barber-maintained)', 'Free-form (no manipulation)',
  'Waves (with durag or wave cap)', 'High top or frohawk',
  'Short natural (TWA, tapered)', 'Locs or faux locs',
  'Box braids', 'Cornrows or flat twists',
  'Twists (two-strand)', 'Other',
];

const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Use a scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness',
  'I just want to stay on top of things', 'Not sure',
];

const sectionExplainers: Record<number, string> = {
  0: "This helps us tailor scalp check-in questions to your hair's needs.",
  1: "Different styles create different tension and coverage patterns. This helps us know what to watch for.",
  2: "This is how we time your check-ins and reminders to your actual routine.",
  3: "This personalises your experience so we focus on what matters to you.",
};

// Photo gallery — full image visible, no cropping
const PhotoGallery = ({ photos }: { photos: { src: string; label: string }[] }) => {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden border border-border">
        <img
          src={photos[0].src}
          alt={photos[0].label}
          className="w-full"
         style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-accent/40">{photos[0].label}</p>
      </div>
    );
  }
  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <img
        src={photos[idx].src}
        alt={photos[idx].label}
        className="w-full"
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />
      <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-accent/40">{photos[idx].label}</p>
      <button
        onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }}
        className="absolute left-2 top-[90px] -translate-y-1/2 w-7 h-7 rounded-full bg-background/90 flex items-center justify-center shadow"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }}
        className="absolute right-2 top-[90px] -translate-y-1/2 w-7 h-7 rounded-full bg-background/90 flex items-center justify-center shadow"
      >
        <ChevronRight size={14} />
      </button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        {photos.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-foreground' : 'bg-foreground/30'}`} />
        ))}
      </div>
    </div>
  );
};

const CurlIcon = ({ type }: { type: string }) => {
  if (type === 'unsure') return <HelpCircle size={24} className="text-muted-foreground" strokeWidth={1.5} />;
  if (type === 'type3') return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>;
  if (type === 'type4') return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>;
  return null;
};

const photoSteps = [
  {
    title: 'Front hairline photo',
    instruction: 'Keep your forehead visible. Pull hair back to show your hairline and temples.',
    refLabel: 'Reference: front hairline view on textured hair',
    area: 'Hairline / edges',
  },
  {
    title: 'Side profile photo',
    instruction: 'Turn to show one side of your head. Include the temple area and ear.',
    refLabel: 'Reference: side view showing temple area',
    area: 'Side / temple',
  },
  {
    title: 'Back and nape photo',
    instruction: 'Show the back of your head. Include your nape and crown. Use a second mirror or ask someone to help.',
    refLabel: 'Reference: back view showing nape and crown',
    area: 'Nape / crown',
  },
];

const TOTAL_SCREENS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setOnboardingComplete, setBaselinePhotos, setBaselineDate } = useApp();

  const [step, setStep] = useState(0);
  const gender = onboardingData.gender;
  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  const [hairType, setHairType] = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);

  const [styles, setStyles] = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle] = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  const [cycleLength, setCycleLength] = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash] = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');

  const [concerns, setConcerns] = useState<string[]>(onboardingData.goals || []);

  // Screen 5: Photo capture
  const [photoStep, setPhotoStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<(string | null)[]>([null, null, null]);
  const [photosDone, setPhotosDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;
  const genderKey = isMale ? 'male' : isNeutral ? 'both' : 'female';

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedPhotos(prev => { const next = [...prev]; next[photoStep] = url; return next; });
    }
    e.target.value = '';
  };

  const handleSkipPhotos = () => {
    finishOnboarding();
  };

  const finishOnboarding = () => {
    const effectiveHairType = hairSubType || hairType;
    const photos = capturedPhotos
      .map((p, i) => p ? { area: photoSteps[i].area, captured: true, date: new Date().toLocaleDateString() } : null)
      .filter(Boolean) as { area: string; captured: boolean; date: string }[];
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
    if (photos.length > 0) {
      setBaselinePhotos(photos);
      setBaselineDate(new Date().toLocaleDateString());
    }
    sessionStorage.setItem('follisense-just-onboarded', 'true');
    setOnboardingComplete(true);
    navigate('/home');
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!hairType;
      case 1: return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
      case 2: return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
      case 3: return concerns.length > 0;
      case 4: return true; // photo screen always allows proceeding
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_SCREENS - 1) {
      setStep(step + 1);
    } else {
      const effectiveHairType = hairSubType || hairType;
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
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col w-full">

        {/* Header with progress */}
        <div className="flex items-center justify-between py-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 pb-8"
            >

              {/* ── Screen 1: Hair Texture ── */}
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">What's your hair texture?</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[0]}</p>
                  <p className="text-xs text-muted-foreground mb-4 italic">
                    Type 4 coils are tighter than a pen spring. Type 3 curls wrap around a finger.
                  </p>
                  <div className="space-y-4">
                    {hairTypes.map(ht => {
                      const hasPhotos = ht.id !== 'unsure' && hairPhotos[ht.id];
                      const photos = hasPhotos
                        ? genderKey === 'both'
                          ? [...(hairPhotos[ht.id].female || []), ...(hairPhotos[ht.id].male || [])]
                          : hairPhotos[ht.id][genderKey] || []
                        : [];
                      return (
                        <button
                          key={ht.id}
                          onClick={() => { setHairType(ht.id); setHairSubType(''); setShowSubType(false); }}
                          className={`selection-card w-full text-left !p-2 ${hairType === ht.id ? 'selected' : ''}`}
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                              <CurlIcon type={ht.id} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{ht.label}</p>
                              <p className="text-sm text-muted-foreground">{ht.desc}</p>
                            </div>
                          </div>

                          {photos.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="rounded-xl bg-accent/50 border border-border p-4 flex flex-col items-center justify-center">
                                <CurlIcon type={ht.id} />
                                <span className="text-[10px] text-muted-foreground mt-2 text-center">Pattern illustration</span>
                              </div>
                              <PhotoGallery photos={photos} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {(hairType === 'type3' || hairType === 'type4') && !showSubType && (
                    <button
                      onClick={() => setShowSubType(true)}
                      className="mt-4 text-sm text-primary font-medium flex items-center gap-1"
                    >
                      Want to be more specific? <ChevronDown size={14} />
                    </button>
                  )}

                  {showSubType && subTypes[hairType] && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <p className="text-sm font-semibold text-foreground mb-3">Which sub-type?</p>
                      <div className="flex flex-wrap gap-2">
                        {subTypes[hairType].map(st => (
                          <button
                            key={st.id}
                            onClick={() => setHairSubType(st.id)}
                            className={`pill-option ${hairSubType === st.id ? 'selected' : ''}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Screen 2: Styles + Frequency ── */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">How do you usually wear your hair?</h2>
                  <p className="text-xs text-muted-foreground mb-3">{sectionExplainers[1]}</p>
                  <p className="text-muted-foreground mb-5 text-sm">Select everything you rotate between</p>

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
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Your routine</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[2]}</p>

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
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">What matters most to you right now?</h2>
                  <p className="text-xs text-muted-foreground mb-5">{sectionExplainers[3]}</p>
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

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom button */}
        <div className="flex-shrink-0 py-4">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
              canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            {step === TOTAL_SCREENS - 1 ? "Let's go" : 'Next'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;