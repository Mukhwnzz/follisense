import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Trash2, Lock, Eye, EyeOff, ChevronRight, ChevronDown, MapPin, Briefcase, Clock,
  Plus, Star, Check, Pencil, Award, ClipboardCheck, Brain, Scissors, X
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const allSpecialties = [
  'Braids (box braids, knotless, etc.)', 'Cornrows or flat twists', 'Locs installation or maintenance',
  'Weave or sew-in', 'Wig install (lace fronts, etc.)', 'Crochet braids', 'Twist styles',
  'Natural hair styling', 'Silk press or blowout', 'Relaxer or chemical treatments',
  'Colour or bleach', 'Haircuts or trims', 'Barber services (fades, lineups)', 'Scalp treatments',
];

const businessTypes =['salon', 'mobile', 'both'];

interface StylistProfileData {
  role: string | string[];
  otherRole: string;
  experience: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  specialties: string[];
  bio: string;
}

const defaultProfile: StylistProfileData = {
  role: '', otherRole: '', experience: '', businessName: '', businessType: '',
  city: '', country: '', specialties: [], bio: '',
};

const loadQuizState = () => {
  try {
    const saved = localStorage.getItem('follisense-quiz');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { totalPoints: 0, currentStreak: 0, bestStreak: 0, challengeHighScore: 0, badges: [] };
};

// ── Section wrapper ──
const ProfileSection = ({
  title, icon: Icon, children, defaultOpen = false,
  editLabel, onEdit, editing, onSave, onCancel
}: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
  editLabel?: string; onEdit?: () => void; editing?: boolean; onSave?: () => void; onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-primary" strokeWidth={1.8} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            {onEdit && !editing && (
              <div className="flex justify-end mb-2">
                <button onClick={onEdit} className="text-xs font-medium text-primary flex items-center gap-1">
                  <Pencil size={11} /> {editLabel || 'Edit'}
                </button>
              </div>
            )}
            {editing && onSave && onCancel && (
              <div className="flex justify-end gap-2 mb-2">
                <button onClick={onCancel} className="text-xs font-medium text-muted-foreground">Cancel</button>
                <button onClick={onSave} className="text-xs font-medium text-primary">Save</button>
              </div>
            )}
            <div className="card-elevated">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} className="text-muted-foreground" />}
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm text-foreground truncate max-w-[180px]">{value}</span>
  </div>
);

