import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg:         '#F8F8F8',
  ink:        '#1C1C1C',
  gold:       '#D4A866',
  goldDeep:   '#B8893E',
  gold10:     'rgba(212,168,102,0.10)',
  goldBorder: 'rgba(212,168,102,0.22)',
  mid:        '#E8DED1',
  muted:      '#999999',
  white:      '#FAF8F5',
};

interface QuestionDef {
  key: string; q: string; qMale?: string;
  options: string[]; maleOptions?: string[];
}

const baseQuestions: QuestionDef[] = [
  { key: 'itch', q: "How's the itching been since your last check-in?", qMale: 'Any scalp itching since your last check-in?', options: ['None', 'Mild', 'Moderate', 'Severe'] },
  { key: 'tenderness', q: 'Any scalp soreness or tenderness since your last check-in?', options: ['None', 'A little', 'Yes, noticeably', 'Yes, painful'] },
  { key: 'irritation', q: 'Any bumps or irritation since your last check-in?', qMale: 'Any razor bumps, ingrown hairs, or irritation since your last check-in?', options: ['None', 'A few bumps', 'Moderate — several areas', 'Significant — widespread'], maleOptions: ['None', 'Minor razor bumps', 'Ingrown hairs', 'Folliculitis — clusters of bumps'] },
  { key: 'hairline', q: 'How are your edges looking since your last check-in?', qMale: 'How does your hairline look since your last check-in?', options: ['No change', 'Looks a bit different', 'Noticeable change', "I'm concerned"], maleOptions: ['No change', 'Slight recession at temples', 'Noticeable thinning', "I'm concerned"] },
  { key: 'hairConcern', q: 'Any unusual breakage or dryness since your last check-in?', qMale: 'Any unusual shedding, thinning, or dryness since your last check-in?', options: ['No, hair feels normal', 'A little more than usual', 'Yes, noticeably more', "Yes, I'm concerned"] },
];

const getAcknowledgment = (i: number) => {
  if (i === 0) return ["That's good to hear", 'Great', 'Lovely'][Math.floor(Math.random() * 3)];
  if (i === 1) return ['Okay, noted', 'Thanks for sharing that', 'Got it'][Math.floor(Math.random() * 3)];
  if (i === 2) return ['Thanks for being honest about that', "Okay, that's really helpful to know", "We'll keep a close eye on that"][Math.floor(Math.random() * 3)];
  return ["I'm sorry you're dealing with that. Let's make sure we address it.", "That sounds really uncomfortable. You're in the right place.", "Thank you for telling us. We're going to take that seriously."][Math.floor(Math.random() * 3)];
};

