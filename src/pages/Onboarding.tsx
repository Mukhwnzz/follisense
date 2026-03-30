import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, HelpCircle, ChevronDown, ChevronLeft,
  ChevronRight, Camera, ImagePlus, X, Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface CapturedPhoto {
  dataUrl: string;
  type: 'scalp' | 'hair';
}

// ─── PALETTE — white bg, black ink, gold accents (matches LearnPage) ──────────
const C = {
  bg:         '#FFFFFF',
  surface:    '#F8F8F6',
  surfaceAlt: '#F2F0EB',
  ink:        '#1C1C1C',
  border:     '#E8E4DC',
  borderDark: '#D4CFC4',
  gold:       '#C9A84C',
  goldDeep:   '#B8893E',
  goldLight:  '#E8C96A',
  gold10:     'rgba(201,168,76,0.10)',
  goldBorder: 'rgba(201,168,76,0.28)',
  muted:      '#888880',
  warm:       '#5C5850',
  dim:        '#AAA89A',
};

// ─── HAIR REFERENCE PHOTOS ───────────────────────────────────────────────────
const hairPhotos: Record<string, Record<string, { src: string; label: string }[]>> = {
  type3: {
    female: [
      { src: 'https://i.pinimg.com/736x/99/59/67/995967923455cf9abd0b8ef9d4e4ba81.jpg', label: 'Type 3: S-shaped curls, bouncy' },
      { src: 'https://i.pinimg.com/1200x/59/e2/50/59e250e2cbe1244e3e2196678551b14b.jpg', label: 'Type 3: Tighter curls, voluminous' },
    ],
    male: [
      { src: 'https://i.pinimg.com/736x/a2/24/c0/a224c05d0dfbda56c5e6841df83067ef.jpg', label: 'Type 3: Defined curls, medium density' },
    ],
  },
  type4: {
    female: [
      { src: 'https://i.pinimg.com/1200x/35/a3/1c/35a31cd46add2f0f7c933f348c60420e.jpg', label: 'Type 4a: Defined coils, springy' },
      { src: 'https://i.pinimg.com/1200x/1b/47/2c/1b472c56063b6145d0945cc232fd056d.jpg', label: 'Type 4b: Z-pattern coils, dense' },
      { src: 'https://i.pinimg.com/736x/a7/e7/9a/a7e79acc50020c6f6d793291e1c4c2e9.jpg', label: 'Type 4c: Tight coils, significant shrinkage' },
    ],
    male: [
      { src: 'https://i.pinimg.com/1200x/c1/f8/13/c1f8138c7a1b36c682dd42554dc9b227.jpg', label: 'Type 4: Tight coils, dense, afro' },
      { src: 'https://i.pinimg.com/736x/f5/ea/1e/f5ea1e1fe243495ddf4c22800791e0c6.jpg', label: 'Type 4: Coily texture, fade' },
    ],
  },
};

const hairTypes = [
  { id: 'type4', label: 'Type 4: Coily', desc: 'Tight coils or zig-zag pattern, dense texture, significant shrinkage' },
  { id: 'type3', label: 'Type 3: Curly', desc: 'Visible curl pattern, S-shaped curls, looser texture' },
  { id: 'unsure', label: 'Not sure', desc: "That's okay. We'll use the most inclusive experience" },
];

