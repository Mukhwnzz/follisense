import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Leaf, Lightbulb, Scissors, X, Calendar, Heart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const serviceOptions = ['Wash', 'Treatment', 'Style installation', 'Style removal/takedown', 'Trim', 'Colour', 'Other'];

const HomePage = () => {
  const navigate = useNavigate();
  const { onboardingData, history, salonVisits, addSalonVisit, healthProfile } = useApp();
  const [showSalonForm, setShowSalonForm] = useState(false);
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [services, setServices] = useState<string[]>([]);
  const [stylistName, setStylistName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');

  const currentStyle = onboardingData.protectiveStyles[0] || 'Braids';
  const currentDay = 14;
  const totalDays = 28;
  const progress = (currentDay / totalDays) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const recentEntries = [
    { label: 'Wash day check-in', date: 'Feb 20', risk: 'green' as const },
    { label: 'Mid-cycle check-in', date: 'Feb 10', risk: 'green' as const },
    { label: 'Wash day check-in', date: 'Feb 6', risk: 'amber' as const },
  ];

  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const toggleService = (s: string) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

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

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{greeting}</h1>
            <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User size={20} className="text-muted-foreground" strokeWidth={1.8} />
          </button>
        </div>

        {/* Cycle status card — protective style wearer */}
        {!onboardingData.isWornOutOnly ? (
          <div className="card-elevated p-5 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <svg width={size} height={size} className="-rotate-90">
                  <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
                  <motion.circle
                    cx={size/2} cy={size/2} r={radius} fill="none"
                    stroke="hsl(var(--primary))" strokeWidth={stroke}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
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
                <span className="text-xl font-semibold text-foreground">3</span>
                <span className="text-[10px] text-muted-foreground leading-tight">days ago</span>
              </div>
              <div className="flex-1">
                <p className="text-label mb-1">Last wash</p>
                <p className="font-semibold text-foreground">{new Date(Date.now() - 3 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <p className="text-sm text-muted-foreground mt-1">Next check-in: {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Health profile prompt */}
        {!healthProfile.sweat && !healthProfile.medicalConditions.length && (
          <button
            onClick={() => navigate('/health-profile')}
            className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left border-l-4 border-l-secondary"
          >
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

        {/* Salon visit card */}
        <button
          onClick={() => setShowSalonForm(true)}
          className="card-elevated p-4 mb-4 w-full flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Scissors size={20} className="text-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Log a salon visit</p>
            <p className="text-xs text-muted-foreground">Track appointments and services</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* Next action */}
        <div className="card-elevated p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center">
              <Leaf size={18} className="text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="font-semibold text-foreground">Mid-cycle check-in</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">3 quick questions — takes 1 minute</p>
          <button
            onClick={() => navigate('/mid-cycle')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm btn-press"
          >
            Start check-in
          </button>
        </div>

        {/* Recent */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Recent</h3>
          <div className="space-y-2">
            {recentEntries.map((entry, i) => (
              <div key={i} className="card-elevated p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${entry.risk}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-2xl bg-sage-light p-5">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-sm text-foreground">
                <strong>Did you know?</strong> Traction alopecia affects up to 1 in 3 women who regularly wear tight hairstyles.
              </p>
              <button onClick={() => navigate('/learn')} className="text-sm text-primary font-medium mt-2">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Salon Visit Modal */}
      <AnimatePresence>
        {showSalonForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-3xl w-full max-w-[430px] max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Log a salon visit</h3>
                  <button onClick={() => setShowSalonForm(false)} className="p-1">
                    <X size={22} className="text-muted-foreground" strokeWidth={1.8} />
                  </button>
                </div>

                {/* Date picker */}
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
                      <CalendarPicker
                        mode="single"
                        selected={visitDate}
                        onSelect={(d) => d && setVisitDate(d)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Services */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">What was done?</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleService(s)}
                        className={`pill-option ${services.includes(s) ? 'selected' : ''}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stylist name */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground mb-2 block">Stylist name (optional)</label>
                  <input
                    type="text"
                    value={stylistName}
                    onChange={e => setStylistName(e.target.value)}
                    placeholder="e.g. Ama"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Any notes? (optional)</label>
                  <textarea
                    value={visitNotes}
                    onChange={e => setVisitNotes(e.target.value)}
                    placeholder="e.g. Deep conditioning treatment"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveSalon}
                  disabled={services.length === 0}
                  className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                    services.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Save visit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
