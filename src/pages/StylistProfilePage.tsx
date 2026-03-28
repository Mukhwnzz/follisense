import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Trash2, Lock, Eye, EyeOff, ChevronDown, MapPin, Briefcase, Clock,
  Plus, Star, Pencil, Award, ClipboardCheck, Brain, Scissors, X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";
const green    = '#2d6e55';
const darkGreen= '#1a4d3a';
const greenLight = '#e8f4ef';
const greenBorder = 'rgba(45,110,85,0.18)';
const green10  = 'rgba(45,110,85,0.10)';

const allSpecialties = [
  'Braids (box braids, knotless, etc.)', 'Cornrows or flat twists', 'Locs installation or maintenance',
  'Weave or sew-in', 'Wig install (lace fronts, etc.)', 'Crochet braids', 'Twist styles',
  'Natural hair styling', 'Silk press or blowout', 'Relaxer or chemical treatments',
  'Colour or bleach', 'Haircuts or trims', 'Barber services (fades, lineups)', 'Scalp treatments',
];

const businessTypes = ['Salon-based', 'Mobile', 'Both'];

interface StylistProfileData {
  role: string | string[]; otherRole: string; experience: string; businessName: string;
  businessType: string; city: string; country: string; specialties: string[]; bio: string;
}

const defaultProfile: StylistProfileData = {
  role: '', otherRole: '', experience: '', businessName: '', businessType: '',
  city: '', country: '', specialties: [], bio: '',
};

const loadQuizState = () => {
  try { const s = localStorage.getItem('follisense-quiz'); if (s) return JSON.parse(s); } catch {}
  return { totalPoints: 0, currentStreak: 0, bestStreak: 0, challengeHighScore: 0, badges: [] };
};

// ─── Shared card style ────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--color-background-primary)',
  border: `1.5px solid ${greenBorder}`,
  borderRadius: 16,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  fontFamily: dm,
};

