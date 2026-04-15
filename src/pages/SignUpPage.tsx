import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName } },
      });

      if (authError) { setError(authError.message); return; }
      if (!authData.user) { setError('Failed to create account. Please try again.'); return; }

      const userId = authData.user.id;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, role: 'consumer', first_name: firstName });

      if (profileError) {
        console.error('Profile insert error:', profileError);
        setError('Account created but profile failed to save. Please contact support.');
        return;
      }

      setUserName(firstName);
      toast({ title: 'Account created successfully!', description: 'Please check your email to confirm your account.' });
      navigate('/onboarding');
    } catch (err: any) {
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

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.01em', lineHeight: '1' }}>
              FolliSense
            </span>
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>Create your account</h1>

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
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
            </div>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <Shield size={14} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.55)' }} />
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>Your data is private and encrypted. We never share your information.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
