import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Camera, Check, ClipboardList } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const styleOptions = [
  'Low cut / fade', 'Waves', 'Cornrows', 'Locs', 'Twists',
  'Braids', 'Afro', 'Bald / shaved', 'Weave / wig',
  'Silk press / blowout', 'Other',
];

const scalpIssueOptions = [
  'Itch', 'Tenderness', 'Flaking', 'Soreness',
  'Razor bumps / ingrown hairs', 'Thinning', 'None',
];

const washOptions = [
  'Today', 'Yesterday', '2–3 days ago', '4–7 days ago',
  'Over a week ago', 'Not sure',
];

const StylistQuickIntake = () => {
  const navigate = useNavigate();
  const { addClientObservation, clientObservations, stylistLocations } = useApp();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Client name
  const [clientName, setClientName] = useState('');

  // Step 2: Style + wash
  const [style, setStyle] = useState('');
  const [otherStyle, setOtherStyle] = useState('');
  const [lastWash, setLastWash] = useState('');

  // Step 3: Scalp issues + areas
  const [scalpIssues, setScalpIssues] = useState<string[]>([]);
  const [attentionAreas, setAttentionAreas] = useState('');
  const [thinning, setThinning] = useState('');

  // Step 4: Photo (optional)
  const [photoTaken, setPhotoTaken] = useState(false);

  const previousClients = useMemo(() => {
    const names = new Set<string>();
    clientObservations.forEach(o => names.add(o.clientName));
    return Array.from(names).sort();
  }, [clientObservations]);

  const toggleIssue = (issue: string) => {
    if (issue === 'None') {
      setScalpIssues(['None']);
    } else {
      setScalpIssues(prev => {
        const filtered = prev.filter(x => x !== 'None');
        return filtered.includes(issue) ? filtered.filter(x => x !== issue) : [...filtered, issue];
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return clientName.trim().length > 0;
      case 2: return style !== '' && (style !== 'Other' || otherStyle.trim()) && lastWash !== '';
      case 3: return scalpIssues.length > 0 && thinning !== '';
      case 4: return true; // photo is optional
      case 5: return true; // summary
      default: return false;
    }
  };

  const computeRisk = (): 'green' | 'amber' | 'red' => {
    if (scalpIssues.includes('None') && thinning === 'No') return 'green';
    if (thinning === 'Yes' || scalpIssues.length >= 3) return 'red';
    return 'amber';
  };

  const finalStyle = style === 'Other' ? otherStyle : style;

  const handleSave = () => {
    const loc = stylistLocations.find(l => l.isPrimary) || stylistLocations[0];
    const observations: string[] = [];
    if (scalpIssues.includes('None')) observations.push('General check, nothing concerning');
    else {
      scalpIssues.forEach(i => {
        if (i === 'Itch') observations.push('Scalp redness or irritation');
        else if (i === 'Tenderness' || i === 'Soreness') observations.push('Tender or sore areas');
        else if (i === 'Flaking') observations.push('Excessive flaking or buildup');
        else if (i === 'Razor bumps / ingrown hairs') observations.push('Bumps or lesions');
        else if (i === 'Thinning') observations.push('Thinning at crown or vertex');
      });
    }
    if (thinning === 'Yes') observations.push('Thinning at crown or vertex');

    const isReturning = previousClients.includes(clientName.trim());

    addClientObservation({
      id: `qi-${Date.now()}`,
      clientName: clientName.trim(),
      date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      observations: [...new Set(observations)],
      photos: photoTaken ? ['Pre-styling scalp'] : [],
      photoAreas: photoTaken ? ['General scalp'] : [],
      notes: `Quick intake — Style: ${finalStyle} | Last wash: ${lastWash}${attentionAreas ? ` | Attention areas: ${attentionAreas}` : ''} | Thinning: ${thinning}`,
      risk: computeRisk(),
      location: loc?.name,
      locationCity: loc?.city,
      service: finalStyle,
      clientType: isReturning ? 'returning' : 'new',
    });
    toast.success('Quick intake saved');
    navigate('/stylist');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/stylist')} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => navigate('/stylist')} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="pt-2 pb-8">

              {/* STEP 1: Client name */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList size={18} className="text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Quick Intake</span>
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-foreground">Client name</h2>
                  <p className="text-muted-foreground text-sm mb-6">First name or initials only — no account needed</p>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g., Ama or A.K."
                    className="w-full h-14 px-4 rounded-xl border-2 border-border bg-card text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-4"
                    autoFocus
                  />
                  {previousClients.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent clients</p>
                      <div className="flex flex-wrap gap-2">
                        {previousClients.slice(0, 8).map(name => (
                          <button key={name} onClick={() => setClientName(name)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${clientName === name ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">🔒 Only stored locally on your device</p>
                </div>
              )}

              {/* STEP 2: Style + wash */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-medium mb-2 text-foreground">What style are they getting today?</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {styleOptions.map(s => (
                      <button key={s} onClick={() => setStyle(s)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${style === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {style === 'Other' && (
                    <input type="text" value={otherStyle} onChange={e => setOtherStyle(e.target.value)} placeholder="Describe the style" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary mb-6" />
                  )}
                  <h2 className="text-lg font-medium mb-2 text-foreground">When did they last wash their hair?</h2>
                  <div className="space-y-2">
                    {washOptions.map(w => (
                      <button key={w} onClick={() => setLastWash(w)} className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${lastWash === w ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Scalp issues */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-medium mb-2 text-foreground">Any scalp issues right now?</h2>
                  <p className="text-muted-foreground text-sm mb-4">Select all that apply</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {scalpIssueOptions.map(issue => (
                      <button key={issue} onClick={() => toggleIssue(issue)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${scalpIssues.includes(issue) ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
                        {issue}
                      </button>
                    ))}
                  </div>

                  <h2 className="text-lg font-medium mb-2 text-foreground">Any areas to pay attention to or avoid?</h2>
                  <input type="text" value={attentionAreas} onChange={e => setAttentionAreas(e.target.value)} placeholder="e.g., tender spot at nape, avoid edges" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary mb-6" />

                  <h2 className="text-lg font-medium mb-2 text-foreground">Noticed any thinning or hair loss?</h2>
                  <div className="flex gap-2">
                    {['Yes', 'No', 'Not sure'].map(opt => (
                      <button key={opt} onClick={() => setThinning(opt)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${thinning === opt ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Photo (optional) */}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-medium mb-2 text-foreground">Quick scalp photo</h2>
                  <p className="text-muted-foreground text-sm mb-6">Optional — capture the scalp before you start styling</p>
                  <button
                    onClick={() => setPhotoTaken(!photoTaken)}
                    className={`w-full p-8 rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center gap-3 ${photoTaken ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    {photoTaken ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check size={28} className="text-primary" />
                        </div>
                        <p className="text-sm font-medium text-primary">Photo captured</p>
                        <p className="text-xs text-muted-foreground">Tap to remove</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                          <Camera size={28} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Tap to capture</p>
                        <p className="text-xs text-muted-foreground">Stored locally only</p>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-4">You can skip this step</p>
                </div>
              )}

              {/* STEP 5: Summary */}
              {step === 5 && (
                <div>
                  <h2 className="text-lg font-medium mb-1 text-foreground">Intake summary</h2>
                  <p className="text-muted-foreground text-sm mb-6">Review before saving</p>

                  <div className="card-elevated p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</span>
                      <span className="text-sm font-semibold text-foreground">{clientName}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Style today</span>
                      <span className="text-sm text-foreground">{finalStyle}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last wash</span>
                      <span className="text-sm text-foreground">{lastWash}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scalp issues</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {scalpIssues.map(i => (
                          <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${i === 'None' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{i}</span>
                        ))}
                      </div>
                    </div>
                    {attentionAreas && (
                      <>
                        <div className="h-px bg-border" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Areas to watch</span>
                          <p className="text-sm text-foreground mt-1">{attentionAreas}</p>
                        </div>
                      </>
                    )}
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thinning</span>
                      <span className={`text-sm font-medium ${thinning === 'Yes' ? 'text-destructive' : thinning === 'No' ? 'text-primary' : 'text-muted-foreground'}`}>{thinning}</span>
                    </div>
                    {photoTaken && (
                      <>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Photo</span>
                          <span className="text-xs text-primary font-medium">✓ Captured</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${computeRisk() === 'green' ? 'bg-primary/10 text-primary' : computeRisk() === 'amber' ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'}`}>
                    {computeRisk() === 'green' ? 'No concerns flagged' : computeRisk() === 'amber' ? 'Some concerns noted — monitor' : 'Significant concerns — consider referral'}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="py-4 pb-8">
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full h-14 rounded-xl font-semibold text-base transition-colors ${canProceed() ? 'bg-primary text-primary-foreground btn-press' : 'bg-border text-muted-foreground'}`}
            >
              {step === 4 ? (photoTaken ? 'Next' : 'Skip') : 'Next'}
            </button>
          ) : (
            <button onClick={handleSave} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">
              Save intake
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylistQuickIntake;