const subTypes: Record<string, { id: string; label: string }[]> = {
  type4: [
    { id: '4a', label: '4a: Soft, defined coils' },
    { id: '4b', label: '4b: Z-shaped, tightly coiled' },
    { id: '4c', label: '4c: Very tight, densely packed' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  type3: [
    { id: '3a', label: '3a: Loose, wide curls' },
    { id: '3b', label: '3b: Springy, defined curls' },
    { id: '3c', label: '3c: Tight corkscrew curls' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'not-sure', label: 'Not sure' },
  ],
};

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

const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions = ['1–2 weeks', '3–4 weeks', '5–6 weeks', '7–8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions = ['Nothing', 'Oil my scalp', 'Use a scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions = [
  'Itching', 'Flaking', 'Thinning', 'Tenderness',
  'Breakage', 'Dryness', 'I just want to stay on top of things', 'Not sure',
];

const TOTAL_SCREENS = 5;

// ─── PHOTO CAPTURE ────────────────────────────────────────────────────────────
const PhotoCapture = ({
  photos, onAdd, onRemove,
}: {
  photos: CapturedPhoto[];
  onAdd: (p: CapturedPhoto) => void;
  onRemove: (i: number) => void;
}) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<'scalp' | 'hair'>('scalp');

  const handleFile = (file: File, type: 'scalp' | 'hair') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onAdd({ dataUrl: e.target.result as string, type });
    };
    reader.readAsDataURL(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'scalp' | 'hair') => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, type);
    e.target.value = '';
  };

  return (
    <div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleInput(e, activeType)} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleInput(e, activeType)} />

      {/* Toggle */}
      <div style={{ display: 'flex', background: C.surfaceAlt, borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px', border: `1px solid ${C.border}` }}>
        {(['scalp', 'hair'] as const).map((t) => (
          <button key={t} onClick={() => setActiveType(t)} style={{
            flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s',
            background: activeType === t ? C.ink : 'transparent',
            color: activeType === t ? C.bg : C.muted,
            border: 'none', cursor: 'pointer',
          }}>
            {t === 'scalp' ? '🔬 Scalp' : '✨ Hair texture'}
          </button>
        ))}
      </div>

      {/* Tip card */}
      <div style={{ background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: '13px', padding: '13px 15px', marginBottom: '16px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '15px', flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: '12px', color: C.goldDeep, lineHeight: '1.65', margin: 0, fontWeight: 500 }}>
          {activeType === 'scalp'
            ? 'Part your hair and photograph your scalp under good lighting. This helps us track any changes over time.'
            : 'Show your natural hair pattern — unstretched if possible. We use this to refine your hair type.'}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Take photo', sub: 'Use camera', icon: <Camera size={20} color={C.gold} strokeWidth={1.5} />, action: () => cameraRef.current?.click() },
          { label: 'From gallery', sub: 'Choose existing', icon: <ImagePlus size={20} color={C.gold} strokeWidth={1.5} />, action: () => galleryRef.current?.click() },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            padding: '20px 14px', background: C.bg,
            border: `1.5px solid ${C.border}`,
            borderRadius: '16px', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = `0 4px 16px rgba(201,168,76,0.18)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: C.gold10, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {btn.icon}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: C.ink }}>{btn.label}</span>
            <span style={{ fontSize: '11px', color: C.dim }}>{btn.sub}</span>
          </button>
        ))}
      </div>

      {/* Previews */}
      {photos.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', color: C.dim, textTransform: 'uppercase', marginBottom: '10px' }}>
            Added · {photos.length} photo{photos.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {photos.map((photo, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: `1.5px solid ${C.border}` }}>
                <img src={photo.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                  <span style={{ fontSize: '9px', color: C.goldLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{photo.type}</span>
                </div>
                <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(28,28,28,0.75)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── REFERENCE PHOTO GALLERY ──────────────────────────────────────────────────
const PhotoGallery = ({ photos }: { photos: { src: string; label: string }[] }) => {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;
  if (photos.length === 1) return (
    <div style={{ borderRadius: '11px', overflow: 'hidden', border: `1px solid ${C.border}`, marginTop: '12px' }}>
      <img src={photos[0].src} alt={photos[0].label} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
      <p style={{ fontSize: '10px', color: C.dim, textAlign: 'center', padding: '7px', background: C.surfaceAlt }}>{photos[0].label}</p>
    </div>
  );
  return (
    <div style={{ position: 'relative', borderRadius: '11px', overflow: 'hidden', border: `1px solid ${C.border}`, marginTop: '12px' }}>
      <img src={photos[idx].src} alt={photos[idx].label} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
      <p style={{ fontSize: '10px', color: C.dim, textAlign: 'center', padding: '7px', background: C.surfaceAlt }}>{photos[idx].label}</p>
      {[
        { side: 'left', icon: <ChevronLeft size={12} color={C.gold} />, fn: () => setIdx(i => (i - 1 + photos.length) % photos.length) },
        { side: 'right', icon: <ChevronRight size={12} color={C.gold} />, fn: () => setIdx(i => (i + 1) % photos.length) },
      ].map(({ side, icon, fn }) => (
        <button key={side} onClick={(e) => { e.stopPropagation(); fn(); }}
          style={{ position: 'absolute', [side]: '8px', top: '95px', transform: 'translateY(-50%)', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
          {icon}
        </button>
      ))}
      <div style={{ position: 'absolute', bottom: '34px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
        {photos.map((_, i) => (
          <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === idx ? C.gold : C.border }} />
        ))}
      </div>
    </div>
  );
};

// ─── CURL ICON ────────────────────────────────────────────────────────────────
const CurlIcon = ({ type, selected }: { type: string; selected: boolean }) => {
  const color = selected ? C.gold : C.dim;
  if (type === 'unsure') return <HelpCircle size={17} color={color} strokeWidth={1.5} />;
  if (type === 'type3') return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>;
  if (type === 'type4') return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return null;
};

const Checkmark = () => (
  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setOnboardingComplete } = useApp();

  const [step, setStep] = useState(0);
  const gender = onboardingData.gender;
  const isMale = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  const [hairType, setHairType] = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);

  const [styles, setStyles] = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle] = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  const [cycleLength, setCycleLength] = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash] = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');

  const [concerns, setConcerns] = useState<string[]>(onboardingData.goals || []);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;
  const genderKey = isMale ? 'male' : isNeutral ? 'both' : 'female';

  const toggleStyle = (s: string) => setStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleBetweenWash = (v: string) => {
    if (v === 'Nothing') { setBetweenWash(p => p.includes(v) ? [] : [v]); return; }
    setBetweenWash(p => { const w = p.filter(x => x !== 'Nothing'); return w.includes(v) ? w.filter(x => x !== v) : [...w, v]; });
  };
  const toggleConcern = (c: string) => setConcerns(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const canProceed = () => {
    if (step === 0) return !!hairType;
    if (step === 1) return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
    if (step === 2) return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
    if (step === 3) return true;
    if (step === 4) return concerns.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_SCREENS - 1) { setStep(s => s + 1); return; }
    setOnboardingData({
      ...onboardingData,
      hairType: hairSubType || hairType,
      protectiveStyles: styles,
      otherStyle,
      protectiveStyleFrequency: protectiveFreq,
      isWornOutOnly: false,
      cycleLength,
      betweenWashCare: betweenWash,
      otherBetweenWashCare: otherBetweenWash,
      goals: concerns,
    });
    sessionStorage.setItem('follisense-just-onboarded', 'true');
    setOnboardingComplete(true);
    navigate('/home');
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); else navigate(-1); };

  // ─── Style helpers ────────────────────────────────────────────────────────
  const card = (selected: boolean): React.CSSProperties => ({
    width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '14px',
    border: `1.5px solid ${selected ? C.gold : C.border}`,
    background: selected ? C.gold10 : C.bg,
    cursor: 'pointer', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    boxShadow: selected ? `0 4px 16px rgba(201,168,76,0.14)` : '0 1px 4px rgba(0,0,0,0.04)',
    display: 'block',
  });

  const pill = (selected: boolean): React.CSSProperties => ({
    padding: '9px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 500,
    border: `1.5px solid ${selected ? C.gold : C.border}`,
    background: selected ? C.ink : C.bg,
    color: selected ? C.bg : C.muted,
    cursor: 'pointer', transition: 'all 0.18s',
    whiteSpace: 'nowrap' as const,
    boxShadow: selected ? '0 2px 10px rgba(28,28,28,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: C.gold, marginBottom: '8px', display: 'block',
  };

  const heading: React.CSSProperties = {
    fontSize: '25px', fontWeight: 700, color: C.ink, lineHeight: 1.25,
    marginBottom: '6px', fontFamily: 'Georgia, "Times New Roman", serif',
  };

  const subtext: React.CSSProperties = {
    fontSize: '13px', color: C.warm, lineHeight: 1.65, marginBottom: '24px',
  };

  const sectionTitle: React.CSSProperties = {
    fontWeight: 600, color: C.ink, marginBottom: '12px', fontSize: '14px',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: '520px', padding: '0 20px 60px' }}
      >
        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 0 24px' }}>
          <button onClick={handleBack} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <ArrowLeft size={17} color={C.warm} strokeWidth={1.8} />
          </button>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
              <div key={i} style={{
                height: '3px', borderRadius: '100px', transition: 'all 0.3s ease',
                width: i === step ? '22px' : '7px',
                background: i < step ? C.gold : i === step ? C.ink : C.border,
              }} />
            ))}
          </div>

          <span style={{ fontSize: '11px', color: C.dim, fontWeight: 600 }}>{step + 1} / {TOTAL_SCREENS}</span>
        </div>

        {/* ── Wordmark ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: C.gold, textTransform: 'uppercase' }}>Follisense</span>
        </div>

        {/* ── Animated content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >

            {/* ── Step 1: Hair Texture ── */}
            {step === 0 && (
              <div>
                <span style={sectionLabel}>Step 1 — Hair texture</span>
                <h2 style={heading}>What's your hair texture?</h2>
                <p style={subtext}>Type 4 coils are tighter than a pen spring. Type 3 curls wrap around a finger.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hairTypes.map(ht => {
                    const sel = hairType === ht.id;
                    const photos = ht.id !== 'unsure' && hairPhotos[ht.id]
                      ? genderKey === 'both'
                        ? [...(hairPhotos[ht.id].female || []), ...(hairPhotos[ht.id].male || [])]
                        : hairPhotos[ht.id][genderKey] || []
                      : [];
                    return (
                      <button key={ht.id} onClick={() => { setHairType(ht.id); setHairSubType(''); setShowSubType(false); }} style={card(sel)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                            background: sel ? C.gold10 : C.surfaceAlt,
                            border: `1px solid ${sel ? C.goldBorder : C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CurlIcon type={ht.id} selected={sel} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: sel ? C.goldDeep : C.ink, fontSize: '14px', marginBottom: '2px' }}>{ht.label}</p>
                            <p style={{ fontSize: '12px', color: C.warm, lineHeight: 1.5 }}>{ht.desc}</p>
                          </div>
                          {sel && <Checkmark />}
                        </div>
                        {photos.length > 0 && sel && <PhotoGallery photos={photos} />}
                      </button>
                    );
                  })}
                </div>

                {(hairType === 'type3' || hairType === 'type4') && !showSubType && (
                  <button onClick={() => setShowSubType(true)} style={{ marginTop: '14px', fontSize: '13px', color: C.gold, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Want to be more specific? <ChevronDown size={14} />
                  </button>
                )}
                {showSubType && subTypes[hairType] && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.warm, marginBottom: '10px' }}>Which sub-type?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {subTypes[hairType].map(st => (
                        <button key={st.id} onClick={() => setHairSubType(st.id)} style={pill(hairSubType === st.id)}>{st.label}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 2: Styles ── */}
            {step === 1 && (
              <div>
                <span style={sectionLabel}>Step 2 — Your styles</span>
                <h2 style={heading}>How do you usually wear your hair?</h2>
                <p style={subtext}>Select everything you rotate between</p>

                {(() => {
                  const defaultCount = isMale ? 6 : 8;
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {rawStyleOptions.slice(0, defaultCount).map(s => (
                          <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '16px 12px' }}>
                            <p style={{ fontWeight: 600, color: styles.includes(s) ? C.goldDeep : C.warm, fontSize: '13px', lineHeight: 1.4 }}>{s}</p>
                          </button>
                        ))}
                      </div>
                      {rawStyleOptions.length > defaultCount && !showMoreStyles && (
                        <button onClick={() => setShowMoreStyles(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: C.gold, marginTop: '12px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Show more styles <ChevronDown size={15} strokeWidth={2} />
                        </button>
                      )}
                      {showMoreStyles && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                          {rawStyleOptions.slice(defaultCount).map(s => (
                            <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '16px 12px' }}>
                              <p style={{ fontWeight: 600, color: styles.includes(s) ? C.goldDeep : C.warm, fontSize: '13px', lineHeight: 1.4 }}>{s}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {styles.includes('Other') && (
                  <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style"
                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: '14px', marginTop: '10px', outline: 'none', boxSizing: 'border-box' }} />
                )}

                {styles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '28px' }}>
                    <p style={sectionTitle}>How often are you in protective styles?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {protectiveFreqOptions.map(o => (
                        <button key={o} onClick={() => setProtectiveFreq(o)} style={pill(protectiveFreq === o)}>{o}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 3: Routine ── */}
            {step === 2 && (
              <div>
                <span style={sectionLabel}>Step 3 — Your routine</span>
                <h2 style={heading}>Your wash routine</h2>
                <p style={subtext}>This is how we time your check-ins to your actual routine.</p>

                <p style={sectionTitle}>How long do you usually keep a style in?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                  {cycleLengthOptions.map(o => <button key={o} onClick={() => setCycleLength(o)} style={pill(cycleLength === o)}>{o}</button>)}
                </div>

                <p style={sectionTitle}>What do you do for your scalp between washes?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {betweenWashOptions.map(o => <button key={o} onClick={() => toggleBetweenWash(o)} style={pill(betweenWash.includes(o))}>{o}</button>)}
                </div>

                {betweenWash.includes('Other') && (
                  <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?"
                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: '14px', marginTop: '10px', outline: 'none', boxSizing: 'border-box' }} />
                )}
              </div>
            )}

            {/* ── Step 4: Baseline Photos ── */}
            {step === 3 && (
              <div>
                <span style={sectionLabel}>Step 4 — Baseline photos</span>
                <h2 style={heading}>Capture your baseline</h2>
                <p style={{ ...subtext, marginBottom: '10px' }}>
                  Photos help us track scalp changes over time. You can always add these later.
                </p>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: '100px', marginBottom: '22px' }}>
                  <Sparkles size={11} color={C.gold} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: C.goldDeep, letterSpacing: '0.04em' }}>AI-analysed for patterns & changes</span>
                </div>

                <PhotoCapture
                  photos={capturedPhotos}
                  onAdd={(p) => setCapturedPhotos(prev => [...prev, p])}
                  onRemove={(i) => setCapturedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                />

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {capturedPhotos.length > 0 && (
                    <button onClick={handleNext} style={{
                      width: '100%', height: '54px', borderRadius: '15px', fontSize: '15px', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: C.ink, color: C.bg,
                      boxShadow: '0 4px 16px rgba(28,28,28,0.18)',
                    }}>
                      Continue with {capturedPhotos.length} photo{capturedPhotos.length > 1 ? 's' : ''} →
                    </button>
                  )}
                  <button onClick={handleNext} style={{ width: '100%', textAlign: 'center', fontSize: '13px', color: C.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    {capturedPhotos.length > 0 ? 'Or skip for now' : 'Skip for now →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 5: Goals ── */}
            {step === 4 && (
              <div>
                <span style={sectionLabel}>Step 5 — What matters</span>
                <h2 style={heading}>What matters most right now?</h2>
                <p style={subtext}>Select all that apply — this shapes your check-in focus.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {concernOptions.map(c => {
                    const sel = concerns.includes(c);
                    return (
                      <button key={c} onClick={() => toggleConcern(c)} style={{ ...card(sel), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}>
                        <p style={{ fontWeight: 500, color: sel ? C.goldDeep : C.warm, fontSize: '14px' }}>{c}</p>
                        {sel && <Checkmark />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        {step !== 3 && (
          <div style={{ paddingTop: '28px' }}>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                width: '100%', height: '56px', borderRadius: '16px', fontSize: '15px',
                fontWeight: 700, border: 'none',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                background: canProceed() ? C.ink : C.surfaceAlt,
                color: canProceed() ? C.bg : C.dim,
                boxShadow: canProceed() ? '0 4px 18px rgba(28,28,28,0.18)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {step === TOTAL_SCREENS - 1 ? "Let's go →" : 'Continue'}
            </button>

            {/* Gold accent line under button */}
            {canProceed() && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <div style={{ width: '32px', height: '2px', borderRadius: '2px', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})` }} />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;