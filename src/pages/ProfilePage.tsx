import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, Shield, Trash2, Leaf, Heart, Camera, RefreshCw, Target, Check,
  Microscope, Eye, EyeOff, Lock, Sparkles, Pencil, ChevronDown, Droplets, Scissors, FlaskConical, Activity, Info
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductSearch from '@/components/ProductSearch';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  'type3': 'Type 3 — Curly',
  'type4': 'Type 4 — Coily',
  '3b': '3b — Wide, springy curls',
  '3c': '3c — Tight, corkscrew curls',
  '4a': '4a — Soft, defined coils',
  '4b': '4b — Z-shaped, tightly coiled',
  '4c': '4c — Very tight, densely packed coils',
  'unsure': 'Not sure yet',
};

// ── Section wrapper ──
const ProfileSection = ({
  title, icon: Icon, children, defaultOpen = false, editLabel, onEdit, editing, onSave, onCancel
}: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
  editLabel?: string; onEdit?: () => void; editing?: boolean; onSave?: () => void; onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-primary" strokeWidth={1.8} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            {onEdit && !editing && (
              <div className="flex justify-end mb-2">
                <button onClick={onEdit} className="text-xs font-medium text-primary flex items-center gap-1">
                  <Pencil size={11} /> {editLabel || 'Edit'}
                </button>
              </div>
            )}
            {editing && onSave && onCancel && (
              <div className="flex justify-end gap-2 mb-2">
                <button onClick={onCancel} className="text-xs font-medium text-muted-foreground">Cancel</button>
                <button onClick={onSave} className="text-xs font-medium text-primary">Save</button>
              </div>
            )}
            <div className="card-elevated">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between py-3 px-4 gap-3">
    <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
    <span className="text-sm text-foreground text-right max-w-[200px]">{value}</span>
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
    dailyTip: true, midCycle: true, washDay: true, washApproaching: true, productReminders: false, weeklySummary: false,
  });
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editGoals, setEditGoals] = useState<string[]>(onboardingData.goals || []);
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showResearchExplainer, setShowResearchExplainer] = useState(false);

  const isMale = onboardingData.gender === 'man';

  const notificationOptions = isMale ? [
    { key: 'dailyTip' as const, label: 'Daily scalp care tip', desc: 'A quick tip to help your scalp health between check-ins' },
    { key: 'midCycle' as const, label: 'Check-in reminder', desc: "We'll nudge you when it's time for your next scalp check" },
    { key: 'washDay' as const, label: 'Wash day reminder', desc: "A heads-up when it's time to wash" },
    { key: 'productReminders' as const, label: 'Product reminders', desc: 'Reminders to apply scalp treatments based on your routine' },
    { key: 'weeklySummary' as const, label: 'Weekly scalp health summary', desc: 'A quick recap of your scalp activity this week' },
  ] : [
    { key: 'dailyTip' as const, label: 'Daily scalp care tip', desc: 'A quick tip or reminder to help your scalp health between check-ins' },
    { key: 'midCycle' as const, label: 'Mid-cycle check-in reminder', desc: "We'll nudge you when it's time for your quick check" },
    { key: 'washDay' as const, label: 'Wash day reminder', desc: "A heads-up when your wash day is approaching" },
    { key: 'washApproaching' as const, label: 'Wash day approaching (2 days before)', desc: 'Reminder 2 days before your expected wash day' },
    { key: 'productReminders' as const, label: 'Product reminders', desc: 'Reminders to apply scalp treatments or oils based on your routine' },
    { key: 'weeklySummary' as const, label: 'Weekly scalp health summary', desc: 'A quick recap of your scalp activity this week' },
  ];

  const handleDelete = () => { resetAll(); navigate('/'); };
  const handleRetakePhoto = (area: string) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos(baselinePhotos.map(p => p.area === area ? { ...p, date: today } : p));
  };
  const handleAddBaseline = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos([
      { area: 'Hairline — temples and edges', captured: true, date: today },
      { area: 'Crown and vertex', captured: true, date: today },
    ]);
  };

  const toggleEditGoal = (g: string) => {
    setEditGoals(prev => {
      if (prev.includes(g)) return prev.filter(x => x !== g);
      if (prev.length >= 3) return prev;
      return [...prev, g];
    });
  };
  const saveGoals = () => {
    setOnboardingData({ ...onboardingData, goals: editGoals });
    setShowGoalEditor(false);
  };

  const toggleMenstrualTracking = () => {
    const newVal = onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'No thanks' : "Yes, I'd like to track";
    setOnboardingData({ ...onboardingData, menstrualTracking: newVal });
  };

  const hpSections = [
    { key: 'scalp', complete: !!(healthProfile.sweat && healthProfile.exercise && healthProfile.heatStyling && healthProfile.satinCovering) },
    { key: 'medical', complete: !!(healthProfile.medicalConditions.length > 0 && healthProfile.pregnancyStatus && healthProfile.medications) },
    { key: 'blood', complete: !!healthProfile.lastBloodTest },
    { key: 'skin', complete: !!(healthProfile.skinConditions.length > 0 && healthProfile.sensitiveSkin) },
    { key: 'hair', complete: !!(healthProfile.previousHairLoss && healthProfile.diagnosedCondition && healthProfile.familyHistory) },
  ];
  const hpCompleted = hpSections.filter(s => s.complete).length;

  const chemDisplay = (() => {
    if (!onboardingData.chemicalProcessing) return 'Not set';
    if (onboardingData.chemicalProcessing === 'Never') return 'Never';
    if (onboardingData.chemicalProcessing === 'No, fully natural') return 'No, fully natural';
    const treatments = onboardingData.chemicalProcessingMultiple?.length > 0
      ? onboardingData.chemicalProcessingMultiple.join(', ')
      : onboardingData.chemicalProcessing;
    return treatments;
  })();

  const betweenWashDisplay = onboardingData.betweenWashCare?.length > 0
    ? onboardingData.betweenWashCare.join(', ') + (onboardingData.otherBetweenWashCare ? `, ${onboardingData.otherBetweenWashCare}` : '')
    : 'Not set';

  const riskColor = (r: string | null) => {
    if (r === 'green') return 'text-emerald-600';
    if (r === 'amber') return 'text-amber-600';
    if (r === 'red') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="page-container pt-6 pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3">
            <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold">{userName || 'Your profile'}</h1>
          {onboardingData.gender && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {onboardingData.gender === 'woman' ? 'Female' : onboardingData.gender === 'man' ? 'Male' : 'Prefer not to say'}
            </p>
          )}
        </div>

        {/* ═══════ Section 1: Account ═══════ */}
        <ProfileSection title="Account" icon={User} defaultOpen={true}>
          <div className="divide-y divide-border">
            <InfoRow label="First name" value={userName || 'Not set'} />
            <InfoRow label="Gender" value={onboardingData.gender === 'woman' ? 'Female' : onboardingData.gender === 'man' ? 'Male' : onboardingData.gender === 'prefer-not-to-say' ? 'Prefer not to say' : 'Not set'} />

            {/* Notifications */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notifications</p>
              <div className="space-y-3">
                {notificationOptions.map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${notifications[item.key] ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${notifications[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data & Research */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Data & Research</p>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Contribute my anonymised data to scalp health research</p>
                </div>
                <Switch
                  checked={research.consented}
                  onCheckedChange={(checked) => setResearch({
                    ...research,
                    consented: checked,
                    consentDate: checked ? new Date().toISOString() : null,
                  })}
                />
              </div>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-primary mb-2">
                  <Info size={12} /> Learn more
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    Your anonymised check-in patterns help improve scalp health understanding for {isMale ? 'people' : 'women'} with textured hair, a group underrepresented in dermatology research. No photos or personal details are shared without your explicit consent.
                  </p>
                </CollapsibleContent>
              </Collapsible>
              {research.consented && research.photoCount > 0 && (
                <p className="text-xs text-primary font-medium">You've contributed {research.photoCount} photo{research.photoCount !== 1 ? 's' : ''}.</p>
              )}
            </div>

            {/* Privacy & Data */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-3 mb-3">
                <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">How we use your information</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your data personalises your experience and generates your clinician summary if needed. Nothing is shared without permission. Photos stay on your device.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button onClick={() => toast({ title: 'Coming soon', description: 'Data export will be available in a future update.' })} className="w-full px-4 py-3 text-left text-sm text-foreground flex items-center justify-between">
              Export my data <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button onClick={() => setShowChangePassword(!showChangePassword)} className="w-full px-4 py-3 text-left text-sm text-foreground flex items-center gap-2">
              <Lock size={14} strokeWidth={1.5} /> Change password <ChevronRight size={14} className="text-muted-foreground ml-auto" />
            </button>
            {showChangePassword && (
              <div className="px-4 py-3 space-y-3">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Current password</label>
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-7 text-muted-foreground">{showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">New password</label>
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-7 text-muted-foreground">{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm new password</label>
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-7 text-muted-foreground">{showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <button
                  onClick={() => { toast({ title: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(false); }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className={`w-full h-10 rounded-xl font-medium text-sm transition-colors ${currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
                >
                  Update password
                </button>
              </div>
            )}
            <button onClick={handleDelete} className="w-full px-4 py-3 text-left text-sm text-destructive flex items-center gap-2"><Trash2 size={14} strokeWidth={1.5} /> Delete all data</button>
          </div>
        </ProfileSection>

        {/* ═══════ Section 2: Your Hair ═══════ */}
        <ProfileSection title="Your Hair" icon={Scissors}>
          <div className="divide-y divide-border">
            <InfoRow label="Hair type" value={hairTypeLabels[onboardingData.hairType] || onboardingData.hairType || 'Not set'} />
            <InfoRow label="How you wear your hair" value={onboardingData.protectiveStyles?.length > 0 ? onboardingData.protectiveStyles.join(', ') : 'Not set'} />
            {!isMale && onboardingData.protectiveStyleFrequency && (
              <InfoRow label="How often in protective styles" value={onboardingData.protectiveStyleFrequency} />
            )}
            {isMale && onboardingData.maleStyleFrequency && (
              <InfoRow label="Style frequency" value={onboardingData.maleStyleFrequency} />
            )}
            {isMale && onboardingData.barberFrequency && (
              <InfoRow label="Barber frequency" value={onboardingData.barberFrequency} />
            )}
          </div>
        </ProfileSection>

        {/* ═══════ Section 3: Hair History ═══════ */}
        <ProfileSection title="Hair History" icon={FlaskConical}>
          <div className="divide-y divide-border">
            <InfoRow label="Chemical processing" value={chemDisplay} />
            {onboardingData.chemicalProcessing && !['No, fully natural', 'Never', 'Not sure'].includes(onboardingData.chemicalProcessing) && onboardingData.lastChemicalTreatment && (
              <InfoRow label="Last treatment" value={onboardingData.lastChemicalTreatment} />
            )}
            {onboardingData.chemicalProcessingMultiple?.length > 0 && (
              <InfoRow label="Type" value={onboardingData.chemicalProcessingMultiple.join(', ')} />
            )}
          </div>
        </ProfileSection>

        {/* ═══════ Section 4: Your Routine ═══════ */}
        <ProfileSection
          title="Your Routine"
          icon={Droplets}
          editLabel={showProductEditor ? 'Done' : 'Edit products'}
          onEdit={() => setShowProductEditor(true)}
          editing={showProductEditor}
          onSave={() => setShowProductEditor(false)}
          onCancel={() => setShowProductEditor(false)}
        >
          <div className="divide-y divide-border">
            {onboardingData.cycleLength && (
              <InfoRow label="Typical cycle length" value={onboardingData.cycleLength} />
            )}
            <InfoRow label="Wash frequency" value={onboardingData.washFrequency || onboardingData.wornOutWashFrequency || onboardingData.washFrequencyPerCycle || 'Not set'} />
            {isMale && onboardingData.locRetwistFrequency && (
              <InfoRow label="Loc retwist frequency" value={onboardingData.locRetwistFrequency} />
            )}
            {onboardingData.betweenWashCare?.length > 0 && (
              <InfoRow label="Between-wash care" value={betweenWashDisplay} />
            )}
          </div>

          {/* Products sub-section */}
          <div className="border-t border-border">
            {!showProductEditor ? (
              <div className="divide-y divide-border">
                <div className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-1">Scalp products</p>
                  <p className="text-sm text-foreground">
                    {onboardingData.scalpProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").length > 0
                      ? onboardingData.scalpProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").join(', ')
                      : 'No scalp products'}
                  </p>
                  {onboardingData.scalpProductFrequency && (
                    <p className="text-xs text-muted-foreground mt-1">Frequency: {onboardingData.scalpProductFrequency}</p>
                  )}
                </div>
                <div className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-1">Hair products</p>
                  <p className="text-sm text-foreground">
                    {onboardingData.hairProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").length > 0
                      ? onboardingData.hairProducts.filter(p => p !== 'None' && p !== "I don't use anything specific").join(', ')
                      : 'No hair products'}
                  </p>
                  {onboardingData.hairProductFrequency && (
                    <p className="text-xs text-muted-foreground mt-1">Frequency: {onboardingData.hairProductFrequency}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Scalp products</p>
                  <ProductSearch
                    category="scalp"
                    selectedProducts={onboardingData.scalpProducts.filter(p => p !== 'None')}
                    onProductsChange={(prods) => setOnboardingData({ ...onboardingData, scalpProducts: prods })}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Hair products</p>
                  <ProductSearch
                    category="hair"
                    selectedProducts={onboardingData.hairProducts.filter(p => p !== 'None')}
                    onProductsChange={(prods) => setOnboardingData({ ...onboardingData, hairProducts: prods })}
                  />
                </div>
              </div>
            )}
            <div className="px-4 pb-3">
              <button onClick={() => navigate('/products')} className="text-sm font-medium text-primary">Browse product guide →</button>
            </div>
          </div>
        </ProfileSection>

        {/* ═══════ Section 5: Health ═══════ */}
        <ProfileSection title="Health" icon={Activity}>
          <div className="divide-y divide-border">
            {/* Baseline */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Baseline Assessment</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="text-foreground">{baselineDate || 'Not set'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Itch</span><span className="text-foreground">{onboardingData.baselineItch || 'Not set'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tenderness</span><span className="text-foreground">{onboardingData.baselineTenderness || 'Not set'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Hairline</span><span className="text-foreground">{onboardingData.baselineHairline || 'Not set'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Hair health</span><span className="text-foreground">{onboardingData.baselineHairHealth || 'Not set'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Risk level</span><span className={`font-medium capitalize ${riskColor(baselineRisk)}`}>{baselineRisk || 'Not assessed'}</span></div>
              </div>
            </div>

            {/* Baseline Photos */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Baseline Photos</p>
              {baselinePhotos.length > 0 ? (
                <div className="space-y-2">
                  {baselinePhotos.map(photo => (
                    <div key={photo.area} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"><Camera size={16} className="text-muted-foreground" strokeWidth={1.5} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{photo.area}</p>
                        <p className="text-xs text-muted-foreground">Captured {photo.date}</p>
                      </div>
                      <button onClick={() => handleRetakePhoto(photo.area)} className="flex items-center gap-1 text-xs font-medium text-primary"><RefreshCw size={11} strokeWidth={2} /> Retake</button>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={handleAddBaseline} className="w-full p-3 rounded-xl border-2 border-dashed border-border flex items-center gap-3 text-left">
                  <Camera size={18} className="text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-foreground text-sm">Add baseline photos</p>
                    <p className="text-xs text-muted-foreground">Capture your starting point</p>
                  </div>
                </button>
              )}
            </div>

            {/* Menstrual Cycle (hidden for male) */}
            {!isMale && (
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Menstrual Cycle</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tracking</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'On' : 'Off'}</span>
                    <button onClick={toggleMenstrualTracking} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                {onboardingData.menstrualTracking === "Yes, I'd like to track" && (
                  <div className="space-y-1">
                    {onboardingData.menstrualCycleLength && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cycle length</span><span className="text-foreground">{onboardingData.menstrualCycleLength}</span></div>}
                    {onboardingData.lastPeriodDate && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last period</span><span className="text-foreground">{onboardingData.lastPeriodDate}</span></div>}
                    {onboardingData.hormonalContraception && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Contraception</span><span className="text-foreground">{onboardingData.hormonalContraception}</span></div>}
                  </div>
                )}
              </div>
            )}

            {/* Health Profile link */}
            <button onClick={() => navigate('/health-profile')} className="w-full px-4 py-3 flex items-center gap-3 text-left">
              <Heart size={16} className="text-primary flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Health Profile — {hpCompleted}/5 complete</p>
                <p className="text-xs text-muted-foreground">{hpCompleted < 5 ? 'Complete your health profile' : 'Edit health profile'}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            {/* Goals */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goals</p>
                {!showGoalEditor && (
                  <button onClick={() => { setEditGoals(onboardingData.goals || []); setShowGoalEditor(true); }} className="text-xs font-medium text-primary flex items-center gap-1">
                    <Pencil size={11} /> Edit
                  </button>
                )}
              </div>
              {!showGoalEditor ? (
                onboardingData.goals.length > 0 ? (
                  <div className="space-y-1.5">
                    {onboardingData.goals.map(g => (
                      <div key={g} className="flex items-center gap-2">
                        <Target size={13} className="text-primary flex-shrink-0" strokeWidth={1.8} />
                        <p className="text-sm text-foreground">{g}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No goals set yet</p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Pick up to 3</p>
                  <div className="space-y-2 mb-3">
                    {goalOptions.map(g => (
                      <button key={g} onClick={() => toggleEditGoal(g)} disabled={editGoals.length >= 3 && !editGoals.includes(g)} className={`w-full text-left p-2.5 rounded-xl border-2 transition-colors ${editGoals.includes(g) ? 'border-primary bg-primary/5' : 'border-border'} ${editGoals.length >= 3 && !editGoals.includes(g) ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${editGoals.includes(g) ? 'bg-primary border-primary' : 'border-border'}`}>
                            {editGoals.includes(g) && <Check size={10} className="text-primary-foreground" strokeWidth={2.5} />}
                          </div>
                          <p className="text-sm text-foreground">{g}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowGoalEditor(false)} className="flex-1 h-9 rounded-xl border border-border font-medium text-sm text-muted-foreground">Cancel</button>
                    <button onClick={saveGoals} disabled={editGoals.length === 0} className={`flex-1 h-9 rounded-xl font-medium text-sm ${editGoals.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>Save</button>
                  </div>
                </div>
              )}
            </div>

            {/* My Routine link */}
            <button onClick={() => navigate('/my-routine')} className="w-full px-4 py-3 flex items-center gap-3 text-left">
              <Sparkles size={16} className="text-primary flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">My Routine</p>
                <p className="text-xs text-muted-foreground">Your personalised scalp care plan</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </ProfileSection>

        {/* ── About ── */}
        <div className="mb-6 mt-2">
          <div className="card-elevated p-4">
            <div className="flex items-start gap-3">
              <Leaf size={16} className="text-primary mt-0.5" strokeWidth={1.8} />
              <div>
                <p className="text-sm text-foreground font-medium">FolliSense</p>
                <p className="text-xs text-muted-foreground mt-1">A symptom-tracking and triage tool. It does not provide medical diagnoses.</p>
                <p className="text-xs text-muted-foreground mt-2">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Log out ── */}
        <div className="mb-20 flex justify-center">
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log out</button>
          ) : (
            <div className="card-elevated p-5 w-full text-center">
              <p className="text-sm font-medium text-foreground mb-4">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm text-muted-foreground">Cancel</button>
                <button onClick={() => { resetAll(); navigate('/'); }} className="flex-1 h-10 rounded-xl font-medium text-sm bg-muted text-foreground">Yes, log out</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
