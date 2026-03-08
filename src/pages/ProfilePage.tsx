import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ChevronRight, Shield, Trash2, Leaf, Heart, Camera, RefreshCw, Target, Check, Calendar, Microscope, ChevronDown, Eye, EyeOff, Lock, Sparkles, Pencil } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductSearch from '@/components/ProductSearch';
import { toast } from '@/hooks/use-toast';

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
  '3b': '3b — Wide, springy curls',
  '3c': '3c — Tight, corkscrew curls',
  '4a': '4a — Soft, defined coils',
  '4b': '4b — Z-shaped, tightly coiled',
  '4c': '4c — Very tight, densely packed coils',
  'unsure': 'Not sure yet',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    userName, onboardingData, setOnboardingData, resetAll,
    baselinePhotos, setBaselinePhotos, baselineRisk, baselineDate,
    healthProfile, research,
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

  // Compute health profile completion
  const hpSections = [
    { key: 'scalp', complete: !!(healthProfile.sweat && healthProfile.exercise && healthProfile.heatStyling && healthProfile.satinCovering) },
    { key: 'medical', complete: !!(healthProfile.medicalConditions.length > 0 && healthProfile.pregnancyStatus && healthProfile.medications) },
    { key: 'blood', complete: !!healthProfile.lastBloodTest },
    { key: 'skin', complete: !!(healthProfile.skinConditions.length > 0 && healthProfile.sensitiveSkin) },
    { key: 'hair', complete: !!(healthProfile.previousHairLoss && healthProfile.diagnosedCondition && healthProfile.familyHistory) },
  ];
  const hpCompleted = hpSections.filter(s => s.complete).length;

  // Chemical processing display
  const chemDisplay = (() => {
    if (!onboardingData.chemicalProcessing) return 'Not set';
    if (onboardingData.chemicalProcessing === 'No, fully natural') return 'No, fully natural';
    const treatments = onboardingData.chemicalProcessingMultiple?.length > 0
      ? onboardingData.chemicalProcessingMultiple.join(', ')
      : onboardingData.chemicalProcessing;
    return `Yes — ${treatments}`;
  })();

  // Between-wash care display
  const betweenWashDisplay = onboardingData.betweenWashCare?.length > 0
    ? onboardingData.betweenWashCare.join(', ') + (onboardingData.otherBetweenWashCare ? `, ${onboardingData.otherBetweenWashCare}` : '')
    : 'Not set';

  const riskColor = (r: string | null) => {
    if (r === 'green') return 'text-emerald-600';
    if (r === 'amber') return 'text-amber-600';
    if (r === 'red') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between py-3 gap-3">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[200px]">{value}</span>
    </div>
  );

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
            <p className="text-sm text-muted-foreground mt-0.5">{onboardingData.gender}</p>
          )}
        </div>

        {/* ── Personal ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Personal</h3>
          <div className="card-elevated divide-y divide-border px-4">
            <InfoRow label="First name" value={userName || 'Not set'} />
            <InfoRow label="Gender" value={onboardingData.gender || 'Not set'} />
          </div>
        </div>

        {/* ── Hair ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Hair</h3>
          <div className="card-elevated divide-y divide-border px-4">
            <InfoRow label="Hair type" value={hairTypeLabels[onboardingData.hairType] || onboardingData.hairType || 'Not set'} />
            <InfoRow label="Chemical processing" value={chemDisplay} />
            {onboardingData.chemicalProcessing && onboardingData.chemicalProcessing !== 'No, fully natural' && onboardingData.lastChemicalTreatment && (
              <InfoRow label="Last treatment" value={onboardingData.lastChemicalTreatment} />
            )}
          </div>
        </div>

        {/* ── Styles ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Styles</h3>
          <div className="card-elevated divide-y divide-border px-4">
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
        </div>

        {/* ── Routine ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Routine</h3>
          <div className="card-elevated divide-y divide-border px-4">
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
        </div>

        {/* ── Baseline ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Baseline</h3>
          <div className="card-elevated divide-y divide-border px-4">
            <InfoRow label="Baseline date" value={baselineDate || 'Not set'} />
            <InfoRow label="Itch" value={onboardingData.baselineItch || 'Not set'} />
            <InfoRow label="Tenderness" value={onboardingData.baselineTenderness || 'Not set'} />
            <InfoRow label="Hairline" value={onboardingData.baselineHairline || 'Not set'} />
            <InfoRow label="Hair health" value={onboardingData.baselineHairHealth || 'Not set'} />
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Risk level</span>
              <span className={`text-sm font-medium capitalize ${riskColor(baselineRisk)}`}>{baselineRisk || 'Not assessed'}</span>
            </div>
          </div>
        </div>

        {/* ── Baseline Photos ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Baseline Photos</h3>
          {baselinePhotos.length > 0 ? (
            <div className="card-elevated divide-y divide-border">
              {baselinePhotos.map(photo => (
                <div key={photo.area} className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0"><Camera size={20} className="text-muted-foreground" strokeWidth={1.5} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{photo.area}</p>
                    <p className="text-xs text-muted-foreground">Captured {photo.date}</p>
                  </div>
                  <button onClick={() => handleRetakePhoto(photo.area)} className="flex items-center gap-1 text-xs font-medium text-primary px-2 py-1"><RefreshCw size={12} strokeWidth={2} /> Retake</button>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={handleAddBaseline} className="card-elevated w-full p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center"><Camera size={22} className="text-muted-foreground" strokeWidth={1.5} /></div>
              <div>
                <p className="font-medium text-foreground text-sm">Add your baseline photos</p>
                <p className="text-xs text-muted-foreground mt-0.5">Capture your starting point to track changes over time</p>
              </div>
            </button>
          )}
        </div>

        {/* ── Products ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label">Products</h3>
            <button onClick={() => setShowProductEditor(!showProductEditor)} className="text-xs font-medium text-primary flex items-center gap-1">
              <Pencil size={12} /> {showProductEditor ? 'Done' : 'Edit'}
            </button>
          </div>

          {!showProductEditor ? (
            <div className="card-elevated divide-y divide-border px-4">
              <div className="py-3">
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
              <div className="py-3">
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
            <div className="space-y-6">
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
          <button onClick={() => navigate('/products')} className="text-sm font-medium text-primary mt-3 px-1">Browse product guide →</button>
        </div>

        {/* ── Menstrual Cycle (hidden for male) ── */}
        {!isMale && (
          <div className="mb-6">
            <h3 className="text-label mb-3">Menstrual Cycle</h3>
            <div className="card-elevated divide-y divide-border px-4">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Tracking</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">{onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'On' : 'Off'}</span>
                  <button onClick={toggleMenstrualTracking} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'bg-primary' : 'bg-border'}`}>
                    <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${onboardingData.menstrualTracking === "Yes, I'd like to track" ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              {onboardingData.menstrualTracking === "Yes, I'd like to track" && (
                <>
                  {onboardingData.menstrualCycleLength && <InfoRow label="Cycle length" value={onboardingData.menstrualCycleLength} />}
                  {onboardingData.lastPeriodDate && <InfoRow label="Last period start" value={onboardingData.lastPeriodDate} />}
                  {onboardingData.hormonalContraception && <InfoRow label="Hormonal contraception" value={onboardingData.hormonalContraception} />}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Goals ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label">My Goals</h3>
            {!showGoalEditor && (
              <button onClick={() => { setEditGoals(onboardingData.goals || []); setShowGoalEditor(true); }} className="text-xs font-medium text-primary flex items-center gap-1">
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>
          {!showGoalEditor ? (
            <div className="card-elevated p-4">
              {onboardingData.goals.length > 0 ? (
                <div className="space-y-2">
                  {onboardingData.goals.map(g => (
                    <div key={g} className="flex items-center gap-2">
                      <Target size={14} className="text-primary flex-shrink-0" strokeWidth={1.8} />
                      <p className="text-sm text-foreground">{g}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No goals set yet</p>
              )}
            </div>
          ) : (
            <div className="card-elevated p-4">
              <p className="text-sm font-medium text-foreground mb-3">Pick up to 3</p>
              <div className="space-y-2 mb-4">
                {goalOptions.map(g => (
                  <button key={g} onClick={() => toggleEditGoal(g)} disabled={editGoals.length >= 3 && !editGoals.includes(g)} className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${editGoals.includes(g) ? 'border-primary bg-sage-light' : 'border-border'} ${editGoals.length >= 3 && !editGoals.includes(g) ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${editGoals.includes(g) ? 'bg-primary border-primary' : 'border-border'}`}>
                        {editGoals.includes(g) && <Check size={10} className="text-primary-foreground" strokeWidth={2.5} />}
                      </div>
                      <p className="text-sm text-foreground">{g}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowGoalEditor(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm btn-press text-muted-foreground">Cancel</button>
                <button onClick={saveGoals} disabled={editGoals.length === 0} className={`flex-1 h-10 rounded-xl font-medium text-sm btn-press ${editGoals.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Health Profile ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Health Profile</h3>
          <button onClick={() => navigate('/health-profile')} className="card-elevated w-full p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0"><Heart size={20} className="text-primary" strokeWidth={1.5} /></div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{hpCompleted}/5 sections complete</p>
              <p className="text-xs text-muted-foreground">{hpCompleted < 5 ? 'Complete your health profile' : 'Edit health profile'}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* ── My Routine ── */}
        <div className="mb-6">
          <button onClick={() => navigate('/my-routine')} className="card-elevated w-full p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0"><Sparkles size={20} className="text-primary" strokeWidth={1.5} /></div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">My Routine</p>
              <p className="text-xs text-muted-foreground">Your personalised scalp care plan</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* ── Research ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Research</h3>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3 mb-3">
              <Microscope size={18} className="text-primary flex-shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {research.consented ? 'Contributing to research' : 'Not participating'}
                </p>
                {research.consented && research.photoCount > 0 && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    You've contributed {research.photoCount} photo{research.photoCount !== 1 ? 's' : ''}. Thank you.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('/research')} className="text-sm font-medium text-primary block">
                {research.consented ? 'Manage consent' : 'Learn more'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="mb-6">
          <h3 className="text-label mb-1">Notifications</h3>
          <p className="text-xs text-muted-foreground mb-3">Choose what you'd like to hear from us</p>
          <div className="card-elevated divide-y divide-border">
            {notificationOptions.map(item => (
              <div key={item.key} className="flex items-start justify-between p-4 gap-3">
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

        {/* ── Your Data — How we use your info ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Your Data</h3>
          <div className="card-elevated p-4 mb-3">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">How we use your information</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your data is used to personalise your experience, time your reminders, and generate your clinician summary if you ever need one. Nothing is shared without your permission. Photos are stored on your device only.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => toast({ title: 'Coming soon', description: 'Data export will be available in a future update.' })} className="card-elevated w-full p-4 text-left text-sm text-foreground flex items-center justify-between">Export my data <ChevronRight size={16} className="text-muted-foreground" /></button>
            <button onClick={() => setShowChangePassword(!showChangePassword)} className="card-elevated w-full p-4 text-left text-sm text-foreground flex items-center gap-2">
              <Lock size={16} strokeWidth={1.5} /> Change password <ChevronRight size={16} className="text-muted-foreground ml-auto" />
            </button>
            {showChangePassword && (
              <div className="card-elevated p-4 space-y-3">
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
                  onClick={() => {
                    toast({ title: 'Password updated' });
                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                    setShowChangePassword(false);
                  }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className={`w-full h-10 rounded-xl font-medium text-sm btn-press transition-colors ${currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
                >
                  Update password
                </button>
              </div>
            )}
            <button onClick={handleDelete} className="card-elevated w-full p-4 text-left text-sm text-destructive flex items-center gap-2"><Trash2 size={16} strokeWidth={1.5} /> Delete all data</button>
          </div>
        </div>

        {/* ── About ── */}
        <div className="mb-6">
          <h3 className="text-label mb-3">About</h3>
          <div className="card-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 mt-0.5"><Leaf size={16} className="text-primary" strokeWidth={1.8} /></div>
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
            <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log out
            </button>
          ) : (
            <div className="card-elevated p-5 w-full text-center">
              <p className="text-sm font-medium text-foreground mb-4">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm btn-press text-muted-foreground">Cancel</button>
                <button onClick={() => { resetAll(); navigate('/'); }} className="flex-1 h-10 rounded-xl font-medium text-sm btn-press bg-muted text-foreground">Yes, log out</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
