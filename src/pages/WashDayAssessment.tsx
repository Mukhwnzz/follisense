import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Camera } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const symptomSteps = [
  {
    key: 'itch',
    q: 'How itchy has your scalp been this cycle?',
    options: [
      { label: 'None', desc: 'No itching at all' },
      { label: 'Mild', desc: 'Occasional, not bothersome' },
      { label: 'Moderate', desc: 'Regular itching, somewhat bothersome' },
      { label: 'Severe', desc: 'Constant or very uncomfortable' },
    ],
  },
  {
    key: 'tenderness',
    q: 'Does your scalp feel tender or sore?',
    options: [
      { label: 'No', desc: 'No tenderness' },
      { label: 'A little', desc: 'Mild sensitivity in some areas' },
      { label: 'Yes, noticeably', desc: 'Sore to touch in several areas' },
      { label: 'Yes, painful', desc: 'Painful even without touching' },
    ],
  },
  {
    key: 'flaking',
    q: 'Have you noticed any flaking or buildup?',
    options: [
      { label: 'None', desc: 'Scalp looks clear' },
      { label: 'Some flaking', desc: 'Light flakes, some buildup' },
      { label: 'Heavy flaking', desc: 'Visible flaking, significant buildup' },
    ],
  },
  {
    key: 'hairline',
    q: 'Any changes around your edges or temples?',
    options: [
      { label: 'No change', desc: 'Edges look the same as usual' },
      { label: 'Looks a bit thinner', desc: 'Slight difference, not sure' },
      { label: 'Noticeable thinning', desc: 'Visible thinning or recession' },
      { label: "I'm concerned", desc: 'Significant change, worried' },
    ],
  },
  {
    key: 'shedding',
    q: 'How much hair came out during wash and detangling?',
    options: [
      { label: 'Normal', desc: "About what I'd expect" },
      { label: 'More than usual', desc: 'A bit more than usual' },
      { label: 'Significantly more', desc: 'Noticeably more than normal' },
      { label: 'Alarming amount', desc: "Far more than I've ever seen" },
    ],
  },
  {
    key: 'newProducts',
    q: 'Any new products this cycle?',
    options: [
      { label: 'No, same routine', desc: 'No changes to your product lineup' },
      { label: 'Yes, I tried something new', desc: 'You introduced a new product' },
    ],
  },
];

const photoAreas = [
  { id: 'hairline', label: 'Temples / edges', baselineLabel: 'Hairline — temples and edges' },
  { id: 'crown', label: 'Crown / vertex', baselineLabel: 'Crown and vertex' },
];

const WashDayAssessment = () => {
  const navigate = useNavigate();
  const { setCurrentCheckIn, baselinePhotos } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newProductText, setNewProductText] = useState('');
  const [photoSaved, setPhotoSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalSteps = symptomSteps.length + 1; // +1 for photo step
  const isProductFollowUp = currentStep === 5 && answers.newProducts === 'Yes, I tried something new';
  const isPhotoStep = currentStep === symptomSteps.length;
  const currentQ = symptomSteps[currentStep];

  const selectAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.key]: val }));
    if (currentQ.key === 'newProducts' && val === 'No, same routine') {
      setTimeout(() => setCurrentStep(symptomSteps.length), 300);
    } else if (currentQ.key === 'newProducts' && val === 'Yes, I tried something new') {
      // Stay on step to show text input
    } else {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    }
  };

  const handleProductContinue = () => {
    setCurrentStep(symptomSteps.length);
  };

  const handleSubmit = () => {
    setCurrentCheckIn({
      itch: answers.itch,
      tenderness: answers.tenderness,
      hairline: answers.hairline,
      flaking: answers.flaking,
      shedding: answers.shedding,
      newProducts: answers.newProducts,
      newProductDetails: newProductText || undefined,
      type: 'wash-day',
      date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    });
    navigate('/results');
  };

  const getBaselineForArea = (baselineLabel: string) => {
    return baselinePhotos.find(p => p.area === baselineLabel);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setShowConfirm(true)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => setShowConfirm(true)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isPhotoStep && currentQ ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-4"
            >
              <p className="text-label mb-2">Braids — Day 28 of 28</p>
              <h2 className="text-xl font-semibold mb-6">{currentQ.q}</h2>
              <div className="space-y-3">
                {currentQ.options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => selectAnswer(opt.label)}
                    className={`selection-card w-full text-left ${answers[currentQ.key] === opt.label ? 'selected' : ''}`}
                  >
                    <p className="font-medium text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {isProductFollowUp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-medium text-foreground mb-2 block">What did you try? (optional)</label>
                  <input
                    type="text"
                    value={newProductText}
                    onChange={e => setNewProductText(e.target.value)}
                    placeholder="e.g. New edge control gel"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleProductContinue}
                    className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm btn-press"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-4"
            >
              <h2 className="text-xl font-semibold mb-2">Want to add a photo?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Tracking your hairline visually over time can help you spot gradual changes. Photos are stored on your device only — never uploaded.
              </p>

              {!photoSaved ? (
                <div className="space-y-3 mb-8">
                  {photoAreas.map(area => {
                    const baseline = getBaselineForArea(area.baselineLabel);
                    return (
                      <div key={area.id}>
                        <button
                          onClick={() => setPhotoSaved(true)}
                          className="selection-card w-full flex items-center gap-4"
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                            <Camera size={22} className="text-muted-foreground" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">{area.label}</p>
                            {baseline && (
                              <p className="text-xs text-primary mt-0.5">Compare with your baseline from {baseline.date}</p>
                            )}
                          </div>
                        </button>
                        {baseline && (
                          <div className="flex items-center gap-3 mt-2 ml-1 px-3 py-2 rounded-xl bg-accent">
                            <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center flex-shrink-0">
                              <Camera size={14} className="text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <p className="text-xs text-muted-foreground">Baseline — {baseline.date}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card-elevated p-5 mb-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-3">
                    <Camera size={22} className="text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Photo saved</p>
                  <p className="text-sm text-muted-foreground">Stored on your device only</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mb-3"
              >
                See my results
              </button>
              <button
                onClick={handleSubmit}
                className="w-full text-center text-sm text-muted-foreground py-2"
              >
                Skip
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm exit */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card">
              <h3 className="font-semibold text-lg mb-2">Are you sure?</h3>
              <p className="text-sm text-muted-foreground mb-6">Your progress won't be saved.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl border border-border font-medium text-sm btn-press">Continue</button>
                <button onClick={() => navigate('/home')} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-press">Leave</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WashDayAssessment;
