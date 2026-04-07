import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const StylistSignUpPage = () => {
  const navigate = useNavigate();
  const { setUserName, setStylistMode } = useApp();

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

  const canSubmit =
    firstName.trim().length > 0 &&
    isValidEmail &&
    isStrongPassword &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      // 1. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        return;
      }

      const userId = authData.user.id;

      // 2. Insert into profiles table with role = 'stylist'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'stylist',
          first_name: firstName,
          gender: null, // stylists usually don't need gender
        });

      if (profileError) {
        console.error('Profile insert error:', profileError);
        setError("Account created, but profile save failed. Please contact support.");
        return;
      }

      // 3. Success
      setUserName(firstName);
      setStylistMode(true);

      toast({
        title: "Stylist account created!",
        description: "Please check your email to confirm your account.",
      });

      navigate('/stylist/onboarding');

    } catch (err) {
      console.error('Stylist signup error:', err);
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={24} className="text-primary" strokeWidth={1.8} />
          <span className="text-xl font-semibold text-foreground">FolliSense</span>
          <span className="text-[10px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">Stylist</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground text-center mb-1">Join as a Stylist</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Help your clients maintain healthy scalp and hair</p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* First Name */}
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

          {/* Email */}
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
              <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase & number"
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
            {password && !isStrongPassword && (
              <p className="text-xs text-red-500 mt-1">
                Password must be 8+ characters and include uppercase, lowercase, and a number
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full h-14 rounded-xl font-semibold text-base transition-all ${
              canSubmit 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating stylist account...' : 'Create stylist account'}
          </button>
        </form>

        <div className="flex items-center gap-3 text-muted-foreground text-xs mb-4 px-2">
          <Shield size={14} className="flex-shrink-0" />
          <p>Your data is private and encrypted. We never share your information without consent.</p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have a stylist account?{' '}
          <button 
            onClick={() => navigate('/stylist/login')} 
            className="text-primary font-medium"
          >
            Log in here
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default StylistSignUpPage;