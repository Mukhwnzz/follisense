import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { setUserName } = useApp();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isStrongPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit = firstName.trim().length > 0 && isValidEmail && isStrongPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError(authError.message); return; }

      if (authData.user) {
        await supabase.from('profiles').upsert([{
          id: authData.user.id,
          role: 'consumer',
          first_name: firstName,
        }]);
      }

      setUserName(firstName);
      navigate('/onboarding');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf size={24} className="text-primary" strokeWidth={1.8} />
          <span className="text-xl font-semibold text-foreground">FolliSense</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground text-center mb-6">Create your account</h1>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {email && !isValidEmail && (
              <p className="text-xs text-red-500 mt-1">Enter a valid email</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters with uppercase, lowercase and number"
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {password && !isStrongPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Password must be 8+ chars, include uppercase, lowercase and number
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
              canSubmit ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Social login buttons */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-2 mb-4">
          <button
            onClick={() => { setUserName(firstName || 'User'); navigate('/onboarding'); }}
            className="w-full h-12 rounded-xl border-2 border-border bg-card text-foreground font-medium text-sm flex items-center justify-center gap-2 btn-press"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" />
            Continue with Google
          </button>
          <button
            onClick={() => { setUserName(firstName || 'User'); navigate('/onboarding'); }}
            className="w-full h-12 rounded-xl border-2 border-border bg-card text-foreground font-medium text-sm flex items-center justify-center gap-2 btn-press"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground text-xs px-2">
          <Shield size={14} className="flex-shrink-0" />
          <p>Your health data is private and encrypted. We never share your information without your consent.</p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-medium">Log in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
