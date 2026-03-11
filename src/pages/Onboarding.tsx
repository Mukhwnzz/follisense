import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, Camera, Check, Leaf, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ProductSearch from '@/components/ProductSearch';

// Hair reference photos
import bwType3 from '@/assets/hair/bw_type3.jpg';
import bwType3c from '@/assets/hair/bw_type3_c.jpg';
import bwType4a from '@/assets/hair/bw_type4_a.jpg';
import bwType4b from '@/assets/hair/bw_type4_b.jpg';
import bwType4c from '@/assets/hair/bw_type4_c.jpg';
import bmType3 from '@/assets/hair/bm_type3.jpg';
import bmType4 from '@/assets/hair/bm_type4.jpg';
import bmType4Fade from '@/assets/hair/bm_type4_fade.jpg';
import bmLocs from '@/assets/hair/bm_locs.jpg';

// Photo sets by gender and hair type
const hairPhotos: Record<string, Record<string, { src: string; label: string }[]>> = {
  type3: {
    female: [
      { src: bwType3, label: 'Type 3: S-shaped curls, bouncy' },
      { src: bwType3c, label: 'Type 3: Tighter curls, voluminous' },
    ],
    male: [
      { src: bmType3, label: 'Type 3: Defined curls, medium density' },
    ],
  },
  type4: {
    female: [
      { src: bwType4a, label: 'Type 4a: Defined coils, springy' },
      { src: bwType4b, label: 'Type 4b: Z-pattern coils, dense' },
      { src: bwType4c, label: 'Type 4c: Tight coils, significant shrinkage' },
    ],
    male: [
      { src: bmType4, label: 'Type 4: Tight coils, dense, afro' },
      { src: bmType4Fade, label: 'Type 4: Coily texture, fade' },
    ],
  },
};


// ── Data ──────────────────────────────────────────────────────────────────────

const hairTypes = [
  {
    id: 'type4',
    label: 'Type 4 — Coily',
    desc: 'Tight coils or zig-zag pattern, dense texture, significant shrinkage',
    photoLabels: {
      female: '4 female: tight coils, z-pattern, dense',
      male: '4 male: tight coils, dense, significant shrinkage',
    },
  },
  {
    id: 'type3',
    label: 'Type 3 — Curly',
    desc: 'Visible curl pattern, S-shaped curls, looser texture',
    photoLabels: {
      female: '3 female: S-shaped curls, bouncy, visible curl pattern',
      male: '3 male: defined curls, medium density',
    },
  },
  {
    id: 'unsure',
    label: 'Not sure',
    desc: "That's okay — we'll use the most inclusive experience",
    photoLabels: null,
  },
];

const chemicalOptionsSimple = ['No, fully natural', 'Yes', 'Previously, but not currently', 'Not sure'];
const chemicalTypeOptions = ['Relaxed or permed', 'Texturised', 'Colour treated', 'Bleached'];
const lastChemicalTreatmentOptions = ['Within the last month', '1 to 3 months ago', '3 to 6 months ago', '6 to 12 months ago', 'Over a year ago', 'Not sure'];
const notSureChemicalFollowUp = [
  { label: 'Relaxer or perm', desc: 'Makes curly hair straight', mapsTo: 'Relaxed or permed' },
  { label: 'Texturiser', desc: 'Loosens curl pattern without fully straightening', mapsTo: 'Texturised' },
  { label: 'Hair colour or dye', desc: '', mapsTo: 'Colour treated' },
  { label: 'Bleach or lightening', desc: '', mapsTo: 'Bleached' },
];

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

const wornOutOnlyStylesFemale = ['Worn out / loose (natural)', 'Worn out / loose (relaxed or straightened)'];
const wornOutOnlyStylesMale = ['Short natural (TWA, tapered)', 'Fade or low cut (barber-maintained)', 'Waves (with durag or wave cap)', 'Free-form (no manipulation)'];

const protectiveFrequencyOptionsFemale = ['Most of the time', 'About half the time', 'Occasionally', 'Rarely — I mostly wear my hair out'];
const protectiveFrequencyOptionsMale = ['This is my everyday look', 'Most of the time', 'I switch it up regularly', 'Occasionally'];
const wornOutWashOptions = ['Multiple times a week', 'Once a week', 'Every 2 weeks', 'Every 3–4 weeks', 'Less often'];
const lessOftenWashOptions = ['Every 5–6 weeks', 'Every 7–8 weeks', '9+ weeks', 'It varies a lot'];
const restyleOptions = ['Daily', 'Every few days', 'Weekly', 'Less often'];
const cycleLengths = ['1–2 weeks', '2–4 weeks', '4–6 weeks', '6+ weeks', 'It varies'];
const cycleLengthMinOptions = ['Less than 1 week', '1–2 weeks', '2–4 weeks', '4–6 weeks'];
const cycleLengthMaxOptions = ['2–4 weeks', '4–6 weeks', '6–8 weeks', '8+ weeks'];
const betweenWashOptions = ['Apply oil or serum to the scalp', 'Use a scalp refresh spray or dry shampoo', 'Rinse with water only', 'Massage / manipulate the scalp', 'Nothing — I leave it alone until wash day', 'Other'];
const betweenWashOptionsMale = ['Apply oil or serum to the scalp', 'Use a scalp refresh spray or dry shampoo', 'Rinse with water only', 'Massage / manipulate the scalp', 'Use a durag or wave cap', 'Nothing — I leave it alone until wash day', 'Other'];

const productFrequencies = ['Daily', 'Every few days', 'Weekly', 'Only on wash day', 'Rarely'];

const femaleGoalOptions = ['Protect my edges / grow my hairline back', 'Reduce scalp irritation or itching', 'Understand my hair loss or thinning', 'Build a consistent scalp care routine', 'Monitor my scalp between salon visits', 'Recover from damage (chemical, heat, or traction)', 'General scalp and hair health', "I'm not sure yet — just exploring"];
const maleGoalOptions = ['Protect my hairline', 'Reduce scalp irritation or itching', 'Understand my hair loss or thinning', 'Build a consistent scalp care routine', 'Grow or maintain my locs', 'Get better wave or curl definition', 'Monitor my scalp between barber visits', 'General scalp and hair health', "I'm not sure yet, just exploring"];

const menstrualCycleLengthOptions = ['21–25 days', '26–30 days', '31–35 days', 'Irregular', 'Not sure'];
const contraceptionOptions = ['No', 'Yes (pill)', 'Yes (implant or injection)', 'Yes (IUD/coil)', 'Prefer not to say'];

const baselineQuestions = [
  { key: 'itch', q: 'Any scalp itching right now?', options: ['None', 'Mild', 'Moderate', 'Severe'] },
  { key: 'tenderness', q: 'Any tenderness or soreness?', options: ['None', 'Mild', 'Moderate', 'Severe'] },
  { key: 'hairline', q: 'Any concerns about your hairline or edges?', options: ['No concerns', 'Slight concern', 'Noticeable change', 'Very concerned'] },
  { key: 'hairHealth', q: 'How would you describe your hair health right now?', options: ['Healthy — no concerns', 'Some dryness or breakage but nothing unusual', 'Noticeably dry, brittle, or breaking more than usual', "Concerned about my hair's condition"] },
];

