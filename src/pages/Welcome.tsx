import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, CalendarCheck, Brain, Stethoscope } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { onboardingComplete } = useApp();

  const features = [
    { icon: CalendarCheck, text: 'Track symptoms around your wash day, not every day' },
    { icon: Brain, text: 'Understand what your scalp and hair are telling you' },
    { icon: Stethoscope, text: 'Know when to seek professional care' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-20 right-[-80px] w-[300px] h-[300px] rounded-full bg-sand/40 blur-3xl" />
      <div className="absolute bottom-20 left-[-60px] w-[200px] h-[200px] rounded-full bg-sand/30 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-[430px] w-full text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf size={28} className="text-primary" strokeWidth={1.8} />
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">ScalpSense</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-12">Smart scalp care, built around you</p>

        <div className="space-y-4 mb-12">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
              className="flex items-center gap-4 text-left px-2"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-primary" strokeWidth={1.8} />
              </div>
              <p className="text-foreground text-[15px]">{text}</p>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => navigate('/signup')}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press"
        >
          Get started
        </button>

        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Already have an account? Log in
        </button>

        <div className="w-full h-px bg-border my-6" />

        <p className="text-sm text-muted-foreground mb-3">Are you a hair professional?</p>
        <button
          onClick={() => navigate('/stylist/signup')}
          className="w-full h-12 rounded-xl border-2 border-border bg-card text-foreground text-sm font-semibold btn-press"
        >
          Stylist sign-up
        </button>
      </motion.div>
    </div>
  );
};

export default Welcome;