const MidCycleCheckIn = () => {
  const navigate = useNavigate();
  const { onboardingData, setCurrentCheckIn } = useApp();
  const [answers, setAnswers]               = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep]       = useState(-1); // -1 = intro/skip screen
  const [showConfirm, setShowConfirm]       = useState(false);
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null);

  const isMale       = onboardingData.gender === 'man';
  const questions    = baseQuestions;
  const currentStyle = onboardingData.protectiveStyles[0] || (isMale ? 'your style' : 'Braids');

  const getContextLabel = () => {
    if (isMale) {
      if (onboardingData.barberFrequency)     return 'Quick scalp check — between barber visits';
      if (onboardingData.locRetwistFrequency) return 'Loc check-in — Day 14 since retwist';
      if (onboardingData.maleStyleFrequency)  return `${currentStyle} check-in`;
      return 'Scalp check-in';
    }
    return `Day 14 of your ${currentStyle.toLowerCase()} cycle`;
  };

  const getQuestion = (q: QuestionDef) => (isMale && q.qMale) ? q.qMale : q.q;
  const getOptions  = (q: QuestionDef) => (isMale && q.maleOptions) ? q.maleOptions : q.options;
  const isLastStep  = currentStep === questions.length - 1;
  const allAnswered = questions.every(q => answers[q.key]);
  const currentQ    = currentStep >= 0 ? questions[currentStep] : null;

  const selectAnswer = (opt: string, optIndex: number) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.key]: opt }));
    setAcknowledgment(getAcknowledgment(optIndex));
  };

  useEffect(() => {
    if (!acknowledgment) return;
    const t = setTimeout(() => { setAcknowledgment(null); if (!isLastStep) setCurrentStep(p => p + 1); }, 1200);
    return () => clearTimeout(t);
  }, [acknowledgment, isLastStep]);

  const handleSubmit = async () => {
  try {
    // 1. Get current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // 2. Format symptoms (matches JSONB column)
    const symptoms = {
      itch: answers.itch,
      tenderness: answers.tenderness,
      irritation: answers.irritation,
      hairline: answers.hairline,
      centerPart: answers.centerPart,
      crownThinning: answers.crownThinning,
      hairConcern: answers.hairConcern,
    };

    // 3. Insert into Supabase
    const { error } = await supabase
      .from('checkins')
      .insert([
        {
          user_id: user.id,
          type: 'mid_cycle', // MUST match your enum
          symptoms: symptoms,
          triage_result: null,        // you can compute later
          triage_reasoning: null,
          notes: null,
          is_baseline: false,
        }
      ]);

    if (error) throw error;

    // 4. Optional: keep local state
    setCurrentCheckIn({
      ...symptoms,
      type: 'mid-cycle',
      date: new Date().toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      }),
    });

    toast({
      title: "Check-in saved",
      description: "Your scalp check-in has been recorded.",
    });

    // 5. Navigate
    navigate('/results');

  } catch (err ) {
    console.error(err);

    toast({
      title: "Error",
      description: err.message || "Failed to save check-in",
      variant: "destructive",
    });
  }
};

  const handleSkip = () => {
    // Note the skip and go back to dashboard
    navigate('/home');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        html, body, #root { background: ${C.bg} !important; margin: 0; padding: 0; }
      `}</style>

      <div style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ height: 16 }} />

        <div style={{
          background: C.white,
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -6px 28px rgba(0,0,0,0.08)',
          width: '100%',
          minHeight: 'calc(100vh - 16px)',
          padding: '28px 24px 60px',
          boxSizing: 'border-box',
        }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <button onClick={() => { if (currentStep > 0) setCurrentStep(p => p - 1); else if (currentStep === 0) setCurrentStep(-1); else setShowConfirm(true); }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: C.bg, border: `1.5px solid ${C.mid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={16} color={C.ink} strokeWidth={1.8} />
            </button>
            {currentStep >= 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{ width: 28, height: 4, borderRadius: 4, background: i <= currentStep ? C.gold : C.mid, transition: 'background 0.25s' }} />
                ))}
              </div>
            )}
            <button onClick={() => setShowConfirm(true)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: C.bg, border: `1.5px solid ${C.mid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color={C.muted} strokeWidth={1.8} />
            </button>
          </div>

          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FolliSense</span>
          </div>

          <AnimatePresence mode="wait">
            {/* Intro / Skip screen */}
            {currentStep === -1 && !acknowledgment && (
              <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: C.goldDeep, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  {getContextLabel()}
                </p>
                <h2 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: C.ink, margin: '0 0 12px', lineHeight: 1.25 }}>
                  Time for a quick scalp check
                </h2>
                <p style={{ fontFamily: dm, fontSize: 13, color: C.muted, margin: '0 0 28px', lineHeight: 1.5 }}>
                  Just a few quick questions about how your scalp's been feeling. Takes about a minute.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => setCurrentStep(0)} style={{
                    width: '100%', textAlign: 'left', padding: '15px 18px', borderRadius: 16,
                    border: `2px solid ${C.gold}`, background: C.gold10, cursor: 'pointer',
                    boxShadow: `0 4px 16px rgba(212,168,102,0.16)`,
                  }}>
                    <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: C.goldDeep, margin: 0 }}>Let's do it</p>
                  </button>
                  <button onClick={handleSkip} style={{
                    width: '100%', textAlign: 'center', padding: '12px 18px', borderRadius: 16,
                    border: `1.5px solid ${C.mid}`, background: C.white, cursor: 'pointer',
                  }}>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.muted, margin: 0 }}>Not right now</p>
                  </button>
                </div>
              </motion.div>
            )}

            {acknowledgment ? (
              <motion.div key="ack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
                <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: C.ink, lineHeight: 1.3 }}>{acknowledgment}</p>
              </motion.div>
            ) : currentStep >= 0 && currentQ && (
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: C.goldDeep, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  {getContextLabel()}
                </p>
                <h2 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: C.ink, margin: '0 0 28px', lineHeight: 1.25 }}>
                  {getQuestion(currentQ)}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {getOptions(currentQ).map((opt, optIdx) => {
                    const sel = answers[currentQ.key] === opt;
                    return (
                      <button key={opt} onClick={() => selectAnswer(opt, optIdx)} style={{
                        width: '100%', textAlign: 'left', padding: '15px 18px', borderRadius: 16,
                        border: sel ? `2px solid ${C.gold}` : `1.5px solid ${C.mid}`,
                        background: sel ? C.gold10 : C.white, cursor: 'pointer',
                        boxShadow: sel ? `0 4px 16px rgba(212,168,102,0.16)` : '0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${sel ? C.gold : C.mid}`, background: sel ? C.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                            {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.white }} />}
                          </div>
                          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? C.goldDeep : C.ink, margin: 0 }}>{opt}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isLastStep && allAnswered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 24 }}>
                      <button onClick={handleSubmit} style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', background: C.ink, color: '#f5f5f5', fontFamily: dm, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.14)' }}>
                        See results
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exit confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.white, borderRadius: 28, padding: 28, maxWidth: 360, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>
              <h3 style={{ fontFamily: playfair, fontSize: 20, fontWeight: 500, color: C.ink, margin: '0 0 8px' }}>Are you sure?</h3>
              <p style={{ fontFamily: dm, fontSize: 13, color: C.muted, margin: '0 0 24px', lineHeight: 1.5 }}>Your progress won't be saved.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, height: 46, borderRadius: 14, border: `1.5px solid ${C.mid}`, background: 'transparent', fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, cursor: 'pointer' }}>Continue</button>
                <button onClick={() => navigate('/home')} style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', background: C.ink, fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#f5f5f5', cursor: 'pointer' }}>Leave</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MidCycleCheckIn;
