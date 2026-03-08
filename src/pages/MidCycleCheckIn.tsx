import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const questions = [
  {
    key: 'itch',
    q: "How's the itching been since your last check-in?",
    options: ['None', 'Mild', 'Moderate', 'Severe'],
  },
  {
    key: 'tenderness',
    q: 'Any scalp tenderness or soreness?',
    options: ['None', 'A little', 'Yes, noticeably', 'Yes, painful'],
  },
  {
    key: 'hairline',
    q: 'Noticed any changes around your edges or temples?',
    options: ['No change', 'Looks a bit different', 'Noticeable change', "I'm concerned"],
  },
];

const MidCycleCheckIn = () => {
  const navigate = useNavigate();
  const { setCurrentCheckIn } = useApp();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const allAnswered = questions.every(q => answers[q.key]);

  const handleSubmit = () => {
    setCurrentCheckIn({
      itch: answers.itch,
      tenderness: answers.tenderness,
      hairline: answers.hairline,
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
          <button onClick={() => setShowConfirm(true)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <p className="text-sm text-muted-foreground">Day 14 of your braids cycle</p>
          <button onClick={() => setShowConfirm(true)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h2 className="text-2xl font-semibold mb-2">Mid-Cycle Check-In</h2>
          <p className="text-muted-foreground mb-8">Just 3 quick questions — takes about 1 minute</p>

          <div className="space-y-8">
            {questions.map((q, i) => (
              <div key={q.key}>
                <p className="font-medium text-foreground mb-3">{i + 1}. {q.q}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: opt }))}
                      className={`pill-option ${answers[q.key] === opt ? 'selected' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 pb-8">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                allAnswered ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
              }`}
            >
              See results
            </button>
          </div>
        </motion.div>
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
