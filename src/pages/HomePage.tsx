import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ChevronRight, Leaf, Lightbulb } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { onboardingData, history } = useApp();

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

  // Progress arc
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

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

        {/* Cycle status card */}
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
    </div>
  );
};

export default HomePage;
