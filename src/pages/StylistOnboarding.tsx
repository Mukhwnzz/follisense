import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';

const roles = ['Hairstylist or braider', 'Barber', 'Loctician', 'Trichologist', 'Dermatologist', 'Other'];
const experience = ['Less than 1 year', '1 to 3 years', '3 to 5 years', '5 to 10 years', '10+ years'];
const workplaces = ['A salon', 'Home-based studio', 'Mobile or home service', 'Clinic', 'Multiple locations'];
const clientCounts = ['1 to 5', '5 to 15', '15 to 30', '30+'];
const services = ['Braids (box braids, knotless, etc.)', 'Cornrows or flat twists', 'Locs installation or maintenance', 'Weave or sew-in', 'Wig install (lace fronts, etc.)', 'Crochet braids', 'Twist styles', 'Natural hair styling', 'Silk press or blowout', 'Relaxer or chemical treatments', 'Colour or bleach', 'Haircuts or trims', 'Barber services (fades, lineups)', 'Scalp treatments', 'Trichology consultations'];
const goals = ['Document scalp observations for my clients', 'Learn to spot scalp conditions early', 'Build trust with clients through better scalp care', 'Track client scalp health over time', 'Get referral guidance when I see something concerning', 'Stay up to date on scalp health knowledge', "I'm just exploring for now"];

interface StylistProfile {
  role: string; otherRole: string; experience: string; businessName: string; city: string; country: string;
  workplace: string; clientCount: string; services: string[]; otherService: string; goals: string[];
}

const StylistOnboarding = () => {
  const navigate = useNavigate();
  const { setStylistMode } = useApp();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<StylistProfile>({
    role: '', otherRole: '', experience: '', businessName: '', city: '', country: '',
    workplace: '', clientCount: '', services: [], otherService: '', goals: [],
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleService = (s: string) => setProfile(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));
  const toggleGoal = (g: string) => setProfile(p => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g] }));

  const canNext = () => {
    if (step === 0) return profile.role && profile.experience;
    if (step === 1) return profile.workplace && profile.clientCount;
    if (step === 2) return profile.services.length > 0;
    if (step === 3) return profile.goals.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 3) { setStep(step + 1); return; }
    // Save profile to localStorage for the prototype
    localStorage.setItem('scalpsense-stylist-profile', JSON.stringify(profile));
    setStylistMode(true);
    navigate('/stylist');
  };

  const SelectButton = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
    <button onClick={onClick} className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary border-primary' : 'border-border'}`}>
          {selected && <Check size={10} className="text-primary-foreground" strokeWidth={2.5} />}
        </div>
        <span className="text-sm text-foreground">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-8 pb-6">
      <div className="max-w-[430px] w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={20} className="text-primary" strokeWidth={1.8} />
          <span className="text-sm font-semibold text-foreground">ScalpSense</span>
          <span className="text-[10px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">Stylist</span>
        </div>
        <Progress value={progress} className="h-1.5 mb-6" />

        <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex-1">
          {step === 0 && (
            <div>
              <h1 className="text-xl font-semibold mb-6">Tell us about you</h1>
              <p className="text-sm font-medium text-foreground mb-3">What do you do?</p>
              <div className="space-y-2 mb-6">
                {roles.map(r => <SelectButton key={r} selected={profile.role === r} label={r} onClick={() => setProfile(p => ({ ...p, role: r }))} />)}
              </div>
              <p className="text-sm font-medium text-foreground mb-3">How long have you been practising?</p>
              <div className="space-y-2">
                {experience.map(e => <SelectButton key={e} selected={profile.experience === e} label={e} onClick={() => setProfile(p => ({ ...p, experience: e }))} />)}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h1 className="text-xl font-semibold mb-6">Where do you work?</h1>
              <div className="space-y-4 mb-6">
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Business or salon name</label><input type="text" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" /></div>
                <div className="flex gap-3">
                  <div className="flex-1"><label className="text-sm font-medium text-foreground mb-1.5 block">City</label><input type="text" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" /></div>
                  <div className="flex-1"><label className="text-sm font-medium text-foreground mb-1.5 block">Country</label><input type="text" value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" /></div>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground mb-3">Do you work from:</p>
              <div className="space-y-2 mb-6">{workplaces.map(w => <SelectButton key={w} selected={profile.workplace === w} label={w} onClick={() => setProfile(p => ({ ...p, workplace: w }))} />)}</div>
              <p className="text-sm font-medium text-foreground mb-3">How many clients do you see per week?</p>
              <div className="space-y-2">{clientCounts.map(c => <SelectButton key={c} selected={profile.clientCount === c} label={c} onClick={() => setProfile(p => ({ ...p, clientCount: c }))} />)}</div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h1 className="text-xl font-semibold mb-1">What services do you offer?</h1>
              <p className="text-sm text-muted-foreground mb-5">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {services.map(s => (
                  <button key={s} onClick={() => toggleService(s)} className={`p-3 rounded-xl border-2 text-left text-xs font-medium transition-colors ${profile.services.includes(s) ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h1 className="text-xl font-semibold mb-1">What do you want from ScalpSense?</h1>
              <p className="text-sm text-muted-foreground mb-5">Pick all that apply</p>
              <div className="space-y-2">
                {goals.map(g => (
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
            </div>
          )}
        </motion.div>

        <button onClick={handleNext} disabled={!canNext()} className={`w-full h-14 rounded-xl font-semibold text-base btn-press mt-6 transition-colors ${canNext() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}>
          {step === 3 ? 'Get started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default StylistOnboarding;
