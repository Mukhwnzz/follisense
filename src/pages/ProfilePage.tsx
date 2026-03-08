import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ChevronRight, Shield, Trash2, Leaf, Repeat, Heart, Camera, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { onboardingData, resetAll, stylistMode, setStylistMode, baselinePhotos, setBaselinePhotos } = useApp();

  const [reminders, setReminders] = useState({
    midCycle: true,
    washDay: true,
    weeklyTip: false,
  });

  const hairTypeLabel: Record<string, string> = {
    '3b': '3b', '3c': '3c', '4a': '4a', '4b': '4b', '4c': '4c', 'unsure': 'Not sure',
  };

  const handleDelete = () => {
    resetAll();
    navigate('/');
  };

  const handleModeSwitch = () => {
    setStylistMode(!stylistMode);
    navigate(stylistMode ? '/home' : '/stylist');
  };

  const handleRetakePhoto = (area: string) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos(
      baselinePhotos.map(p => p.area === area ? { ...p, date: today } : p)
    );
  };

  const handleAddBaseline = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setBaselinePhotos([
      { area: 'Hairline — temples and edges', captured: true, date: today },
      { area: 'Crown and vertex', captured: true, date: today },
    ]);
  };

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3">
            <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold">Your profile</h1>
        </div>

        {/* Mode switch */}
        <div className="mb-6">
          <button
            onClick={handleModeSwitch}
            className="card-elevated w-full p-5 flex items-center gap-4 border-2 border-secondary"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Repeat size={22} className="text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">
                {stylistMode ? 'Switch to Personal Mode' : 'Switch to Stylist Mode'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stylistMode ? 'Go back to tracking your own scalp health' : 'Document scalp observations for your clients'}
              </p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Health profile link */}
        {!stylistMode && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/health-profile')}
              className="card-elevated w-full p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Heart size={20} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Health Profile</p>
                <p className="text-xs text-muted-foreground">Medical history, blood work & more</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Baseline photos */}
        {!stylistMode && (
          <div className="mb-6">
            <h3 className="text-label mb-3">Baseline Photos</h3>
            {baselinePhotos.length > 0 ? (
              <div className="card-elevated divide-y divide-border">
                {baselinePhotos.map(photo => (
                  <div key={photo.area} className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                      <Camera size={20} className="text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{photo.area}</p>
                      <p className="text-xs text-muted-foreground">Captured {photo.date}</p>
                    </div>
                    <button
                      onClick={() => handleRetakePhoto(photo.area)}
                      className="flex items-center gap-1 text-xs font-medium text-primary px-2 py-1"
                    >
                      <RefreshCw size={12} strokeWidth={2} /> Retake
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={handleAddBaseline}
                className="card-elevated w-full p-5 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Camera size={22} className="text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Add your baseline photos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Capture your starting point to track changes over time</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Hair settings */}
        {!stylistMode && (
          <div className="mb-6">
            <h3 className="text-label mb-3">Hair & Style Settings</h3>
            <div className="card-elevated divide-y divide-border">
              {[
                { label: 'Hair type', value: hairTypeLabel[onboardingData.hairType] || 'Not set' },
                { label: 'Preferred styles', value: onboardingData.protectiveStyles.join(', ') || 'Not set' },
                { label: 'Cycle length', value: onboardingData.cycleLength || 'Not set' },
                { label: 'Wash frequency', value: onboardingData.washFrequency || 'Not set' },
                { label: 'Products', value: onboardingData.scalpProducts.join(', ') || 'Not set' },
                { label: 'Product frequency', value: onboardingData.productFrequency || 'Not set' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground max-w-[160px] truncate">{item.value}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Notifications</h3>
          <div className="card-elevated divide-y divide-border">
            {[
              { key: 'midCycle' as const, label: 'Mid-cycle check-in reminder' },
              { key: 'washDay' as const, label: 'Wash day reminder' },
              { key: 'weeklyTip' as const, label: 'Weekly scalp tip' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => setReminders(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    reminders[item.key] ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${
                    reminders[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Data & Privacy</h3>
          <div className="card-elevated p-4 mb-3">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">Your data stays on your device</p>
                <p className="text-xs text-muted-foreground">Photos are never uploaded or shared. All symptom data is stored locally.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button className="card-elevated w-full p-4 text-left text-sm text-foreground flex items-center justify-between">
              Export my data <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button onClick={handleDelete} className="card-elevated w-full p-4 text-left text-sm text-destructive flex items-center gap-2">
              <Trash2 size={16} strokeWidth={1.5} /> Delete all data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h3 className="text-label mb-3">About</h3>
          <div className="card-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 mt-0.5">
                <Leaf size={16} className="text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm text-foreground font-medium">ScalpSense</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A symptom-tracking and triage tool. It does not provide medical diagnoses.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
