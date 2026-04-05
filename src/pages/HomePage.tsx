import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, Lightbulb, Scissors, X,
  Calendar, Stethoscope, Flame, Microscope, Droplets,
  Camera, FlaskConical, Heart, Sparkles, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getPrioritisedFact } from '@/data/didYouKnowFacts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import MaleDashboard from '@/components/MaleDashboard';

const serviceOptions = [
  'Wash', 'Treatment', 'Style installation', 'Style removal/takedown',
  'Trim', 'Colour', 'Lineup or shape-up', 'Retwist (locs)',
  'Barber fade or cut', 'Scalp treatment', 'Other',
];

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
};

const cardBase: React.CSSProperties = {
  background: '#F5F0EB',
  border: `1.5px solid #E8DED1`,
  borderRadius: 18,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
  fontFamily: dm,
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: dm, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.1em', color: C.muted,
    textTransform: 'uppercase', marginBottom: 12, marginTop: 4,
  }}>
    {children}
  </p>
);

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>
    {children}
  </p>
);

const styleDurationOptions = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer'];

const HomePage = () => {
  const navigate = useNavigate();
  const {
    onboardingData, addSalonVisit, checkInCount, userName,
    research, setResearch, progressiveDismissed, dismissProgressivePrompt, checkInHistory,
    setOnboardingData,
  } = useApp();

  // Render male dashboard for male users
  if (onboardingData.gender === 'man') {
    return <MaleDashboard />;
  }

  const [showSalonForm, setShowSalonForm]               = useState(false);
  const [showSalonVisitPicker, setShowSalonVisitPicker] = useState(false);
  const [visitDate, setVisitDate]                       = useState<Date>(new Date());
  const [services, setServices]                         = useState<string[]>([]);
  const [stylistName, setStylistName]                   = useState('');
  const [visitNotes, setVisitNotes]                     = useState('');
  const [showResearchPrompt, setShowResearchPrompt]     = useState(false);

  // Style change flow
  const [showStyleChange, setShowStyleChange] = useState(false);
  const [styleStep, setStyleStep] = useState(0); // 0=pick style, 1=pick duration, 2=confirmation
  const [newStyle, setNewStyle] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [addingNewStyle, setAddingNewStyle] = useState(false);
  const [customNewStyle, setCustomNewStyle] = useState('');

  // Nudge card for 100% cycle
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Cycle state
  const [cycleDay, setCycleDay] = useState(14);
  const [cycleTotalDays, setCycleTotalDays] = useState(21);

  useEffect(() => {
    localStorage.setItem('follisense-last-home-visit', String(Date.now()));
  }, []);

  useEffect(() => {
    if (checkInCount >= 3 && !research.consented && !research.dismissed) {
      const t = setTimeout(() => setShowResearchPrompt(true), 1500);
      return () => clearTimeout(t);
    }
  }, [checkInCount, research.consented, research.dismissed]);

  const isMale       = onboardingData.gender === 'man';
  const currentStyle = onboardingData.protectiveStyles[0] || 'Braids';
  const progress     = Math.min((cycleDay / cycleTotalDays) * 100, 100);
  const cycleComplete = cycleDay >= cycleTotalDays;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Ring config
  const ringSize = 200;
  const stroke   = 10;
  const r        = (ringSize - stroke) / 2;
  const circ     = 2 * Math.PI * r;
  const offset   = circ - (progress / 100) * circ;
  const ringColor = progress >= 75 ? C.terracotta : C.sage;

  const showPhotosPrompt    = checkInCount >= 2 && !progressiveDismissed['photos'];
  const showChemicalPrompt  = !onboardingData.chemicalProcessing && !progressiveDismissed['chemical'] && checkInCount >= 1 && !showPhotosPrompt;
  const showProductsPrompt  = !progressiveDismissed['products'] && checkInCount >= 1 && onboardingData.scalpProducts.length === 0 && !showPhotosPrompt && !showChemicalPrompt;
  const hasSymptomFluctuation = checkInHistory.length >= 2 && !isMale;
  const showMenstrualPrompt = hasSymptomFluctuation && !onboardingData.menstrualTracking && !progressiveDismissed['menstrual'] && !isMale && !showPhotosPrompt && !showChemicalPrompt && !showProductsPrompt;

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSaveSalon = () => {
    addSalonVisit({
      id: `sv-${Date.now()}`,
      date: format(visitDate, 'MMM d'),
      services,
      stylistName: stylistName || undefined,
      notes: visitNotes || undefined,
    });
    setShowSalonForm(false);
    setServices([]);
    setStylistName('');
    setVisitNotes('');
    setVisitDate(new Date());
  };

  const handleResearchDismiss = () => {
    setShowResearchPrompt(false);
    setResearch({ ...research, dismissed: true });
  };
  const handleResearchOptIn = () => {
    setShowResearchPrompt(false);
    setResearch({ ...research, consented: true, consentDate: new Date().toISOString() });
  };

  // Style change handlers
  const handleStyleSelect = (style: string) => {
    setNewStyle(style);
    setTimeout(() => setStyleStep(1), 200);
  };

  const handleDurationSelect = (dur: string) => {
    setNewDuration(dur);
    setStyleStep(2);
    // Reset cycle
    setCycleDay(1);
    const durationMap: Record<string, number> = {
      '1-2 weeks': 14, '3-4 weeks': 28, '5-6 weeks': 42, '7-8 weeks': 56, 'Longer': 70,
    };
    setCycleTotalDays(durationMap[dur] || 21);
    // Close after 2s
    setTimeout(() => {
      setShowStyleChange(false);
      setStyleStep(0);
      setNewStyle('');
      setNewDuration('');
    }, 2000);
  };

  const handleAddCustomStyle = () => {
    if (customNewStyle.trim()) {
      setNewStyle(customNewStyle.trim());
      setAddingNewStyle(false);
      setCustomNewStyle('');
      setTimeout(() => setStyleStep(1), 200);
    }
  };

  const progressiveCard = () => {
    if (showPhotosPrompt) return (
      <ProgressiveCard
        icon={<Camera size={16} color={C.gold} strokeWidth={1.8} />}
        iconBg={C.gold10}
        title="Track visual changes over time?"
        desc="Add your starting point so we can compare at future check-ins."
        cta="Add photos"
        onCta={() => navigate('/profile')}
        onDismiss={() => dismissProgressivePrompt('photos')}
      />
    );
    if (showChemicalPrompt) return (
      <ProgressiveCard
        icon={<FlaskConical size={16} color={C.muted} strokeWidth={1.8} />}
        iconBg={C.surface}
        title="Tell us more about your hair history"
        desc="Helps us tailor your check-ins more accurately."
        cta="Complete profile"
        onCta={() => navigate('/profile')}
        onDismiss={() => dismissProgressivePrompt('chemical')}
      />
    );
    if (showProductsPrompt) return (
      <ProgressiveCard
        icon={<Sparkles size={16} color={C.gold} strokeWidth={1.8} />}
        iconBg={C.gold10}
        title="What products are you using?"
        desc="We'll flag potential irritants for you."
        cta="Add products"
        onCta={() => navigate('/profile')}
        onDismiss={() => dismissProgressivePrompt('products')}
      />
    );
    if (showMenstrualPrompt) return (
      <ProgressiveCard
        icon={<Heart size={16} color="#C06080" strokeWidth={1.8} />}
        iconBg="rgba(192,96,128,0.08)"
        title="Your symptoms seem to shift in a pattern"
        desc="Want to link your cycle for more accurate insights?"
        cta="Link cycle"
        onCta={() => navigate('/profile')}
        onDismiss={() => dismissProgressivePrompt('menstrual')}
      />
    );
    return null;
  };

  return (
    <div style={{ fontFamily: dm, background: C.bg, minHeight: '100vh' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        input::placeholder, textarea::placeholder { color: #BBBBBB; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div style={{ padding: '4px 20px 110px' }}>

          {/* ── Nudge card (when cycle reaches 100%) ── */}
          {cycleComplete && !nudgeDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                ...cardBase,
                padding: '14px 16px', marginBottom: 16,
                borderLeft: `3px solid ${C.terracotta}`,
              }}
            >
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>
                Style change coming up?
              </p>
              <p style={{ fontFamily: dm, fontSize: 11, color: C.warm, lineHeight: 1.5, marginBottom: 10 }}>
                Let us know what's next so we can adjust your check-ins.
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => setShowStyleChange(true)}
                  style={{
                    fontFamily: dm, fontSize: 12, fontWeight: 600,
                    color: C.white, background: C.sage,
                    border: 'none', borderRadius: 100, padding: '7px 16px', cursor: 'pointer',
                  }}
                >
                  Log a style change
                </button>
                <button
                  onClick={() => setNudgeDismissed(true)}
                  style={{
                    fontFamily: dm, fontSize: 12, color: C.muted,
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Cycle Progress Ring ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0, duration: 0.3 }}
            onClick={() => navigate('/scalp-check')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginBottom: 8 }}
          >
            <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx={ringSize/2} cy={ringSize/2} r={r}
                  fill="none" stroke={C.sand} strokeWidth={stroke}
                />
                <motion.circle
                  cx={ringSize/2} cy={ringSize/2} r={r}
                  fill="none" stroke={ringColor} strokeWidth={stroke}
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: playfair, fontSize: 36, fontWeight: 500, color: C.ink, lineHeight: 1 }}>
                  Day {cycleDay}
                </span>
                <span style={{ fontFamily: dm, fontSize: 14, color: C.muted, marginTop: 2 }}>
                  of {cycleTotalDays}
                </span>
              </div>
            </div>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#7A7570', marginTop: 8, textAlign: 'center' }}>
              {progress >= 75 ? 'Wash day approaching' : 'Mid-cycle check-in due'}
            </p>
          </motion.div>

          {/* ── Start check-in button ─────────────────────────────────────── */}
          <motion.button
            onClick={() => navigate('/scalp-check')}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', height: 52, borderRadius: 16,
              background: C.sage, color: C.white,
              border: 'none', fontFamily: dm, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', marginBottom: 20,
              boxShadow: '0 4px 16px rgba(124,154,142,0.25)',
            }}
          >
            Start check-in
          </motion.button>

          {/* ── Quick actions ─────────────────────────────────────────────────── */}
          <SectionLabel>Quick actions</SectionLabel>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}
          >
            <QuickActionBtn
              icon={<AlertTriangle size={18} color={C.goldDeep} strokeWidth={1.6} />}
              label="Something feels off?"
              onClick={() => navigate('/spot-it?mode=symptoms')}
            />
            <QuickActionBtn
              icon={<Scissors size={18} color={C.warm} strokeWidth={1.6} />}
              label="Salon visit"
              onClick={() => setShowSalonVisitPicker(true)}
            />
            <QuickActionBtn
              icon={<RefreshCw size={18} color={C.sage} strokeWidth={1.6} />}
              label="Log a style change"
              onClick={() => setShowStyleChange(true)}
            />
            <QuickActionBtn
              icon={<Droplets size={18} color={C.goldDeep} strokeWidth={1.6} />}
              label="My routine"
              onClick={() => navigate('/routine-tracker')}
            />
          </motion.div>

          {/* Streak pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.ink, color: '#f5f5f5',
              borderRadius: 100, padding: '6px 14px',
              fontFamily: dm, fontSize: 12, fontWeight: 500, marginBottom: 16,
            }}
          >
            <Flame size={12} color={C.gold} fill={C.gold} strokeWidth={0} />
            {checkInCount} check-in{checkInCount !== 1 ? 's' : ''} · keep it up
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: i < checkInCount ? C.gold : 'rgba(255,255,255,0.2)',
                }} />
              ))}
            </div>
          </motion.div>

          {/* ── Did you know ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
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

      {/* ── Research Prompt Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showResearchPrompt && (
          <Modal onClose={handleResearchDismiss}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 13, background: C.gold10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Microscope size={19} color={C.goldDeep} strokeWidth={1.6} />
              </div>
              <h3 style={{ fontFamily: playfair, fontSize: 17, color: C.ink, margin: 0, lineHeight: 1.2 }}>
                Help improve scalp health research
              </h3>
            </div>
            <p style={{ fontFamily: dm, fontSize: 13, color: C.warm, lineHeight: 1.6, marginBottom: 20 }}>
              You've completed {checkInCount} check-ins. Your anonymised data helps us better
              understand scalp health for textured hair.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleResearchOptIn} style={primaryBtn}>Yes, opt me in</button>
              <button onClick={handleResearchDismiss} style={outlineBtn}>Not now</button>
              <button onClick={() => { handleResearchDismiss(); navigate('/profile'); }} style={{ ...ghostBtn, marginTop: 4 }}>
                Learn more
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Salon Visit Picker Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showSalonVisitPicker && (
          <Modal onClose={() => setShowSalonVisitPicker(false)} title="Salon Visit">
            <p style={{ fontFamily: dm, fontSize: 13, color: C.warm, marginBottom: 20 }}>
              What would you like to do?
            </p>
            <ModalOption
              iconBg={C.surface}
              icon={<Calendar size={19} color={C.ink} strokeWidth={1.6} />}
              title="Log my own visit"
              desc="Record your salon or barber experience"
              onClick={() => { setShowSalonVisitPicker(false); setShowSalonForm(true); }}
            />
            <ModalOption
              iconBg={C.gold10}
              icon={<Stethoscope size={19} color={C.goldDeep} strokeWidth={1.6} />}
              title="Stylist check-in"
              desc="Hand your phone to your stylist for photo capture"
              onClick={() => { setShowSalonVisitPicker(false); navigate('/salon-checkin'); }}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Salon Visit Form Sheet ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSalonForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.3)', zIndex: 50,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                background: C.white, borderRadius: '28px 28px 0 0',
                width: '100%', maxWidth: 430, maxHeight: '85vh',
                overflowY: 'auto', padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontFamily: playfair, fontSize: 18, color: C.ink, margin: 0 }}>
                  {isMale ? 'Log a salon or barber visit' : 'Log a salon visit'}
                </h3>
                <button onClick={() => setShowSalonForm(false)} style={iconBtn}>
                  <X size={19} color={C.muted} strokeWidth={1.8} />
                </button>
              </div>

              <FormLabel>Date of visit</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <button style={formField}>{format(visitDate, 'PPP')}</button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single" selected={visitDate}
                    onSelect={(d) => d && setVisitDate(d)}
                    initialFocus className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <FormLabel>Services</FormLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {serviceOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    style={{
                      padding: '7px 14px', borderRadius: 100,
                      fontFamily: dm, fontSize: 12, fontWeight: 500,
                      border: services.includes(s)
                        ? `1.5px solid ${C.gold}` : `1.5px solid ${C.mid}`,
                      background: services.includes(s) ? C.gold10 : C.white,
                      color: services.includes(s) ? C.goldDeep : C.warm,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <FormLabel>Stylist name (optional)</FormLabel>
              <input
                type="text" value={stylistName}
                onChange={e => setStylistName(e.target.value)}
                placeholder="Who did your hair?"
                style={{ ...formField, marginBottom: 20 }}
              />

              <FormLabel>Notes (optional)</FormLabel>
              <textarea
                value={visitNotes} onChange={e => setVisitNotes(e.target.value)}
                placeholder="Anything to remember?" rows={3}
                style={{
                  ...(formField as React.CSSProperties),
                  height: 'auto', padding: '12px 16px',
                  resize: 'none', marginBottom: 24,
                }}
              />

              <button
                onClick={handleSaveSalon}
                disabled={services.length === 0}
                style={{
                  ...primaryBtn,
                  opacity: services.length === 0 ? 0.4 : 1,
                  cursor: services.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Save visit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Style Change Flow Sheet ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showStyleChange && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.3)', zIndex: 50,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                background: C.bg, borderRadius: '28px 28px 0 0',
                width: '100%', maxWidth: 430, maxHeight: '80vh',
                overflowY: 'auto', padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: playfair, fontSize: 18, color: C.ink, margin: 0 }}>
                  {styleStep === 0 ? "What's your new style?" : styleStep === 1 ? 'How long do you plan to keep it?' : ''}
                </h3>
                {styleStep < 2 && (
                  <button onClick={() => { setShowStyleChange(false); setStyleStep(0); }} style={iconBtn}>
                    <X size={19} color={C.muted} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {styleStep === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {onboardingData.protectiveStyles.filter(s => s !== 'Other').map(style => (
                        <motion.button
                          key={style}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStyleSelect(style)}
                          style={{
                            width: '100%', textAlign: 'left',
                            background: C.white, border: `1.5px solid ${C.sand}`,
                            borderRadius: 14, padding: '14px 16px',
                            fontFamily: dm, fontSize: 14, fontWeight: 500, color: C.ink,
                            cursor: 'pointer',
                          }}
                        >
                          {style}
                        </motion.button>
                      ))}
                    </div>
                    {!addingNewStyle ? (
                      <button
                        onClick={() => setAddingNewStyle(true)}
                        style={{
                          fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.sage,
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '12px 0 0', display: 'block',
                        }}
                      >
                        + Add a style
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <input
                          type="text"
                          value={customNewStyle}
                          onChange={e => setCustomNewStyle(e.target.value)}
                          placeholder="Enter style name"
                          autoFocus
                          style={{ ...formField, marginBottom: 0, flex: 1 }}
                          onKeyDown={e => e.key === 'Enter' && handleAddCustomStyle()}
                        />
                        <button onClick={handleAddCustomStyle} style={{
                          background: C.sage, color: C.white, border: 'none',
                          borderRadius: 14, padding: '0 16px', fontFamily: dm,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                          Add
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {styleStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {styleDurationOptions.map(dur => (
                        <motion.button
                          key={dur}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDurationSelect(dur)}
                          style={{
                            width: '100%', textAlign: 'left',
                            background: C.white, border: `1.5px solid ${C.sand}`,
                            borderRadius: 14, padding: '14px 16px',
                            fontFamily: dm, fontSize: 14, fontWeight: 500, color: C.ink,
                            cursor: 'pointer',
                          }}
                        >
                          {dur}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {styleStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                    style={{ textAlign: 'center', padding: '40px 0' }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,154,142,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <RefreshCw size={24} color={C.sage} strokeWidth={1.6} />
                    </motion.div>
                    <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 500, color: C.ink }}>
                      Got it. Your check-ins are updated.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const QuickActionBtn = ({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <motion.button
    onClick={onClick} whileTap={{ scale: 0.95 }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '12px 4px', borderRadius: 16,
      background: '#fff', border: '1.5px solid #EBEBEB',
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}
  >
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'rgba(212,168,102,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, color: '#666', textAlign: 'center', lineHeight: 1.3 }}>
      {label}
    </span>
  </motion.button>
);

const MiniCard = ({
  iconBg, icon, title, desc, onClick,
}: { iconBg: string; icon: React.ReactNode; title: string; desc: string; onClick: () => void }) => (
  <motion.button
    onClick={onClick} whileTap={{ scale: 0.97 }}
    style={{
      background: '#fff', border: '1.5px solid #EBEBEB',
      borderRadius: 18, padding: 18, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 10,
      textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}
  >
    <div style={{
      width: 34, height: 34, borderRadius: 10, background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1C1C1C', margin: '0 0 3px' }}>{title}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0 }}>{desc}</p>
    </div>
  </motion.button>
);

const FullCard = ({
  iconBg, icon, title, desc, onClick,
}: { iconBg: string; icon: React.ReactNode; title: string; desc: string; onClick: () => void }) => (
  <motion.button
    onClick={onClick} whileTap={{ scale: 0.98 }}
    style={{
      width: '100%', background: '#fff', border: '1.5px solid #EBEBEB',
      borderRadius: 18, padding: '15px 18px', marginBottom: 10,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
      textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 12, background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1C1C1C', margin: '0 0 3px' }}>{title}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0 }}>{desc}</p>
    </div>
    <ChevronRight size={14} color="#CCCCCC" strokeWidth={1.8} style={{ flexShrink: 0 }} />
  </motion.button>
);

const ProgressiveCard = ({
  icon, iconBg, title, desc, cta, onCta, onDismiss,
}: {
  icon: React.ReactNode; iconBg: string;
  title: string; desc: string; cta: string;
  onCta: () => void; onDismiss: () => void;
}) => (
  <div style={{
    background: '#fff', border: '1.5px solid #EBEBEB',
    borderLeft: '3px solid #D4A866',
    borderRadius: 18, padding: '15px 18px', marginBottom: 14,
    display: 'flex', gap: 14, alignItems: 'flex-start',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10, background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1C1C1C', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0, lineHeight: 1.55 }}>{desc}</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <button onClick={onCta} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: '#B8893E', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          {cta}
        </button>
        <button onClick={onDismiss} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#BBBBBB',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          Not now
        </button>
      </div>
    </div>
  </div>
);

const Modal = ({
  children, onClose, title,
}: { children: React.ReactNode; onClose: () => void; title?: string }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.3)', zIndex: 55,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px',
    }}
  >
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      style={{
        background: '#fff', borderRadius: 28, padding: 24,
        maxWidth: 360, width: '100%', fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1C1C1C', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={iconBtn}>
            <X size={19} color="#999" strokeWidth={1.8} />
          </button>
        </div>
      )}
      {children}
    </motion.div>
  </motion.div>
);

const ModalOption = ({
  iconBg, icon, title, desc, onClick,
}: { iconBg: string; icon: React.ReactNode; title: string; desc: string; onClick: () => void }) => (
  <motion.button
    onClick={onClick} whileTap={{ scale: 0.98 }}
    style={{
      width: '100%', background: '#F8F8F8',
      border: '1.5px solid #EBEBEB',
      borderRadius: 16, padding: '14px 16px', marginBottom: 10,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
      textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 13, background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1C1C1C', margin: '0 0 2px' }}>{title}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0 }}>{desc}</p>
    </div>
    <ChevronRight size={14} color="#CCCCCC" strokeWidth={1.8} />
  </motion.button>
);

// ─── Shared styles ────────────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  width: '100%', height: 52, borderRadius: 16,
  background: '#1C1C1C', color: '#f5f5f5',
  border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const outlineBtn: React.CSSProperties = {
  width: '100%', height: 52, borderRadius: 16,
  background: 'transparent', color: '#1C1C1C',
  border: '1.5px solid #EBEBEB', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  width: '100%', height: 40, borderRadius: 16,
  background: 'none', color: '#D4A866', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const formField: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px',
  borderRadius: 14, border: '1.5px solid #EBEBEB',
  background: '#F8F8F8', fontFamily: "'DM Sans', sans-serif",
  fontSize: 13, color: '#1C1C1C',
  marginBottom: 20, outline: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', boxSizing: 'border-box',
};

export default HomePage;
