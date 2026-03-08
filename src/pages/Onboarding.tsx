import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, Camera, Check, Eye, Stethoscope } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const hairTypes = [
  { id: '3b', label: '3b', desc: 'Loose, springy curls' },
  { id: '3c', label: '3c', desc: 'Tight, corkscrew curls' },
  { id: '4a', label: '4a', desc: 'Dense, S-shaped coils' },
  { id: '4b', label: '4b', desc: 'Z-shaped, tightly coiled' },
  { id: '4c', label: '4c', desc: 'Very tight, densely packed coils' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay — lots of us have a mix of patterns" },
];

const chemicalOptions = [
  'No, fully natural', 'Yes, relaxed / permed', 'Yes, texturised', 'Yes, colour treated',
  'Yes, bleached', 'Multiple', 'Previously processed, currently growing out', 'Not sure',
];
const chemicalMultipleOptions = ['Relaxed', 'Texturised', 'Colour treated', 'Bleached'];

const styleOptions = [
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

const wornOutOnlyStyles = [
  'Worn out / loose (natural)', 'Worn out / loose (relaxed or straightened)',
];

const protectiveFrequencyOptions = [
  'Most of the time', 'About half the time', 'Occasionally', 'Rarely — I mostly wear my hair out',
];
const wornOutWashOptions = ['More than once a week', 'About once a week', 'Every 2 weeks', 'Less than every 2 weeks'];
const restyleOptions = ['Daily', 'Every few days', 'Weekly', 'Less often'];
const cycleLengths = ['1–2 weeks', '2–4 weeks', '4–6 weeks', '6+ weeks', 'It varies'];
const washFrequencyOptions = [
  'More than once a week', 'About once a week', 'Every 2 weeks', 'Every 3–4 weeks',
  'Only when I take the style down', 'It depends on the style',
];
const washPerCycleOptions = ['0 (not at all)', '1', '2–3', '4+'];
const cycleLengthMinOptions = ['Less than 1 week', '1–2 weeks', '2–4 weeks', '4–6 weeks'];
const cycleLengthMaxOptions = ['2–4 weeks', '4–6 weeks', '6–8 weeks', '8+ weeks'];
const betweenWashOptions = [
  'Apply oil or serum to the scalp', 'Use a scalp refresh spray or dry shampoo',
  'Rinse with water only', 'Massage / manipulate the scalp',
  'Nothing — I leave it alone until wash day', 'Other',
];

const scalpProductOptions = [
  'Scalp oil (e.g., Mielle Rosemary Mint, Jamaican Mango & Lime)',
  'Scalp serum or treatment',
  'Anti-dandruff or medicated shampoo (e.g., Nizoral, Head & Shoulders Royal Oils)',
  'Clarifying shampoo (e.g., SheaMoisture, Neutrogena Anti-Residue)',
  'Scalp scrub or exfoliant',
  'Scalp refresh spray',
  'Grease or pomade (applied to scalp)',
  'Growth drops or topical (e.g., The Ordinary Multi-Peptide Serum, Minoxidil)',
  'Apple cider vinegar rinse',
  'Nothing directly on my scalp',
  'Other',
];

const hairProductOptions = [
  'Leave-in conditioner (e.g., SheaMoisture, Cantu, Aunt Jackie\'s)',
  'Deep conditioner or mask (e.g., SheaMoisture Manuka Honey, Amika Soulfood)',
  'Hair oil (e.g., Mielle, The Ordinary, Moroccanoil)',
  'Hair butter or cream',
  'Mousse or foam',
  'Gel (e.g., Eco Styler, Uncle Funky\'s Daughter)',
  'Edge control (e.g., Ebin, Got2b, Gorilla Snot)',
  'Heat protectant (e.g., Chi 44 Iron Guard, TRESemme, GHD)',
  'Protein treatment (e.g., Aphogee Two-Step, Curlsmith)',
  'Bond repair treatment (e.g., Olaplex No.3, K18)',
  'Curl cream (e.g., Eco Style, Twist by Ouidad, Cantu)',
  'Co-wash',
  'Dry shampoo',
  'Detangler',
  'None',
  'Other',
];

const productFrequencies = ['Daily', 'Every few days', 'Weekly', 'Only on wash day', 'Rarely'];

const goalOptions = [
  'Protect my edges / grow my hairline back',
  'Reduce scalp irritation or itching',
  'Understand my hair loss or thinning',
  'Build a consistent scalp care routine',
  'Monitor my scalp between salon visits',
  'Recover from damage (chemical, heat, or traction)',
  'General scalp and hair health',
  "I'm not sure yet — just exploring",
];

const menstrualCycleLengthOptions = ['21–25 days', '26–30 days', '31–35 days', 'Irregular', 'Not sure'];
const contraceptionOptions = ['No', 'Yes (pill)', 'Yes (implant or injection)', 'Yes (IUD/coil)', 'Prefer not to say'];

const baselineQuestions = [
  {
    key: 'itch',
    q: 'Any scalp itching right now?',
    options: ['None', 'Mild', 'Moderate', 'Severe'],
  },
  {
    key: 'tenderness',
    q: 'Any tenderness or soreness?',
    options: ['None', 'Mild', 'Moderate', 'Severe'],
  },
  {
    key: 'hairline',
    q: 'Any concerns about your hairline or edges?',
    options: ['No concerns', 'Slight concern', 'Noticeable change', 'Very concerned'],
  },
  {
    key: 'hairHealth',
    q: 'How would you describe your hair health right now?',
    options: [
      'Healthy — no concerns',
      'Some dryness or breakage but nothing unusual',
      'Noticeably dry, brittle, or breaking more than usual',
      "Concerned about my hair's condition",
    ],
  },
];

const getBaselineAcknowledgment = (optionIndex: number): string => {
  if (optionIndex === 0) {
    const msgs = ["That's good to hear", 'Great', 'Lovely'];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (optionIndex === 1) {
    const msgs = ['Okay, noted', 'Thanks for sharing that', 'Got it'];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (optionIndex === 2) {
    const msgs = ['Thanks for being honest about that', "Okay, that's really helpful to know", "We'll keep a close eye on that"];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  const msgs = ["I'm sorry you're dealing with that. Let's make sure we address it.", "That sounds really uncomfortable. You're in the right place.", "Thank you for telling us. We're going to take that seriously."];
  return msgs[Math.floor(Math.random() * msgs.length)];
};

const CurlIcon = ({ type }: { type: string }) => {
  if (type === 'unsure') return <HelpCircle size={24} className="text-muted-foreground" strokeWidth={1.5} />;
  const patterns: Record<string, React.ReactNode> = {
    '3b': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>,
    '3c': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 18 C8 10, 10 22, 12 14 C14 6, 16 22, 18 14 C20 6, 22 18, 24 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>,
    '4a': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 16 C8 10, 9 20, 11 14 C13 8, 14 20, 16 14 C18 8, 19 20, 21 14 C23 8, 24 16, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>,
    '4b': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 16 L9 10 L11 18 L14 10 L16 18 L19 10 L21 18 L24 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>,
    '4c': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>,
  };
  return patterns[type] || null;
};

const computeBaselineRisk = (itch: string, tenderness: string, hairline: string, hairHealth: string): 'green' | 'amber' | 'red' => {
  const mildest = ['None', 'No concerns'];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  const hairMildest = ['Healthy — no concerns'];
  const hairModerate = ['Noticeably dry, brittle, or breaking more than usual', "Concerned about my hair's condition"];
  const scalpValues = [itch, tenderness, hairline];
  const allScalpMild = scalpValues.every(v => mildest.includes(v));
  const allMild = allScalpMild && hairMildest.includes(hairHealth);
  if (allMild) return 'green';
  if (scalpValues.some(v => severe.includes(v))) return 'red';
  const moderateCount = scalpValues.filter(v => moderate.includes(v)).length;
  if (moderateCount >= 2) return 'red';
  if (allScalpMild && hairModerate.includes(hairHealth)) return 'amber';
  if (!allScalpMild && hairModerate.includes(hairHealth) && moderateCount >= 1) return 'red';
  return allScalpMild ? 'green' : 'amber';
};

const getBaselineSevereFlaggedSymptoms = (itch: string, tenderness: string, hairline: string): string[] => {
  const flagged: string[] = [];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  if (severe.includes(itch) || moderate.includes(itch)) flagged.push('scalp itching');
  if (severe.includes(tenderness) || moderate.includes(tenderness)) flagged.push('tenderness');
  if (severe.includes(hairline) || moderate.includes(hairline)) flagged.push('hairline changes');
  return flagged;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { setOnboardingComplete, setOnboardingData, setBaselinePhotos, setBaselineRisk, setBaselineDate } = useApp();
  const [step, setStep] = useState(1);
  const [hairType, setHairType] = useState('');
  const [chemicalProcessing, setChemicalProcessing] = useState('');
  const [chemicalMultiple, setChemicalMultiple] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [otherStyle, setOtherStyle] = useState('');
  const [protectiveFreq, setProtectiveFreq] = useState('');
  const [wornOutWashFreq, setWornOutWashFreq] = useState('');
  const [restyleFreq, setRestyleFreq] = useState('');
  const [cycleLen, setCycleLen] = useState('');
  const [cycleLenMin, setCycleLenMin] = useState('');
  const [cycleLenMax, setCycleLenMax] = useState('');
  const [washFreq, setWashFreq] = useState('');
  const [washFreqPerCycle, setWashFreqPerCycle] = useState('');
  const [betweenWashCare, setBetweenWashCare] = useState<string[]>([]);
  const [otherBetweenWash, setOtherBetweenWash] = useState('');
  const isWornOutOnly = styles.length > 0 && styles.every(s => wornOutOnlyStyles.includes(s));
  const hasProtectiveOrStretchedStyle = styles.length > 0 && styles.some(s => !wornOutOnlyStyles.includes(s) && s !== 'Other');

  // Baseline — now conversational step-through
  const [baselineStep, setBaselineStep] = useState(0);
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, string>>({});
  const [baselineAck, setBaselineAck] = useState<string | null>(null);

  const [products, setProducts] = useState<string[]>([]);
  const [otherProduct, setOtherProduct] = useState('');
  const [prodFreq, setProdFreq] = useState('');
  const [hairProds, setHairProds] = useState<string[]>([]);
  const [otherHairProd, setOtherHairProd] = useState('');
  const [hairProdFreq, setHairProdFreq] = useState('');
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, boolean>>({});
  const [baselineResultScreen, setBaselineResultScreen] = useState<'amber' | 'red' | null>(null);

  // Menstrual
  const [menstrualTracking, setMenstrualTracking] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(undefined);
  const [menstrualCycleLength, setMenstrualCycleLength] = useState('');
  const [hormonalContraception, setHormonalContraception] = useState('');

  // Goals
  const [goals, setGoals] = useState<string[]>([]);

  const totalSteps = 8;

  const baselineAreas = [
    { id: 'hairline', label: 'Hairline — temples and edges', desc: 'Front-facing', optional: false },
    { id: 'crown', label: 'Crown and vertex', desc: 'Top of head', optional: false },
    { id: 'nape', label: 'Nape / back of neck', desc: 'Optional', optional: true },
    { id: 'hair-condition', label: 'Hair condition — mid-lengths and ends', desc: 'Helps track breakage patterns and texture changes over time', optional: true },
  ];

  const toggleStyle = (s: string) => setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleProduct = (p: string) => setProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleHairProd = (p: string) => setHairProds(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleChemMulti = (v: string) => setChemicalMultiple(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleBetweenWash = (v: string) => setBetweenWashCare(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleGoal = (g: string) => {
    setGoals(prev => {
      if (prev.includes(g)) return prev.filter(x => x !== g);
      if (prev.length >= 3) return prev;
      return [...prev, g];
    });
  };

  // Baseline acknowledgment auto-advance
  useEffect(() => {
    if (!baselineAck) return;
    const timer = setTimeout(() => {
      setBaselineAck(null);
      if (baselineStep < baselineQuestions.length - 1) {
        setBaselineStep(prev => prev + 1);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [baselineAck, baselineStep]);

  const selectBaselineAnswer = (key: string, val: string, optIndex: number) => {
    setBaselineAnswers(prev => ({ ...prev, [key]: val }));
    setBaselineAck(getBaselineAcknowledgment(optIndex));
  };

  const allBaselineAnswered = baselineQuestions.every(q => baselineAnswers[q.key]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!hairType && !!chemicalProcessing && (chemicalProcessing !== 'Multiple' || chemicalMultiple.length > 0);
      case 2: {
        const stylesOk = styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0);
        const freqOk = isWornOutOnly || !!protectiveFreq;
        return stylesOk && freqOk;
      }
      case 3: {
        if (isWornOutOnly) return !!wornOutWashFreq && !!restyleFreq;
        const cycleOk = !!cycleLen && (cycleLen !== 'It varies' || (!!cycleLenMin && !!cycleLenMax));
        const washOk = !!washFreq && (washFreq !== 'It depends on the style' || !!washFreqPerCycle);
        const betweenOk = betweenWashCare.length > 0 && (!betweenWashCare.includes('Other') || otherBetweenWash.trim().length > 0);
        return cycleOk && washOk && betweenOk;
      }
      case 4: return allBaselineAnswered;
      case 5: return true;
      case 6: {
        const scalpOk = products.length > 0 && !!prodFreq && (!products.includes('Other') || otherProduct.trim().length > 0);
        const hairOk = hairProds.length > 0 && !!hairProdFreq && (!hairProds.includes('Other') || otherHairProd.trim().length > 0);
        return scalpOk && hairOk;
      }
      case 7: return !!menstrualTracking && (menstrualTracking !== 'Yes, I\'d like to track' || (!!menstrualCycleLength && !!hormonalContraception));
      case 8: return goals.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 4 && !baselineResultScreen) {
        const itch = baselineAnswers.itch || '';
        const tenderness = baselineAnswers.tenderness || '';
        const hairline = baselineAnswers.hairline || '';
        const hairHealth = baselineAnswers.hairHealth || '';
        const risk = computeBaselineRisk(itch, tenderness, hairline, hairHealth);
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        setBaselineRisk(risk);
        setBaselineDate(today);
        if (risk !== 'green') {
          setBaselineResultScreen(risk as 'amber' | 'red');
          return;
        }
      }
      if (step === 4 && baselineResultScreen) setBaselineResultScreen(null);
      if (step === 5) {
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const photos = baselineAreas.filter(a => capturedPhotos[a.id]).map(a => ({ area: a.label, captured: true, date: today }));
        setBaselinePhotos(photos);
      }
      setStep(step + 1);
    } else {
      const nextCheckIn = new Date();
      nextCheckIn.setDate(nextCheckIn.getDate() + 7);

      setOnboardingData({
        hairType, chemicalProcessing, chemicalProcessingMultiple: chemicalMultiple,
        protectiveStyles: styles, otherStyle, protectiveStyleFrequency: protectiveFreq,
        isWornOutOnly, cycleLength: cycleLen, cycleLengthMin: cycleLenMin, cycleLengthMax: cycleLenMax,
        washFrequency: washFreq, washFrequencyPerCycle: washFreqPerCycle,
        betweenWashCare, otherBetweenWashCare: otherBetweenWash,
        wornOutWashFrequency: wornOutWashFreq, restyleFrequency: restyleFreq,
        baselineItch: baselineAnswers.itch || '', baselineTenderness: baselineAnswers.tenderness || '',
        baselineHairline: baselineAnswers.hairline || '', baselineHairHealth: baselineAnswers.hairHealth || '',
        scalpProducts: products, otherProduct, productFrequency: prodFreq,
        hairProducts: hairProds, otherHairProduct: otherHairProd, hairProductFrequency: hairProdFreq,
        scalpProductFrequency: prodFreq,
        menstrualTracking,
        lastPeriodDate: lastPeriodDate ? format(lastPeriodDate, 'yyyy-MM-dd') : '',
        menstrualCycleLength,
        hormonalContraception,
        goals,
      });
      setOnboardingComplete(true);
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step === 4 && baselineResultScreen) {
      setBaselineResultScreen(null);
      return;
    }
    if (step === 4 && baselineStep > 0 && !baselineResultScreen) {
      setBaselineStep(prev => prev - 1);
      return;
    }
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const itch = baselineAnswers.itch || '';
  const tenderness = baselineAnswers.tenderness || '';
  const hairline = baselineAnswers.hairline || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${baselineResultScreen}-${baselineStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pt-4 pb-8"
          >
            {/* Step 1: Hair type & chemical processing */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Let's get to know your hair</h2>
                <p className="text-muted-foreground mb-6">Select the option closest to your hair type</p>
                <div className="space-y-3 mb-8">
                  {hairTypes.map(ht => (
                    <button key={ht.id} onClick={() => setHairType(ht.id)} className={`selection-card w-full flex items-center gap-4 text-left ${hairType === ht.id ? 'selected' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <CurlIcon type={ht.id} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{ht.label}</p>
                        <p className="text-sm text-muted-foreground">{ht.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="font-medium text-foreground mb-3">Has your hair been chemically processed?</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {chemicalOptions.map(opt => (
                    <button key={opt} onClick={() => { setChemicalProcessing(opt); if (opt !== 'Multiple') setChemicalMultiple([]); }} className={`pill-option ${chemicalProcessing === opt ? 'selected' : ''}`}>{opt}</button>
                  ))}
                </div>
                {chemicalProcessing === 'Multiple' && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-xl bg-accent">
                    {chemicalMultipleOptions.map(opt => (
                      <button key={opt} onClick={() => toggleChemMulti(opt)} className={`pill-option ${chemicalMultiple.includes(opt) ? 'selected' : ''}`}>{opt}</button>
                    ))}
                  </div>
                )}
                {(chemicalProcessing.startsWith('Yes') || chemicalProcessing === 'Previously processed, currently growing out' || chemicalProcessing === 'Multiple') && (
                  <p className="text-xs text-muted-foreground mt-3">When was your last chemical treatment? This helps us understand where you are in your hair journey.</p>
                )}
                <p className="text-xs text-muted-foreground mt-3">Chemical processing can affect how your scalp responds to styling — this helps us personalise your experience.</p>
              </div>
            )}

            {/* Step 2: Hair styles */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">How do you usually wear your hair?</h2>
                <p className="text-muted-foreground mb-6">Select everything you rotate between</p>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.slice(0, 8).map(s => (
                    <button key={s} onClick={() => toggleStyle(s)} className={`selection-card text-center py-5 ${styles.includes(s) ? 'selected' : ''}`}>
                      <p className="font-medium text-foreground text-sm">{s}</p>
                    </button>
                  ))}
                </div>
                {!showMoreStyles && (
                  <button onClick={() => setShowMoreStyles(true)} className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary mt-3 py-2">
                    Show more styles <ChevronDown size={16} strokeWidth={2} />
                  </button>
                )}
                {showMoreStyles && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {styleOptions.slice(8).map(s => (
                      <button key={s} onClick={() => toggleStyle(s)} className={`selection-card text-center py-5 ${styles.includes(s) ? 'selected' : ''}`}>
                        <p className="font-medium text-foreground text-sm">{s}</p>
                      </button>
                    ))}
                  </div>
                )}
                {styles.includes('Other') && (
                  <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3" />
                )}
                {hasProtectiveOrStretchedStyle && styles.length > 0 && (
                  <div className="mt-8">
                    <p className="font-medium text-foreground mb-3">How much of the time are you in a protective or installed style?</p>
                    <div className="flex flex-wrap gap-2">
                      {protectiveFrequencyOptions.map(o => (
                        <button key={o} onClick={() => setProtectiveFreq(o)} className={`pill-option ${protectiveFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Cycle / routine */}
            {step === 3 && !isWornOutOnly && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Your cycle</h2>
                <p className="text-muted-foreground mb-6">How long do you typically keep a style in?</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cycleLengths.map(c => (
                    <button key={c} onClick={() => { setCycleLen(c); if (c !== 'It varies') { setCycleLenMin(''); setCycleLenMax(''); } }} className={`pill-option ${cycleLen === c ? 'selected' : ''}`}>{c}</button>
                  ))}
                </div>
                {cycleLen === 'It varies' && (
                  <div className="rounded-2xl bg-accent p-4 mt-3 mb-2 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">What's the shortest you'd keep a style in?</p>
                      <div className="flex flex-wrap gap-2">
                        {cycleLengthMinOptions.map(o => (<button key={o} onClick={() => setCycleLenMin(o)} className={`pill-option ${cycleLenMin === o ? 'selected' : ''}`}>{o}</button>))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">What's the longest?</p>
                      <div className="flex flex-wrap gap-2">
                        {cycleLengthMaxOptions.map(o => (<button key={o} onClick={() => setCycleLenMax(o)} className={`pill-option ${cycleLenMax === o ? 'selected' : ''}`}>{o}</button>))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">We'll set your check-ins based on your typical range.</p>
                  </div>
                )}
                <div className="mt-8">
                  <h3 className="text-base font-medium text-foreground mb-1">How do you care for your scalp during a protective style?</h3>
                  <p className="text-muted-foreground text-sm mb-4">How often do you wash or wet your scalp?</p>
                  <div className="flex flex-wrap gap-2">
                    {washFrequencyOptions.map(w => (
                      <button key={w} onClick={() => { setWashFreq(w); if (w !== 'It depends on the style') setWashFreqPerCycle(''); }} className={`pill-option ${washFreq === w ? 'selected' : ''}`}>{w}</button>
                    ))}
                  </div>
                  {washFreq === 'It depends on the style' && (
                    <div className="rounded-2xl bg-accent p-4 mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">On average, roughly how many times per cycle do you cleanse your scalp?</p>
                      <div className="flex flex-wrap gap-2">
                        {washPerCycleOptions.map(o => (<button key={o} onClick={() => setWashFreqPerCycle(o)} className={`pill-option ${washFreqPerCycle === o ? 'selected' : ''}`}>{o}</button>))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <p className="text-sm font-medium text-foreground mb-3">Between washes, do you do anything for your scalp?</p>
                  <div className="flex flex-wrap gap-2">
                    {betweenWashOptions.map(o => (<button key={o} onClick={() => toggleBetweenWash(o)} className={`pill-option ${betweenWashCare.includes(o) ? 'selected' : ''}`}>{o}</button>))}
                  </div>
                  {betweenWashCare.includes('Other') && (
                    <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3" />
                  )}
                </div>
              </div>
            )}

            {step === 3 && isWornOutOnly && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Your routine</h2>
                <p className="text-muted-foreground mb-6">How often do you wash your hair?</p>
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {wornOutWashOptions.map(o => (<button key={o} onClick={() => setWornOutWashFreq(o)} className={`pill-option ${wornOutWashFreq === o ? 'selected' : ''}`}>{o}</button>))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-3">How often do you restyle or manipulate your hair?</p>
                  <div className="flex flex-wrap gap-2">
                    {restyleOptions.map(o => (<button key={o} onClick={() => setRestyleFreq(o)} className={`pill-option ${restyleFreq === o ? 'selected' : ''}`}>{o}</button>))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Baseline — conversational step-through */}
            {step === 4 && !baselineResultScreen && (
              <div>
                {baselineAck ? (
                  <motion.div
                    key="baseline-ack"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="pt-16 text-center"
                  >
                    <p className="text-lg font-medium text-foreground">{baselineAck}</p>
                  </motion.div>
                ) : (
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-2">How are things right now?</h2>
                    <p className="text-muted-foreground mb-6">Just a few questions so we know where you're starting from</p>

                    <div className="flex gap-1 mb-6">
                      {baselineQuestions.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= baselineStep ? 'bg-primary' : 'bg-border'}`} />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={baselineStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-base font-medium text-foreground mb-4">{baselineQuestions[baselineStep].q}</h3>
                        <div className="space-y-3">
                          {baselineQuestions[baselineStep].options.map((opt, optIdx) => (
                            <button
                              key={opt}
                              onClick={() => selectBaselineAnswer(baselineQuestions[baselineStep].key, opt, optIdx)}
                              className={`selection-card w-full text-left ${baselineAnswers[baselineQuestions[baselineStep].key] === opt ? 'selected' : ''}`}
                            >
                              <p className="font-medium text-foreground">{opt}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {step === 4 && baselineResultScreen === 'amber' && (
              <div>
                <div className="flex justify-center mb-6">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-warning flex items-center justify-center">
                    <Eye size={32} className="text-warning-foreground" strokeWidth={1.8} />
                  </motion.div>
                </div>
                <h2 className="text-lg font-medium text-foreground text-center mb-2">Thanks for sharing — a couple of things to note</h2>
                <p className="text-muted-foreground text-center mb-6">You have some symptoms worth tracking from the start. We'll factor this into your first check-in so we can see how things develop.</p>
                <div className="card-elevated p-5 mb-4">
                  <h3 className="font-semibold mb-3">In the meantime</h3>
                  <ol className="space-y-2">
                    {getBaselineSevereFlaggedSymptoms(itch, tenderness, hairline).includes('scalp itching') && (
                      <li className="flex gap-3 text-sm"><span className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-warning">•</span><span className="text-muted-foreground">Apply a lightweight, non-comedogenic scalp oil to soothe irritation</span></li>
                    )}
                    {getBaselineSevereFlaggedSymptoms(itch, tenderness, hairline).includes('tenderness') && (
                      <li className="flex gap-3 text-sm"><span className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-warning">•</span><span className="text-muted-foreground">Avoid re-tightening your edges — if they're loose, leave them</span></li>
                    )}
                    {getBaselineSevereFlaggedSymptoms(itch, tenderness, hairline).includes('hairline changes') && (
                      <li className="flex gap-3 text-sm"><span className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-warning">•</span><span className="text-muted-foreground">Consider loosening or avoiding tension on your hairline for the next style</span></li>
                    )}
                  </ol>
                </div>
                <div className="rounded-2xl bg-accent p-4 mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">This isn't a diagnosis — it's a starting point.</p>
                </div>
              </div>
            )}

            {step === 4 && baselineResultScreen === 'red' && (
              <div>
                <div className="flex justify-center mb-6">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center">
                    <Stethoscope size={32} className="text-destructive-foreground" strokeWidth={1.8} />
                  </motion.div>
                </div>
                <h2 className="text-lg font-medium text-foreground text-center mb-2">We'd recommend seeking advice soon</h2>
                <p className="text-muted-foreground text-center mb-6">The symptoms you've described — especially {getBaselineSevereFlaggedSymptoms(itch, tenderness, hairline).join(' and ')} — are worth getting checked sooner rather than later.</p>
                <div className="card-elevated p-5 mb-4">
                  <h3 className="font-semibold mb-2">Who to see</h3>
                  <p className="text-sm text-muted-foreground">A trichologist specialises in hair and scalp conditions. A dermatologist can investigate further. Your GP can refer you.</p>
                </div>
                <div className="card-elevated p-5 mb-4">
                  <h3 className="font-semibold mb-2">We'll still track with you</h3>
                  <p className="text-sm text-muted-foreground">Setting up ScalpSense now means you'll have a symptom timeline to share with whoever you see.</p>
                </div>
                <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-border font-semibold text-sm btn-press mb-4 flex items-center justify-center gap-2">
                  <Stethoscope size={16} strokeWidth={1.8} /> View your baseline summary
                </button>
              </div>
            )}

            {/* Step 5: Baseline photos */}
            {step === 5 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Capture your starting point</h2>
                <p className="text-muted-foreground mb-6">A baseline photo helps you spot gradual changes that are hard to notice day to day</p>
                <div className="space-y-3 mb-6">
                  {baselineAreas.map(area => (
                    <button key={area.id} onClick={() => setCapturedPhotos(prev => ({ ...prev, [area.id]: true }))} className={`selection-card w-full flex items-center gap-4 text-left ${area.optional ? 'border-dashed opacity-80' : ''} ${capturedPhotos[area.id] ? 'selected' : ''}`}>
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${capturedPhotos[area.id] ? 'bg-primary/10' : 'bg-accent'}`}>
                        {capturedPhotos[area.id] ? <Check size={22} className="text-primary" strokeWidth={2} /> : <Camera size={22} className="text-muted-foreground" strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{area.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{capturedPhotos[area.id] ? 'Photo captured ✓' : area.desc}</p>
                      </div>
                      {area.optional && !capturedPhotos[area.id] && (<span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">Optional</span>)}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl bg-accent p-4 mb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">🔒 Photos are stored on your device only — never uploaded, never shared unless you choose to.</p>
                </div>
                <div className="rounded-2xl bg-accent p-4 mb-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">💡 For the best baseline, take photos in good natural light with your hair parted or pulled back so your scalp is visible.</p>
                </div>
              </div>
            )}

            {/* Step 6: Products */}
            {step === 6 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Let's talk products</h2>
                <p className="text-muted-foreground mb-6">This helps us understand what might be affecting your scalp health</p>

                {/* Scalp products */}
                <h3 className="text-base font-medium text-foreground mb-1">What do you put on your scalp?</h3>
                <p className="text-sm text-muted-foreground mb-4">Even if it's just oil every now and then</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {scalpProductOptions.map(p => (
                    <button key={p} onClick={() => toggleProduct(p)} className={`selection-card text-center py-4 ${products.includes(p) ? 'selected' : ''}`}>
                      <p className="font-medium text-foreground text-xs leading-snug">{p}</p>
                    </button>
                  ))}
                </div>
                {products.includes('Other') && (
                  <input type="text" value={otherProduct} onChange={e => setOtherProduct(e.target.value)} placeholder="What else do you use on your scalp?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-2" />
                )}
                <button onClick={() => navigate('/products?from=onboarding&type=scalp')} className="text-xs font-medium text-primary mb-6 py-1">Browse products →</button>

                <p className="text-sm text-muted-foreground mb-3">How often do you apply products to your scalp?</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {productFrequencies.map(f => (<button key={f} onClick={() => setProdFreq(f)} className={`pill-option ${prodFreq === f ? 'selected' : ''}`}>{f}</button>))}
                </div>

                {/* Hair products */}
                <h3 className="text-base font-medium text-foreground mb-1">And what about your hair?</h3>
                <p className="text-sm text-muted-foreground mb-4">The stuff that goes on your lengths and ends</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {hairProductOptions.map(p => (
                    <button key={p} onClick={() => toggleHairProd(p)} className={`selection-card text-center py-4 ${hairProds.includes(p) ? 'selected' : ''}`}>
                      <p className="font-medium text-foreground text-xs leading-snug">{p}</p>
                    </button>
                  ))}
                </div>
                {hairProds.includes('Other') && (
                  <input type="text" value={otherHairProd} onChange={e => setOtherHairProd(e.target.value)} placeholder="What else do you use on your hair?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-2" />
                )}
                <button onClick={() => navigate('/products?from=onboarding&type=hair')} className="text-xs font-medium text-primary mb-6 py-1">Browse products →</button>

                <p className="text-sm text-muted-foreground mb-3">How often do you apply products to your hair?</p>
                <div className="flex flex-wrap gap-2">
                  {productFrequencies.map(f => (<button key={f} onClick={() => setHairProdFreq(f)} className={`pill-option ${hairProdFreq === f ? 'selected' : ''}`}>{f}</button>))}
                </div>
              </div>
            )}

            {/* Step 7: Menstrual cycle */}
            {step === 7 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Do you want to link your menstrual cycle?</h2>
                <p className="text-muted-foreground mb-4">Your hormones have a direct effect on your scalp</p>

                <div className="rounded-2xl bg-secondary/50 p-4 mb-6">
                  <p className="text-sm text-foreground leading-relaxed">
                    Oestrogen, progesterone, and testosterone fluctuate throughout your cycle and can affect scalp oiliness, sensitivity, and shedding. Linking your cycle lets us give you context when symptoms change, so you know what's hormonal and what's worth investigating.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {["Yes, I'd like to track", 'No thanks', "I don't menstruate"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setMenstrualTracking(opt)}
                      className={`selection-card w-full text-left ${menstrualTracking === opt ? 'selected' : ''}`}
                    >
                      <p className="font-medium text-foreground">{opt}</p>
                    </button>
                  ))}
                </div>

                {menstrualTracking === "Yes, I'd like to track" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <p className="font-medium text-foreground mb-3">When did your last period start?</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-left text-sm flex items-center gap-2">
                            <span className={lastPeriodDate ? 'text-foreground' : 'text-muted-foreground'}>
                              {lastPeriodDate ? format(lastPeriodDate, 'PPP') : 'Select a date'}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={lastPeriodDate} onSelect={(d) => d && setLastPeriodDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-3">How long is your typical cycle?</p>
                      <div className="flex flex-wrap gap-2">
                        {menstrualCycleLengthOptions.map(o => (
                          <button key={o} onClick={() => setMenstrualCycleLength(o)} className={`pill-option ${menstrualCycleLength === o ? 'selected' : ''}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-3">Are you on hormonal contraception?</p>
                      <div className="flex flex-wrap gap-2">
                        {contraceptionOptions.map(o => (
                          <button key={o} onClick={() => setHormonalContraception(o)} className={`pill-option ${hormonalContraception === o ? 'selected' : ''}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 8: Goals */}
            {step === 8 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">What matters most to you right now?</h2>
                <p className="text-muted-foreground mb-6">Pick up to 3 — this helps us focus your experience</p>
                <div className="space-y-3 mb-6">
                  {goalOptions.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`selection-card w-full text-left ${goals.includes(g) ? 'selected' : ''} ${goals.length >= 3 && !goals.includes(g) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={goals.length >= 3 && !goals.includes(g)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${goals.includes(g) ? 'bg-primary border-primary' : 'border-border'}`}>
                          {goals.includes(g) && <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />}
                        </div>
                        <p className="font-medium text-foreground text-sm">{g}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pb-8">
          {step === 4 && baselineResultScreen ? (
            <button onClick={handleNext} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
              Continue setup
            </button>
          ) : step === 4 && !baselineResultScreen && !baselineAck ? (
            allBaselineAnswered && baselineStep === baselineQuestions.length - 1 ? (
              <button onClick={handleNext} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
                Set up my cycle
              </button>
            ) : null
          ) : step === 5 ? (
            <div className="space-y-3">
              <button onClick={handleNext} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
                {Object.values(capturedPhotos).some(Boolean) ? 'Continue' : 'Skip for now'}
              </button>
              {!Object.values(capturedPhotos).some(Boolean) && (
                <p className="text-xs text-center text-muted-foreground">You can always add baseline photos later from your Profile.</p>
              )}
            </div>
          ) : step === 4 && baselineAck ? null : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? "Let's go" : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
