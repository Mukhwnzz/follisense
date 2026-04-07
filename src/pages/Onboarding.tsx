import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, HelpCircle, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Camera, ImagePlus, X, Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:           '#FAF8F5',
  card:         '#FFFFFF',
  cardBorder:   '#E8DED1',
  cardFill:     '#D4A866',
  cardFillText: '#FFFFFF',
  cardBorderSel:'#B8893E',
  ink:          '#1C1C1C',
  heading:      '#4A4540',
  gold:         '#D4A866',
  goldDeep:     '#B8893E',
  gold10:       'rgba(212,168,102,0.10)',
  goldBorder:   'rgba(212,168,102,0.30)',
  muted:        '#999999',
  warm:         '#666666',
  mid:          '#E8DED1',
};

const dm = "'DM Sans', sans-serif";

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
  { id: 'unsure', label: 'Not sure', desc: "That's okay. We'll use the most inclusive settings" },
];

interface SubTypeOption { id: string; label: string; }
const subTypes: Record<string, SubTypeOption[]> = {
  type4: [{ id: '4a', label: '4A' }, { id: '4b', label: '4B' }, { id: '4c', label: '4C' }, { id: 'mixed', label: 'Mixed' }, { id: 'not-sure', label: 'Not sure' }],
  type3: [{ id: '3a', label: '3A' }, { id: '3b', label: '3B' }, { id: '3c', label: '3C' }, { id: 'mixed', label: 'Mixed' }, { id: 'not-sure', label: 'Not sure' }],
};

const femaleStyleOptions = ['Braids', 'Locs', 'Twists', 'Twist out', 'Wig', 'Weave', 'Silk press', 'Blow out', 'Loose natural', 'Wash and go', 'Cornrows', 'Other'];
const maleStyleOptions   = ['Low cut / fade', 'Waves', 'Locs', 'Twists', 'Cornrows', 'Afro', 'Bald / shaved', 'Other'];
const protectiveFreqOptions = ['Most of the time', 'Sometimes', 'Rarely', 'Never'];
const cycleLengthOptions    = ['1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks', 'Longer than 8 weeks', 'It varies'];
const betweenWashOptions    = ['Nothing', 'Oil my scalp', 'Use a scalp spray or tonic', 'Rinse with water only', 'Other'];
const concernOptions        = ['Itching', 'Flaking', 'Thinning', 'Tenderness', 'Breakage', 'Dryness', 'I just want to stay on top of things', 'Not sure'];

interface CapturedPhoto { area: string; dataUrl: string; }

const PHOTO_AREAS = [
  { id: 'hairline', label: 'Hairline / edges', tip: 'Face camera towards your hairline, especially at the temples.' },
  { id: 'nape',     label: 'Nape',             tip: 'Photograph the back of your neck hairline.' },
  { id: 'crown',    label: 'Crown / top',       tip: 'Part your hair and photograph the scalp at the crown.' },
];

const TOTAL_SCREENS = 5;

// ─── SHARED STYLE HELPERS ────────────────────────────────────────────────────
const card = (selected: boolean): React.CSSProperties => ({
  width: '100%', textAlign: 'left', padding: '13px 15px', borderRadius: 14,
  border: `1.5px solid ${selected ? C.cardBorderSel : C.cardBorder}`,
  background: selected ? C.cardFill : C.card,
  cursor: 'pointer', transition: 'all 0.18s',
  boxShadow: selected ? '0 3px 12px rgba(212,168,102,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
  display: 'block', fontFamily: dm,
});

const pill = (selected: boolean): React.CSSProperties => ({
  padding: '9px 16px', borderRadius: 100, fontSize: 13, fontFamily: dm, fontWeight: 500,
  border: `1.5px solid ${selected ? C.cardBorderSel : C.cardBorder}`,
  background: selected ? C.cardFill : C.card,
  color: selected ? C.cardFillText : C.warm,
  cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' as const,
  boxShadow: selected ? '0 2px 8px rgba(212,168,102,0.25)' : 'none',
});

