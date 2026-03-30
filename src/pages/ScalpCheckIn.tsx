import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  ink:        '#1C1C1C',
  gold:       '#D4A866',
  goldDeep:   '#B8893E',
  gold10:     'rgba(212,168,102,0.10)',
  goldBorder: 'rgba(212,168,102,0.22)',
  mid:        '#EBEBEB',
  muted:      '#999999',
  surface:    '#F8F8F8',
  white:      '#FFFFFF',
};

const ScalpCheckIn = () => {
  const navigate = useNavigate();
  const { onboardingData } = useApp();
  const isMale = onboardingData.gender === 'man';

  const options = [
    {
      label: 'Scheduled check-in',
      desc: 'Your regular scalp check — takes about a minute',
      Icon: Leaf,
      iconBg: C.gold10,
      iconColor: C.goldDeep,
      onClick: () => navigate(isMale || onboardingData.isWornOutOnly ? '/wash-day?mode=regular' : '/mid-cycle'),
    },
    {
      label: 'Something feels off',
      desc: 'You noticed itching, flaking, tenderness, or something new',
      Icon: AlertTriangle,
      iconBg: 'rgba(176,112,48,0.08)',
      iconColor: '#A06030',
      onClick: () => navigate('/spot-it?mode=symptoms'),
    },
    {
      label: 'I want to check something',
      desc: "Compare what you're seeing to reference images",
      Icon: Eye,
      iconBg: C.gold10,
      iconColor: C.goldDeep,
      onClick: () => navigate('/spot-it?mode=visual'),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.white, fontFamily: dm }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: 480, margin: '0 auto', padding: '52px 24px 80px' }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: dm, fontSize: 13, fontWeight: 500,
            color: C.muted, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, marginBottom: 32,
          }}
        >
          <ArrowLeft size={17} strokeWidth={1.8} color={C.muted} /> Back
        </button>

        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            FolliSense
          </span>
        </div>

        <h1 style={{ fontFamily: playfair, fontSize: 26, fontWeight: 500, color: C.ink, margin: '0 0 6px', lineHeight: 1.2 }}>
          What brings you here?
        </h1>
        <p style={{ fontFamily: dm, fontSize: 13, color: C.muted, margin: '0 0 32px', lineHeight: 1.5 }}>
          Choose how you'd like to check in today.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt, i) => (
            <motion.button
              key={opt.label}
              onClick={opt.onClick}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.25 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', textAlign: 'left',
                background: C.white,
                border: `1.5px solid ${C.mid}`,
                borderRadius: 20, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', fontFamily: dm,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.border = `1.5px solid ${C.goldBorder}`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 18px rgba(212,168,102,0.14), 0 1px 4px rgba(0,0,0,0.05)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.border = `1.5px solid ${C.mid}`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: opt.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <opt.Icon size={20} color={opt.iconColor} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: C.ink, margin: 0 }}>
                  {opt.label}
                </p>
                <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, margin: '3px 0 0', lineHeight: 1.45 }}>
                  {opt.desc}
                </p>
              </div>
              <ChevronRight size={15} color={C.mid} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ScalpCheckIn;