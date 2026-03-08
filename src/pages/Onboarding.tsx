import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const hairTypes = [
  { id: '3b', label: '3b', desc: 'Loose, springy curls' },
  { id: '3c', label: '3c', desc: 'Tight, corkscrew curls' },
  { id: '4a', label: '4a', desc: 'Dense, S-shaped coils' },
  { id: '4b', label: '4b', desc: 'Z-shaped, tightly coiled' },
  { id: '4c', label: '4c', desc: 'Very tight, densely packed coils' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay — lots of people have a mix of different curl patterns" },
];

const chemicalOptions = [
  'No, fully natural',
  'Yes, relaxed / permed',
  'Yes, texturised',
  'Yes, colour treated',
  'Yes, bleached',
  'Multiple',
  'Previously processed, currently growing out',
  'Not sure',
];

const chemicalMultipleOptions = ['Relaxed', 'Texturised', 'Colour treated', 'Bleached'];

const styleOptions = [
  'Box braids', 'Cornrows / flat twists', 'Knotless braids', 'Twists (two-strand)',
  'Twist out / braid out', 'Locs / faux locs', 'Weave / sew-in', 'Wig (lace front)',
  'Wig (other)', 'Crochet braids', 'Hair extensions (k-tips, micro links, etc.)',
  'Wash and go', 'Bantu knots', 'Silk press / blowout', 'Other',
];

const cycleLengths = ['1–2 weeks', '2–4 weeks', '4–6 weeks', '6+ weeks', 'It varies'];
const washFrequencies = ['Weekly', 'Every 2 weeks', 'Less than every 2 weeks', 'Only at takedown'];
const severities = ['None', 'Mild', 'Moderate', 'Severe'];
const tendernessSeverities = ['None', 'Mild', 'Moderate', 'Severe'];
const hairlineConcerns = ['No concerns', 'Slight concern', 'Noticeable change', 'Very concerned'];

const productOptions = [
  'Scalp oil (e.g., tea tree, rosemary, castor)',
  'Hair oil (e.g., argan, jojoba, coconut)',
  'Leave-in conditioner',
  'Deep conditioner / mask',
  'Edge control / gel',
  'Mousse / foam',
  'Hair butter / cream',
  'Grease / pomade',
  'Anti-dandruff / medicated shampoo',
  'Clarifying shampoo',
  'Co-wash',
  'Growth serum / scalp treatment',
  'Dry shampoo / scalp refresh spray',
  'Heat protectant',
  'Protein treatment',
  'Apple cider vinegar rinse',
  "None — I don't use products on my scalp",
  'Other',
];
const productFrequencies = ['Daily', 'Every few days', 'Weekly', 'Only on wash day', 'Rarely'];

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

const Onboarding = () => {
  const navigate = useNavigate();
  const { setOnboardingComplete, setOnboardingData } = useApp();
  const [step, setStep] = useState(1);
  const [hairType, setHairType] = useState('');
  const [chemicalProcessing, setChemicalProcessing] = useState('');
  const [chemicalMultiple, setChemicalMultiple] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [otherStyle, setOtherStyle] = useState('');
  const [cycleLen, setCycleLen] = useState('');
  const [washFreq, setWashFreq] = useState('');
  const [itch, setItch] = useState('');
  const [tenderness, setTenderness] = useState('');
  const [hairline, setHairline] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [otherProduct, setOtherProduct] = useState('');
  const [prodFreq, setProdFreq] = useState('');
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  const totalSteps = 5;

  const toggleStyle = (s: string) => setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleProduct = (p: string) => setProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleChemMulti = (v: string) => setChemicalMultiple(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!hairType && !!chemicalProcessing && (chemicalProcessing !== 'Multiple' || chemicalMultiple.length > 0);
      case 2: return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0);
      case 3: return !!cycleLen && !!washFreq;
      case 4: return !!itch && !!tenderness && !!hairline;
      case 5: return products.length > 0 && !!prodFreq && (!products.includes('Other') || otherProduct.trim().length > 0);
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setOnboardingData({
        hairType,
        chemicalProcessing,
        chemicalProcessingMultiple: chemicalMultiple,
        protectiveStyles: styles,
        otherStyle,
        cycleLength: cycleLen,
        washFrequency: washFreq,
        baselineItch: itch,
        baselineTenderness: tenderness,
        baselineHairline: hairline,
        scalpProducts: products,
        otherProduct,
        productFrequency: prodFreq,
      });
      setOnboardingComplete(true);
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pt-4 pb-8"
          >
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Let's personalise your experience</h2>
                <p className="text-muted-foreground mb-6">Select the option closest to your hair type</p>
                <div className="space-y-3 mb-8">
                  {hairTypes.map(ht => (
                    <button
                      key={ht.id}
                      onClick={() => setHairType(ht.id)}
                      className={`selection-card w-full flex items-center gap-4 text-left ${hairType === ht.id ? 'selected' : ''}`}
                    >
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
                    <button
                      key={opt}
                      onClick={() => {
                        setChemicalProcessing(opt);
                        if (opt !== 'Multiple') setChemicalMultiple([]);
                      }}
                      className={`pill-option ${chemicalProcessing === opt ? 'selected' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {chemicalProcessing === 'Multiple' && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-xl bg-accent">
                    {chemicalMultipleOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => toggleChemMulti(opt)}
                        className={`pill-option ${chemicalMultiple.includes(opt) ? 'selected' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Chemical processing can affect how your scalp responds to styling and products — this helps us give you more relevant guidance.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">What protective style do you usually wear?</h2>
                <p className="text-muted-foreground mb-6">Select all that apply</p>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.slice(0, 8).map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`selection-card text-center py-5 ${styles.includes(s) ? 'selected' : ''}`}
                    >
                      <p className="font-medium text-foreground text-sm">{s}</p>
                    </button>
                  ))}
                </div>
                {!showMoreStyles && (
                  <button
                    onClick={() => setShowMoreStyles(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary mt-3 py-2"
                  >
                    Show more styles <ChevronDown size={16} strokeWidth={2} />
                  </button>
                )}
                {showMoreStyles && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {styleOptions.slice(8).map(s => (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`selection-card text-center py-5 ${styles.includes(s) ? 'selected' : ''}`}
                      >
                        <p className="font-medium text-foreground text-sm">{s}</p>
                      </button>
                    ))}
                  </div>
                )}
                {styles.includes('Other') && (
                  <input
                    type="text"
                    value={otherStyle}
                    onChange={e => setOtherStyle(e.target.value)}
                    placeholder="Describe your style"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your cycle</h2>
                <p className="text-muted-foreground mb-6">How long do you typically keep a style in?</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {cycleLengths.map(c => (
                    <button key={c} onClick={() => setCycleLen(c)} className={`pill-option ${cycleLen === c ? 'selected' : ''}`}>{c}</button>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">How often do you wash or cleanse your scalp during a protective style?</p>
                <div className="flex flex-wrap gap-2">
                  {washFrequencies.map(w => (
                    <button key={w} onClick={() => setWashFreq(w)} className={`pill-option ${washFreq === w ? 'selected' : ''}`}>{w}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Quick baseline — how's your scalp right now?</h2>
                <p className="text-muted-foreground mb-6">This helps us set your starting point</p>
                <div className="space-y-6">
                  <div>
                    <p className="font-medium text-foreground mb-3">Any current scalp itching?</p>
                    <div className="flex flex-wrap gap-2">
                      {severities.map(s => (
                        <button key={s} onClick={() => setItch(s)} className={`pill-option ${itch === s ? 'selected' : ''}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-3">Any tenderness or soreness?</p>
                    <div className="flex flex-wrap gap-2">
                      {tendernessSeverities.map(s => (
                        <button key={s} onClick={() => setTenderness(s)} className={`pill-option ${tenderness === s ? 'selected' : ''}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-3">Any concerns about your hairline or edges?</p>
                    <div className="flex flex-wrap gap-2">
                      {hairlineConcerns.map(s => (
                        <button key={s} onClick={() => setHairline(s)} className={`pill-option ${hairline === s ? 'selected' : ''}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">What products do you use on your scalp?</h2>
                <p className="text-muted-foreground mb-6">This helps us understand what might be affecting your scalp health</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {productOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => toggleProduct(p)}
                      className={`selection-card text-center py-5 ${products.includes(p) ? 'selected' : ''}`}
                    >
                      <p className="font-medium text-foreground text-sm">{p}</p>
                    </button>
                  ))}
                </div>
                {products.includes('Other') && (
                  <input
                    type="text"
                    value={otherProduct}
                    onChange={e => setOtherProduct(e.target.value)}
                    placeholder="What else do you use?"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-4"
                  />
                )}
                <p className="text-muted-foreground mb-4">How often do you apply products to your scalp?</p>
                <div className="flex flex-wrap gap-2">
                  {productFrequencies.map(f => (
                    <button key={f} onClick={() => setProdFreq(f)} className={`pill-option ${prodFreq === f ? 'selected' : ''}`}>{f}</button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pb-8">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
              canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            {step === totalSteps ? 'Set up my cycle' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
