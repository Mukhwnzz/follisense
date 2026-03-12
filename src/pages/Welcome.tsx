import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, Scissors } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

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
        <div className="flex items-center justify-center gap-2 mb-3">
          <Leaf size={28} className="text-primary" strokeWidth={1.8} />
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">FolliSense</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-10">Smart scalp care, built around you</p>

        {/* Consumer entry */}
        <div className="card-elevated p-5 mb-4 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-semibold text-foreground">I'm a consumer</p>
              <p className="text-xs text-muted-foreground">Track your scalp health and hair journey</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm btn-press"
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 h-12 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm btn-press"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Stylist entry */}
        <div className="card-elevated p-5 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Scissors size={20} className="text-foreground" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-semibold text-foreground">I'm a stylist or barber</p>
              <p className="text-xs text-muted-foreground">Professional tools for client scalp health</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/stylist/signup')}
              className="flex-1 h-12 bg-foreground text-background rounded-xl font-semibold text-sm btn-press"
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/stylist/login')}
              className="flex-1 h-12 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm btn-press"
            >
              Log in
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