// ─── Input style ──────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  borderRadius: 12, border: `1.5px solid ${greenBorder}`,
  background: 'var(--color-background-secondary)',
  color: 'var(--color-text-primary)',
  fontFamily: dm, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const ProfileSection = ({
  title, icon: Icon, children, defaultOpen = false,
  onEdit, editing, onSave, onCancel,
}: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
  onEdit?: () => void; editing?: boolean; onSave?: () => void; onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', background: 'none', border: 'none',
          borderBottom: open ? 'none' : `1px solid ${greenBorder}`, cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: green10, border: `1px solid ${greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={green} strokeWidth={1.8} />
          </div>
          <span style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
        </div>
        <ChevronDown size={15} color="var(--color-text-secondary)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderBottom: `1px solid ${greenBorder}`, paddingBottom: 16 }}
          >
            {onEdit && !editing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 11, fontWeight: 600, color: green, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Pencil size={11} /> Edit
                </button>
              </div>
            )}
            {editing && onSave && onCancel && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 8 }}>
                <button onClick={onCancel} style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onSave}   style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: green, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
              </div>
            )}
            <div style={card}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid rgba(45,110,85,0.07)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {Icon && <Icon size={13} color="var(--color-text-secondary)" strokeWidth={1.6} />}
      <span style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
    </div>
    <span style={{ fontFamily: dm, fontSize: 13, color: 'var(--color-text-primary)', maxWidth: 200, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
);

const StylistProfilePage = () => {
  const navigate = useNavigate();
  const { userName, resetAll, clientObservations, stylistLocations, setStylistLocations, addStylistLocation, removeStylistLocation } = useApp();
  const [profile, setProfile]           = useState<StylistProfileData>(defaultProfile);
  const [editingAbout, setEditingAbout]         = useState(false);
  const [editingBusiness, setEditingBusiness]   = useState(false);
  const [editingExpertise, setEditingExpertise] = useState(false);
  const [editProfile, setEditProfile]   = useState<StylistProfileData>(defaultProfile);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]       = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddLocation, setShowAddLocation]     = useState(false);
  const [newLocName, setNewLocName]     = useState('');
  const [newLocCity, setNewLocCity]     = useState('');
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editLocName, setEditLocName]   = useState('');
  const [editLocCity, setEditLocCity]   = useState('');
  const [confirmDeleteLoc, setConfirmDeleteLoc] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({ clientReminders: true, quizReminders: true, weeklyDigest: false });

  const quizState = loadQuizState();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('follisense-stylist-profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile({ ...defaultProfile, ...parsed, specialties: parsed.specialties || parsed.services || [] });
      }
    } catch {}
  }, []);

  const saveProfile = (updated: StylistProfileData) => {
    setProfile(updated);
    localStorage.setItem('follisense-stylist-profile', JSON.stringify(updated));
  };

  const startEditing = (section: 'about' | 'business' | 'expertise') => {
    setEditProfile({ ...profile });
    if (section === 'about')     setEditingAbout(true);
    if (section === 'business')  setEditingBusiness(true);
    if (section === 'expertise') setEditingExpertise(true);
  };
  const cancelEditing = () => { setEditingAbout(false); setEditingBusiness(false); setEditingExpertise(false); };
  const saveEditing   = () => { saveProfile(editProfile); cancelEditing(); toast({ title: 'Profile updated' }); };

  const toggleSpecialty = (s: string) =>
    setEditProfile(prev => ({ ...prev, specialties: prev.specialties.includes(s) ? prev.specialties.filter(x => x !== s) : [...prev.specialties, s] }));

  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const roleDisplay = (() => {
    const roles = Array.isArray(profile.role) ? profile.role.filter(r => r !== 'Other') : (profile.role ? [profile.role] : []);
    if (profile.otherRole) roles.push(profile.otherRole);
    return roles.join(', ');
  })();

  const handleSetPrimary = (id: string) => { setStylistLocations(stylistLocations.map(l => ({ ...l, isPrimary: l.id === id }))); toast({ title: 'Primary location updated' }); };
  const handleEditLocation = (id: string) => { const loc = stylistLocations.find(l => l.id === id); if (loc) { setEditingLocationId(id); setEditLocName(loc.name); setEditLocCity(loc.city); } };
  const handleSaveEditLocation = () => {
    if (!editingLocationId || !editLocName.trim()) return;
    setStylistLocations(stylistLocations.map(l => l.id === editingLocationId ? { ...l, name: editLocName.trim(), city: editLocCity.trim() } : l));
    setEditingLocationId(null); toast({ title: 'Location updated' });
  };
  const handleDeleteLocation = (id: string) => { removeStylistLocation(id); setConfirmDeleteLoc(null); toast({ title: 'Location removed' }); };
  const handleAddNewLocation = () => {
    if (!newLocName.trim()) return;
    addStylistLocation({ id: `loc-${Date.now()}`, name: newLocName.trim(), city: newLocCity.trim(), isPrimary: stylistLocations.length === 0 });
    setNewLocName(''); setNewLocCity(''); setShowAddLocation(false); toast({ title: 'Location added' });
  };

  return (
    <div style={{ background: 'var(--color-background-tertiary)', minHeight: '100vh', paddingBottom: 120, fontFamily: dm }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

      {/* ── Dark hero header ─────────────────────────────────────────────────── */}
      <div style={{ background: darkGreen, padding: '52px 20px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(45,110,85,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, var(--color-background-tertiary), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18, alignSelf: 'flex-start' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d3ede0' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'rgba(211,237,224,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FolliSense</span>
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, background: '#d3ede0', color: '#1a5c3a', border: '1px solid rgba(45,110,85,0.22)', padding: '2px 8px', borderRadius: 100 }}>Stylist</span>
          </div>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: green10, border: `3px solid rgba(211,237,224,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <User size={30} color="#d3ede0" strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: '#f0f8f4', margin: 0 }}>{userName || 'Stylist'}</h1>
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, background: '#d3ede0', color: darkGreen, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro</span>
          </div>
          {roleDisplay && <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(240,248,244,0.65)', margin: '0 0 3px' }}>{roleDisplay}</p>}
          {(profile.businessName || location) && (
            <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(240,248,244,0.5)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={10} /> {profile.businessName}{location ? `, ${location}` : ''}
            </p>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ padding: '20px 20px 0' }}>

        {/* ═══ About You ═══ */}
        <ProfileSection title="About You" icon={User} defaultOpen onEdit={() => startEditing('about')} editing={editingAbout} onSave={saveEditing} onCancel={cancelEditing}>
          {editingAbout ? (
            <div style={{ padding: 16 }}>
              <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Bio (optional)</label>
              <textarea
                value={editProfile.bio} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                maxLength={300} rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none' }}
                placeholder="Tell clients about yourself and your approach to scalp health..."
              />
              <p style={{ fontFamily: dm, fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'right', marginTop: 4 }}>{editProfile.bio.length}/300</p>
            </div>
          ) : (
            <div>
              <InfoRow label="Name" value={userName || 'Not set'} />
              {profile.bio && (
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>Bio</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-primary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>"{profile.bio}"</p>
                </div>
              )}
            </div>
          )}
        </ProfileSection>

        {/* ═══ Your Business ═══ */}
        <ProfileSection title="Your Business" icon={Briefcase} onEdit={() => startEditing('business')} editing={editingBusiness} onSave={saveEditing} onCancel={cancelEditing}>
          {editingBusiness ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Business name</label>
                <input type="text" value={editProfile.businessName} onChange={e => setEditProfile({ ...editProfile, businessName: e.target.value })} style={inputStyle} placeholder="e.g. Natural Touch Studio" />
              </div>
              <div>
                <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Business type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {businessTypes.map(bt => (
                    <button key={bt} onClick={() => setEditProfile({ ...editProfile, businessType: bt })} style={{
                      flex: 1, height: 40, borderRadius: 12,
                      border: `1.5px solid ${editProfile.businessType === bt ? green : greenBorder}`,
                      background: editProfile.businessType === bt ? green10 : 'transparent',
                      color: editProfile.businessType === bt ? green : 'var(--color-text-secondary)',
                      fontFamily: dm, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'City',    val: editProfile.city,    set: (v: string) => setEditProfile({ ...editProfile, city: v }) },
                  { label: 'Country', val: editProfile.country, set: (v: string) => setEditProfile({ ...editProfile, country: v }) },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type="text" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <InfoRow label="Business" value={profile.businessName || 'Not set'} icon={Briefcase} />
              <InfoRow label="Type"     value={profile.businessType || 'Not set'} icon={Briefcase} />
              <InfoRow label="Location" value={location || 'Not set'}             icon={MapPin} />
            </div>
          )}

          {/* Locations sub-section */}
          <div style={{ borderTop: `1px solid ${greenBorder}`, padding: '14px 16px' }}>
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10 }}>Locations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {stylistLocations.map(loc => (
                <div key={loc.id} style={{ borderRadius: 12, border: `1.5px solid ${greenBorder}`, padding: 12 }}>
                  {editingLocationId === loc.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="text" value={editLocName} onChange={e => setEditLocName(e.target.value)} style={{ ...inputStyle, height: 38 }} placeholder="Location name" />
                      <input type="text" value={editLocCity} onChange={e => setEditLocCity(e.target.value)} style={{ ...inputStyle, height: 38 }} placeholder="City" />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditingLocationId(null)} style={{ flex: 1, height: 36, borderRadius: 10, border: `1.5px solid ${greenBorder}`, background: 'transparent', fontFamily: dm, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveEditLocation} style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', background: green, color: '#fff', fontFamily: dm, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                      </div>
                    </div>
                  ) : confirmDeleteLoc === loc.id ? (
                    <div>
                      <p style={{ fontFamily: dm, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 10 }}>Remove {loc.name}?</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setConfirmDeleteLoc(null)} style={{ flex: 1, height: 36, borderRadius: 10, border: `1.5px solid ${greenBorder}`, background: 'transparent', fontFamily: dm, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => handleDeleteLocation(loc.id)} style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', background: '#fad9d7', color: '#7a2020', fontFamily: dm, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={13} color={green} strokeWidth={1.8} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{loc.name}</p>
                            {loc.isPrimary && <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, background: green10, color: green, border: `1px solid ${greenBorder}`, padding: '1px 7px', borderRadius: 100 }}>Primary</span>}
                          </div>
                          {loc.city && <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '1px 0 0' }}>{loc.city}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {!loc.isPrimary && <button onClick={() => handleSetPrimary(loc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: green }}><Star size={13} /></button>}
                        <button onClick={() => handleEditLocation(loc.id)} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: green, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => setConfirmDeleteLoc(loc.id)} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#b05040', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddLocation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)} style={{ ...inputStyle, height: 38 }} placeholder="Location name" />
                <input type="text" value={newLocCity} onChange={e => setNewLocCity(e.target.value)} style={{ ...inputStyle, height: 38 }} placeholder="City" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowAddLocation(false)} style={{ flex: 1, height: 36, borderRadius: 10, border: `1.5px solid ${greenBorder}`, background: 'transparent', fontFamily: dm, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddNewLocation} disabled={!newLocName.trim()} style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', background: newLocName.trim() ? green : greenBorder, color: newLocName.trim() ? '#fff' : 'var(--color-text-secondary)', fontFamily: dm, fontSize: 12, fontWeight: 600, cursor: newLocName.trim() ? 'pointer' : 'not-allowed' }}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddLocation(true)} style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px dashed ${greenBorder}`, background: 'transparent', fontFamily: dm, fontSize: 12, color: green, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <Plus size={13} /> Add location
              </button>
            )}
          </div>
        </ProfileSection>

        {/* ═══ Your Expertise ═══ */}
        <ProfileSection title="Your Expertise" icon={Scissors} onEdit={() => startEditing('expertise')} editing={editingExpertise} onSave={saveEditing} onCancel={cancelEditing}>
          {editingExpertise ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Years of experience</label>
                <input type="text" value={editProfile.experience} onChange={e => setEditProfile({ ...editProfile, experience: e.target.value })} style={inputStyle} placeholder="e.g. 5 years" />
              </div>
              <div>
                <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Specialties</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {allSpecialties.map(s => (
                    <button key={s} onClick={() => toggleSpecialty(s)} style={{
                      padding: '9px 12px', borderRadius: 12, textAlign: 'left',
                      border: `1.5px solid ${editProfile.specialties.includes(s) ? green : greenBorder}`,
                      background: editProfile.specialties.includes(s) ? green10 : 'transparent',
                      color: editProfile.specialties.includes(s) ? green : 'var(--color-text-secondary)',
                      fontFamily: dm, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <InfoRow label="Role"       value={roleDisplay || 'Not set'}       icon={Briefcase} />
              <InfoRow label="Experience" value={profile.experience || 'Not set'} icon={Clock} />
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Specialties</p>
                {profile.specialties.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.specialties.map(s => (
                      <span key={s} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, background: green10, color: green, border: `1px solid ${greenBorder}`, padding: '3px 10px', borderRadius: 100 }}>{s}</span>
                    ))}
                  </div>
                ) : <p style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-secondary)' }}>No specialties set</p>}
              </div>
            </div>
          )}
        </ProfileSection>

        {/* ═══ Your Progress ═══ */}
        <ProfileSection title="Your Progress" icon={Award} defaultOpen>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { Icon: ClipboardCheck, val: clientObservations.length, label: 'Clients checked' },
                { Icon: Brain,          val: quizState.totalPoints || 0, label: 'Quiz points' },
                { Icon: Award,          val: quizState.bestStreak || 0,  label: 'Best streak' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: green10, borderRadius: 12, border: `1px solid ${greenBorder}` }}>
                  <s.Icon size={16} color={green} strokeWidth={1.8} style={{ marginBottom: 6 }} />
                  <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>{s.val}</p>
                  <p style={{ fontFamily: dm, fontSize: 9, color: 'var(--color-text-secondary)', margin: 0, letterSpacing: '0.03em' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {quizState.badges?.length > 0 && (
              <div>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Badges</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {quizState.badges.map((badge: string) => (
                    <span key={badge} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, background: green10, color: green, border: `1px solid ${greenBorder}`, padding: '3px 10px', borderRadius: 100 }}>{badge}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* ═══ Account ═══ */}
        <ProfileSection title="Account" icon={Shield}>
          <div>
            {/* Notifications */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(45,110,85,0.07)` }}>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 12 }}>Notifications</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'clientReminders' as const, label: 'Client check-in reminders', desc: 'Nudge when a returning client is due' },
                  { key: 'quizReminders'   as const, label: 'Quiz reminders',              desc: 'Weekly reminder to test your knowledge' },
                  { key: 'weeklyDigest'    as const, label: 'Weekly activity digest',       desc: 'Summary of your scalp checks this week' },
                ].map(opt => (
                  <div key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{opt.label}</p>
                      <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{opt.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 100, border: 'none',
                        background: notifications[opt.key] ? green : 'var(--color-border-tertiary)',
                        position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, left: notifications[opt.key] ? 22 : 3,
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(45,110,85,0.07)`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Shield size={15} color={green} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>Your data stays on your device</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>Client observations and photos are stored locally and never uploaded.</p>
              </div>
            </div>

            {/* Change password */}
            <button onClick={() => setShowChangePassword(!showChangePassword)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderBottom: `1px solid rgba(45,110,85,0.07)`, cursor: 'pointer', fontFamily: dm }}>
              <Lock size={13} color={green} strokeWidth={1.8} />
              <span style={{ fontFamily: dm, fontSize: 13, color: 'var(--color-text-primary)', flex: 1, textAlign: 'left' }}>Change password</span>
            </button>
            {showChangePassword && (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: `1px solid rgba(45,110,85,0.07)` }}>
                {[
                  { label: 'Current password', val: currentPassword, set: setCurrentPassword, show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                  { label: 'New password',      val: newPassword,     set: setNewPassword,     show: showNewPw,     toggle: () => setShowNewPw(p => !p) },
                  { label: 'Confirm new',       val: confirmPassword, set: setConfirmPassword, show: showConfirmPw, toggle: () => setShowConfirmPw(p => !p) },
                ].map(f => (
                  <div key={f.label} style={{ position: 'relative' }}>
                    <label style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input type={f.show ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)} style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => { toast({ title: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(false); }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  style={{
                    height: 42, borderRadius: 12, border: 'none', fontFamily: dm, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    background: currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? green : 'var(--color-background-secondary)',
                    color: currentPassword && newPassword && confirmPassword && newPassword === confirmPassword ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  Update password
                </button>
              </div>
            )}

            {/* Delete */}
            <button onClick={() => { resetAll(); navigate('/'); }} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: dm }}>
              <Trash2 size={13} color="#b05040" strokeWidth={1.8} />
              <span style={{ fontFamily: dm, fontSize: 13, color: '#b05040' }}>Delete all data</span>
            </button>
          </div>
        </ProfileSection>

        {/* About */}
        <div style={{ ...card, padding: 16, marginTop: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Scissors size={15} color={green} strokeWidth={1.8} style={{ marginTop: 1 }} />
            <div>
              <p style={{ fontFamily: playfair, fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>FolliSense for Professionals</p>
              <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>A professional tool for documenting and tracking client scalp health.</p>
              <p style={{ fontFamily: dm, fontSize: 10, color: 'var(--color-text-secondary)', margin: 0, opacity: 0.6 }}>Version 1.0</p>
            </div>
          </div>
        </div>

        {/* Switch / Log out */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button onClick={() => navigate('/login')} style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Switch to personal account →
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 80 }}>
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} style={{ fontFamily: dm, fontSize: 13, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Log out
            </button>
          ) : (
            <div style={{ ...card, padding: 20, width: '100%', textAlign: 'center' }}>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>Are you sure you want to log out?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, height: 42, borderRadius: 12, border: `1.5px solid ${greenBorder}`, background: 'transparent', fontFamily: dm, fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { resetAll(); navigate('/'); }} style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: green10, fontFamily: dm, fontSize: 13, fontWeight: 600, color: green, cursor: 'pointer' }}>Yes, log out</button>
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default StylistProfilePage;