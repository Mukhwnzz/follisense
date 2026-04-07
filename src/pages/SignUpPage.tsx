import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const genderOptions = [
  { id: 'woman', label: 'Female' },
  { id: 'man', label: 'Male' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const { setUserName, setOnboardingData } = useApp();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('');
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
      // 1. Create Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
          }
        }
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

      // 2. Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'consumer',           // Change to 'stylist' when you add stylist signup
          first_name: firstName,
          gender: gender || null,
        });

      if (profileError) {
        console.error('Profile insert error:', profileError);
        setError("Account created but profile failed to save. Please contact support.");
        return;
      }

      // 3. Success
      setUserName(firstName);

      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account.",
      });

      // Redirect to onboarding (or login if you want email confirmation first)
      navigate('/onboarding');

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
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
                placeholder="At least 8 characters with uppercase, lowercase & number"
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

          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">How do you identify?</label>
            <p className="text-xs text-muted-foreground mb-2">This helps us personalise your experience</p>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id)}
                  className={`flex-1 h-11 rounded-xl border-2 text-sm font-medium transition-colors ${
                    gender === opt.id
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 text-muted-foreground text-xs px-2">
          <Shield size={14} className="flex-shrink-0" />
          <p>Your data is private and encrypted. We never share your information.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;