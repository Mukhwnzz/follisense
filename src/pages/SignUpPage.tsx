import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { setUserName, setOnboardingData } = useApp();

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
          role: 'consumer',          
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
    <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(https://i.pinimg.com/736x/c7/0e/6f/c70e6f35cd514ff235f0565f5b8fbe6f.jpg)', backgroundSize: '100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '620px', border: 'none', outline: 'none' }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderRadius: '24px', padding: '28px 52px', border: '1px solid rgba(255, 255, 255, 0.3)', outline: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>

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
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.01em', lineHeight: '1' }}>
              FolliSense
            </span>
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

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            {/* First Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginBottom: '6px' }}>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name"
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a' }}
                autoFocus
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
          </form>
          

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginBottom: '6px' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a' }}
              />
              {email && !isValidEmail && (
                <p style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '4px' }}>Enter a valid email</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8+ chars, upper, lower & number"
                  style={{ width: '100%', height: '48px', padding: '0 48px 0 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a4a4a' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && !isStrongPassword && (
                <p style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '4px' }}>Must be 8+ chars with uppercase, lowercase & number</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '1rem', cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', backgroundColor: '#7C9A8E', color: '#ffffff', transition: 'all 0.2s ease', opacity: canSubmit && !loading ? 1 : 0.6 }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
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
