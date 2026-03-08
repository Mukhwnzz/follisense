import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const StylistLoginPage = () => {
  const navigate = useNavigate();
  const { setUserName, setStylistMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
    setUserName(name.charAt(0).toUpperCase() + name.slice(1) || 'Stylist');
    setStylistMode(true);
    navigate('/stylist');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-[430px] w-full">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={24} className="text-primary" strokeWidth={1.8} />
          <span className="text-xl font-semibold text-foreground">ScalpSense</span>
          <span className="text-[10px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">Stylist</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground text-center mb-8">Welcome back, stylist</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" autoFocus />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-primary font-medium">Forgot password?</button>
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          <button type="button" onClick={() => { setEmail('stylist@scalpsense.app'); setPassword('demo1234'); setUserName('Ama'); setStylistMode(true); navigate('/stylist'); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Use test account</button>

          <button type="submit" disabled={!canSubmit} className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${canSubmit ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>Log in</button>
        </form>

        <div className="flex items-center gap-3 mb-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
        <div className="space-y-3 mb-8">
          <button onClick={() => toast({ title: 'Coming soon' })} className="w-full h-12 rounded-xl border-2 border-border bg-card text-foreground text-sm font-medium flex items-center justify-center gap-3 btn-press">Continue with Google</button>
          <button onClick={() => toast({ title: 'Coming soon' })} className="w-full h-12 rounded-xl border-2 border-border bg-card text-foreground text-sm font-medium flex items-center justify-center gap-3 btn-press">Continue with Apple</button>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-3">
          Don't have a stylist account? <button onClick={() => navigate('/stylist/signup')} className="text-primary font-medium">Sign up</button>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Looking for the personal app? <button onClick={() => navigate('/login')} className="text-primary font-medium">Log in here</button>
        </p>
      </motion.div>
    </div>
  );
};

export default StylistLoginPage;
