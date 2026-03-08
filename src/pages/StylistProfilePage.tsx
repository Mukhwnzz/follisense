import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ChevronRight, Shield, Trash2, Leaf, Lock, Eye, EyeOff, Check, MapPin, Briefcase, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const allServices = ['Braids (box braids, knotless, etc.)', 'Cornrows or flat twists', 'Locs installation or maintenance', 'Weave or sew-in', 'Wig install (lace fronts, etc.)', 'Crochet braids', 'Twist styles', 'Natural hair styling', 'Silk press or blowout', 'Relaxer or chemical treatments', 'Colour or bleach', 'Haircuts or trims', 'Barber services (fades, lineups)', 'Scalp treatments', 'Trichology consultations'];
const allGoals = ['Document scalp observations for my clients', 'Learn to spot scalp conditions early', 'Build trust with clients through better scalp care', 'Track client scalp health over time', 'Get referral guidance when I see something concerning', 'Stay up to date on scalp health knowledge', "I'm just exploring for now"];

interface StylistProfile {
  role: string; otherRole: string; experience: string; businessName: string; city: string; country: string;
  workplace: string; clientCount: string; services: string[]; otherService: string; goals: string[];
}

const defaultProfile: StylistProfile = {
  role: '', otherRole: '', experience: '', businessName: '', city: '', country: '',
  workplace: '', clientCount: '', services: [], otherService: '', goals: [],
};

const StylistProfilePage = () => {
  const navigate = useNavigate();
  const { userName, resetAll } = useApp();
  const [profile, setProfile] = useState<StylistProfile>(defaultProfile);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingServices, setEditingServices] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scalpsense-stylist-profile');
      if (saved) setProfile(JSON.parse(saved));
    } catch {}
  }, []);

  const saveProfile = (updated: StylistProfile) => {
    setProfile(updated);
    localStorage.setItem('scalpsense-stylist-profile', JSON.stringify(updated));
  };

  const toggleService = (s: string) => {
    const updated = { ...profile, services: profile.services.includes(s) ? profile.services.filter(x => x !== s) : [...profile.services, s] };
    saveProfile(updated);
  };

  const toggleGoal = (g: string) => {
    const updated = { ...profile, goals: profile.goals.includes(g) ? profile.goals.filter(x => x !== g) : [...profile.goals, g] };
    saveProfile(updated);
  };

  const location = [profile.city, profile.country].filter(Boolean).join(', ');

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3">
            <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold">{userName || 'Stylist'}</h1>
          {profile.role && <p className="text-sm text-muted-foreground mt-0.5">{profile.role}</p>}
          {profile.businessName && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin size={11} /> {profile.businessName}{location ? `, ${location}` : ''}
            </p>
          )}
        </div>

        {/* Professional info */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Professional Info</h3>
          <div className="card-elevated divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><Briefcase size={15} className="text-muted-foreground" /><span className="text-sm text-foreground">Role</span></div>
              <span className="text-sm text-muted-foreground">{profile.role || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-muted-foreground" /><span className="text-sm text-foreground">Business</span></div>
              <span className="text-sm text-muted-foreground truncate max-w-[160px]">{profile.businessName || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-muted-foreground" /><span className="text-sm text-foreground">Location</span></div>
              <span className="text-sm text-muted-foreground">{location || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><Clock size={15} className="text-muted-foreground" /><span className="text-sm text-foreground">Experience</span></div>
              <span className="text-sm text-muted-foreground">{profile.experience || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label">Services</h3>
            <button onClick={() => setEditingServices(!editingServices)} className="text-xs font-medium text-primary">{editingServices ? 'Done' : 'Edit'}</button>
          </div>
          {!editingServices ? (
            <div className="card-elevated p-4">
              {profile.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.services.map(s => (
                    <span key={s} className="text-xs bg-secondary text-foreground px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No services set</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {allServices.map(s => (
                <button key={s} onClick={() => toggleService(s)} className={`p-3 rounded-xl border-2 text-left text-xs font-medium transition-colors ${profile.services.includes(s) ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label">Goals</h3>
            <button onClick={() => setEditingGoals(!editingGoals)} className="text-xs font-medium text-primary">{editingGoals ? 'Done' : 'Edit'}</button>
          </div>
          {!editingGoals ? (
            <div className="card-elevated p-4">
              {profile.goals.length > 0 ? (
                <div className="space-y-2">
                  {profile.goals.map(g => (
                    <div key={g} className="flex items-start gap-2">
                      <Check size={14} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-sm text-foreground">{g}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No goals set</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {allGoals.map(g => (
                <button key={g} onClick={() => toggleGoal(g)} className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${profile.goals.includes(g) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${profile.goals.includes(g) ? 'bg-primary' : 'border-2 border-border'}`}>
                      {profile.goals.includes(g) && <Check size={10} className="text-primary-foreground" strokeWidth={2.5} />}
                    </div>
                    <span className="text-sm text-foreground">{g}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data & Privacy */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Data & Privacy</h3>
          <div className="card-elevated p-4 mb-3">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">Your data stays on your device</p>
                <p className="text-xs text-muted-foreground">Client observations and photos are stored locally and never uploaded.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => setShowChangePassword(!showChangePassword)} className="card-elevated w-full p-4 text-left text-sm text-foreground flex items-center gap-2">
              <Lock size={16} strokeWidth={1.5} /> Change password <ChevronRight size={16} className="text-muted-foreground ml-auto" />
            </button>
            {showChangePassword && (
              <div className="card-elevated p-4 space-y-3">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Current password</label>
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-7 text-muted-foreground">{showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">New password</label>
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-7 text-muted-foreground">{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm new password</label>
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-7 text-muted-foreground">{showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <button
                  onClick={() => { toast({ title: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(false); }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className={`w-full h-10 rounded-xl font-medium text-sm btn-press transition-colors ${currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
                >
                  Update password
                </button>
              </div>
            )}
            <button onClick={() => { resetAll(); navigate('/'); }} className="card-elevated w-full p-4 text-left text-sm text-destructive flex items-center gap-2"><Trash2 size={16} strokeWidth={1.5} /> Delete all data</button>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h3 className="text-label mb-3">About</h3>
          <div className="card-elevated p-4">
            <div className="flex items-start gap-3">
              <Leaf size={16} className="text-primary mt-0.5" strokeWidth={1.8} />
              <div>
                <p className="text-sm text-foreground font-medium">ScalpSense for Stylists</p>
                <p className="text-xs text-muted-foreground mt-1">A professional tool for documenting and tracking client scalp health.</p>
                <p className="text-xs text-muted-foreground mt-2">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Switch to personal */}
        <div className="mb-6 text-center">
          <button onClick={() => navigate('/login')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Switch to personal account →
          </button>
        </div>

        {/* Log out */}
        <div className="mb-20 flex justify-center">
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log out
            </button>
          ) : (
            <div className="card-elevated p-5 w-full text-center">
              <p className="text-sm font-medium text-foreground mb-4">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm btn-press text-muted-foreground">Cancel</button>
                <button onClick={() => { resetAll(); navigate('/'); }} className="flex-1 h-10 rounded-xl font-medium text-sm btn-press bg-muted text-foreground">Yes, log out</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StylistProfilePage;
