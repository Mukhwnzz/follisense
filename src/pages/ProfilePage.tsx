import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ChevronRight, Shield, Info, Trash2, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { onboardingData, resetAll } = useApp();

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

        {/* Hair settings */}
        <div className="mb-6">
          <h3 className="text-label mb-3">Hair & Style Settings</h3>
          <div className="card-elevated divide-y divide-border">
            {[
              { label: 'Hair type', value: hairTypeLabel[onboardingData.hairType] || 'Not set' },
              { label: 'Preferred styles', value: onboardingData.protectiveStyles.join(', ') || 'Not set' },
              { label: 'Cycle length', value: onboardingData.cycleLength || 'Not set' },
              { label: 'Wash frequency', value: onboardingData.washFrequency || 'Not set' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4">
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

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
