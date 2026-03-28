import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{
  backgroundImage: 'url(https://i.pinimg.com/1200x/33/db/0b/33db0b45d854152416ab14b23bb5619d.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  width: '100%',
}}>
      {/* Dark overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', textAlign: 'center', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/11847/11847144.png"
            alt="FolliSense logo"
            style={{ width: '36px', height: '36px', filter: 'brightness(0) invert(1)', flexShrink: 0 }}
          />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.01em' }}>
            FolliSense
          </h1>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '48px', fontFamily: "'Montserrat', sans-serif" }}>
          Smart scalp care, built around you
        </p>

        {/* Consumer card */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '12px',
          width: '100%',
          maxWidth: '480px',
          textAlign: 'left',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="https://cdn-icons-png.flaticon.com/512/11847/11847144.png" alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', fontFamily: "'Montserrat', sans-serif", fontSize: '0.95rem' }}>I'm a consumer</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontFamily: "'Montserrat', sans-serif" }}>Track your scalp health and hair journey</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/signup')}
              style={{ flex: 1, height: '46px', backgroundColor: '#FFFFFF', color: '#1a1a1a', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ flex: 1, height: '46px', backgroundColor: 'transparent', color: '#FFFFFF', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
            >
              Log in
            </button>
          </div>
        </div>

        {/* Stylist card */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '480px',
          textAlign: 'left',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Scissors size={20} color="#FFFFFF" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', fontFamily: "'Montserrat', sans-serif", fontSize: '0.95rem' }}>I'm a stylist or barber</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontFamily: "'Montserrat', sans-serif" }}>Professional tools for client scalp health</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/stylist/signup')}
              style={{ flex: 1, height: '46px', backgroundColor: '#FFFFFF', color: '#1a1a1a', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/stylist/login')}
              style={{ flex: 1, height: '46px', backgroundColor: 'transparent', color: '#FFFFFF', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
            >
              Log in
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif" }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;