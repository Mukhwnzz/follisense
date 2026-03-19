import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUserName, onboardingComplete } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const nameFromEmail = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
    const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    setUserName(displayName || 'there');
    navigate(onboardingComplete ? '/home' : '/onboarding');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`#login-card { border: none !important; outline: none !important; box-shadow: none !important; }`}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '860px', border: 'none', outline: 'none' }}
      >
        {/* White card — no border/outline */}
        <div id="login-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '44px 72px', border: 'none', outline: 'none' }}>

          {/* Logo + FolliSense — centered, inline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/11847/11847144.png"
              alt="FolliSense logo"
              style={{ width: '34px', height: '34px', filter: 'invert(60%) sepia(0%) saturate(0%) brightness(70%) contrast(85%)', flexShrink: 0 }}
            />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.01em', lineHeight: '1' }}>
              FolliSense
            </span>
          </div>

          {/* Welcome back */}
          <p style={{ textAlign: 'center', paddingLeft: '44px', fontSize: '0.75rem', fontWeight: 400, color: '#b0b0b0', letterSpacing: '0.04em', marginBottom: '32px' }}>
            Welcome back
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '6px' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', backgroundColor: '#FFFFFF', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#2d2d2d' }}>Password</label>
                <button type="button" onClick={() => navigate('/forgot-password')} style={{ fontSize: '0.75rem', color: '#7fa896', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ width: '100%', height: '48px', padding: '0 48px 0 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', backgroundColor: '#FFFFFF', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9e9e9e' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setEmail('test@follisense.app'); setPassword('demo1234'); setUserName('Ama'); navigate('/onboarding'); }}
                style={{ fontSize: '0.75rem', color: '#b0b0b0', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Use test account
              </button>
            </div>

            {/* Log in button — beige */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                border: 'none',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                backgroundColor: '#7fa896',
                color: '#FFFFFF',
                transition: 'all 0.2s ease',
              }}
            >
              Log in
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
            <span style={{ fontSize: '0.75rem', color: '#b0b0b0' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => { setUserName('Ama'); navigate('/onboarding'); }}
              style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1.5px solid #e0e0e0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => { setUserName('Ama'); navigate('/onboarding'); }}
              style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1.5px solid #e0e0e0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9e9e9e' }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} style={{ color: '#7fa896', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button>
          </p>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#b0b0b0', marginTop: '12px' }}>
            Are you a stylist?{' '}
            <button onClick={() => navigate('/stylist/login')} style={{ color: '#7fa896', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Log in here</button>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;