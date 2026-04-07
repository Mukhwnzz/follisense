import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, Shield, Trash2, Leaf, Heart, Camera, RefreshCw,
  Target, Check, Droplets, Scissors, FlaskConical, Activity, Pencil, ChevronDown
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const mont = "'Montserrat', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg: '#FAF8F5', surface: '#F5F0EB', ink: '#7A746E',
  goldSolid: '#D4A866', goldDeep: '#C09A52', gold08: 'rgba(212,168,102,0.08)',
  goldBorder: 'rgba(212,168,102,0.18)', mid: '#E8E4DF', muted: '#B0AAA4',
  white: '#FFFFFF',
};

interface ConsumerProfile {
  gender?: string;
  hair_texture?: string;
  current_styles?: string[];
  protective_style_frequency?: string;
  style_duration?: string;
  between_wash_care?: string[];
  between_wash_other?: string;
  top_concerns?: string[];
  chemical_processing?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userName, onboardingData, resetAll } = useApp();

  const [profile, setProfile] = useState<ConsumerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch consumer profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('consumer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
          console.error(error);
        } else if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    resetAll();
    navigate('/');
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100, fontFamily: mont }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(160deg, #2A2420 0%, #3A2E20 100%)', padding: '52px 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,168,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#D4A866" />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,168,102,0.6)', textTransform: 'uppercase' }}>Your Profile</p>
            <h1 style={{ fontFamily: playfair, fontSize: 22, color: '#fff' }}>{userName || 'Welcome'}</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Account */}
        <div style={{ background: C.white, border: `1.5px solid ${C.mid}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px', borderBottom: `1px solid ${C.mid}` }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Account</p>
          </div>
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Name</span>
              <span>{userName || 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.muted }}>Gender</span>
              <span>{profile?.gender || onboardingData.gender || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Your Hair */}
        <div style={{ background: C.white, border: `1.5px solid ${C.mid}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px', borderBottom: `1px solid ${C.mid}` }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Your Hair</p>
          </div>
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Hair Texture</span>
              <span>{profile?.hair_texture || 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Current Styles</span>
              <span>{profile?.current_styles?.join(', ') || 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.muted }}>Protective Style Frequency</span>
              <span>{profile?.protective_style_frequency || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Routine */}
        <div style={{ background: C.white, border: `1.5px solid ${C.mid}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px', borderBottom: `1px solid ${C.mid}` }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Routine</p>
          </div>
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Between Wash Care</span>
              <span>{profile?.between_wash_care?.join(', ') || 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.muted }}>Chemical Processing</span>
              <span>{profile?.chemical_processing || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Concerns */}
        <div style={{ background: C.white, border: `1.5px solid ${C.mid}`, borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px', borderBottom: `1px solid ${C.mid}` }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Top Concerns</p>
          </div>
          <div style={{ padding: '12px 18px' }}>
            {profile?.top_concerns && profile.top_concerns.length > 0 ? (
              profile.top_concerns.map((concern, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? `1px solid ${C.mid}` : 'none' }}>
                  {concern}
                </div>
              ))
            ) : (
              <p style={{ color: C.muted }}>No concerns saved yet</p>
            )}
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', padding: '16px', background: 'none', 
            border: `1.5px solid ${C.mid}`, borderRadius: 12, 
            color: '#B05040', fontWeight: 600 
          }}
        >
          Log out
        </button>

      </div>
    </div>
  );
};

export default ProfilePage;