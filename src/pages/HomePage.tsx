import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Leaf, Lightbulb, Scissors, X, Calendar, Heart, AlertTriangle, ArrowRight, Target, MessageCircle, Stethoscope, FlaskConical, ShieldCheck, Microscope, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const serviceOptions = ['Wash', 'Treatment', 'Style installation', 'Style removal/takedown', 'Trim', 'Colour', 'Lineup or shape-up', 'Retwist (locs)', 'Barber fade or cut', 'Scalp treatment', 'Other'];

const protectiveStyleTips = [
  "Quick thought — a satin pillowcase tonight could help protect your edges while you sleep",
  "A gentle scalp massage with your fingertips can help with circulation. You don't need to add product for this to work.",
  "If your braids feel tight around the hairline, don't tough it out — loosen or remove the ones causing pain",
  "Staying hydrated helps your scalp too — aim for 2 litres today",
  "Try pressing gently with a fingertip instead of scratching — it relieves itch without damaging the scalp",
  "Your wash day is coming up — start thinking about whether you'll reinstall or give your hair a break",
  "If you're exercising today, a light spritz of scalp refresh spray afterwards can help with sweat buildup under your style",
];

const maleTips = [
  "Wearing your durag tonight? Make sure your hairline isn't under too much tension from the tie",
  "If your barber is lining you up every week, give your edges a break now and then",
  "Cornrows feeling tight? Don't tough it out. Loosen the front ones to protect your hairline",
  "Sweat buildup under a wave cap can irritate your scalp. A quick rinse or scalp wipe helps",
  "If your locs are pulling at the root, that's traction. Talk to your loctician about lighter retwists",
  "Staying hydrated helps your scalp too — aim for 2 litres today",
  "Try pressing gently with a fingertip instead of scratching — it relieves itch without damaging the scalp",
];

const wornOutTips = [
  "Using heat today? A heat protectant on mid-lengths and ends helps — but don't forget your scalp can burn too",
  "If you're restyling daily, try to keep tension low around your hairline — edges are delicate",
  "Sleeping with your hair out? A satin pillowcase or bonnet reduces friction and breakage overnight",
  "Washing more than twice a week? Your scalp might be overcompensating with oil. Try stretching to every 4–5 days",
  "Sun exposure on your parting and hairline can cause scalp damage — consider a scalp SPF spray if you're outside a lot",
  "Staying hydrated helps your scalp too — aim for 2 litres today",
  "Try pressing gently with a fingertip instead of scratching — it relieves itch without damaging the scalp",
];

const lutealTips = [
  "You're in the second half of your cycle — increased scalp oiliness or sensitivity is normal right now",
];

const menstruationTips = [
  "Some women notice more shedding around their period — this is usually temporary and hormonal",
];

const quickLogSymptoms = [
  'Itching', 'Tenderness / soreness', 'Flaking', 'Thinning / shedding', 'Breakage', 'Bumps or irritation', 'Something else',
];

const quickLogSeverities = [
  { label: 'Mild', desc: 'Just noticed it' },
  { label: 'Moderate', desc: "It's bothering me" },
  { label: 'Severe', desc: 'I need to do something about this' },
];

const getQuickLogTip = (symptoms: string[]): string => {
  if (symptoms.includes('Itching')) return 'Try pressing gently with a fingertip instead of scratching. If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help.';
  if (symptoms.includes('Tenderness / soreness')) return "If your style feels tight, loosen the edges. Don't tough it out — tension damage is preventable.";
  if (symptoms.includes('Flaking')) return 'A gentle sulphate-free rinse can help clear buildup without disturbing your style.';
  if (symptoms.includes('Thinning / shedding')) return 'Avoid re-tightening edges. If shedding is concentrated at the hairline, consider loosening or removing tension.';
  if (symptoms.includes('Bumps or irritation')) return 'Keep the area clean and avoid heavy products. If bumps persist, they could indicate folliculitis — worth monitoring.';
  return 'Note taken. Keep an eye on it and mention it at your next check-in.';
};

