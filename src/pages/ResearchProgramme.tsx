import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Trash2, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ResearchProgramme = () => {
  const navigate = useNavigate();
  const { research, setResearch } = useApp();
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleOptIn = () => {
    setResearch({
      ...research,
      consented: true,
      consentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    navigate('/home');
  };

  const handleWithdraw = () => {
    setResearch({ consented: false, consentDate: null, photoCount: 0, dismissed: false });
    setShowWithdraw(false);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold mb-2">The FolliSense Research Programme</h1>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mt-6">
            <p>
              Right now, AI tools for skin and scalp health perform poorly on darker skin tones. The reason is simple: they weren't trained on data that represents us.
            </p>
            <p>
              FolliSense is in a unique position to change that. Every time you do a check-in, you're generating structured, clinically meaningful data: photos tagged with your hair type, symptoms, cycle timing, and scalp region. That's exactly what's needed to train AI that actually works for women with textured hair.
            </p>
            <p>If you choose to contribute, here's what happens:</p>
          </div>

          <div className="space-y-3 mt-5 mb-6">
            {[
              { icon: Shield, text: 'Your photos are stripped of all identifying information (no name, no face, no metadata)' },
              { icon: Lock, text: "They're securely stored in an encrypted research database" },
              { icon: Shield, text: "They're tagged with your anonymised symptom and profile data" },
              { icon: Shield, text: "They're used exclusively to improve scalp health AI for textured hair communities" },
              { icon: Trash2, text: 'You can withdraw your consent and have your images deleted at any time' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon size={16} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Your personal tracking photos are never affected. They stay on your device regardless of whether you contribute to research.
          </p>

          {!research.consented ? (
            <>
              <div className="card-elevated p-5 mb-6">
                <p className="text-sm font-medium text-foreground mb-4">Your consent</p>
                <div className="space-y-4">
                  <button
                    onClick={() => setConsent1(!consent1)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${consent1 ? 'bg-primary border-primary' : 'border-border'}`}>
                      {consent1 && <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />}
                    </div>
                    <p className="text-sm text-foreground">I understand my anonymised photos will be used for AI research and training</p>
                  </button>
                  <button
                    onClick={() => setConsent2(!consent2)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${consent2 ? 'bg-primary border-primary' : 'border-border'}`}>
                      {consent2 && <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />}
                    </div>
                    <p className="text-sm text-foreground">I understand I can withdraw my consent at any time and request deletion of my contributed images</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleOptIn}
                disabled={!consent1 || !consent2}
                className={`w-full h-14 rounded-xl font-semibold text-base btn-press mb-3 transition-colors ${consent1 && consent2 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
              >
                Yes, I'd like to contribute
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full text-center text-sm text-muted-foreground py-2 mb-10"
              >
                Not right now, maybe later
              </button>
            </>
          ) : (
            <div className="mb-10">
              <div className="card-elevated p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-foreground">Contributing to research</p>
                </div>
                <p className="text-xs text-muted-foreground">Opted in {research.consentDate}</p>
                {research.photoCount > 0 && (
                  <p className="text-xs text-primary font-medium mt-2">You've contributed {research.photoCount} photo{research.photoCount !== 1 ? 's' : ''} to the research programme. Thank you.</p>
                )}
              </div>

              <button
                onClick={() => setShowWithdraw(true)}
                className="w-full text-center text-sm text-destructive font-medium py-3"
              >
                Withdraw consent and delete contributed data
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Withdraw confirmation */}
      {showWithdraw && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card"
          >
            <h3 className="font-semibold text-lg mb-2">Withdraw from research?</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This will permanently remove all photos you've contributed to the research programme. Your personal tracking data is not affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdraw(false)} className="flex-1 h-12 rounded-xl border border-border font-medium text-sm btn-press">Cancel</button>
              <button onClick={handleWithdraw} className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm btn-press">Withdraw</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ResearchProgramme;
