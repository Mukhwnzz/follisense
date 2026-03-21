import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const StylistLoginPage = () => {
  const navigate = useNavigate();
  const { setUserName, setStylistMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await supabase.auth.signOut(); // clear any old session

      // 1️⃣ Login user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ title: error.message });
        return;
      }

      const user = data.user;

      if (!user) {
        toast({ title: 'Login failed' });
        return;
      }

      // 2️⃣ Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast({ title: 'Could not fetch profile' });
        return;
      }

      // 3️⃣ Role check (THIS FIXES YOUR BUG)
      if (profile.role !== 'stylist') {
        toast({ title: 'This is not a stylist account' });
        await supabase.auth.signOut();
        return;
      }

      // 4️⃣ Success
      setUserName(profile.first_name || 'Stylist');
      setStylistMode(true);

      navigate('/stylist');
    } catch (err) {
      console.error(err);
      toast({ title: 'Something went wrong' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[430px] w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={24} className="text-primary" strokeWidth={1.8} />
          <span className="text-xl font-semibold text-foreground">FolliSense</span>
          <span className="text-[10px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">
            Stylist
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground text-center mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Log in to your stylist account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-primary font-medium"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
              canSubmit
                ? 'bg-primary text-primary-foreground'
                : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mb-3">
          Don't have a stylist account?{' '}
          <button
            onClick={() => navigate('/stylist/signup')}
            className="text-primary font-medium"
          >
            Sign up
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Looking for the personal app?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-medium"
          >
            Log in here
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default StylistLoginPage;