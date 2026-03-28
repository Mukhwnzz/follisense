import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, Shield, Trash2, Leaf, Heart, Camera, RefreshCw, Target, Check,
  Microscope, Eye, EyeOff, Lock, Sparkles, Pencil, ChevronDown, Droplets, Scissors,
  FlaskConical, Activity, Info, Bell
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductSearch from '@/components/ProductSearch';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg:         '#FFFFFF',
  surface:    '#F8F8F8',
  ink:        '#1C1C1C',
  gold:       '#D4A866',
  goldDeep:   '#B8893E',
  gold10:     'rgba(212,168,102,0.10)',
  goldBorder: 'rgba(212,168,102,0.22)',
  mid:        '#EBEBEB',
  muted:      '#999999',
  warm:       '#666666',
  white:      '#FFFFFF',
};

const goalOptions = [
  'Protect my edges / grow my hairline back',
  'Reduce scalp irritation or itching',
  'Understand my hair loss or thinning',
  'Build a consistent scalp care routine',
  'Monitor my scalp between salon visits',
  'Recover from damage (chemical, heat, or traction)',
  'General scalp and hair health',
  "I'm not sure yet — just exploring",
];

const hairTypeLabels: Record<string, string> = {
  'type3': 'Type 3 — Curly', 'type4': 'Type 4 — Coily',
  '3b': '3b — Wide, springy curls', '3c': '3c — Tight, corkscrew curls',
  '4a': '4a — Soft, defined coils', '4b': '4b — Z-shaped, tightly coiled',
  '4c': '4c — Very tight, densely packed coils', 'unsure': 'Not sure yet',
};

// ── Section wrapper ──────────────────────────────────────────────────────────
const ProfileSection = ({
  title, icon: Icon, children, defaultOpen = false, onEdit, editing, onSave, onCancel, editLabel,
}: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
  editLabel?: string; onEdit?: () => void; editing?: boolean; onSave?: () => void; onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'none', border: 'none',
          borderBottom: open ? 'none' : `1px solid ${C.mid}`, cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: C.gold10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={C.goldDeep} strokeWidth={1.8} />
          </div>
          <span style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: C.ink }}>{title}</span>
        </div>
        <ChevronDown size={14} color={C.muted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderBottom: `1px solid ${C.mid}` }}
          >
            {onEdit && !editing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button onClick={onEdit} style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Pencil size={11} /> {editLabel || 'Edit'}
                </button>
              </div>
            )}
            {editing && onSave && onCancel && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 8 }}>
                <button onClick={onCancel} style={{ fontFamily: dm, fontSize: 12, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onSave} style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
              </div>
            )}
            <div style={{ paddingBottom: 12 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '10px 0', gap: 12, borderBottom: `1px solid rgba(235,235,235,0.8)`,
  }}>
    <span style={{ fontFamily: dm, fontSize: 12, color: C.muted, flexShrink: 0 }}>{label}</span>
    <span style={{ fontFamily: dm, fontSize: 13, color: C.ink, textAlign: 'right', maxWidth: 220 }}>{value}</span>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '16px 0 8px' }}>{children}</p>
);

