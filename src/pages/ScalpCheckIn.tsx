import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ScalpCheckIn = () => {
  const navigate = useNavigate();
  const { onboardingData } = useApp();
  const isMale = onboardingData.gender === 'man';

  const options = [
    {
      label: 'Scheduled check-in',
      desc: 'Your regular scalp check — takes about a minute',
      icon: Leaf,
      iconBg: 'bg-sage-light',
      iconColor: 'text-primary',
      onClick: () => navigate(isMale || onboardingData.isWornOutOnly ? '/wash-day?mode=regular' : '/mid-cycle'),
    },
    {
      label: 'Something feels off',
      desc: 'You noticed itching, flaking, tenderness, or something new',
      icon: AlertTriangle,
      iconBg: 'bg-warning/15',
      iconColor: 'text-warning',
      onClick: () => navigate('/spot-it?mode=symptoms'),
    },
    {
      label: 'I want to check something',
      desc: "Compare what you're seeing to reference images",
      icon: Eye,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      onClick: () => navigate('/spot-it?mode=visual'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center py-4">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h1 className="text-xl font-semibold text-foreground mb-1">What brings you here?</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose how you'd like to check in today.</p>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={opt.onClick}
                className="w-full card-elevated p-4 flex items-center gap-3 text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <opt.icon size={20} className={opt.iconColor} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScalpCheckIn;
