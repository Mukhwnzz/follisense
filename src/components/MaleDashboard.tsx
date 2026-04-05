import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, Lightbulb, AlertTriangle, Droplets, Calendar, X,
  Stethoscope, Microscope, Camera, Sparkles, FlaskConical,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getPrioritisedFact } from '@/data/didYouKnowFacts';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg:       '#FAF8F5',
  surface:  '#F5F0EB',
  ink:      '#1C1C1C',
  gold:     '#D4A866',
  goldDeep: '#B8893E',
  gold10:   'rgba(212,168,102,0.10)',
  goldBorder:'rgba(212,168,102,0.22)',
  mid:      '#EBEBEB',
  muted:    '#999999',
  warm:     '#666666',
  white:    '#FFFFFF',
  sage:     '#7C9A8E',
  sand:     '#E8DED1',
  terracotta: '#C4967A',
  roseRed:  '#B85C5C',
};

const cardBase: React.CSSProperties = {
  background: '#F5F0EB',
  border: `1.5px solid #E8DED1`,
  borderRadius: 18,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
  fontFamily: dm,
};

const cadenceToNextDate = (cadence: string): string => {
  const now = new Date();
  const daysMap: Record<string, number> = {
    'Weekly': 7,
    'Every 2 weeks': 14,
    'Monthly': 30,
    'Every 6+ weeks': 42,
    'I maintain it myself': 14,
  };
  const days = daysMap[cadence] || 14;
  const next = new Date(now.getTime() + days * 86400000);
  return next.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const MaleDashboard = () => {
  const navigate = useNavigate();
  const {
    onboardingData, userName, checkInHistory, baselineRisk, baselinePhotos,
    research, setResearch, checkInCount, progressiveDismissed, dismissProgressivePrompt,
  } = useApp();

  const [showResearchPrompt, setShowResearchPrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem('follisense-last-home-visit', String(Date.now()));
  }, []);

  useEffect(() => {
    if (checkInCount >= 3 && !research.consented && !research.dismissed) {
      const t = setTimeout(() => setShowResearchPrompt(true), 1500);
      return () => clearTimeout(t);
    }
  }, [checkInCount, research.consented, research.dismissed]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const norwoodStage = (onboardingData as any).norwoodBaseline || '1';
  const cutCadence = (onboardingData as any).cutCadence || 'Every 2 weeks';
  const nextCheckInDate = cadenceToNextDate(cutCadence);

  // Determine risk from latest check-in or baseline
  const latestCheckIn = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const currentRisk = baselineRisk || 'green';

  // Baseline front photo
  const baselineFrontPhoto = baselinePhotos.find(p => p.area === 'Front hairline');
  const baselineDate = baselineFrontPhoto?.date
    ? new Date(baselineFrontPhoto.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  const statusText = currentRisk === 'green'
    ? 'No changes detected'
    : currentRisk === 'amber'
    ? "You've reported some changes since your baseline. Keep tracking."
    : 'Changes detected. Consider seeing a professional.';

  const statusColor = currentRisk === 'red' ? C.roseRed : C.warm;

  const showPhotosPrompt = checkInCount >= 2 && !progressiveDismissed['photos'];
  const showProductsPrompt = !progressiveDismissed['products'] && checkInCount >= 1 && onboardingData.scalpProducts.length === 0 && !showPhotosPrompt;

  return (
    <div style={{ fontFamily: dm, background: C.bg, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
      `}</style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

        {/* Hero */}
        <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#C4B5A5' }}>
          <img
            src="https://i.pinimg.com/1200x/27/cc/b9/27ccb9853ed4ccced03567b73f7902c5.jpg"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
            background: `linear-gradient(to top, ${C.bg}, transparent)`,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(to bottom, rgba(28,28,28,0.5), transparent)',
          }} />

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '48px 20px 0',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  FolliSense
                </span>
              </div>
              <h1 style={{
                fontFamily: playfair, fontSize: 22, fontWeight: 500,
                color: '#fff', lineHeight: 1.15, margin: 0,
                textShadow: '0 1px 8px rgba(0,0,0,0.25)',
              }}>
                {greeting}{userName ? `, ${userName}` : ''}
              </h1>
              <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3, fontWeight: 300 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <button
              onClick={() => navigate('/profile')}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                border: 'none', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)',
              }}
            >
              <User size={15} color={C.ink} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div style={{ padding: '4px 20px 110px' }}>

          {/* Hairline Tracker Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.3 }}
            onClick={() => navigate('/history')}
            style={{ ...cardBase, padding: '18px', marginBottom: 16, cursor: 'pointer' }}
          >
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
              Hairline Tracker
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              {/* Baseline photo */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                  background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${C.sand}`,
                }}>
                  {baselineFrontPhoto ? (
                    <Camera size={28} color={C.muted} strokeWidth={1.2} />
                  ) : (
                    <Camera size={28} color={C.muted} strokeWidth={1.2} />
                  )}
                </div>
                <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 6 }}>
                  Baseline{baselineDate ? ` · ${baselineDate}` : ''}
                </p>
              </div>

              {/* Latest photo */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                  background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px dashed ${C.mid}`,
                }}>
                  <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', padding: 8, lineHeight: 1.4 }}>
                    Your next photo will appear here
                  </p>
                </div>
                <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 6 }}>
                  Latest
                </p>
              </div>
            </div>

            <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, marginBottom: 4 }}>
              Self-assessment: Stage {norwoodStage === '3v' ? '3 Vertex' : norwoodStage}
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 500, color: statusColor, lineHeight: 1.5 }}>
              {statusText}
            </p>
          </motion.div>

          {/* Next Check-in Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{ ...cardBase, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                Next check-in
              </p>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 500, color: C.ink }}>
                {nextCheckInDate}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/scalp-check'); }}
              style={{
                fontFamily: dm, fontSize: 12, fontWeight: 600,
                color: C.white, background: C.sage,
                border: 'none', borderRadius: 100, padding: '9px 18px', cursor: 'pointer',
              }}
            >
              Check in now
            </button>
          </motion.div>

          {/* Scalp Health Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            style={{ ...cardBase, padding: '16px 18px', marginBottom: 16 }}
          >
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>
              Scalp Health Summary
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: currentRisk === 'green' ? C.sage : currentRisk === 'amber' ? C.terracotta : C.roseRed,
              }} />
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink }}>
                {currentRisk === 'green' ? 'All clear' : currentRisk === 'amber' ? 'Worth monitoring' : 'Needs attention'}
              </p>
            </div>
            {latestCheckIn && (
              <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, marginTop: 6 }}>
                Last check-in: {latestCheckIn.date}
              </p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <p style={{
            fontFamily: dm, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', color: C.muted,
            textTransform: 'uppercase', marginBottom: 12, marginTop: 4,
          }}>
            Quick actions
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}
          >
            <motion.button
              onClick={() => navigate('/spot-it?mode=symptoms')}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 8px', borderRadius: 16,
                background: '#fff', border: '1.5px solid #EBEBEB',
                cursor: 'pointer', fontFamily: dm,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(212,168,102,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={18} color={C.goldDeep} strokeWidth={1.6} />
              </div>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: C.warm, textAlign: 'center' }}>
                Something feels off?
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/routine-tracker')}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 8px', borderRadius: 16,
                background: '#fff', border: '1.5px solid #EBEBEB',
                cursor: 'pointer', fontFamily: dm,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(212,168,102,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Droplets size={18} color={C.goldDeep} strokeWidth={1.6} />
              </div>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: C.warm, textAlign: 'center' }}>
                My routine
              </span>
            </motion.button>
          </motion.div>

          {/* Progressive prompts */}
          {showPhotosPrompt && (
            <div style={{
              background: '#fff', border: '1.5px solid #EBEBEB',
              borderLeft: '3px solid #D4A866',
              borderRadius: 18, padding: '15px 18px', marginBottom: 14,
              display: 'flex', gap: 14, alignItems: 'flex-start',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: C.gold10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Camera size={16} color={C.gold} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.ink, margin: '0 0 4px' }}>Track visual changes over time?</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>Add your starting point so we can compare at future check-ins.</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <button onClick={() => navigate('/profile')} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Add photos</button>
                  <button onClick={() => dismissProgressivePrompt('photos')} style={{ fontFamily: dm, fontSize: 12, color: '#BBBBBB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Not now</button>
                </div>
              </div>
            </div>
          )}

          {/* Did you know */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            style={{
              ...cardBase,
              padding: '16px 18px', marginBottom: 14,
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: 34, height: 34, background: C.gold10, borderRadius: 10,
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lightbulb size={15} color={C.gold} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 4, letterSpacing: '0.01em' }}>
                Did you know?
              </p>
              <p style={{ fontFamily: dm, fontSize: 11, color: C.warm, lineHeight: 1.6, margin: 0 }}>
                {getPrioritisedFact(onboardingData.goals, dayOfYear)}
              </p>
              <button
                onClick={() => navigate('/learn')}
                style={{
                  fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.goldDeep,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0',
                }}
              >
                Learn more →
              </button>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default MaleDashboard;