// ── Notification toggle row ──────────────────────────────────────────────────
const NotifRow = ({ label, desc, active, onToggle }: { label: string; desc: string; active: boolean; onToggle: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0', lineHeight: 1.45 }}>{desc}</p>
    </div>
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 100, border: 'none', flexShrink: 0,
        background: active ? C.gold : C.mid,
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: C.white,
        position: 'absolute', top: 3, left: active ? 22 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </button>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    userName, onboardingData, setOnboardingData, resetAll,
    baselinePhotos, setBaselinePhotos, baselineRisk, baselineDate,
    healthProfile, research, setResearch,
  } = useApp();

  const [notifications, setNotifications] = useState({
    dailyTip: true, midCycle: true, washDay: false, washApproaching: false, productReminders: false, weeklySummary: false,
  });
  const [showAllNotifs, setShowAllNotifs]       = useState(false);
  const [showGoalEditor, setShowGoalEditor]     = useState(false);
  const [editGoals, setEditGoals]               = useState<string[]>(onboardingData.goals || []);
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showCurrentPw, setShowCurrentPw]       = useState(false);
  const [showNewPw, setShowNewPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw]       = useState(false);
  const [preferredStylist, setPreferredStylist] = useState('');
  const [preferredSalon, setPreferredSalon]     = useState('');
  const [bookingMethod, setBookingMethod]       = useState('');
  const [salonContact, setSalonContact]         = useState('');

  const isMale = onboardingData.gender === 'man';

  const allNotifOptions = isMale ? [
    { key: 'dailyTip'         as const, label: 'Daily scalp care tip',          desc: 'A quick tip to help your scalp health between check-ins' },
    { key: 'midCycle'         as const, label: 'Check-in reminder',              desc: "We'll nudge you when it's time for your next scalp check" },
    { key: 'washDay'          as const, label: 'Wash day reminder',              desc: "A heads-up when it's time to wash" },
    { key: 'productReminders' as const, label: 'Product reminders',              desc: 'Reminders to apply scalp treatments based on your routine' },
    { key: 'weeklySummary'    as const, label: 'Weekly scalp health summary',    desc: 'A quick recap of your scalp activity this week' },
  ] : [
    { key: 'dailyTip'         as const, label: 'Daily scalp care tip',          desc: 'A quick tip to help your scalp health between check-ins' },
    { key: 'midCycle'         as const, label: 'Mid-cycle check-in reminder',   desc: "We'll nudge you when it's time for your quick check" },
    { key: 'washDay'          as const, label: 'Wash day reminder',              desc: "A heads-up when your wash day is approaching" },
    { key: 'washApproaching'  as const, label: 'Wash day approaching',          desc: 'Reminder 2 days before your expected wash day' },
    { key: 'productReminders' as const, label: 'Product reminders',              desc: 'Reminders to apply scalp treatments or oils' },
    { key: 'weeklySummary'    as const, label: 'Weekly scalp health summary',    desc: 'A quick recap of your scalp activity this week' },
  ];

  // Show first 2 always, rest behind "Show more"
  const visibleNotifs = showAllNotifs ? allNotifOptions : allNotifOptions.slice(0, 2);

  const handleDelete        = () => { resetAll(); navigate('/'); };
  const handleRetakePhoto   = (area: string) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos(baselinePhotos.map(p => p.area === area ? { ...p, date: today } : p));
  };
  const handleAddBaseline   = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos([
      { area: 'Hairline — temples and edges', captured: true, date: today },
      { area: 'Crown and vertex', captured: true, date: today },
    ]);
  };
  const toggleEditGoal      = (g: string) =>
    setEditGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : prev.length >= 3 ? prev : [...prev, g]);
  const saveGoals           = () => { setOnboardingData({ ...onboardingData, goals: editGoals }); setShowGoalEditor(false); };
  const toggleMenstrual     = () => {
    const newVal = onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'No thanks' : "Yes, I'd like to track";
    setOnboardingData({ ...onboardingData, menstrualTracking: newVal });
  };

  const hpSections = [
    { key: 'scalp',   complete: !!(healthProfile.sweat && healthProfile.exercise && healthProfile.heatStyling && healthProfile.satinCovering) },
    { key: 'medical', complete: !!(healthProfile.medicalConditions.length > 0 && healthProfile.pregnancyStatus && healthProfile.medications) },
    { key: 'blood',   complete: !!healthProfile.lastBloodTest },
    { key: 'skin',    complete: !!(healthProfile.skinConditions.length > 0 && healthProfile.sensitiveSkin) },
    { key: 'hair',    complete: !!(healthProfile.previousHairLoss && healthProfile.diagnosedCondition && healthProfile.familyHistory) },
  ];
  const hpCompleted = hpSections.filter(s => s.complete).length;

  const chemDisplay = (() => {
    if (!onboardingData.chemicalProcessing) return 'Not set';
    if (['Never', 'No, fully natural'].includes(onboardingData.chemicalProcessing)) return onboardingData.chemicalProcessing;
    return onboardingData.chemicalProcessingMultiple?.length > 0
      ? onboardingData.chemicalProcessingMultiple.join(', ')
      : onboardingData.chemicalProcessing;
  })();

  const betweenWashDisplay = onboardingData.betweenWashCare?.length > 0
    ? onboardingData.betweenWashCare.join(', ') + (onboardingData.otherBetweenWashCare ? `, ${onboardingData.otherBetweenWashCare}` : '')
    : 'Not set';

  const riskColor = (r: string | null) =>
    r === 'green' ? '#5A9A50' : r === 'amber' ? C.gold : r === 'red' ? '#B05040' : C.muted;

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42, padding: '0 14px',
    borderRadius: 12, border: `1.5px solid ${C.mid}`,
    background: C.surface, fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: dm, color: C.ink,
  };

  return (
    <div style={{ fontFamily: dm, background: C.bg, paddingBottom: 120 }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          background: C.ink, padding: '52px 20px 32px',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(212,168,102,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: C.gold10, border: `1.5px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={24} color={C.gold} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>FolliSense</span>
              </div>
              <h1 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: '#f5f5f5', margin: 0, lineHeight: 1.15 }}>
                {userName || 'Your profile'}
              </h1>
              {onboardingData.gender && (
                <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>
                  {onboardingData.gender === 'woman' ? 'Female' : onboardingData.gender === 'man' ? 'Male' : 'Prefer not to say'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sections ───────────────────────────────────────────────────── */}
        <div style={{ padding: '8px 20px 0' }}>

          {/* ═══ Account ═══ */}
          <ProfileSection title="Account" icon={User} defaultOpen>
            <InfoRow label="First name" value={userName || 'Not set'} />
            <InfoRow label="Gender" value={
              onboardingData.gender === 'woman' ? 'Female'
                : onboardingData.gender === 'man' ? 'Male'
                  : onboardingData.gender === 'prefer-not-to-say' ? 'Prefer not to say' : 'Not set'
            } />

            {/* Notifications — first 2 + expandable */}
            <SectionLabel>Notifications</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 10 }}>
              {visibleNotifs.map(item => (
                <NotifRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  active={notifications[item.key]}
                  onToggle={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                />
              ))}
            </div>
            {/* Show more / less */}
            <button
              onClick={() => setShowAllNotifs(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep,
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 10px',
              }}
            >
              <ChevronDown size={13} color={C.goldDeep} style={{ transform: showAllNotifs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {showAllNotifs ? 'Show fewer' : `Show ${allNotifOptions.length - 2} more`}
            </button>

            {/* Data & Research */}
            <SectionLabel>Data & Research</SectionLabel>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, margin: 0, flex: 1 }}>Contribute anonymised data to scalp health research</p>
                <Switch
                  checked={research.consented}
                  onCheckedChange={checked => setResearch({ ...research, consented: checked, consentDate: checked ? new Date().toISOString() : null })}
                />
              </div>
              <Collapsible>
                <CollapsibleTrigger style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Info size={11} /> Learn more
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, lineHeight: 1.55, marginTop: 6 }}>
                    Your anonymised check-in patterns help improve scalp health understanding. No photos or personal details are shared without explicit consent.
                  </p>
                </CollapsibleContent>
              </Collapsible>
              {research.consented && research.photoCount > 0 && (
                <p style={{ fontFamily: dm, fontSize: 11, color: C.goldDeep, fontWeight: 600, marginTop: 6 }}>You've contributed {research.photoCount} photo{research.photoCount !== 1 ? 's' : ''}.</p>
              )}
            </div>

            {/* Privacy note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: C.gold10, border: `1px solid ${C.goldBorder}`, marginBottom: 12 }}>
              <Shield size={14} color={C.goldDeep} strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: dm, fontSize: 11, color: C.warm, margin: 0, lineHeight: 1.55 }}>
                Your data personalises your experience. Nothing is shared without permission. Photos stay on your device.
              </p>
            </div>

            {/* Actions */}
            {[{ label: 'Export my data', action: () => toast({ title: 'Coming soon', description: 'Data export will be available in a future update.' }) }].map(item => (
              <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', borderTop: `1px solid ${C.mid}`, cursor: 'pointer' }}>
                <span style={{ fontFamily: dm, fontSize: 13, color: C.ink }}>{item.label}</span>
                <ChevronRight size={14} color={C.mid} />
              </button>
            ))}

            <button onClick={() => setShowChangePassword(!showChangePassword)} style={{ width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderTop: `1px solid ${C.mid}`, cursor: 'pointer' }}>
              <Lock size={13} color={C.goldDeep} strokeWidth={1.6} />
              <span style={{ fontFamily: dm, fontSize: 13, color: C.ink, flex: 1, textAlign: 'left' }}>Change password</span>
              <ChevronRight size={14} color={C.mid} />
            </button>

            {showChangePassword && (
              <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Current password', val: currentPassword, set: setCurrentPassword, show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                  { label: 'New password',      val: newPassword,     set: setNewPassword,     show: showNewPw,     toggle: () => setShowNewPw(p => !p) },
                  { label: 'Confirm new',       val: confirmPassword, set: setConfirmPassword, show: showConfirmPw, toggle: () => setShowConfirmPw(p => !p) },
                ].map(f => (
                  <div key={f.label} style={{ position: 'relative' }}>
                    <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input type={f.show ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)} style={{ ...inputStyle, paddingRight: 42 }} />
                    <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 12, bottom: 11, background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => { toast({ title: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(false); }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  style={{
                    height: 44, borderRadius: 14, border: 'none', fontFamily: dm, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    background: currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? C.ink : C.mid,
                    color: currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? '#f5f5f5' : C.muted,
                  }}
                >
                  Update password
                </button>
              </div>
            )}

            <button onClick={handleDelete} style={{ width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderTop: `1px solid ${C.mid}`, cursor: 'pointer' }}>
              <Trash2 size={13} color="#B05040" strokeWidth={1.6} />
              <span style={{ fontFamily: dm, fontSize: 13, color: '#B05040' }}>Delete all data</span>
            </button>
          </ProfileSection>

          {/* ═══ Your Hair ═══ */}
          <ProfileSection title="Your Hair" icon={Scissors}>
            <InfoRow label="Hair type" value={hairTypeLabels[onboardingData.hairType] || onboardingData.hairType || 'Not set'} />
            <InfoRow label="How you wear your hair" value={onboardingData.protectiveStyles?.length > 0 ? onboardingData.protectiveStyles.join(', ') : 'Not set'} />
            {!isMale && onboardingData.protectiveStyleFrequency && <InfoRow label="How often in protective styles" value={onboardingData.protectiveStyleFrequency} />}
            {isMale && onboardingData.maleStyleFrequency && <InfoRow label="Style frequency" value={onboardingData.maleStyleFrequency} />}
            {isMale && onboardingData.barberFrequency && <InfoRow label="Barber frequency" value={onboardingData.barberFrequency} />}
          </ProfileSection>

          {/* ═══ Hair History ═══ */}
          <ProfileSection title="Hair History" icon={FlaskConical} editLabel={showChemicalEditor ? 'Done' : 'Edit'} onEdit={() => setShowChemicalEditor(true)} editing={showChemicalEditor} onSave={saveChemical} onCancel={() => setShowChemicalEditor(false)}>
            {!showChemicalEditor ? (
              <>
                <InfoRow label="Chemical processing" value={chemDisplay} />
                {onboardingData.lastChemicalTreatment && <InfoRow label="Last treatment" value={onboardingData.lastChemicalTreatment} />}
                {onboardingData.chemicalBrand && <InfoRow label="Brand" value={onboardingData.chemicalBrand === 'Other' ? (onboardingData.chemicalBrandOther || 'Other') : onboardingData.chemicalBrand} />}
                {onboardingData.chemicalFrequency && <InfoRow label="How often" value={onboardingData.chemicalFrequency} />}
              </>
            ) : (
              <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Processing status */}
                <div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Chemical processing</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['No, fully natural', 'Yes currently', 'Previously but growing out', 'Not sure'].map(opt => (
                      <button key={opt} onClick={() => setEditChemStatus(opt)} style={{
                        padding: '8px 14px', borderRadius: 20, fontSize: 12, fontFamily: dm, fontWeight: 500, cursor: 'pointer',
                        border: `1.5px solid ${editChemStatus === opt ? '#7fa896' : C.mid}`,
                        background: editChemStatus === opt ? 'rgba(127,168,150,0.08)' : C.white, color: C.ink,
                      }}>{opt}</button>
                    ))}
                  </div>
                </div>

                {/* Treatment type — only if yes/previously */}
                {(editChemStatus === 'Yes currently' || editChemStatus === 'Previously but growing out') && (
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Type of treatment</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Relaxed', 'Texturised', 'Colour', 'Bleach', 'Keratin treatment'].map(t => (
                        <button key={t} onClick={() => setEditChemTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 12, fontFamily: dm, fontWeight: 500, cursor: 'pointer',
                          border: `1.5px solid ${editChemTypes.includes(t) ? '#7fa896' : C.mid}`,
                          background: editChemTypes.includes(t) ? 'rgba(127,168,150,0.08)' : C.white, color: C.ink,
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand — only if actively processed */}
                {(editChemStatus === 'Yes currently' || editChemStatus === 'Previously but growing out') && editChemTypes.length > 0 && (
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Which brand do you use?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {chemicalBrandOptions.map(b => (
                        <button key={b} onClick={() => { setEditChemBrand(b); if (b !== 'Other') setEditChemBrandOther(''); }} style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 12, fontFamily: dm, fontWeight: 500, cursor: 'pointer',
                          border: `1.5px solid ${editChemBrand === b ? '#7fa896' : C.mid}`,
                          background: editChemBrand === b ? 'rgba(127,168,150,0.08)' : C.white, color: C.ink,
                        }}>{b}</button>
                      ))}
                    </div>
                    {editChemBrand === 'Other' && (
                      <input type="text" value={editChemBrandOther} onChange={e => setEditChemBrandOther(e.target.value)} placeholder="Enter brand name" style={inputStyle} />
                    )}
                  </div>
                )}

                {/* Frequency — only if actively processed */}
                {(editChemStatus === 'Yes currently') && editChemTypes.length > 0 && (
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>How often?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {chemicalFreqOptions.map(f => (
                        <button key={f} onClick={() => setEditChemFreq(f)} style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 12, fontFamily: dm, fontWeight: 500, cursor: 'pointer',
                          border: `1.5px solid ${editChemFreq === f ? '#7fa896' : C.mid}`,
                          background: editChemFreq === f ? 'rgba(127,168,150,0.08)' : C.white, color: C.ink,
                        }}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ProfileSection>

          {/* ═══ Your Routine ═══ */}
          <ProfileSection title="Your Routine" icon={Droplets} editLabel={showProductEditor ? 'Done' : 'Edit products'} onEdit={() => setShowProductEditor(true)} editing={showProductEditor} onSave={() => setShowProductEditor(false)} onCancel={() => setShowProductEditor(false)}>
            {onboardingData.cycleLength && <InfoRow label="Typical cycle length" value={onboardingData.cycleLength} />}
            <InfoRow label="Wash frequency" value={onboardingData.washFrequency || onboardingData.wornOutWashFrequency || onboardingData.washFrequencyPerCycle || 'Not set'} />
            {isMale && onboardingData.locRetwistFrequency && <InfoRow label="Loc retwist frequency" value={onboardingData.locRetwistFrequency} />}
            {onboardingData.betweenWashCare?.length > 0 && <InfoRow label="Between-wash care" value={betweenWashDisplay} />}
            {!showProductEditor ? (
              <>
                <SectionLabel>Products</SectionLabel>
                <div style={{ marginBottom: 6 }}>
                  <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '0 0 3px' }}>Scalp products</p>
                  <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, margin: 0 }}>
                    {onboardingData.scalpProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").length > 0
                      ? onboardingData.scalpProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").join(', ')
                      : 'No scalp products'}
                  </p>
                </div>
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '0 0 3px' }}>Hair products</p>
                  <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, margin: 0 }}>
                    {onboardingData.hairProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").length > 0
                      ? onboardingData.hairProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").join(', ')
                      : 'No hair products'}
                  </p>
                </div>
              </>
            ) : (
              <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Scalp products</p>
                  <ProductSearch category="scalp" selectedProducts={onboardingData.scalpProducts.filter(p => p !== 'None')} onProductsChange={prods => setOnboardingData({ ...onboardingData, scalpProducts: prods })} />
                </div>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Hair products</p>
                  <ProductSearch category="hair" selectedProducts={onboardingData.hairProducts.filter(p => p !== 'None')} onProductsChange={prods => setOnboardingData({ ...onboardingData, hairProducts: prods })} />
                </div>
              </div>
            )}
            <button onClick={() => navigate('/products')} style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 4px' }}>
              Browse product guide →
            </button>
          </ProfileSection>

          {/* ═══ Your Stylist ═══ */}
          <ProfileSection title="Your Stylist" icon={Scissors}>
            {[
              { label: 'Preferred stylist name (optional)', val: preferredStylist, set: setPreferredStylist, placeholder: 'e.g. Ama' },
              { label: 'Salon name (optional)', val: preferredSalon, set: setPreferredSalon, placeholder: 'e.g. Natural Touch Studio' },
              { label: 'Salon phone or booking link (optional)', val: salonContact, set: setSalonContact, placeholder: 'Phone number or URL' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 8 }}>How do you usually book?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Fresha', 'Booksy', 'Instagram DM', 'WhatsApp', 'Phone call', 'Other'].map(m => (
                  <button key={m} onClick={() => setBookingMethod(m)} style={{
                    padding: '6px 14px', borderRadius: 100, fontFamily: dm, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${bookingMethod === m ? C.gold : C.mid}`,
                    background: bookingMethod === m ? C.gold10 : 'transparent',
                    color: bookingMethod === m ? C.goldDeep : C.muted,
                    transition: 'all 0.15s',
                  }}>{m}</button>
                ))}
              </div>
            </div>
          </ProfileSection>

          {/* ═══ Health ═══ */}
          <ProfileSection title="Health" icon={Activity}>
            <SectionLabel>Baseline Assessment</SectionLabel>
            <InfoRow label="Date" value={baselineDate || 'Not set'} />
            <InfoRow label="Itch" value={onboardingData.baselineItch || 'Not set'} />
            <InfoRow label="Tenderness" value={onboardingData.baselineTenderness || 'Not set'} />
            <InfoRow label="Hairline" value={onboardingData.baselineHairline || 'Not set'} />
            <InfoRow label="Hair health" value={onboardingData.baselineHairHealth || 'Not set'} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(235,235,235,0.8)` }}>
              <span style={{ fontFamily: dm, fontSize: 12, color: C.muted }}>Risk level</span>
              <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: riskColor(baselineRisk) }}>{baselineRisk || 'Not assessed'}</span>
            </div>

            <SectionLabel>Baseline Photos</SectionLabel>
            {baselinePhotos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                {baselinePhotos.map(photo => (
                  <div key={photo.area} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: C.gold10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Camera size={15} color={C.goldDeep} strokeWidth={1.6} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>{photo.area}</p>
                      <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Captured {photo.date}</p>
                    </div>
                    <button onClick={() => handleRetakePhoto(photo.area)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <RefreshCw size={11} strokeWidth={2} /> Retake
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={handleAddBaseline} style={{ width: '100%', padding: 14, borderRadius: 14, border: `1.5px dashed ${C.goldBorder}`, background: C.gold10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 8 }}>
                <Camera size={16} color={C.goldDeep} strokeWidth={1.6} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>Add baseline photos</p>
                  <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Capture your starting point</p>
                </div>
              </button>
            )}

            {!isMale && (
              <>
                <SectionLabel>Menstrual Cycle</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: dm, fontSize: 13, color: C.ink }}>Tracking</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: dm, fontSize: 12, color: C.muted }}>{onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'On' : 'Off'}</span>
                    <button onClick={toggleMenstrual} style={{
                      width: 44, height: 24, borderRadius: 100, border: 'none', flexShrink: 0,
                      background: onboardingData.menstrualTracking === "Yes, I'd like to track" ? C.gold : C.mid,
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: C.white,
                        position: 'absolute', top: 3,
                        left: onboardingData.menstrualTracking === "Yes, I'd like to track" ? 22 : 3,
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </div>
                </div>
                {onboardingData.menstrualTracking === "Yes, I'd like to track" && (
                  <div>
                    {onboardingData.menstrualCycleLength && <InfoRow label="Cycle length" value={onboardingData.menstrualCycleLength} />}
                    {onboardingData.lastPeriodDate && <InfoRow label="Last period" value={onboardingData.lastPeriodDate} />}
                    {onboardingData.hormonalContraception && <InfoRow label="Contraception" value={onboardingData.hormonalContraception} />}
                  </div>
                )}
              </>
            )}

            <button onClick={() => navigate('/health-profile')} style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', borderTop: `1px solid ${C.mid}`, cursor: 'pointer', marginTop: 8 }}>
              <Heart size={15} color={C.goldDeep} strokeWidth={1.6} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>Health Profile — {hpCompleted}/5 complete</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{hpCompleted < 5 ? 'Complete your health profile' : 'Edit health profile'}</p>
              </div>
              <ChevronRight size={14} color={C.mid} />
            </button>

            {/* Goals */}
            <div style={{ borderTop: `1px solid ${C.mid}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <SectionLabel>Goals</SectionLabel>
                {!showGoalEditor && (
                  <button onClick={() => { setEditGoals(onboardingData.goals || []); setShowGoalEditor(true); }} style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.goldDeep, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Pencil size={11} /> Edit
                  </button>
                )}
              </div>
              {!showGoalEditor ? (
                onboardingData.goals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {onboardingData.goals.map(g => (
                      <div key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, flexShrink: 0, marginTop: 5 }} />
                        <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5 }}>{g}</p>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontFamily: dm, fontSize: 13, color: C.muted }}>No goals set yet</p>
              ) : (
                <div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Pick up to 3</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {goalOptions.map(g => (
                      <button key={g} onClick={() => toggleEditGoal(g)} disabled={editGoals.length >= 3 && !editGoals.includes(g)} style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 14,
                        border: `1.5px solid ${editGoals.includes(g) ? C.gold : C.mid}`,
                        background: editGoals.includes(g) ? C.gold10 : 'transparent',
                        cursor: 'pointer', opacity: editGoals.length >= 3 && !editGoals.includes(g) ? 0.4 : 1,
                        fontFamily: dm,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${editGoals.includes(g) ? C.gold : C.mid}`, background: editGoals.includes(g) ? C.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {editGoals.includes(g) && <Check size={10} color={C.white} strokeWidth={2.5} />}
                          </div>
                          <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, margin: 0 }}>{g}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowGoalEditor(false)} style={{ flex: 1, height: 42, borderRadius: 14, border: `1.5px solid ${C.mid}`, background: 'transparent', fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.muted, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveGoals} disabled={editGoals.length === 0} style={{ flex: 1, height: 42, borderRadius: 14, border: 'none', background: editGoals.length > 0 ? C.ink : C.mid, fontFamily: dm, fontSize: 13, fontWeight: 600, color: editGoals.length > 0 ? '#f5f5f5' : C.muted, cursor: editGoals.length > 0 ? 'pointer' : 'not-allowed' }}>Save</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/my-routine')} style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', borderTop: `1px solid ${C.mid}`, cursor: 'pointer', marginTop: 8 }}>
              <Sparkles size={15} color={C.goldDeep} strokeWidth={1.6} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>My Routine</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Your personalised scalp care plan</p>
              </div>
              <ChevronRight size={14} color={C.mid} />
            </button>
          </ProfileSection>

          {/* ── About ── */}
          <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: C.gold10, border: `1.5px solid ${C.goldBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, marginTop: 6, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: playfair, fontSize: 15, fontWeight: 500, color: C.ink, margin: '0 0 4px' }}>FolliSense</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>A symptom-tracking and triage tool. It does not provide medical diagnoses.</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, margin: '6px 0 0', opacity: 0.6 }}>Version 1.0</p>
              </div>
            </div>
          </div>

          {/* ── Log out ── */}
          <div style={{ marginTop: 32, marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
            {!showLogoutConfirm ? (
              <button onClick={() => setShowLogoutConfirm(true)} style={{ fontFamily: dm, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                Log out
              </button>
            ) : (
              <div style={{ width: '100%', padding: 20, borderRadius: 18, background: C.surface, border: `1.5px solid ${C.mid}`, textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 16 }}>Are you sure you want to log out?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, height: 44, borderRadius: 14, border: `1.5px solid ${C.mid}`, background: 'transparent', fontFamily: dm, fontSize: 13, fontWeight: 500, color: C.muted, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { resetAll(); navigate('/'); }} style={{ flex: 1, height: 44, borderRadius: 14, border: 'none', background: C.gold10, fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.goldDeep, cursor: 'pointer' }}>Yes, log out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;