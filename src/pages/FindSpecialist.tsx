import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FindSpecialist = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-1.5">
            <Leaf size={16} className="text-primary" strokeWidth={1.8} />
            <span className="text-xs font-semibold text-muted-foreground">FolliSense</span>
          </div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-24 pt-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center">
              <Leaf size={28} className="text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-2">Find a Specialist</h1>
          <p className="text-lg text-muted-foreground text-center mb-4">Coming soon</p>
          <p className="text-sm text-muted-foreground text-center leading-relaxed mb-10 max-w-[320px] mx-auto">
            We're building a curated directory of trichologists, dermatologists, and GPs who understand textured hair. Watch this space.
          </p>

          <div className="card-elevated p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={20} className="text-primary" strokeWidth={1.5} />
              <p className="font-medium text-foreground text-sm">Get notified when it's ready</p>
            </div>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-3"
            />
            <button onClick={() => toast({ title: 'You\'re on the list!', description: 'We\'ll notify you when the specialist directory is ready.' })} className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm btn-press">
              Notify me
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full h-14 rounded-xl border-2 border-border font-semibold text-base btn-press text-foreground"
          >
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FindSpecialist;
