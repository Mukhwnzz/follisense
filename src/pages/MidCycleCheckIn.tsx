import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const questions = [
  {
    key: 'itch',
    q: "How's the itching been this cycle?",
    options: ['None', 'Mild', 'Moderate', 'Severe'],
  },
  {
    key: 'tenderness',
    q: 'Any scalp soreness or tenderness?',
    options: ['None', 'A little', 'Yes, noticeably', 'Yes, painful'],
  },
  {
    key: 'hairline',
    q: 'How are your edges looking?',
    options: ['No change', 'Looks a bit different', 'Noticeable change', "I'm concerned"],
  },
  {
    key: 'hairConcern',
    q: 'Any breakage or dryness since your last check-in?',
    options: ['No, hair feels normal', 'A little more than usual', 'Yes, noticeably more', "Yes, I'm concerned"],
  },
];

const getAcknowledgment = (optionIndex: number): string => {
  if (optionIndex === 0) {
    const mild = ["Great — let's keep going", "Good to hear", "Nice — moving on"];
    return mild[Math.floor(Math.random() * mild.length)];
  }
  if (optionIndex === 1) return "Noted — we'll keep an eye on that";
  if (optionIndex === 2) return "Thanks for flagging that — we'll factor this in";
  return "Thanks for letting us know — this is important";
};

const MidCycleCheckIn = () => {
  const navigate = useNavigate();
  const { setCurrentCheckIn } = useApp();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null);

  const isLastStep = currentStep === questions.length - 1;
  const allAnswered = questions.every(q => answers[q.key]);
  const currentQ = questions[currentStep];

  const selectAnswer = (opt: string, optIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.key]: opt }));
    const ack = getAcknowledgment(optIndex);
    setAcknowledgment(ack);
  };

  useEffect(() => {
    if (!acknowledgment) return;
    const timer = setTimeout(() => {
      setAcknowledgment(null);
      if (!isLastStep) {
        setCurrentStep(prev => prev + 1);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [acknowledgment, isLastStep]);

  const handleSubmit = () => {
    setCurrentCheckIn({
      itch: answers.itch,
      tenderness: answers.tenderness,
      hairline: answers.hairline,
      hairConcern: answers.hairConcern,
      type: 'mid-cycle',
      date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    });
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => {
            if (currentStep > 0) setCurrentStep(prev => prev - 1);
            else setShowConfirm(true);
          }} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => setShowConfirm(true)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {acknowledgment ? (
            <motion.div
              key="ack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-16 text-center"
            >
              <p className="text-lg font-medium text-foreground">{acknowledgment}</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-4"
            >
              <p className="text-label mb-2">Day 14 of your braids cycle</p>
              <h2 className="text-xl font-semibold mb-6">{currentQ.q}</h2>

              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(opt, optIdx)}
                    className={`selection-card w-full text-left ${answers[currentQ.key] === opt ? 'selected' : ''}`}
                  >
                    <p className="font-medium text-foreground">{opt}</p>
                  </button>
                ))}
              </div>

              {isLastStep && allAnswered && !acknowledgment && (
                <div className="pt-8">
                  <button
                    onClick={handleSubmit}
                    className="w-full h-14 rounded-xl font-semibold text-base btn-press bg-primary text-primary-foreground"
                  >
                    See results
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm exit modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card"
            >
              <h3 className="font-semibold text-lg text-foreground mb-2">Are you sure?</h3>
              <p className="text-sm text-muted-foreground mb-6">Your progress won't be saved.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl border border-border font-medium text-sm btn-press">
                  Continue
                </button>
                <button onClick={() => navigate('/home')} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-press">
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MidCycleCheckIn;
