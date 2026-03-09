import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Leaf, Lightbulb, Scissors, X, Calendar, Heart, AlertTriangle, Target, Stethoscope } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { didYouKnowFacts } from '@/data/didYouKnowFacts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const serviceOptions = ['Wash', 'Treatment', 'Style installation', 'Style removal/takedown', 'Trim', 'Colour', 'Lineup or shape-up', 'Retwist (locs)', 'Barber fade or cut', 'Scalp treatment', 'Other'];

const HomePage = () => {
  const navigate = useNavigate();
  const { onboardingData, healthProfile, addSalonVisit, checkInCount, userName } = useApp();
  const [showSalonForm, setShowSalonForm] = useState(false);
  const [showSalonVisitPicker, setShowSalonVisitPicker] = useState(false);
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [services, setServices] = useState<string[]>([]);
  const [stylistName, setStylistName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [showScalpCheckInPicker, setShowScalpCheckInPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem('follisense-last-home-visit', String(Date.now()));
    const justOnboarded = sessionStorage.getItem('follisense-just-onboarded');
    if (justOnboarded === 'true') {
      return () => { sessionStorage.removeItem('follisense-just-onboarded'); };
    }
  }, []);

  const isMale = onboardingData.gender === 'man';
  const currentStyle = onboardingData.protectiveStyles[0] || 'Braids';
  const currentDay = 14;
  const totalDays = 28;
  const progress = (currentDay / totalDays) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const toggleService = (s: string) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSaveSalon = () => {
    addSalonVisit({ id: `sv-${Date.now()}`, date: format(visitDate, 'MMM d'), services, stylistName: stylistName || undefined, notes: visitNotes || undefined });
    setShowSalonForm(false);
    setServices([]);
    setStylistName('');
    setVisitNotes('');
    setVisitDate(new Date());
  };

  // Check-in context text
  const getCheckInLabel = () => {
    if (isMale) {
      if (onboardingData.barberFrequency) return 'Scalp check-in';
      if (onboardingData.locRetwistFrequency) return 'Scalp check-in';
      return 'Scalp check-in';
    }
    return onboardingData.isWornOutOnly ? 'Scalp check-in' : 'Scalp check-in';
  };

  const getCheckInDesc = () => {
    if (isMale) {
      if (onboardingData.barberFrequency) return "It's been a couple of weeks since your last barber visit. Quick scalp check?";
      if (onboardingData.locRetwistFrequency) return "Your locs have been in for 2 weeks — time for a quick scalp check?";
      return "Ready for a quick scalp check? Takes about a minute.";
    }
    if (onboardingData.isWornOutOnly) return "It's been 2 weeks — ready for a quick scalp check?";
    return `Hey — it's been 2 weeks since your ${(currentStyle).toLowerCase()} went in. Quick check-in?`;
  };

  // Profile completeness check
  const skipped = JSON.parse(sessionStorage.getItem('follisense-skipped-sections') || '[]');
  const hasSkippedProducts = skipped.includes(6) || skipped.includes(7);
  const hasIncompleteProfile = hasSkippedProducts || (!healthProfile.sweat && !healthProfile.medicalConditions.length);

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

        {/* ══════ Primary Action: Scalp Check-in ══════ */}
        <button
          onClick={() => setShowScalpCheckInPicker(true)}
          className="card-elevated p-5 mb-4 w-full text-left border-l-4 border-l-primary"
        >
          <div className="flex items-center gap-4">
            {/* Cycle ring for protective style users */}
            {!isMale && !onboardingData.isWornOutOnly ? (
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
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Leaf size={24} className="text-primary" strokeWidth={1.8} />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">{getCheckInLabel()}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{getCheckInDesc()}</p>
              <p className="text-xs text-primary font-medium mt-1.5">{checkInCount} check-ins completed</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
          </div>
        </button>

        {/* ══════ Salon Visit (secondary) ══════ */}
        <button onClick={() => setShowSalonVisitPicker(true)} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Scissors size={20} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Salon Visit</p>
            <p className="text-xs text-muted-foreground">Log your visit or let your stylist check in</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* ══════ Did You Know ══════ */}
        <div className="rounded-2xl bg-sage-light p-5 mb-4">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-sm text-foreground">
                <strong>Did you know?</strong> {didYouKnowFacts[dayOfYear % didYouKnowFacts.length]}
              </p>
              <button onClick={() => navigate('/learn')} className="text-sm text-primary font-medium mt-2">Learn more</button>
            </div>
          </div>
        </div>

        {/* ══════ Complete your profile (only if sections skipped) ══════ */}
        {hasIncompleteProfile && (
          <button onClick={() => navigate(hasSkippedProducts ? '/onboarding?step=7' : '/health-profile')} className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left border-l-4 border-l-warning">
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
              <Target size={20} className="text-warning" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Complete your profile</p>
              <p className="text-xs text-muted-foreground">Fill in skipped sections for better personalisation</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20" />
      </motion.div>

      {/* ══════ Scalp Check-in Picker Modal ══════ */}
      <AnimatePresence>
        {showScalpCheckInPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-[55] flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Scalp Check-in</h3>
                <button onClick={() => setShowScalpCheckInPicker(false)} className="p-1"><X size={22} className="text-muted-foreground" strokeWidth={1.8} /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-5">What would you like to do?</p>

              {/* Scheduled check-in */}
              <button
                onClick={() => {
                  setShowScalpCheckInPicker(false);
                  navigate(isMale || onboardingData.isWornOutOnly ? '/wash-day?mode=regular' : '/mid-cycle');
                }}
                className="w-full card-elevated p-4 mb-3 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                  <Leaf size={20} className="text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Scheduled check-in</p>
                  <p className="text-xs text-muted-foreground">Your regular scalp check — takes about a minute</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>

              {/* Something feels off */}
              <button
                onClick={() => {
                  setShowScalpCheckInPicker(false);
                  navigate('/scalp-check');
                }}
                className="w-full card-elevated p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-warning" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Something feels off</p>
                  <p className="text-xs text-muted-foreground">Log a symptom or check what you're seeing</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ Salon Visit Picker Modal ══════ */}
      <AnimatePresence>
        {showSalonVisitPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-[55] flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Salon Visit</h3>
                <button onClick={() => setShowSalonVisitPicker(false)} className="p-1"><X size={22} className="text-muted-foreground" strokeWidth={1.8} /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-5">What would you like to do?</p>
              <button
                onClick={() => { setShowSalonVisitPicker(false); setShowSalonForm(true); }}
                className="w-full card-elevated p-4 mb-3 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Log my own visit</p>
                  <p className="text-xs text-muted-foreground">Record your salon or barber experience</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => { setShowSalonVisitPicker(false); navigate('/salon-checkin'); }}
                className="w-full card-elevated p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={20} className="text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Stylist check-in</p>
                  <p className="text-xs text-muted-foreground">Hand your phone to your stylist for photo capture</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ Salon Visit Form Modal ══════ */}
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