const getQuickLogTips = (symptoms: string[]): string[] => {
  const tips: string[] = [];
  if (symptoms.includes('Itching')) tips.push('If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help. Avoid heavy oils or butters directly on the scalp.');
  if (symptoms.includes('Tenderness / soreness')) tips.push('Avoid re-tightening your edges — if they\'re loose, leave them');
  if (symptoms.includes('Flaking')) tips.push('Gently cleanse your scalp mid-cycle with a sulphate-free rinse');
  if (symptoms.includes('Thinning / shedding')) tips.push('Consider loosening or avoiding tension on your hairline for the next style');
  if (symptoms.includes('Bumps or irritation')) tips.push('Keep the affected area clean and avoid heavy product application');
  if (tips.length === 0) tips.push('Monitor the symptom and mention it at your next check-in');
  return tips.slice(0, 3);
};

const HomePage = () => {
  const navigate = useNavigate();
  const { onboardingData, history, salonVisits, addSalonVisit, healthProfile, addQuickLog, research, setResearch, checkInCount, userName } = useApp();
  const [showSalonForm, setShowSalonForm] = useState(false);
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [services, setServices] = useState<string[]>([]);
  const [stylistName, setStylistName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [dismissedWashPrompt, setDismissedWashPrompt] = useState(false);
  // Check-in modal logic: only show on fresh app open (6h+ gap) and not within 24h of dismissal
  const [dismissedCheckInModal, setDismissedCheckInModal] = useState(() => {
    const lastDismissed = localStorage.getItem('follisense-checkin-dismissed');
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10);
      if (elapsed < 24 * 60 * 60 * 1000) return true; // within 24h
    }
    const lastHomeVisit = localStorage.getItem('follisense-last-home-visit');
    if (lastHomeVisit) {
      const elapsed = Date.now() - parseInt(lastHomeVisit, 10);
      if (elapsed < 6 * 60 * 60 * 1000) return true; // within 6h = just tab switching
    }
    const justOnboarded = sessionStorage.getItem('follisense-just-onboarded');
    if (justOnboarded === 'true') return true;
    return false;
  });
  const [showCheckInModal] = useState(!dismissedCheckInModal);
  const [showHealthNudge, setShowHealthNudge] = useState(false);
  const [dismissedHealthNudge, setDismissedHealthNudge] = useState(false);

  // Track home visit time + clear onboarding flag
  useEffect(() => {
    localStorage.setItem('follisense-last-home-visit', String(Date.now()));
    // Clear the just-onboarded flag after first Home visit
    const justOnboarded = sessionStorage.getItem('follisense-just-onboarded');
    if (justOnboarded === 'true') {
      // Don't clear immediately — clear after navigating away and back
      return () => { sessionStorage.removeItem('follisense-just-onboarded'); };
    }
  }, []);

  // Show health profile nudge 2 seconds after first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!healthProfile.sweat && !healthProfile.medicalConditions.length) {
        setShowHealthNudge(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogStep, setQuickLogStep] = useState(0);
  const [quickSymptoms, setQuickSymptoms] = useState<string[]>([]);
  const [quickSeverity, setQuickSeverity] = useState('');
  const [quickOtherText, setQuickOtherText] = useState('');

  const currentStyle = onboardingData.protectiveStyles[0] || 'Braids';
  const currentDay = 14;
  const totalDays = 28;
  const progress = (currentDay / totalDays) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  // Menstrual cycle day calculation
  const getCycleDay = (): number | null => {
    if (onboardingData.menstrualTracking !== "Yes, I'd like to track" || !onboardingData.lastPeriodDate) return null;
    const lastPeriod = new Date(onboardingData.lastPeriodDate);
    const diffDays = Math.floor((Date.now() - lastPeriod.getTime()) / 86400000);
    const cycleLengthMap: Record<string, number> = { '21–25 days': 23, '26–30 days': 28, '31–35 days': 33 };
    const cycleLen = cycleLengthMap[onboardingData.menstrualCycleLength] || 28;
    return diffDays > 0 ? ((diffDays - 1) % cycleLen) + 1 : null;
  };

  const cycleDay = getCycleDay();
  const cycleLenNum = (() => {
    const m: Record<string, number> = { '21–25 days': 23, '26–30 days': 28, '31–35 days': 33 };
    return m[onboardingData.menstrualCycleLength] || 28;
  })();

  // Determine tip based on user type and menstrual phase
  const isMale = onboardingData.gender === 'man';
  const dailyTips = isMale ? maleTips : onboardingData.isWornOutOnly ? wornOutTips : protectiveStyleTips;
  let todayTip = dailyTips[dayOfYear % dailyTips.length];
  if (cycleDay) {
    if (cycleDay >= 1 && cycleDay <= 5) {
      todayTip = menstruationTips[0];
    } else if (cycleDay >= 15 && cycleDay <= cycleLenNum) {
      todayTip = lutealTips[0];
    }
  }

  const daysUntilWash = totalDays - currentDay;
  const showWashPrompt = !onboardingData.isWornOutOnly && daysUntilWash <= 2 && !dismissedWashPrompt;

  const recentEntries = [
    { label: 'Wash day check-in', date: 'Mar 5', risk: 'amber' as const, nav: '/results?risk=amber' },
    { label: 'Quick log: itching (moderate)', date: 'Feb 28', risk: 'amber' as const, nav: '/history' },
    { label: 'Salon visit: Wash + Treatment', date: 'Feb 25', risk: 'green' as const, icon: 'scissors', nav: '/history' },
    { label: 'Stylist observation', date: 'Feb 25', risk: 'amber' as const, icon: 'eye', nav: '/history' },
    { label: 'Mid-cycle check-in', date: 'Feb 20', risk: 'green' as const, nav: '/results?risk=green' },
    { label: 'Wash day check-in', date: 'Feb 12', risk: 'green' as const, nav: '/results?risk=green' },
  ];

  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const toggleService = (s: string) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleQuickSymptom = (s: string) => setQuickSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const dismissCheckIn = () => {
    setDismissedCheckInModal(true);
    localStorage.setItem('follisense-checkin-dismissed', String(Date.now()));
  };

  const handleSaveSalon = () => {
    addSalonVisit({ id: `sv-${Date.now()}`, date: format(visitDate, 'MMM d'), services, stylistName: stylistName || undefined, notes: visitNotes || undefined });
    setShowSalonForm(false);
    setServices([]);
    setStylistName('');
    setVisitNotes('');
    setVisitDate(new Date());
  };

  const resetQuickLog = () => {
    setShowQuickLog(false);
    setQuickLogStep(0);
    setQuickSymptoms([]);
    setQuickSeverity('');
    setQuickOtherText('');
  };

  const handleQuickLogDone = () => {
    addQuickLog({
      id: `ql-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      symptoms: quickSymptoms,
      severity: quickSeverity,
    });
    resetQuickLog();
  };

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{greeting}{userName ? `, ${userName}` : ''}</h1>
            <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User size={20} className="text-muted-foreground" strokeWidth={1.8} />
          </button>
        </div>

        {/* Cycle status card */}
        {isMale ? (
          /* Male-specific dashboard cards */
          <div className="card-elevated p-5 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sage-light flex flex-col items-center justify-center flex-shrink-0">
                <Scissors size={22} className="text-primary mb-0.5" strokeWidth={1.8} />
                <span className="text-[10px] text-muted-foreground leading-tight">Tracker</span>
              </div>
              <div className="flex-1">
                {onboardingData.barberFrequency && !onboardingData.locRetwistFrequency && !onboardingData.maleStyleFrequency && (
                  <>
                    <p className="font-semibold text-foreground mb-1">Barber tracker</p>
                    <p className="text-sm text-muted-foreground">Last barber visit: Feb 28</p>
                    <p className="text-sm text-muted-foreground">Next check-in: {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </>
                )}
                {onboardingData.locRetwistFrequency && (
                  <>
                    <p className="font-semibold text-foreground mb-1">Loc tracker</p>
                    <p className="text-sm text-muted-foreground">Last retwist: Feb 20</p>
                    <p className="text-sm text-muted-foreground">Day {currentDay} since retwist</p>
                    <p className="text-sm text-muted-foreground">Next check-in: {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </>
                )}
                {onboardingData.maleStyleFrequency && !onboardingData.locRetwistFrequency && (
                  <>
                    <p className="font-semibold text-foreground mb-1">Style tracker</p>
                    <p className="text-sm text-muted-foreground">Day {currentDay} of {currentStyle}</p>
                    <p className="text-sm text-muted-foreground">Next check-in: {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </>
                )}
                {!onboardingData.barberFrequency && !onboardingData.locRetwistFrequency && !onboardingData.maleStyleFrequency && (
                  <>
                    <p className="font-semibold text-foreground mb-1">Scalp health tracker</p>
                    <p className="text-sm text-muted-foreground">Next check-in: {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </>
                )}
                <p className="text-xs text-primary font-medium mt-1">{checkInCount} check-ins completed</p>
              </div>
            </div>
          </div>
        ) : !onboardingData.isWornOutOnly ? (
          <div className="card-elevated p-5 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <svg width={size} height={size} className="-rotate-90">
                  <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
                  <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, ease: 'easeOut' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-foreground">{currentDay}</span>
                  <span className="text-[11px] text-muted-foreground">of {totalDays} days</span>
                </div>
              </div>
              <div>
                <p className="text-label mb-1">Current style</p>
                <p className="font-semibold text-lg text-foreground">{currentStyle}</p>
                <p className="text-sm text-muted-foreground mt-1">Installed Feb 24</p>
                <p className="text-sm text-muted-foreground">Next wash day: Mar 10</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-elevated p-5 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sage-light flex flex-col items-center justify-center flex-shrink-0">
                <Leaf size={22} className="text-primary mb-0.5" strokeWidth={1.8} />
                <span className="text-[10px] text-muted-foreground leading-tight">Tracker</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Scalp health tracker</p>
                <p className="text-sm text-muted-foreground">Last check-in: Feb 20</p>
                <p className="text-sm text-muted-foreground">Next check-in: {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <p className="text-xs text-primary font-medium mt-1">3 check-ins completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Menstrual cycle indicator */}
        {cycleDay && (
          <div className="text-xs text-muted-foreground mb-3 px-1">Cycle day {cycleDay}</div>
        )}

        {/* Goals card */}
        {onboardingData.goals.length > 0 && (
          <button onClick={() => navigate('/profile')} className="card-elevated p-4 mb-4 w-full text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center flex-shrink-0">
              <Target size={16} className="text-primary" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Your focus</p>
              <p className="text-sm font-medium text-foreground truncate">{onboardingData.goals.slice(0, 2).join(', ')}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          </button>
        )}

        {/* Routine card */}
        <button onClick={() => navigate('/my-routine')} className="card-elevated p-5 mb-4 w-full text-left flex items-center gap-4 border-2 border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
            <Sparkles size={22} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Your personalised routine is ready</p>
            <p className="text-xs text-muted-foreground mt-0.5">A scalp and hair care plan built around your life</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
        </button>

        {/* Today's tip card */}
        <div className="rounded-2xl bg-secondary/50 p-4 mb-4">
          <p className="text-sm text-foreground leading-relaxed">{todayTip}</p>
          <button onClick={() => navigate('/learn')} className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
            More tips <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>

        {/* Pre-wash day prompt */}
        {showWashPrompt && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-5 mb-4 border-l-4 border-l-warning">
            <h3 className="font-semibold text-foreground mb-1">Wash day is coming up</h3>
            <p className="text-sm text-muted-foreground mb-4">When you take down your style, take a moment to check your scalp.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/wash-day')} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl font-medium text-sm btn-press">Start early assessment</button>
              <button onClick={() => setDismissedWashPrompt(true)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm btn-press text-muted-foreground">I'll wait</button>
            </div>
          </motion.div>
        )}

        {/* Quick log card */}
        <button onClick={() => setShowQuickLog(true)} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-warning" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Something feels off?</p>
            <p className="text-xs text-muted-foreground">Quick log — takes 30 seconds</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* Health profile prompt */}
        {!healthProfile.sweat && !healthProfile.medicalConditions.length && (
          <button onClick={() => navigate('/health-profile')} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left border-l-4 border-l-secondary">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
              <Heart size={20} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Complete your health profile</p>
              <p className="text-xs text-muted-foreground">For more personalised insights</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        )}

        {/* Research contribution card - only after 2+ check-ins, not yet dismissed/consented */}
        {checkInCount >= 2 && !research.consented && !research.dismissed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-5 mb-4 border-l-4 border-l-primary">
            <div className="flex items-start gap-3 mb-3">
              <Microscope size={20} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Help build better AI for textured hair</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Most scalp health AI doesn't work well on darker skin because the training data doesn't include us. Your check-in photos could help change that.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/research')} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl font-medium text-sm btn-press">Tell me more</button>
              <button onClick={() => setResearch({ ...research, dismissed: true })} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm btn-press text-muted-foreground">Not right now</button>
            </div>
          </motion.div>
        )}

        {/* Salon visit card */}
        <button onClick={() => setShowSalonForm(true)} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Scissors size={20} className="text-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">{isMale ? 'Log a salon or barber visit' : 'Log a salon visit'}</p>
            <p className="text-xs text-muted-foreground">Track appointments and services</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* Next action */}
        <div className="card-elevated p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center">
              <Leaf size={18} className="text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="font-semibold text-foreground">{onboardingData.isWornOutOnly ? 'Scalp check-in' : 'Mid-cycle check-in'}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {onboardingData.isWornOutOnly
              ? "It's been 2 weeks — ready for a quick scalp check?"
              : "Hey — it's been 2 weeks since your braids went in. Quick check-in? Takes about a minute."}
          </p>
          <button onClick={() => navigate(onboardingData.isWornOutOnly ? '/wash-day?mode=regular' : '/mid-cycle')} className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm btn-press">Start check-in</button>
        </div>

        {/* Got a question? - points to Learn since chat is floating */}
        <button onClick={() => navigate('/learn')} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Got a question?</p>
            <p className="text-xs text-muted-foreground">Tap the chat bubble or browse articles</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* Recent */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Recent</h3>
          <div className="space-y-2">
            {recentEntries.map((entry, i) => (
              <button key={i} onClick={() => navigate(entry.nav)} className="card-elevated p-4 w-full flex items-center justify-between btn-press">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${entry.risk}`} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-2xl bg-sage-light p-5 mb-20">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-sm text-foreground">
                <strong>Did you know?</strong> Traction alopecia affects up to 1 in 3 people who regularly wear tight hairstyles.
              </p>
              <button onClick={() => navigate('/learn')} className="text-sm text-primary font-medium mt-2">Learn more</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Check-In Prompt Modal */}
      <AnimatePresence>
        {showCheckInModal && !dismissedCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-[55] flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card"
            >
              {!onboardingData.isWornOutOnly ? (
                <>
                  <p className="text-foreground leading-relaxed mb-6">
                    Hey — your braids have been in for 14 days. Quick scalp check? Takes about a minute.
                  </p>
                  <button
                    onClick={() => { dismissCheckIn(); navigate('/mid-cycle'); }}
                    className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mb-3"
                  >
                    Start check-in
                  </button>
                  <button
                    onClick={dismissCheckIn}
                    className="w-full text-center text-sm text-muted-foreground py-2"
                  >
                    Remind me later
                  </button>
                </>
              ) : (
                <>
                  <p className="text-foreground leading-relaxed mb-6">
                    It's been 2 weeks — ready for a quick scalp check? Takes about 2 minutes.
                  </p>
                  <button
                    onClick={() => { dismissCheckIn(); navigate('/wash-day?mode=regular'); }}
                    className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mb-3"
                  >
                    Start check-in
                  </button>
                  <button
                    onClick={dismissCheckIn}
                    className="w-full text-center text-sm text-muted-foreground py-2"
                  >
                    Remind me later
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Health Profile Nudge Modal */}
      <AnimatePresence>
        {showHealthNudge && !dismissedHealthNudge && !showCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-[55] flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center">
                  <Heart size={22} className="text-primary" strokeWidth={1.8} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground text-center mb-2">You're all set!</h3>
              <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                We've set up your cycle and check-ins based on what you told us. When you have a few minutes, there's a more detailed health profile you can fill in. The more we know, the smarter your insights get.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Stethoscope size={16} className="text-primary flex-shrink-0" strokeWidth={1.8} />
                  <p className="text-sm text-foreground">Medical history and conditions</p>
                </div>
                <div className="flex items-center gap-3">
                  <FlaskConical size={16} className="text-primary flex-shrink-0" strokeWidth={1.8} />
                  <p className="text-sm text-foreground">Recent blood work (iron, vitamin D, thyroid)</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-primary flex-shrink-0" strokeWidth={1.8} />
                  <p className="text-sm text-foreground">Scalp environment and skin conditions</p>
                </div>
              </div>
              <button
                onClick={() => { setDismissedHealthNudge(true); navigate('/health-profile'); }}
                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mb-3"
              >
                Take me there
              </button>
              <button
                onClick={() => setDismissedHealthNudge(true)}
                className="w-full text-center text-sm text-muted-foreground py-2"
              >
                I'll do it later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Log Modal */}
      <AnimatePresence>
        {showQuickLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-[60] flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-t-3xl w-full max-w-[430px] max-h-[85vh] flex flex-col">
              <div className="p-6 pb-10 overflow-y-auto flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Quick log</h3>
                  <button onClick={resetQuickLog} className="p-1"><X size={22} className="text-muted-foreground" strokeWidth={1.8} /></button>
                </div>

                {quickLogStep === 0 && (
                  <div>
                    <p className="font-medium text-foreground mb-4">What are you noticing?</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {quickLogSymptoms.map(s => (
                        <button key={s} onClick={() => toggleQuickSymptom(s)} className={`pill-option ${quickSymptoms.includes(s) ? 'selected' : ''}`}>{s}</button>
                      ))}
                    </div>
                    {quickSymptoms.includes('Something else') && (
                      <input type="text" value={quickOtherText} onChange={e => setQuickOtherText(e.target.value)} placeholder="What are you noticing?" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-4" />
                    )}
                    <button onClick={() => setQuickLogStep(1)} disabled={quickSymptoms.length === 0} className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${quickSymptoms.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>Next</button>
                  </div>
                )}

                {quickLogStep === 1 && (
                  <div>
                    <p className="font-medium text-foreground mb-4">How bad is it?</p>
                    <div className="space-y-3">
                      {quickLogSeverities.map(s => (
                        <button key={s.label} onClick={() => { setQuickSeverity(s.label); setQuickLogStep(2); }} className={`selection-card w-full text-left ${quickSeverity === s.label ? 'selected' : ''}`}>
                          <p className="font-medium text-foreground">{s.label}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {quickLogStep === 2 && (
                  <div>
                    {quickSeverity === 'Mild' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Leaf size={22} className="text-primary" strokeWidth={1.8} /></div>
                        <h4 className="font-semibold text-center mb-2">Thanks for sharing that</h4>
                        <p className="text-sm text-muted-foreground text-center mb-6">We'll keep an eye on this. In the meantime:</p>
                        <div className="rounded-2xl bg-accent p-4 mb-6"><p className="text-sm text-foreground">{getQuickLogTip(quickSymptoms)}</p></div>
                      </div>
                    )}
                    {quickSeverity === 'Moderate' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center mx-auto mb-4"><AlertTriangle size={22} className="text-warning" strokeWidth={1.8} /></div>
                        <h4 className="font-semibold text-center mb-2">Okay, that's really helpful to know</h4>
                        <p className="text-sm text-muted-foreground text-center mb-4">Here are some things to try. If it gets worse, you can do a full check-in anytime.</p>
                        <div className="card-elevated p-4 mb-6">
                          <ol className="space-y-3">
                            {getQuickLogTips(quickSymptoms).map((tip, i) => (
                              <li key={i} className="flex gap-3 text-sm">
                                <span className="w-5 h-5 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-warning">{i + 1}</span>
                                <span className="text-muted-foreground">{tip}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                    {quickSeverity === 'Severe' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4"><AlertTriangle size={22} className="text-destructive" strokeWidth={1.8} /></div>
                        <h4 className="font-semibold text-center mb-2">I'm sorry you're dealing with that</h4>
                        <p className="text-sm text-muted-foreground text-center mb-6">That sounds like it needs attention. A full assessment will give you personalised guidance and, if needed, a summary to share with a professional.</p>
                        <button onClick={() => { handleQuickLogDone(); navigate('/wash-day'); }} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mb-3">Do a full assessment</button>
                        <button onClick={() => navigate('/results?risk=red')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm btn-press mb-6">View guidance</button>
                      </div>
                    )}
                    {quickSeverity !== 'Severe' && (
                      <>
                        <button onClick={handleQuickLogDone} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">Done</button>
                        <p className="text-xs text-center text-muted-foreground mt-3">This has been saved to your timeline</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Salon Visit Modal */}
      <AnimatePresence>
        {showSalonForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-t-3xl w-full max-w-[430px] max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">{isMale ? 'Log a salon or barber visit' : 'Log a salon visit'}</h3>
                  <button onClick={() => setShowSalonForm(false)} className="p-1"><X size={22} className="text-muted-foreground" strokeWidth={1.8} /></button>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">Date of visit</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-left text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="text-foreground">{format(visitDate, 'PPP')}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker mode="single" selected={visitDate} onSelect={(d) => d && setVisitDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">What was done?</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map(s => (<button key={s} onClick={() => toggleService(s)} className={`pill-option ${services.includes(s) ? 'selected' : ''}`}>{s}</button>))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">Stylist name (optional)</label>
                  <input type="text" value={stylistName} onChange={e => setStylistName(e.target.value)} placeholder="e.g. Ama" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Any notes? (optional)</label>
                  <textarea value={visitNotes} onChange={e => setVisitNotes(e.target.value)} placeholder="e.g. Deep conditioning treatment" rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <button onClick={handleSaveSalon} disabled={services.length === 0} className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${services.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>Save visit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