const genderOptions = [
  { id: 'woman', label: 'Female' },
  { id: 'man', label: 'Male' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
];

// ── "Why we ask" helper text for each section ─────────────────────────────────
const sectionWhyText: Record<number, string> = {
  1: "This helps us tailor scalp check-in questions to your hair's needs.",
  2: "Chemical processing changes how your scalp and hair respond to products and styling tension. This helps us tailor your check-ins.",
  3: "Different styles create different tension and coverage patterns. This helps us know what to watch for.",
  4: "We use this to time your reminders and mid-cycle check-ins.",
  5: "This sets your baseline so we can track changes over time.",
  7: "Knowing what you use helps us flag potential irritants or gaps.",
  8: "Hormonal changes affect your scalp and hair cycle. This helps us give you relevant guidance.",
};

// ── Micro-education transitional messages ──────────────────────────────────────
const getMicroEducation = (step: number, data: {
  washFreq?: string; styles?: string[]; baselineItch?: string; baselineTenderness?: string;
  baselineHairline?: string; baselineHairHealth?: string; isMale?: boolean;
}): { title: string; message: string } | null => {
  // After step 4 (routine/cycle)
  if (step === 4) {
    const longWash = data.washFreq === 'Only at takedown' || data.washFreq === 'Every 3 to 4 weeks' || data.washFreq === 'Less than weekly';
    if (longWash) {
      return {
        title: 'Got it',
        message: "Extended wash cycles are common with protective styles. Your ScalpSense check-ins will be timed around your cycle so you stay ahead of any buildup or irritation.",
      };
    }
    const tightStyles = (data.styles || []).some(s =>
      ['Box braids', 'Knotless braids', 'Cornrows / flat twists', 'Cornrows or flat twists', 'Weave / sew-in', 'Hair extensions (k-tips, micro links, etc.)'].includes(s)
    );
    if (tightStyles) {
      return {
        title: 'Noted',
        message: "Some styles put more tension on the hairline and edges. We'll keep an eye on those areas in your scalp checks.",
      };
    }
    return null;
  }
  // After baseline (step 5 → going to 6)
  if (step === 5) {
    const hasSymptoms = data.baselineItch && data.baselineItch !== 'None' || data.baselineTenderness && data.baselineTenderness !== 'None' || data.baselineHairline && data.baselineHairline !== 'No concerns';
    if (hasSymptoms) {
      return {
        title: "Thanks for sharing that",
        message: "Tracking this over time will help you spot patterns and know when to take action.",
      };
    }
    return null;
  }
  return null;
};

// ── Skippable steps ────────────────────────────────────────────────────────────
const isSkippableStep = (step: number, skipMenstrual: boolean): boolean => {
  // Products (step 7), menstrual (step 8 for non-male)
  if (step === 7) return true; // products
  if (step === 8 && !skipMenstrual) return true; // menstrual
  return false;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ackPools: Record<number, string[]> = {
  0: ["That's great", "Good to hear", "Lovely", "Nice"],
  1: [
    "Okay, we've noted that. Nothing to worry about for now",
    "Thanks for sharing. We'll keep that in mind",
    "Got it. That's pretty common but worth tracking",
    "Noted. We'll see how that looks over your next few check-ins",
    "Mild is usually manageable. Let's track how it goes",
  ],
  2: [
    "Thanks for being honest about that. That's exactly the kind of thing we want to track for you",
    "Okay, that's really helpful to know. We'll pay attention to that",
    "We appreciate you sharing that. Let's watch how it develops",
    "That's worth keeping an eye on. We'll check in on this next time",
    "Thanks for flagging that. Knowing your starting point helps us help you better",
    "Moderate symptoms are exactly why tools like this exist. We'll track it closely",
  ],
  3: [
    "I'm sorry you're dealing with that. Let's make sure we address it",
    "That sounds really uncomfortable. You're in the right place",
    "Thank you for telling us. We're going to take that seriously",
    "We hear you. That's not something you should have to just live with",
    "That's significant and we're glad you're not ignoring it",
  ],
};

const pickAck = (optionIndex: number, used: Set<string>): string => {
  const pool = ackPools[Math.min(optionIndex, 3)];
  const unused = pool.filter(m => !used.has(m));
  const available = unused.length > 0 ? unused : pool;
  return available[Math.floor(Math.random() * available.length)];
};

const computeBaselineRisk = (itch: string, tenderness: string, hairline: string, hairHealth: string): 'green' | 'amber' | 'red' => {
  const mildest = ['None', 'No concerns'];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  const hairMildest = ['Healthy — no concerns'];
  const hairModerate = ['Noticeably dry, brittle, or breaking more than usual', "Concerned about my hair's condition"];
  const scalpValues = [itch, tenderness, hairline];
  const allScalpMild = scalpValues.every(v => mildest.includes(v));
  if (allScalpMild && hairMildest.includes(hairHealth)) return 'green';
  if (scalpValues.some(v => severe.includes(v))) return 'red';
  const moderateCount = scalpValues.filter(v => moderate.includes(v)).length;
  if (moderateCount >= 2) return 'red';
  if (allScalpMild && hairModerate.includes(hairHealth)) return 'amber';
  if (!allScalpMild && hairModerate.includes(hairHealth) && moderateCount >= 1) return 'red';
  return allScalpMild ? 'green' : 'amber';
};

const CurlIcon = ({ type }: { type: string }) => {
  if (type === 'unsure') return <HelpCircle size={24} className="text-muted-foreground" strokeWidth={1.5} />;
  const patterns: Record<string, React.ReactNode> = {
    'type3': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/></svg>,
    'type4': <svg width="28" height="28" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"/></svg>,
  };
  return patterns[type] || null;
};

// ── Mini photo gallery for multiple reference photos ──────────────────────────
const PhotoGallery = ({ photos }: { photos: { src: string; label: string }[] }) => {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <img src={photos[0].src} alt={photos[0].label} className="w-full h-24 object-cover object-top" />
        <p className="text-[10px] text-muted-foreground text-center py-1 bg-accent/30">{photos[0].label}</p>
      </div>
    );
  }
  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <img src={photos[idx].src} alt={photos[idx].label} className="w-full h-24 object-cover object-top" />
      <p className="text-[10px] text-muted-foreground text-center py-1 bg-accent/30">{photos[idx].label}</p>
      <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }} className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center">
        <ChevronLeft size={12} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center">
        <ChevronRight size={12} />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
        {photos.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-foreground' : 'bg-foreground/30'}`} />
        ))}
      </div>
    </div>
  );
};

// ── Slide-in wrapper ─────────────────────────────────────────────────────────

const SlideIn = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Micro-education transition screen ────────────────────────────────────────