// ─── CURL ICON ────────────────────────────────────────────────────────────────
const CurlIcon = ({ type, selected }: { type: string; selected: boolean }) => {
  const color = selected ? '#FFFFFF' : C.muted;
  if (type === 'unsure') return <HelpCircle size={17} color={color} strokeWidth={1.5} />;
  if (type === 'type3')  return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 20 C10 8, 14 24, 18 12 C20 6, 24 18, 24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>;
  if (type === 'type4')  return <svg width="20" height="20" viewBox="0 0 28 28"><path d="M6 14 L7 10 L9 16 L10 10 L12 16 L13 10 L15 16 L16 10 L18 16 L19 10 L21 16 L22 10 L24 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return null;
};

// ─── TAP-TO-REVEAL PHOTO GALLERY ─────────────────────────────────────────────
const PhotoGallery = ({ photos }: { photos: { src: string; label: string }[] }) => {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;
  if (photos.length === 1) return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
      style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.cardBorder}` }}>
      <img src={photos[0].src} alt={photos[0].label} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', padding: '6px', background: '#F5F0EB' }}>{photos[0].label}</p>
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
      style={{ marginTop: 10, position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.cardBorder}` }}>
      <img src={photos[idx].src} alt={photos[idx].label} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', padding: '6px', background: '#F5F0EB' }}>{photos[idx].label}</p>
      {[{ side: 'left', fn: () => setIdx(i => (i - 1 + photos.length) % photos.length), Icon: ChevronLeft },
        { side: 'right', fn: () => setIdx(i => (i + 1) % photos.length), Icon: ChevronRight }].map(({ side, fn, Icon }) => (
        <button key={side} onClick={e => { e.stopPropagation(); fn(); }}
          style={{ position: 'absolute', [side]: 8, top: 95, transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon size={13} color={C.goldDeep} />
        </button>
      ))}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
        {photos.map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? C.goldDeep : 'rgba(184,137,62,0.3)' }} />)}
      </div>
    </motion.div>
  );
};