const StylistProfilePage = () => {
  const navigate = useNavigate();
  const { userName, resetAll, clientObservations, stylistLocations, setStylistLocations, addStylistLocation, removeStylistLocation } = useApp();
  const [profile, setProfile] = useState<StylistProfileData>(defaultProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState(false);
  const [editProfile, setEditProfile] = useState<StylistProfileData>(defaultProfile);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');
  const [editLocCity, setEditLocCity] = useState('');
  const [confirmDeleteLoc, setConfirmDeleteLoc] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({ clientReminders: true, quizReminders: true, weeklyDigest: false });

  const quizState = loadQuizState();

  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id || null);
  };

  getUser();
}, []);
  
  useEffect(() => {
  const loadProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
     setProfile({
      role: data.roles || [], // ✅ FIX: was data.role
      otherRole: data.other_role || '',
      experience: data.experience_level || '',
      businessName: data.business_name || '',
      businessType: data.work_type || '', // ✅ FIX: was business_type
      city: data.city || '',
      country: data.country || '',
      specialties: data.specialties || [],
      bio: data.bio || '',
  });
}
  };

  loadProfile();
}, [userId]);
  
  const saveProfile = async (updated: StylistProfileData) => {
  if (!userId) return;

  const { data, error } = await supabase
  .from('stylist_profiles')
  .upsert(
  {
    user_id: userId,

    roles: Array.isArray(updated.role)
      ? updated.role
      : [updated.role],

    work_type: updated.businessType,

    experience_level: updated.experience,

    business_name: updated.businessName,
    business_type: updated.businessType,

    city: updated.city,
    country: updated.country,

    specialties: updated.specialties,

    bio: updated.bio,

    services: updated.specialties, // or separate if you collect differently
    goals: [], // since you haven’t added this input yet
  },
  { onConflict: 'user_id' }
)
.select();
  console.log('DATA:',JSON.stringify(data, null, 2));
  console.log('ERROR:', error);

  if (error) {
    console.error(error);
    toast({ title: 'Failed to save profile' });
    return;
  }

  setProfile(updated);
  toast({ title: 'Profile saved successfully 🔥' });
};
  
  const startEditing = (section: 'about' | 'business' | 'expertise') => {
    setEditProfile({ ...profile });
    if (section === 'about') setEditingAbout(true);
    if (section === 'business') setEditingBusiness(true);
    if (section === 'expertise') setEditingExpertise(true);
  };
  const cancelEditing = () => { setEditingAbout(false); setEditingBusiness(false); setEditingExpertise(false); };
  const saveEditing = async () => {
  await saveProfile(editProfile);
  
    setEditingAbout(false);
    setEditingBusiness(false);
    setEditingExpertise(false);
    toast({ title: 'Profile updated' });
  };

  const toggleSpecialty = (s: string) => {
    setEditProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s) ? prev.specialties.filter(x => x !== s) : [...prev.specialties, s],
    }));
  };

  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const clientsChecked = clientObservations.length;
  const roleDisplay = (() => {
    const roles = Array.isArray(profile.role) ? profile.role.filter(r => r !== 'Other') : (profile.role ? [profile.role] : []);
    if (profile.otherRole) roles.push(profile.otherRole);
    return roles.length > 0 ? roles.join(', ') : '';
  })();

  const handleSetPrimary = (id: string) => {
    setStylistLocations(stylistLocations.map(l => ({ ...l, isPrimary: l.id === id })));
    toast({ title: 'Primary location updated' });
  };
  const handleEditLocation = (id: string) => {
    const loc = stylistLocations.find(l => l.id === id);
    if (loc) { setEditingLocationId(id); setEditLocName(loc.name); setEditLocCity(loc.city); }
  };
  const handleSaveEditLocation = () => {
    if (!editingLocationId || !editLocName.trim()) return;
    setStylistLocations(stylistLocations.map(l => l.id === editingLocationId ? { ...l, name: editLocName.trim(), city: editLocCity.trim() } : l));
    setEditingLocationId(null);
    toast({ title: 'Location updated' });
  };
  const handleDeleteLocation = (id: string) => { removeStylistLocation(id); setConfirmDeleteLoc(null); toast({ title: 'Location removed' }); };
  const handleAddNewLocation = () => {
    if (!newLocName.trim()) return;
    addStylistLocation({ id: `loc-${Date.now()}`, name: newLocName.trim(), city: newLocCity.trim(), isPrimary: stylistLocations.length === 0 });
    setNewLocName(''); setNewLocCity(''); setShowAddLocation(false);
    toast({ title: 'Location added' });
  };

  return (
    <div className="page-container pt-6 pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* ─── Header ─── */}
        <div className="relative mb-8">
          <div className="absolute inset-0 -mx-4 -mt-6 h-32 bg-gradient-to-br from-primary/20 to-accent rounded-b-3xl" />
          <div className="relative pt-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-card border-4 border-primary/20 flex items-center justify-center mb-3 shadow-md">
              <User size={32} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-foreground">{userName || 'Stylist'}</h1>
              <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
            </div>
            {roleDisplay && <p className="text-sm text-muted-foreground">{roleDisplay}</p>}
            {(profile.businessName || location) && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {profile.businessName}{location ? `, ${location}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* ═══════ Section 1: About You ═══════ */}
        <ProfileSection
          title="About You" icon={User} defaultOpen={true}
          editLabel="Edit" onEdit={() => startEditing('about')}
          editing={editingAbout} onSave={saveEditing} onCancel={cancelEditing}
        >
          {editingAbout ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio (optional)</label>
                <textarea value={editProfile.bio} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Tell clients about yourself and your approach to scalp health..." maxLength={300} />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{editProfile.bio.length}/300</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <InfoRow label="Name" value={userName || 'Not set'} />
              {profile.bio && (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground italic">"{profile.bio}"</p>
                </div>
              )}
            </div>
          )}
        </ProfileSection>

        {/* ═══════ Section 2: Your Business ═══════ */}
        <ProfileSection
          title="Your Business" icon={Briefcase}
          editLabel="Edit" onEdit={() => startEditing('business')}
          editing={editingBusiness} onSave={saveEditing} onCancel={cancelEditing}
        >
          {editingBusiness ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Business name</label>
                <input type="text" value={editProfile.businessName} onChange={e => setEditProfile({ ...editProfile, businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" placeholder="e.g. Natural Touch Studio" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Business type</label>
                <div className="flex gap-2">
                  {businessTypes.map(bt => (
                    <button key={bt} onClick={() => setEditProfile({ ...editProfile, businessType: bt })}
                      className={`flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-colors ${editProfile.businessType === bt ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                  <input type="text" value={editProfile.city} onChange={e => setEditProfile({ ...editProfile, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                  <input type="text" value={editProfile.country} onChange={e => setEditProfile({ ...editProfile, country: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <InfoRow label="Business" value={profile.businessName || 'Not set'} icon={MapPin} />
              <InfoRow label="Type" value={profile.businessType || 'Not set'} icon={Briefcase} />
              <InfoRow label="Location" value={location || 'Not set'} icon={MapPin} />
            </div>
          )}

          {/* Locations sub-section */}
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Locations</p>
            <div className="space-y-2 mb-3">
              {stylistLocations.map(loc => (
                <div key={loc.id} className="rounded-xl border border-border p-3">
                  {editingLocationId === loc.id ? (
                    <div className="space-y-2">
                      <input type="text" value={editLocName} onChange={e => setEditLocName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" placeholder="Location name" />
                      <input type="text" value={editLocCity} onChange={e => setEditLocCity(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" placeholder="City" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingLocationId(null)} className="flex-1 h-8 rounded-lg border border-border text-xs font-medium">Cancel</button>
                        <button onClick={handleSaveEditLocation} className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Save</button>
                      </div>
                    </div>
                  ) : confirmDeleteLoc === loc.id ? (
                    <div>
                      <p className="text-sm text-foreground mb-2">Remove {loc.name}?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDeleteLoc(null)} className="flex-1 h-8 rounded-lg border border-border text-xs font-medium">Cancel</button>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="flex-1 h-8 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{loc.name}</p>
                            {loc.isPrimary && <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>}
                          </div>
                          {loc.city && <p className="text-xs text-muted-foreground">{loc.city}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!loc.isPrimary && <button onClick={() => handleSetPrimary(loc.id)} className="text-xs text-primary font-medium"><Star size={13} /></button>}
                        <button onClick={() => handleEditLocation(loc.id)} className="text-xs text-muted-foreground font-medium">Edit</button>
                        <button onClick={() => setConfirmDeleteLoc(loc.id)} className="text-xs text-destructive font-medium">Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddLocation ? (
              <div className="space-y-2">
                <input type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" placeholder="Location name" />
                <input type="text" value={newLocCity} onChange={e => setNewLocCity(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" placeholder="City" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddLocation(false)} className="flex-1 h-8 rounded-lg border border-border text-xs font-medium">Cancel</button>
                  <button onClick={handleAddNewLocation} disabled={!newLocName.trim()} className={`flex-1 h-8 rounded-lg text-xs font-medium ${newLocName.trim() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddLocation(true)} className="w-full p-2.5 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Plus size={14} /> Add location
              </button>
            )}
          </div>
        </ProfileSection>

        {/* ═══════ Section 3: Your Expertise ═══════ */}
        <ProfileSection
          title="Your Expertise" icon={Scissors}
          editLabel="Edit" onEdit={() => startEditing('expertise')}
          editing={editingExpertise} onSave={saveEditing} onCancel={cancelEditing}
        >
          {editingExpertise ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Years of experience</label>
                <select
  value={editProfile.experience}
  onChange={e => setEditProfile({ ...editProfile, experience: e.target.value })}
  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
>
  <option value="">Select experience</option>
  <option value="<1">Less than 1 year</option>
  <option value="1-3">1 to 3 years</option>
  <option value="3-5">3 to 5 years</option>
  <option value="5-10">5 to 10 years</option>
  <option value="10+">10+ years</option>
</select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Specialties</label>
                <div className="grid grid-cols-2 gap-2">
                  {allSpecialties.map(s => (
                    <button key={s} onClick={() => toggleSpecialty(s)}
                      className={`p-2.5 rounded-xl border-2 text-left text-xs font-medium transition-colors ${editProfile.specialties.includes(s) ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <InfoRow label="Role" value={roleDisplay || 'Not set'} icon={Briefcase} />
              <InfoRow label="Experience" value={profile.experience || 'Not set'} icon={Clock} />
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2">Specialties</p>
                {profile.specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No specialties set</p>}
              </div>
            </div>
          )}
        </ProfileSection>

        {/* ═══════ Section 4: Your Progress ═══════ */}
        <ProfileSection title="Your Progress" icon={Award} defaultOpen={true}>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <ClipboardCheck size={18} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{clientsChecked}</p>
                <p className="text-[10px] text-muted-foreground">Clients checked</p>
              </div>
              <div className="text-center">
                <Brain size={18} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{quizState.totalPoints || 0}</p>
                <p className="text-[10px] text-muted-foreground">Quiz points</p>
              </div>
              <div className="text-center">
                <Award size={18} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{quizState.bestStreak || 0}</p>
                <p className="text-[10px] text-muted-foreground">Best streak</p>
              </div>
            </div>
            {quizState.badges?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {quizState.badges.map((badge: string) => (
                    <span key={badge} className="text-xs bg-accent text-foreground px-2.5 py-1 rounded-full font-medium">{badge}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* ═══════ Section 5: Account ═══════ */}
        <ProfileSection title="Account" icon={Shield}>
          <div className="divide-y divide-border">
            {/* Notifications */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notifications</p>
              <div className="space-y-3">
                {[
                  { key: 'clientReminders' as const, label: 'Client check-in reminders', desc: 'Nudge when a returning client is due' },
                  { key: 'quizReminders' as const, label: 'Quiz reminders', desc: 'Weekly reminder to test your knowledge' },
                  { key: 'weeklyDigest' as const, label: 'Weekly activity digest', desc: 'Summary of your scalp checks this week' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <p className="text-sm text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    <button onClick={() => setNotifications(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifications[opt.key] ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${notifications[opt.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Your data stays on your device</p>
                  <p className="text-xs text-muted-foreground">Client observations and photos are stored locally and never uploaded.</p>
                </div>
              </div>
            </div>

            {/* Password */}
            <button onClick={() => setShowChangePassword(!showChangePassword)} className="w-full px-4 py-3 text-left text-sm text-foreground flex items-center gap-2">
              <Lock size={14} strokeWidth={1.5} /> Change password <ChevronRight size={14} className="text-muted-foreground ml-auto" />
            </button>
            {showChangePassword && (
              <div className="px-4 py-3 space-y-3">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Current password</label>
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-7 text-muted-foreground">{showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">New password</label>
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-7 text-muted-foreground">{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm new password</label>
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-7 text-muted-foreground">{showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <button onClick={() => { toast({ title: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(false); }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className={`w-full h-10 rounded-xl font-medium text-sm transition-colors ${currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>
                  Update password
                </button>
              </div>
            )}
            <button onClick={() => { resetAll(); navigate('/'); }} className="w-full px-4 py-3 text-left text-sm text-destructive flex items-center gap-2">
              <Trash2 size={14} strokeWidth={1.5} /> Delete all data
            </button>
          </div>
        </ProfileSection>

        {/* ── About ── */}
        <div className="mb-6 mt-2">
          <div className="card-elevated p-4">
            <div className="flex items-start gap-3">
              <Scissors size={16} className="text-primary mt-0.5" strokeWidth={1.8} />
              <div>
                <p className="text-sm text-foreground font-medium">FolliSense for Professionals</p>
                <p className="text-xs text-muted-foreground mt-1">A professional tool for documenting and tracking client scalp health.</p>
                <p className="text-xs text-muted-foreground mt-2">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <button onClick={() => navigate('/login')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Switch to personal account →</button>
        </div>

        <div className="mb-20 flex justify-center">
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log out</button>
          ) : (
            <div className="card-elevated p-5 w-full text-center">
              <p className="text-sm font-medium text-foreground mb-4">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-sm text-muted-foreground">Cancel</button>
                <button onClick={() => { resetAll(); navigate('/'); }} className="flex-1 h-10 rounded-xl font-medium text-sm bg-muted text-foreground">Yes, log out</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StylistProfilePage;