const MicroEducationScreen = ({ title, message, onContinue }: { title: string; message: string; onContinue: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center px-4 py-16">
    <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center mb-5">
      <Leaf size={24} className="text-primary" strokeWidth={1.8} />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-3">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px] mb-8">{message}</p>
    <button onClick={onContinue} className="w-full max-w-[280px] h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">
      Continue
    </button>
  </motion.div>
);

// ── Component ────────────────────────────────────────────────────────────────

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setOnboardingComplete, setOnboardingData, setBaselinePhotos, setBaselineRisk, setBaselineDate } = useApp();
  const initialStep = parseInt(searchParams.get('step') || '0', 10);
  const [step, setStep] = useState(initialStep);

  // ── State ──
  const [gender, setGender] = useState('');
  const [hairType, setHairType] = useState('');
  const [chemicalProcessing, setChemicalProcessing] = useState('');
  const [chemicalMultiple, setChemicalMultiple] = useState<string[]>([]);
  const [lastChemicalTreatment, setLastChemicalTreatment] = useState('');
  const [styles, setStyles] = useState<string[]>([]);
  const [otherStyle, setOtherStyle] = useState('');
  const [protectiveFreq, setProtectiveFreq] = useState('');
  const [wornOutWashFreq, setWornOutWashFreq] = useState('');
  const [lessOftenDetail, setLessOftenDetail] = useState('');
  const [restyleFreq, setRestyleFreq] = useState('');
  const [cycleLen, setCycleLen] = useState('');
  const [cycleLenMin, setCycleLenMin] = useState('');
  const [cycleLenMax, setCycleLenMax] = useState('');
  const [washFreq, setWashFreq] = useState('');
  const [washFreqBucket, setWashFreqBucket] = useState('');
  const [washFreqDetail, setWashFreqDetail] = useState('');
  const [washFreqPerCycle, setWashFreqPerCycle] = useState('');
  const [betweenWashCare, setBetweenWashCare] = useState<string[]>([]);
  const [otherBetweenWash, setOtherBetweenWash] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<string[]>([]);
  const [otherProduct, setOtherProduct] = useState('');
  const [prodFreq, setProdFreq] = useState('');
  const [hairProds, setHairProds] = useState<string[]>([]);
  const [otherHairProd, setOtherHairProd] = useState('');
  const [hairProdFreq, setHairProdFreq] = useState('');
  const [menstrualTracking, setMenstrualTracking] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(undefined);
  const [menstrualCycleLength, setMenstrualCycleLength] = useState('');
  const [hormonalContraception, setHormonalContraception] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const [showMicroEducation, setShowMicroEducation] = useState<{ title: string; message: string } | null>(null);
  const [skippedSections, setSkippedSections] = useState<number[]>([]);
  const [notSureFollowUp, setNotSureFollowUp] = useState<string[]>([]);

  // Male-specific
  const [barberFreq, setBarberFreq] = useState('');
  const [locRetwistFreq, setLocRetwistFreq] = useState('');
  const [maleStyleDuration, setMaleStyleDuration] = useState('');
  const [maleScalpWashFreq, setMaleScalpWashFreq] = useState('');
  const [maleWashFreq, setMaleWashFreq] = useState('');
  const [maleBetweenCare, setMaleBetweenCare] = useState<string[]>([]);
  const [otherMaleBetweenCare, setOtherMaleBetweenCare] = useState('');

  // Baseline
  const [baselineStep, setBaselineStep] = useState(0);
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, string>>({});
  const [baselineAck, setBaselineAck] = useState<string | null>(null);
  const usedAcks = useRef<Set<string>>(new Set());

  // ── Derived ──
  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';
  const skipMenstrual = isMale;

  // Filter styles based on chemical processing — hide natural-only styles for currently processed hair
  const naturalOnlyStyles = ['Worn out / loose (natural)', 'Wash and go', 'Twist out / braid out'];
  const isCurrentlyProcessed = chemicalProcessing === 'Yes' && chemicalMultiple.some(c => ['Relaxed or permed', 'Texturised'].includes(c));
  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;
  const styleOptions = isCurrentlyProcessed ? rawStyleOptions.filter(s => !naturalOnlyStyles.includes(s)) : rawStyleOptions;
  const wornOutOnlyStyles = isMale ? wornOutOnlyStylesMale : isNeutral ? [...wornOutOnlyStylesFemale, ...wornOutOnlyStylesMale] : wornOutOnlyStylesFemale;
  const currentBetweenWashOptions = isMale ? betweenWashOptionsMale : isNeutral ? [...new Set([...betweenWashOptions, ...betweenWashOptionsMale])] : betweenWashOptions;
  const goalOptions = isMale ? maleGoalOptions : isNeutral ? [...new Set([...femaleGoalOptions, ...maleGoalOptions])] : femaleGoalOptions;

  const isWornOutOnly = styles.length > 0 && styles.every(s => wornOutOnlyStyles.includes(s));
  const hasProtectiveOrStretchedStyle = styles.length > 0 && styles.some(s => !wornOutOnlyStyles.includes(s) && s !== 'Other');

  const maleInstalledStyles = ['Locs or faux locs', 'Box braids', 'Cornrows or flat twists', 'Twists (two-strand)'];
  const maleNonInstalledStyles = ['Fade or low cut (barber-maintained)', 'Free-form (no manipulation)', 'Waves (with durag or wave cap)', 'High top or frohawk', 'Short natural (TWA, tapered)'];
  const hasLocsMale = isMale && styles.some(s => s === 'Locs or faux locs');
  const hasBraidsMale = isMale && styles.some(s => ['Box braids', 'Cornrows or flat twists', 'Twists (two-strand)'].includes(s));
  const hasFadeOrShortMale = isMale && styles.some(s => maleNonInstalledStyles.includes(s));
  const hasMaleInstalledStyles = isMale && styles.some(s => maleInstalledStyles.includes(s));

  /*
   * STEP MAP:
   * -1 = Intro ("why we ask")
   * 0 = Gender
   * 1 = Hair type (get to know your hair)
   * 2 = Chemical processing (separate clinical question)
   * 3 = Styles
   * 4 = Cycle / routine
   * 5 = Baseline check → navigates to /onboarding/baseline-response
   * 6 = Photos
   * 7 = Products (skippable)
   * 8 = Menstrual (skipped for male; skippable for others)
   * 9 = Goals
   */
  const totalSegments = skipMenstrual ? 10 : 11; // +1 for intro

  const baselineAreas = [
    { id: 'hairline', label: 'Hairline — temples and edges', desc: 'Front-facing', optional: false },
    { id: 'crown', label: 'Crown and vertex', desc: 'Top of head', optional: false },
    { id: 'nape', label: 'Nape / back of neck', desc: 'Optional', optional: true },
    ...((isMale && styles.some(s => s === 'Fade or low cut (barber-maintained)') && styles.length === 1) ? [] : [
      { id: 'hair-condition', label: 'Hair condition — mid-lengths and ends', desc: 'Helps track breakage patterns', optional: true },
    ]),
  ];

  // ── Toggles ──
  const toggleStyle = (s: string) => setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleChemMulti = (v: string) => setChemicalMultiple(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleMaleBetweenCare = (v: string) => setMaleBetweenCare(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleNotSureFollowUp = (v: string) => {
    if (v === 'None of these' || v === "I really don't know") {
      setNotSureFollowUp(prev => prev.includes(v) ? [] : [v]);
      setLastChemicalTreatment('');
    } else {
      setNotSureFollowUp(prev => {
        const without = prev.filter(x => x !== 'None of these' && x !== "I really don't know");
        return without.includes(v) ? without.filter(x => x !== v) : [...without, v];
      });
    }
  };
  const toggleBetweenWash = (v: string) => {
    const nothingOption = 'Nothing — I leave it alone until wash day';
    if (v === nothingOption) {
      setBetweenWashCare(prev => prev.includes(v) ? [] : [v]);
    } else {
      setBetweenWashCare(prev => {
        const without = prev.filter(x => x !== nothingOption);
        return without.includes(v) ? without.filter(x => x !== v) : [...without, v];
      });
    }
  };
  const toggleGoal = (g: string) => {
    setGoals(prev => {
      if (prev.includes(g)) return prev.filter(x => x !== g);
      if (prev.length >= 3) return prev;
      return [...prev, g];
    });
  };

  // ── Baseline auto-advance ──
  useEffect(() => {
    if (!baselineAck) return;
    const timer = setTimeout(() => {
      setBaselineAck(null);
      if (baselineStep < baselineQuestions.length - 1) {
        setBaselineStep(prev => prev + 1);
      } else {
        const bItch = baselineAnswers.itch || '';
        const bTenderness = baselineAnswers.tenderness || '';
        const bHairline = baselineAnswers.hairline || '';
        const bHairHealth = baselineAnswers.hairHealth || '';
        const risk = computeBaselineRisk(bItch, bTenderness, bHairline, bHairHealth);
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        setBaselineRisk(risk);
        setBaselineDate(today);
        sessionStorage.setItem('follisense-baseline-answers', JSON.stringify(baselineAnswers));
        navigate('/onboarding/baseline-response');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [baselineAck, baselineStep, baselineAnswers]);

  const selectBaselineAnswer = (key: string, val: string, optIndex: number) => {
    setBaselineAnswers(prev => ({ ...prev, [key]: val }));
    const ack = pickAck(optIndex, usedAcks.current);
    usedAcks.current.add(ack);
    setBaselineAck(ack);
  };

  // ── canProceed ──
  const canProceed = () => {
    if (step === -1) return true; // intro
    switch (step) {
      case 0: return !!gender;
      case 1: return !!hairType;
      case 2: {
        if (!chemicalProcessing) return false;
        if (chemicalProcessing === 'No, fully natural') return true;
        if (chemicalProcessing === 'Yes') return chemicalMultiple.length > 0 && !!lastChemicalTreatment;
        if (chemicalProcessing === 'Previously, but not currently') return !!lastChemicalTreatment;
        if (chemicalProcessing === 'Not sure') {
          if (notSureFollowUp.length === 0) return false;
          if (notSureFollowUp.includes('None of these') || notSureFollowUp.includes("I really don't know")) return true;
          return !!lastChemicalTreatment;
        }
        return false;
      }
      case 3: {
        const stylesOk = styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0);
        if (isMale) return stylesOk && (!hasMaleInstalledStyles || !!protectiveFreq);
        return stylesOk && (isWornOutOnly || !!protectiveFreq);
      }
      case 4: {
        if (isMale) {
          const betweenOk = maleBetweenCare.length > 0 && (!maleBetweenCare.includes('Other') || otherMaleBetweenCare.trim().length > 0);
          if (hasFadeOrShortMale && !hasLocsMale && !hasBraidsMale) return !!barberFreq && !!maleWashFreq && betweenOk;
          if (hasLocsMale) return !!locRetwistFreq && !!maleScalpWashFreq && betweenOk;
          if (hasBraidsMale) return !!maleStyleDuration && !!maleScalpWashFreq && betweenOk;
          return betweenOk;
        }
        if (isWornOutOnly) return !!wornOutWashFreq && (wornOutWashFreq !== 'Less often' || !!lessOftenDetail) && !!restyleFreq;
        const cycleOk = !!cycleLen && (cycleLen !== 'It varies' || (!!cycleLenMin && !!cycleLenMax));
        const washOk = !!washFreqBucket && !!washFreqDetail && (washFreqDetail !== 'It depends' || !!washFreqPerCycle);
        const betweenOk = betweenWashCare.length > 0 && (!betweenWashCare.includes('Other') || otherBetweenWash.trim().length > 0);
        return cycleOk && washOk && betweenOk;
      }
      case 5: return false;
      case 6: return true;
      case 7: {
        const scalpNone = products.length === 1 && products[0] === 'None';
        const hairNone = hairProds.length === 1 && hairProds[0] === 'None';
        const scalpOk = scalpNone || (products.length > 0 && !!prodFreq);
        const hairOk = hairNone || (hairProds.length > 0 && !!hairProdFreq);
        return scalpOk && hairOk;
      }
      case 8: {
        if (skipMenstrual) return goals.length > 0;
        return !!menstrualTracking && (menstrualTracking !== "Yes, I'd like to track" || (!!menstrualCycleLength && !!hormonalContraception));
      }
      case 9: return goals.length > 0;
      default: return false;
    }
  };

  const isLastStep = skipMenstrual ? step === 8 : step === 9;

  const handleSkip = () => {
    setSkippedSections(prev => [...prev, step]);
    if (skipMenstrual && step === 7) {
      setStep(8);
    } else {
      setStep(step + 1);
    }
  };

  const handleNext = () => {
    if (step === -1) {
      setStep(0);
      return;
    }

    // Check for micro-education transition
    if (step === 4 && !showMicroEducation) {
      const edu = getMicroEducation(4, {
        washFreq: washFreqDetail || wornOutWashFreq || maleWashFreq,
        styles,
        isMale,
      });
      if (edu) {
        setShowMicroEducation(edu);
        return;
      }
    }

    if (!isLastStep) {
      if (step === 6) {
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const photos = baselineAreas.filter(a => capturedPhotos[a.id]).map(a => ({ area: a.label, captured: true, date: today }));
        setBaselinePhotos(photos);
      }
      if (skipMenstrual && step === 7) {
        setStep(8);
      } else {
        setStep(step + 1);
      }
    } else {
      // Compute the best wash frequency display value
      const computedWashFrequency = isMale
        ? maleWashFreq || maleScalpWashFreq
        : isWornOutOnly
          ? wornOutWashFreq + (lessOftenDetail ? ` (${lessOftenDetail})` : '')
          : washFreqDetail || washFreqBucket;

      // Compute effective chemical processing from "Not sure" follow-up
      let effectiveChemProcessing = chemicalProcessing;
      let effectiveChemMultiple = [...chemicalMultiple];
      if (chemicalProcessing === 'Not sure' && notSureFollowUp.length > 0) {
        if (notSureFollowUp.includes('None of these')) {
          effectiveChemProcessing = 'No, fully natural';
        } else if (!notSureFollowUp.includes("I really don't know")) {
          effectiveChemProcessing = 'Yes';
          effectiveChemMultiple = notSureFollowUp
            .map(s => notSureChemicalFollowUp.find(n => n.label === s)?.mapsTo)
            .filter(Boolean) as string[];
        }
      }

      setOnboardingData({
        gender, hairType, chemicalProcessing: effectiveChemProcessing, lastChemicalTreatment,
        chemicalProcessingMultiple: effectiveChemMultiple,
        protectiveStyles: styles, otherStyle, protectiveStyleFrequency: protectiveFreq,
        isWornOutOnly, cycleLength: cycleLen, cycleLengthMin: cycleLenMin, cycleLengthMax: cycleLenMax,
        washFrequency: computedWashFrequency, washFrequencyPerCycle: washFreqPerCycle,
        betweenWashCare: isMale ? maleBetweenCare : betweenWashCare, otherBetweenWashCare: isMale ? otherMaleBetweenCare : otherBetweenWash,
        wornOutWashFrequency: wornOutWashFreq, restyleFrequency: restyleFreq,
        baselineItch: baselineAnswers.itch || '', baselineTenderness: baselineAnswers.tenderness || '',
        baselineHairline: baselineAnswers.hairline || '', baselineHairHealth: baselineAnswers.hairHealth || '',
        scalpProducts: products, otherProduct, productFrequency: prodFreq,
        hairProducts: hairProds, otherHairProduct: otherHairProd, hairProductFrequency: hairProdFreq,
        scalpProductFrequency: prodFreq,
        menstrualTracking: skipMenstrual ? '' : menstrualTracking,
        lastPeriodDate: lastPeriodDate ? format(lastPeriodDate, 'yyyy-MM-dd') : '',
        menstrualCycleLength: skipMenstrual ? '' : menstrualCycleLength,
        hormonalContraception: skipMenstrual ? '' : hormonalContraception,
        goals,
        barberFrequency: barberFreq,
        locRetwistFrequency: locRetwistFreq,
        maleStyleFrequency: maleStyleDuration,
      });
      // Save skipped sections for profile completion card
      if (skippedSections.length > 0) {
        sessionStorage.setItem('follisense-skipped-sections', JSON.stringify(skippedSections));
      }
      sessionStorage.setItem('follisense-just-onboarded', 'true');
      setOnboardingComplete(true);
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (showMicroEducation) {
      setShowMicroEducation(null);
      return;
    }
    if (step === 5 && baselineStep > 0) { setBaselineStep(prev => prev - 1); return; }
    if (step === -1) { navigate('/'); return; }
    if (step > 0) {
      if (skipMenstrual && step === 8) { setStep(7); return; }
      setStep(step - 1);
    } else if (step === 0) {
      setStep(-1);
    } else {
      navigate('/');
    }
  };

  const getProgressIndex = () => {
    if (step === -1) return 0;
    if (!skipMenstrual) return step + 1;
    if (step <= 7) return step + 1;
    return 9;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Show micro-education transition
  if (showMicroEducation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => setShowMicroEducation(null)} className="p-2 -ml-2 text-foreground"><ArrowLeft size={22} strokeWidth={1.8} /></button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSegments }).map((_, i) => (
                <div key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i <= getProgressIndex() ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center">
            <MicroEducationScreen
              title={showMicroEducation.title}
              message={showMicroEducation.message}
              onContinue={() => {
                setShowMicroEducation(null);
                setStep(step + 1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          {step > -1 ? (
            <button onClick={handleBack} className="p-2 -ml-2 text-foreground"><ArrowLeft size={22} strokeWidth={1.8} /></button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex gap-1.5">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i <= getProgressIndex() ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={step === 5 ? `5-${baselineStep}-${baselineAck ? 'ack' : 'q'}` : step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pt-4 pb-8"
          >

            {/* ── Step -1: Intro ── */}
            {step === -1 && (
              <div className="flex flex-col items-center text-center px-2 pt-8">
                <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-6">
                  <Leaf size={28} className="text-primary" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Before we start</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[340px]">
                  We'll ask you a few questions about your hair, scalp, and routine. This helps ScalpSense personalise your check-ins, time your reminders to your actual cycle, and flag what matters most for your scalp health.
                </p>
                <p className="text-xs text-muted-foreground mb-8">You can skip anything you're not comfortable sharing.</p>
              </div>
            )}

            {/* ── Step 0: Gender ── */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">First, tell us a bit about you</h2>
                <p className="text-muted-foreground mb-3">This helps us personalise your experience</p>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Hair health is affected by hormones, and hormonal profiles differ. Knowing this helps us ask the right questions and give you more relevant insights.</p>
                <div className="space-y-3">
                  {genderOptions.map(opt => (
                    <button key={opt.id} onClick={() => setGender(opt.id)} className={`selection-card w-full text-left ${gender === opt.id ? 'selected' : ''}`}>
                      <p className="font-medium text-foreground">{opt.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">This is only used to personalise your experience. You can change it anytime in your profile.</p>
              </div>
            )}

            {/* ── Step 1: Hair type ── */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Let's get to know your hair</h2>
                <p className="text-xs text-muted-foreground mb-5">{sectionWhyText[1]}</p>
                <p className="text-muted-foreground mb-4">Which best describes your hair texture?</p>
                <p className="text-xs text-muted-foreground mb-6 italic">
                  Type 3 curls wrap around a finger. Type 4 coils are tighter than a pen spring.
                </p>
                <div className="space-y-4">
                  {hairTypes.map(ht => {
                    const hasPhotos = ht.id !== 'unsure' && hairPhotos[ht.id];
                    const genderKey = isMale ? 'male' : isNeutral ? 'both' : 'female';
                    const photos = hasPhotos
                      ? genderKey === 'both'
                        ? [...(hairPhotos[ht.id].female || []), ...(hairPhotos[ht.id].male || [])]
                        : hairPhotos[ht.id][genderKey] || []
                      : [];
                    return (
                      <button
                        key={ht.id}
                        onClick={() => setHairType(ht.id)}
                        className={`selection-card w-full text-left ${hairType === ht.id ? 'selected' : ''}`}
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
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="rounded-lg bg-accent/50 border border-border p-3 flex flex-col items-center justify-center min-h-[80px]">
                              <CurlIcon type={ht.id} />
                              <span className="text-[10px] text-muted-foreground mt-1.5 text-center">Pattern illustration</span>
                            </div>
                            <PhotoGallery photos={photos} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 2: Chemical processing ── */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">A quick question about your hair history</h2>
                <p className="text-xs text-muted-foreground mb-5">{sectionWhyText[2]}</p>
                <p className="font-medium text-foreground mb-3">Has your hair been chemically processed?</p>
                <div className="space-y-2">
                  {chemicalOptionsSimple.map(opt => (
                    <button key={opt} onClick={() => {
                      setChemicalProcessing(opt);
                      if (opt === 'No, fully natural') { setChemicalMultiple([]); setLastChemicalTreatment(''); setNotSureFollowUp([]); }
                      if (opt === 'Yes') { setNotSureFollowUp([]); }
                      if (opt === 'Previously, but not currently') { setChemicalMultiple([]); setNotSureFollowUp([]); }
                      if (opt === 'Not sure') { setChemicalMultiple([]); setLastChemicalTreatment(''); setNotSureFollowUp([]); }
                      if (opt !== 'Yes') setChemicalMultiple([]);
                    }} className={`selection-card w-full text-left ${chemicalProcessing === opt ? 'selected' : ''}`}>
                      <p className="font-medium text-foreground text-sm">{opt}</p>
                    </button>
                  ))}
                </div>

                <SlideIn show={chemicalProcessing === 'Yes'}>
                  <div className="mt-4 p-3 rounded-xl bg-accent space-y-2">
                    <p className="text-sm font-medium text-foreground mb-2">What type of processing?</p>
                    <div className="flex flex-wrap gap-2">
                      {chemicalTypeOptions.map(opt => (
                        <button key={opt} onClick={() => toggleChemMulti(opt)} className={`pill-option ${chemicalMultiple.includes(opt) ? 'selected' : ''}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                </SlideIn>

                <SlideIn show={chemicalProcessing === 'Not sure'}>
                  <div className="mt-4 p-3 rounded-xl bg-accent space-y-3">
                    <p className="text-sm font-medium text-foreground">No worries. Have you ever had any of these done to your hair?</p>
                    <div className="space-y-2">
                      {notSureChemicalFollowUp.map(opt => (
                        <button key={opt.label} onClick={() => toggleNotSureFollowUp(opt.label)} className={`selection-card w-full text-left ${notSureFollowUp.includes(opt.label) ? 'selected' : ''}`}>
                          <p className="font-medium text-foreground text-sm">{opt.label}</p>
                          {opt.desc && <p className="text-xs text-muted-foreground">{opt.desc}</p>}
                        </button>
                      ))}
                      <button onClick={() => toggleNotSureFollowUp('None of these')} className={`selection-card w-full text-left ${notSureFollowUp.includes('None of these') ? 'selected' : ''}`}>
                        <p className="font-medium text-foreground text-sm">None of these</p>
                      </button>
                      <button onClick={() => toggleNotSureFollowUp("I really don't know")} className={`selection-card w-full text-left ${notSureFollowUp.includes("I really don't know") ? 'selected' : ''}`}>
                        <p className="font-medium text-foreground text-sm">I really don't know</p>
                      </button>
                    </div>
                  </div>
                </SlideIn>

                <SlideIn show={(chemicalProcessing === 'Yes' && chemicalMultiple.length > 0) || chemicalProcessing === 'Previously, but not currently' || (chemicalProcessing === 'Not sure' && notSureFollowUp.length > 0 && !notSureFollowUp.includes('None of these') && !notSureFollowUp.includes("I really don't know"))}>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-foreground mb-3">When was your last chemical treatment?</p>
                    <div className="flex flex-wrap gap-2">
                      {lastChemicalTreatmentOptions.map(opt => (
                        <button key={opt} onClick={() => setLastChemicalTreatment(opt)} className={`pill-option ${lastChemicalTreatment === opt ? 'selected' : ''}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                </SlideIn>
              </div>
            )}

            {/* ── Step 3: Styles ── */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">How do you usually wear your hair?</h2>
                <p className="text-xs text-muted-foreground mb-3">{sectionWhyText[3]}</p>
                <p className="text-muted-foreground mb-6">Select everything you rotate between</p>
                {(() => {
                  const defaultCount = isMale ? 6 : 8;
                  
                  const renderStyleButton = (s: string) => {
                    return (
                      <button 
                        key={s} 
                        onClick={() => toggleStyle(s)} 
                        className={`selection-card text-center py-4 ${styles.includes(s) ? 'selected' : ''}`}
                      >
                        <p className="font-medium text-foreground text-sm">{s}</p>
                      </button>
                    );
                  };
                  
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {styleOptions.slice(0, defaultCount).map(s => renderStyleButton(s))}
                      </div>
                      {styleOptions.length > defaultCount && !showMoreStyles && (
                        <button onClick={() => setShowMoreStyles(true)} className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary mt-3 py-2">
                          Show more styles <ChevronDown size={16} strokeWidth={2} />
                        </button>
                      )}
                      {showMoreStyles && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {styleOptions.slice(defaultCount).map(s => renderStyleButton(s))}
                        </div>
                      )}
                    </>
                  );
                })()}
                {styles.includes('Other') && (
                  <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3" />
                )}

                <SlideIn show={isMale && hasMaleInstalledStyles && styles.length > 0}>
                  <div className="mt-8">
                    <p className="font-medium text-foreground mb-3">How often do you wear this style?</p>
                    <div className="flex flex-wrap gap-2">
                      {protectiveFrequencyOptionsMale.map(o => (
                        <button key={o} onClick={() => setProtectiveFreq(o)} className={`pill-option ${protectiveFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </SlideIn>

                <SlideIn show={!isMale && hasProtectiveOrStretchedStyle && styles.length > 0}>
                  <div className="mt-8">
                    <p className="font-medium text-foreground mb-3">How often are you in an installed or protective style?</p>
                    <div className="flex flex-wrap gap-2">
                      {protectiveFrequencyOptionsFemale.map(o => (
                        <button key={o} onClick={() => setProtectiveFreq(o)} className={`pill-option ${protectiveFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </SlideIn>
              </div>
            )}

            {/* ── Step 4: Routine / Cycle ── */}
            {step === 4 && isMale && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Your routine</h2>
                <p className="text-xs text-muted-foreground mb-6">{sectionWhyText[4]}</p>

                {hasFadeOrShortMale && !hasLocsMale && !hasBraidsMale && (
                  <>
                    <p className="font-medium text-foreground mb-3">How often do you go to the barber?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Every week', 'Every 2 weeks', 'Every 3 to 4 weeks', 'Monthly or less', 'I cut my own hair'].map(o => (
                        <button key={o} onClick={() => setBarberFreq(o)} className={`pill-option ${barberFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                    <p className="font-medium text-foreground mb-3">How often do you wash your hair?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Daily', 'Every few days', 'Weekly', 'Less than weekly'].map(o => (
                        <button key={o} onClick={() => setMaleWashFreq(o)} className={`pill-option ${maleWashFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </>
                )}

                {hasLocsMale && (
                  <>
                    <p className="font-medium text-foreground mb-3">How often do you get your locs retwisted?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Every 2 weeks', 'Every 3 to 4 weeks', 'Every 6 to 8 weeks', 'Less often than that', 'I do it myself'].map(o => (
                        <button key={o} onClick={() => setLocRetwistFreq(o)} className={`pill-option ${locRetwistFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                    <p className="font-medium text-foreground mb-3">How often do you wash your scalp?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Weekly', 'Every 2 weeks', 'Every 3 to 4 weeks', 'Less often'].map(o => (
                        <button key={o} onClick={() => setMaleScalpWashFreq(o)} className={`pill-option ${maleScalpWashFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </>
                )}

                {hasBraidsMale && !hasLocsMale && (
                  <>
                    <p className="font-medium text-foreground mb-3">How long do you usually keep them in?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Less than a week', '1 to 2 weeks', '2 to 4 weeks', 'Longer than 4 weeks'].map(o => (
                        <button key={o} onClick={() => setMaleStyleDuration(o)} className={`pill-option ${maleStyleDuration === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                    <p className="font-medium text-foreground mb-3">How often do you wash or cleanse your scalp while they're in?</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Every few days', 'Weekly', 'Only when I take them out', "I don't"].map(o => (
                        <button key={o} onClick={() => setMaleScalpWashFreq(o)} className={`pill-option ${maleScalpWashFreq === o ? 'selected' : ''}`}>{o}</button>
                      ))}
                    </div>
                  </>
                )}

                <p className="font-medium text-foreground mb-3">Between barber visits or washes, do you do anything for your scalp?</p>
                <div className="flex flex-wrap gap-2">
                  {['Moisturise or oil my scalp', 'Use a scalp spray or tonic', 'Brush (for waves)', 'Wear a durag or wave cap', 'Nothing really', 'Other'].map(o => (
                    <button key={o} onClick={() => toggleMaleBetweenCare(o)} className={`pill-option ${maleBetweenCare.includes(o) ? 'selected' : ''}`}>{o}</button>
                  ))}
                </div>
                {maleBetweenCare.includes('Other') && (
                  <input type="text" value={otherMaleBetweenCare} onChange={e => setOtherMaleBetweenCare(e.target.value)} placeholder="What else do you do?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3" />
                )}
              </div>
            )}

            {step === 4 && !isMale && !isWornOutOnly && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Your cycle</h2>
                <p className="text-xs text-muted-foreground mb-3">{sectionWhyText[4]}</p>
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
                  <p className="text-muted-foreground text-sm mb-4">How often do you wash or cleanse your scalp?</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Once a week or more', 'Less than once a week'].map(o => (
                      <button key={o} onClick={() => { setWashFreqBucket(o); setWashFreqDetail(''); setWashFreqPerCycle(''); setWashFreq(o); }} className={`pill-option ${washFreqBucket === o ? 'selected' : ''}`}>{o}</button>
                    ))}
                  </div>
                  <SlideIn show={washFreqBucket === 'Once a week or more'}>
                    <div className="rounded-2xl bg-accent p-4 mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">How many times a week?</p>
                      <div className="flex flex-wrap gap-2">
                        {['Once a week', 'Twice a week', 'More than twice a week'].map(o => (
                          <button key={o} onClick={() => { setWashFreqDetail(o); setWashFreq(o); }} className={`pill-option ${washFreqDetail === o ? 'selected' : ''}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </SlideIn>
                  <SlideIn show={washFreqBucket === 'Less than once a week'}>
                    <div className="rounded-2xl bg-accent p-4 mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">How often?</p>
                      <div className="flex flex-wrap gap-2">
                        {['Every 2 weeks', 'Every 3 to 4 weeks', 'Only at takedown', 'It depends'].map(o => (
                          <button key={o} onClick={() => { setWashFreqDetail(o); setWashFreq(o); if (o !== 'It depends') setWashFreqPerCycle(''); }} className={`pill-option ${washFreqDetail === o ? 'selected' : ''}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </SlideIn>
                  <SlideIn show={washFreqDetail === 'It depends'}>
                    <div className="rounded-2xl bg-accent p-4 mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">On average, roughly how many times per cycle do you cleanse your scalp?</p>
                      <div className="flex flex-wrap gap-2">
                        {['0 (not at all)', '1', '2 to 3', '4+'].map(o => (
                          <button key={o} onClick={() => setWashFreqPerCycle(o)} className={`pill-option ${washFreqPerCycle === o ? 'selected' : ''}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </SlideIn>
                </div>
                <div className="mt-8">
                  <p className="text-sm font-medium text-foreground mb-3">Between washes, do you do anything for your scalp?</p>
                  <div className="flex flex-wrap gap-2">
                    {currentBetweenWashOptions.map(o => {
                      const isNothing = o === 'Nothing — I leave it alone until wash day';
                      const nothingSelected = betweenWashCare.includes('Nothing — I leave it alone until wash day');
                      const disabled = nothingSelected && !isNothing;
                      return (
                        <button key={o} onClick={() => !disabled && toggleBetweenWash(o)} className={`pill-option ${betweenWashCare.includes(o) ? 'selected' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>{o}</button>
                      );
                    })}
                  </div>
                  {betweenWashCare.includes('Other') && (
                    <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3" />
                  )}
                </div>
              </div>
            )}

            {step === 4 && !isMale && isWornOutOnly && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Your routine</h2>
                <p className="text-xs text-muted-foreground mb-3">{sectionWhyText[4]}</p>
                <p className="text-muted-foreground mb-6">How often do you wash your hair?</p>
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {wornOutWashOptions.map(o => (<button key={o} onClick={() => { setWornOutWashFreq(o); if (o !== 'Less often') setLessOftenDetail(''); }} className={`pill-option ${wornOutWashFreq === o ? 'selected' : ''}`}>{o}</button>))}
                  </div>
                </div>
                <SlideIn show={wornOutWashFreq === 'Less often'}>
                  <div className="mb-8">
                    <p className="font-medium text-foreground mb-3">How many weeks between washes, roughly?</p>
                    <div className="flex flex-wrap gap-2">
                      {lessOftenWashOptions.map(o => (<button key={o} onClick={() => setLessOftenDetail(o)} className={`pill-option ${lessOftenDetail === o ? 'selected' : ''}`}>{o}</button>))}
                    </div>
                  </div>
                </SlideIn>
                <div>
                  <p className="font-medium text-foreground mb-3">How often do you restyle or manipulate your hair?</p>
                  <div className="flex flex-wrap gap-2">
                    {restyleOptions.map(o => (<button key={o} onClick={() => setRestyleFreq(o)} className={`pill-option ${restyleFreq === o ? 'selected' : ''}`}>{o}</button>))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Baseline ── */}
            {step === 5 && (
              <div>
                {baselineAck ? (
                  <motion.div key="ack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-16 text-center">
                    <p className="text-lg font-medium text-foreground">{baselineAck}</p>
                  </motion.div>
                ) : (
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-1">How are things right now?</h2>
                    <p className="text-xs text-muted-foreground mb-2">{sectionWhyText[5]}</p>
                    <p className="text-muted-foreground mb-6">Just a few questions so we know where you're starting from</p>
                    <div className="flex gap-1 mb-6">
                      {baselineQuestions.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= baselineStep ? 'bg-primary' : 'bg-border'}`} />
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div key={baselineStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        <h3 className="text-base font-medium text-foreground mb-4">{baselineQuestions[baselineStep].q}</h3>
                        <div className="space-y-3">
                          {baselineQuestions[baselineStep].options.map((opt, optIdx) => (
                            <button key={opt} onClick={() => selectBaselineAnswer(baselineQuestions[baselineStep].key, opt, optIdx)} className={`selection-card w-full text-left ${baselineAnswers[baselineQuestions[baselineStep].key] === opt ? 'selected' : ''}`}>
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

            {/* ── Step 6: Photos ── */}
            {step === 6 && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Capture your starting point</h2>
                <p className="text-muted-foreground mb-4">A baseline photo helps you spot gradual changes that are hard to notice day to day</p>
                <div className="card-elevated mb-5 overflow-hidden">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-semibold text-foreground">How to take good baseline photos</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Getting this right makes tracking changes much easier</p>
                  </div>
                  <Tabs defaultValue="read" className="px-4 pb-4">
                    <TabsList className="w-full mb-3">
                      <TabsTrigger value="watch" className="flex-1">Watch</TabsTrigger>
                      <TabsTrigger value="read" className="flex-1">Read</TabsTrigger>
                    </TabsList>
                    <TabsContent value="watch">
                      <button
                        onClick={() => toast({ title: 'Video guide coming soon', description: 'We are working on a short instructional video for you.' })}
                        className="w-full aspect-video rounded-xl bg-accent border border-border flex flex-col items-center justify-center gap-2 mb-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                          <Play size={20} className="text-primary ml-0.5" strokeWidth={1.8} />
                        </div>
                      </button>
                      <p className="text-xs text-muted-foreground text-center">A quick 60-second guide to capturing your scalp and hairline</p>
                    </TabsContent>
                    <TabsContent value="read">
                      <div className="space-y-3">
                        <div className="rounded-xl bg-accent p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">Hairline and temples</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-3">
                            <li>Pull your hair back from your face</li>
                            <li>Hold the camera about 15cm away</li>
                            <li>Capture from your forehead down to your ears on both sides</li>
                            <li>Good lighting facing a window is ideal</li>
                          </ul>
                        </div>
                        <div className="rounded-xl bg-accent p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">Crown and vertex</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-3">
                            <li>Part your hair at the crown</li>
                            <li>Use a second mirror or ask someone to help</li>
                            <li>Capture straight down from above</li>
                            <li>Make sure the scalp is visible, not just hair</li>
                          </ul>
                        </div>
                        <div className="rounded-xl bg-accent p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">Nape and back of neck</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-3">
                            <li>Pull your hair forward or up</li>
                            <li>Capture the back of your neck and lower hairline</li>
                            <li>A second mirror or someone to help makes this easier</li>
                          </ul>
                        </div>
                        <div className="rounded-xl bg-accent p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">Hair condition</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-3">
                            <li>Hold a section of hair against a plain light background</li>
                            <li>Capture the mid-lengths and ends</li>
                            <li>This helps track breakage and texture changes over time</li>
                          </ul>
                        </div>
                        <div className="rounded-xl border border-border p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">General tips</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-3">
                            <li>Take photos in natural light whenever possible</li>
                            <li>Make sure your scalp is visible, not hidden by hair</li>
                            <li>Take a few shots and pick the clearest one</li>
                            <li>Consistency matters: try to take photos in the same lighting and angle each time</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="space-y-3 mb-6">
                  {baselineAreas.map(area => (
                    <div key={area.id} className={`selection-card w-full flex items-center gap-4 text-left ${area.optional ? 'border-dashed opacity-80' : ''} ${capturedPhotos[area.id] ? 'selected' : ''}`}>
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${capturedPhotos[area.id] ? 'bg-primary/10' : 'bg-accent'}`}>
                        {capturedPhotos[area.id] ? <Check size={22} className="text-primary" strokeWidth={2} /> : <Camera size={22} className="text-muted-foreground" strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{area.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{capturedPhotos[area.id] ? 'Photo captured ✓' : area.desc}</p>
                        {!capturedPhotos[area.id] && (
                          <div className="flex gap-2 mt-2">
                            <label className="text-xs font-medium text-primary cursor-pointer flex items-center gap-1">
                              <Camera size={12} /> Take photo
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => setCapturedPhotos(prev => ({ ...prev, [area.id]: true }))} />
                            </label>
                            <label className="text-xs font-medium text-primary cursor-pointer flex items-center gap-1">
                              ↑ Upload
                              <input type="file" accept="image/*" className="hidden" onChange={() => setCapturedPhotos(prev => ({ ...prev, [area.id]: true }))} />
                            </label>
                          </div>
                        )}
                      </div>
                      {area.optional && !capturedPhotos[area.id] && (<span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">Optional</span>)}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-accent p-4 mb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">🔒 Photos are stored on your device only — never uploaded, never shared unless you choose to.</p>
                </div>
              </div>
            )}

            {/* ── Step 7: Products (skippable) ── */}
            {step === 7 && (() => {
              const scalpIsNone = products.length === 1 && products[0] === 'None';
              const hairIsNone = hairProds.length === 1 && hairProds[0] === 'None';
              return (
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-1">Let's talk products</h2>
                  <p className="text-xs text-muted-foreground mb-4">{sectionWhyText[7]}</p>
                  <p className="text-sm text-muted-foreground mb-1">What do you put on your scalp?</p>
                  <p className="text-xs text-muted-foreground mb-4">Start typing a product or brand name</p>
                  <ProductSearch category="scalp" selectedProducts={products} onProductsChange={setProducts} noneLabel="I don't use anything on my scalp" />
                  {!scalpIsNone && products.length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mt-6 mb-3">How often do you apply products to your scalp?</p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {productFrequencies.map(f => (<button key={f} onClick={() => setProdFreq(f)} className={`pill-option ${prodFreq === f ? 'selected' : ''}`}>{f}</button>))}
                      </div>
                    </>
                  )}
                  {scalpIsNone && <div className="mb-8" />}
                  <h3 className="text-base font-medium text-foreground mb-1">And what about your hair?</h3>
                  <p className="text-xs text-muted-foreground mb-4">Start typing a product or brand name</p>
                  <ProductSearch category="hair" selectedProducts={hairProds} onProductsChange={setHairProds} noneLabel="I don't use hair products" />
                  {!hairIsNone && hairProds.length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mt-6 mb-3">How often do you apply products to your hair?</p>
                      <div className="flex flex-wrap gap-2">
                        {productFrequencies.map(f => (<button key={f} onClick={() => setHairProdFreq(f)} className={`pill-option ${hairProdFreq === f ? 'selected' : ''}`}>{f}</button>))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Step 8: Menstrual (skipped for men — this step is goals for men) ── */}
            {step === 8 && !skipMenstrual && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">
                  {isNeutral ? 'Do you want to track your hormonal cycle?' : 'Do you want to link your menstrual cycle?'}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">{sectionWhyText[8]}</p>
                <p className="text-muted-foreground mb-4">
                  {isNeutral ? 'Some people find it useful to track their hormonal cycle alongside scalp health' : 'Your hormones have a direct effect on your scalp'}
                </p>
                <div className="rounded-2xl bg-secondary/50 p-4 mb-6">
                  <p className="text-sm text-foreground leading-relaxed">
                    {isNeutral
                      ? "Hormonal fluctuations can affect scalp oiliness, sensitivity, and shedding. Linking your cycle lets us give you context when symptoms change."
                      : "Oestrogen, progesterone, and testosterone fluctuate throughout your cycle and can affect scalp oiliness, sensitivity, and shedding. Linking your cycle lets us give you context when symptoms change, so you know what's hormonal and what's worth investigating."}
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {["Yes, I'd like to track", 'No thanks', "I don't menstruate"].map(opt => (
                    <button key={opt} onClick={() => setMenstrualTracking(opt)} className={`selection-card w-full text-left ${menstrualTracking === opt ? 'selected' : ''}`}>
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
                        {menstrualCycleLengthOptions.map(o => (<button key={o} onClick={() => setMenstrualCycleLength(o)} className={`pill-option ${menstrualCycleLength === o ? 'selected' : ''}`}>{o}</button>))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-3">Are you on hormonal contraception?</p>
                      <div className="flex flex-wrap gap-2">
                        {contraceptionOptions.map(o => (<button key={o} onClick={() => setHormonalContraception(o)} className={`pill-option ${hormonalContraception === o ? 'selected' : ''}`}>{o}</button>))}
                      </div>
                    </div>

                    {/* Pregnancy prompt — fires when cycle appears overdue and no contraception */}
                    {(() => {
                      if (!lastPeriodDate || !menstrualCycleLength || hormonalContraception !== 'No') return null;
                      const cycleLengthDays: Record<string, number> = { '21–25 days': 25, '26–30 days': 30, '31–35 days': 35 };
                      const maxDays = cycleLengthDays[menstrualCycleLength];
                      if (!maxDays) return null;
                      const daysSince = Math.floor((Date.now() - lastPeriodDate.getTime()) / 86400000);
                      if (daysSince <= maxDays) return null;
                      return (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                          <p className="text-sm font-medium text-foreground mb-2">Could you be pregnant?</p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Based on your last period ({format(lastPeriodDate, 'PPP')}) and your typical cycle length ({menstrualCycleLength}), your period may be overdue. If there's a chance you could be pregnant, you can note it in your Health Profile.
                          </p>
                          <button
                            onClick={() => navigate('/health-profile')}
                            className="text-sm font-medium text-primary"
                          >
                            Go to Health Profile →
                          </button>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Goals step: 8 for men, 9 for others ── */}
            {((skipMenstrual && step === 8) || (!skipMenstrual && step === 9)) && (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">What matters most to you right now?</h2>
                <p className="text-muted-foreground mb-6">Pick up to 3 — this helps us focus your experience</p>
                <div className="space-y-3 mb-6">
                  {goalOptions.map(g => (
                    <button key={g} onClick={() => toggleGoal(g)} className={`selection-card w-full text-left ${goals.includes(g) ? 'selected' : ''} ${goals.length >= 3 && !goals.includes(g) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={goals.length >= 3 && !goals.includes(g)}>
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
        </div>

        {/* ── Bottom button (sticky) ── */}
        <div className="flex-shrink-0 py-4">
          {step === -1 ? (
            <button onClick={handleNext} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
              Let's get started
            </button>
          ) : step === 5 ? null : step === 6 ? (
            <div className="space-y-3">
              <button onClick={handleNext} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
                {Object.values(capturedPhotos).some(Boolean) ? 'Continue' : 'Skip for now'}
              </button>
              {!Object.values(capturedPhotos).some(Boolean) && (
                <p className="text-xs text-center text-muted-foreground">You can always add baseline photos later from your Profile.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={handleNext} disabled={!canProceed()} className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>
                {isLastStep ? "Let's go" : 'Next'}
              </button>
              {isSkippableStep(step, skipMenstrual) && (
                <button onClick={handleSkip} className="w-full text-center text-sm text-muted-foreground py-2 hover:text-foreground transition-colors">
                  Skip for now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