// ─── PHOTO CAPTURE STEP ───────────────────────────────────────────────────────
const PhotoCaptureStep = ({
  photos, onAdd, onRemove,
}: { photos: CapturedPhoto[]; onAdd: (p: CapturedPhoto) => void; onRemove: (i: number) => void }) => {
  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [activeArea, setActiveArea] = useState(PHOTO_AREAS[0].id);

  const handleFile = (file: File, area: string) => {
    const reader = new FileReader();
    reader.onload = e => { if (e.target?.result) onAdd({ area, dataUrl: e.target.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, area: string) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, area);
    e.target.value = '';
  };

  const activeAreaData = PHOTO_AREAS.find(a => a.id === activeArea)!;

  return (
    <div>
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleInput(e, activeArea)} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleInput(e, activeArea)} />

      {/* Area tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {PHOTO_AREAS.map(a => (
          <button key={a.id} onClick={() => setActiveArea(a.id)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 12, fontFamily: dm, fontSize: 11, fontWeight: 600,
            border: `1.5px solid ${activeArea === a.id ? C.cardBorderSel : C.cardBorder}`,
            background: activeArea === a.id ? C.cardFill : C.card,
            color: activeArea === a.id ? '#fff' : C.warm,
            cursor: 'pointer', transition: 'all 0.18s', textAlign: 'center',
          }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Tip */}
      <div style={{ background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 13, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
        <p style={{ fontFamily: dm, fontSize: 12, color: C.goldDeep, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{activeAreaData.tip}</p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Take photo', sub: 'Use camera', icon: <Camera size={20} color={C.goldDeep} strokeWidth={1.5} />, action: () => cameraRef.current?.click() },
          { label: 'From gallery', sub: 'Choose existing', icon: <ImagePlus size={20} color={C.goldDeep} strokeWidth={1.5} />, action: () => galleryRef.current?.click() },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '18px 12px', background: C.card, border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.cardBorderSel)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.cardBorder)}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.gold10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {btn.icon}
            </div>
            <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading }}>{btn.label}</span>
            <span style={{ fontFamily: dm, fontSize: 11, color: C.muted }}>{btn.sub}</span>
          </button>
        ))}
      </div>

      {/* Previews */}
      {photos.length > 0 && (
        <div>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>
            Added · {photos.length} photo{photos.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${C.cardBorder}` }}>
                <img src={p.dataUrl} alt={p.area} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 7px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                  <span style={{ fontFamily: dm, fontSize: 9, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.area}</span>
                </div>
                <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(28,28,28,0.75)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setOnboardingComplete } = useApp();

  const [step, setStep]           = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const gender    = onboardingData.gender;
  const isMale    = gender === 'man';
  const isNeutral = gender === 'prefer-not-to-say';

  const [hairType, setHairType]       = useState(onboardingData.hairType || '');
  const [hairSubType, setHairSubType] = useState('');
  const [showSubType, setShowSubType] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const [chemicalStatus] = useState(onboardingData.chemicalProcessing || '');
  const [styles, setStyles]                 = useState<string[]>(onboardingData.protectiveStyles || []);
  const [otherStyle, setOtherStyle]         = useState(onboardingData.otherStyle || '');
  const [protectiveFreq, setProtectiveFreq] = useState(onboardingData.protectiveStyleFrequency || '');
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const [cycleLength, setCycleLength]       = useState(onboardingData.cycleLength || '');
  const [betweenWash, setBetweenWash]       = useState<string[]>(onboardingData.betweenWashCare || []);
  const [otherBetweenWash, setOtherBetweenWash] = useState(onboardingData.otherBetweenWashCare || '');
  const [concerns, setConcerns]             = useState<string[]>(onboardingData.goals || []);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const rawStyleOptions = isMale ? maleStyleOptions : isNeutral ? [...new Set([...femaleStyleOptions, ...maleStyleOptions])] : femaleStyleOptions;

  const toggleStyle       = (s: string) => setStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleBetweenWash = (v: string) => {
    if (v === 'Nothing') { setBetweenWash(p => p.includes(v) ? [] : [v]); return; }
    setBetweenWash(p => { const w = p.filter(x => x !== 'Nothing'); return w.includes(v) ? w.filter(x => x !== v) : [...w, v]; });
  };
  const toggleConcern = (c: string) => setConcerns(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const canProceed = () => {
    if (step === 0) return !!hairType;
    if (step === 1) return styles.length > 0 && (!styles.includes('Other') || otherStyle.trim().length > 0) && !!protectiveFreq;
    if (step === 2) return !!cycleLength && betweenWash.length > 0 && (!betweenWash.includes('Other') || otherBetweenWash.trim().length > 0);
    if (step === 3) return concerns.length > 0;
    if (step === 4) return true; // photos optional
    return false;
  };

  const handleNext = async () => {
    if (step < TOTAL_SCREENS - 1) { setStep(s => s + 1); return; }

    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No session found. Please log in again.');

      const effectiveHairType = hairSubType || hairType;
      const finalStyles       = styles.includes('Other') ? [...styles.filter(s => s !== 'Other'), otherStyle.trim()] : styles;
      const finalBetweenWash  = betweenWash.includes('Other') ? [...betweenWash.filter(b => b !== 'Other'), otherBetweenWash.trim()] : betweenWash;

      // 1. Save consumer profile
      const { error: saveError } = await supabase
        .from('consumer_profiles')
        .upsert({
          user_id:                    session.user.id,
          gender:                     gender || null,
          hair_texture:               effectiveHairType,
          current_styles:             finalStyles,
          protective_style_frequency: protectiveFreq || null,
          style_duration:             cycleLength || null,
          between_wash_care:          finalBetweenWash,
          between_wash_other:         betweenWash.includes('Other') ? otherBetweenWash.trim() : null,
          top_concerns:               concerns,
          chemical_processing:        chemicalStatus || null,
          current_style_start_date:   new Date().toISOString().split('T')[0],
          updated_at:                 new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (saveError) throw saveError;

      // 2. Save baseline photos if any were captured
      if (capturedPhotos.length > 0) {
        const result = await createCheckinWithPhotos({
          userId:     session.user.id,
          type:       'baseline',
          symptoms:   {},
          isBaseline: true,
          photos:     capturedPhotos.map(p => ({ dataUrl: p.dataUrl, area: p.area })),
        });

        if (!result.success) {
          // Non-fatal — log but don't block onboarding completion
          console.warn('Baseline photo upload partial failure:', result.error);
        }
      }

      // 3. Update local context and navigate
      setOnboardingData({
        ...onboardingData,
        hairType: effectiveHairType,
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

    } catch (err ) {
      console.error('Onboarding save error:', err);
      toast({ title: 'Could not save your profile', description: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); else navigate(-1); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 16px 60px', fontFamily: dm }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 520 }}>

        <div style={{ backgroundColor: C.card, borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)', padding: '24px 28px 28px', display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={handleBack} style={{ padding: 8, marginLeft: -8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={22} strokeWidth={1.8} color={C.ink} />
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
                <div key={i} style={{ height: 4, width: i === step ? 22 : 7, borderRadius: 100, background: i < step ? C.gold : i === step ? C.ink : C.cardBorder, transition: 'all 0.3s ease' }} />
              ))}
            </div>
            <span style={{ fontFamily: dm, fontSize: 11, color: C.muted, fontWeight: 600 }}>{step + 1} / {TOTAL_SCREENS}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              style={{ paddingBottom: 24 }}>

              {/* ── Step 1: Hair Texture ── */}
              {step === 0 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 1 — Hair texture</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>What's your hair texture?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Type 4 coils are tighter than a pen spring. Type 3 curls wrap around a finger.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hairTypes.map(ht => {
                      const sel = hairType === ht.id;
                      const photos = ht.id !== 'unsure' && hairPhotos[ht.id]
                        ? isNeutral ? [...(hairPhotos[ht.id].female || []), ...(hairPhotos[ht.id].male || [])]
                          : isMale ? hairPhotos[ht.id].male || [] : hairPhotos[ht.id].female || []
                        : [];
                      const photoOpen = expandedPhoto === ht.id;

                      return (
                        <div key={ht.id} style={card(sel)}>
                          <button onClick={() => { setHairType(ht.id); setHairSubType(''); setShowSubType(false); }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: sel ? 'rgba(255,255,255,0.2)' : '#F5F0EB', border: `1px solid ${sel ? 'rgba(255,255,255,0.3)' : C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CurlIcon type={ht.id} selected={sel} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: sel ? '#fff' : C.heading, marginBottom: 2 }}>{ht.label}</p>
                                <p style={{ fontFamily: dm, fontSize: 11, color: sel ? 'rgba(255,255,255,0.75)' : C.muted, lineHeight: 1.45 }}>{ht.desc}</p>
                              </div>
                              {sel && (
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                </div>
                              )}
                            </div>
                          </button>

                          {photos.length > 0 && (
                            <button onClick={e => { e.stopPropagation(); setExpandedPhoto(photoOpen ? null : ht.id); }}
                              style={{ width: '100%', marginTop: 10, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: dm, fontSize: 11, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.85)' : C.goldDeep }}>
                              {photoOpen ? <><ChevronUp size={13} /> Hide examples</> : <><ChevronDown size={13} /> See examples</>}
                            </button>
                          )}
                          <AnimatePresence>
                            {photoOpen && <PhotoGallery photos={photos} />}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {(hairType === 'type3' || hairType === 'type4') && !showSubType && (
                    <button onClick={() => setShowSubType(true)} style={{ marginTop: 14, fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      Want to be more specific? <ChevronDown size={13} />
                    </button>
                  )}
                  {showSubType && subTypes[hairType] && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 10 }}>Which sub-type?</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {subTypes[hairType].map(st => <button key={st.id} onClick={() => setHairSubType(st.id)} style={pill(hairSubType === st.id)}>{st.label}</button>)}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 2: Styles ── */}
              {step === 1 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 2 — Your styles</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>How do you usually wear your hair?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Select everything you rotate between</p>

                  {(() => {
                    const defaultCount = isMale ? 6 : 8;
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {rawStyleOptions.slice(0, defaultCount).map(s => (
                            <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '13px 10px' }}>
                              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: styles.includes(s) ? '#fff' : C.warm, lineHeight: 1.35, margin: 0 }}>{s}</p>
                            </button>
                          ))}
                        </div>
                        {rawStyleOptions.length > defaultCount && !showMoreStyles && (
                          <button onClick={() => setShowMoreStyles(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, marginTop: 10, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                            Show more styles <ChevronDown size={14} />
                          </button>
                        )}
                        {showMoreStyles && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            {rawStyleOptions.slice(defaultCount).map(s => (
                              <button key={s} onClick={() => toggleStyle(s)} style={{ ...card(styles.includes(s)), textAlign: 'center', padding: '13px 10px' }}>
                                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: styles.includes(s) ? '#fff' : C.warm, lineHeight: 1.35, margin: 0 }}>{s}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {styles.includes('Other') && (
                    <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe your style"
                      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${C.cardBorder}`, background: C.card, fontFamily: dm, fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box', marginTop: 8 }} />
                  )}

                  {styles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>How often are you in protective styles?</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {protectiveFreqOptions.map(o => <button key={o} onClick={() => setProtectiveFreq(o)} style={pill(protectiveFreq === o)}>{o}</button>)}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 3: Routine ── */}
              {step === 2 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 3 — Your routine</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Your wash routine</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>This is how we time your check-ins to your actual routine.</p>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>How long do you usually keep a style in?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                    {cycleLengthOptions.map(o => <button key={o} onClick={() => setCycleLength(o)} style={pill(cycleLength === o)}>{o}</button>)}
                  </div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 12 }}>What do you do for your scalp between washes?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {betweenWashOptions.map(o => <button key={o} onClick={() => toggleBetweenWash(o)} style={pill(betweenWash.includes(o))}>{o}</button>)}
                  </div>
                  {betweenWash.includes('Other') && (
                    <input type="text" value={otherBetweenWash} onChange={e => setOtherBetweenWash(e.target.value)} placeholder="What else do you do?"
                      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${C.cardBorder}`, background: C.card, fontFamily: dm, fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box', marginTop: 8 }} />
                  )}
                </div>
              )}

              {/* ── Step 4: Concerns ── */}
              {step === 3 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 4 — What matters</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>What matters most right now?</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Select all that apply — this shapes your check-in focus.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {concernOptions.map(c => {
                      const sel = concerns.includes(c);
                      return (
                        <button key={c} onClick={() => toggleConcern(c)} style={{ ...card(sel), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: sel ? '#fff' : C.warm, margin: 0 }}>{c}</p>
                          {sel && (
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Step 5: Baseline Photos ── */}
              {step === 4 && (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Step 5 — Baseline photos</p>
                  <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Capture your baseline</h2>
                  <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.6 }}>
                    Photos of your hairline and nape help us track changes over time. You can always add these later.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 100, marginBottom: 20 }}>
                    <Sparkles size={11} color={C.goldDeep} />
                    <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.goldDeep, letterSpacing: '0.03em' }}>Saved to your profile & analysed over time</span>
                  </div>
                  <PhotoCaptureStep
                    photos={capturedPhotos}
                    onAdd={p => setCapturedPhotos(prev => [...prev, p])}
                    onRemove={i => setCapturedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  />
                  <button onClick={handleNext} style={{ width: '100%', textAlign: 'center', fontFamily: dm, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0 0' }}>
                    {capturedPhotos.length > 0 ? 'Or skip for now' : 'Skip for now →'}
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ── CTA ── */}
          {step !== 4 && (
            <div style={{ paddingTop: 8 }}>
              <button onClick={handleNext} disabled={!canProceed() || isLoading} style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                fontFamily: dm, fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
                cursor: canProceed() && !isLoading ? 'pointer' : 'not-allowed',
                background: canProceed() && !isLoading ? C.ink : C.cardBorder,
                color: canProceed() && !isLoading ? '#fff' : C.muted,
                transition: 'all 0.2s ease',
                boxShadow: canProceed() && !isLoading ? '0 4px 14px rgba(28,28,28,0.2)' : 'none',
              }}>
                {isLoading ? 'Saving…' : 'Continue'}
              </button>
            </div>
          )}

          {/* Photos step — gold CTA when photos added */}
          {step === 4 && capturedPhotos.length > 0 && (
            <div style={{ paddingTop: 12 }}>
              <button onClick={handleNext} disabled={isLoading} style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                fontFamily: dm, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: C.ink, color: '#fff',
                boxShadow: '0 4px 14px rgba(28,28,28,0.2)',
              }}>
                {isLoading ? 'Uploading…' : `Save ${capturedPhotos.length} photo${capturedPhotos.length > 1 ? 's' : ''} & finish →`}
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;