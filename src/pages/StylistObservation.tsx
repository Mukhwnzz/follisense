import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Camera, Share2, Save } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const observationOptions = [
  'Scalp redness or irritation',
  'Thinning at hairline / edges',
  'Thinning at crown / vertex',
  'Excessive flaking or buildup',
  'Tender or sore areas',
  'Bumps or lesions',
  'Signs of traction damage',
  'Nothing of concern',
];

const photoSlots = ['Hairline / edges', 'Crown / vertex', 'Other area'];

const StylistObservation = () => {
  const navigate = useNavigate();
  const { addClientObservation } = useApp();
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [observations, setObservations] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const totalSteps = 5;

  const toggleObs = (o: string) => {
    if (o === 'Nothing of concern') {
      setObservations(['Nothing of concern']);
    } else {
      setObservations(prev => {
        const filtered = prev.filter(x => x !== 'Nothing of concern');
        return filtered.includes(o) ? filtered.filter(x => x !== o) : [...filtered, o];
      });
    }
  };

  const togglePhoto = (p: string) => {
    setPhotos(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return clientName.trim().length > 0;
      case 2: return observations.length > 0;
      case 3: return true; // photos optional
      case 4: return true; // notes optional
      case 5: return true; // summary
      default: return false;
    }
  };

  const computeRisk = (): 'green' | 'amber' | 'red' => {
    if (observations.includes('Nothing of concern')) return 'green';
    const severeObs = ['Bumps or lesions', 'Signs of traction damage'];
    if (observations.some(o => severeObs.includes(o))) return 'red';
    if (observations.length >= 3) return 'red';
    return 'amber';
  };

  const handleSave = () => {
    addClientObservation({
      id: `co-${Date.now()}`,
      clientName: clientName.trim(),
      date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      observations,
      photos,
      notes: notes || undefined,
      risk: computeRisk(),
    });
    toast.success('Observation shared with client.');
    navigate('/stylist');
  };

  const handleShare = async () => {
    const text = `ScalpSense Client Observation\n\nClient: ${clientName}\nDate: ${new Date().toLocaleDateString()}\n\nObservations:\n${observations.map(o => `• ${o}`).join('\n')}\n${notes ? `\nNotes: ${notes}` : ''}\n\nThis observation does not constitute a medical diagnosis.`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ScalpSense Observation', text });
      } catch {
        toast.info('Sharing cancelled');
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : setShowConfirm(true)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-7 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => setShowConfirm(true)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pt-4 pb-8"
          >
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Client details</h2>
                <p className="text-muted-foreground text-sm mb-6">Enter initials or first name only — no full names for privacy</p>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. A.M. or Amara"
                  className="w-full h-14 px-4 rounded-xl border-2 border-border bg-card text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">What are you observing?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select all that apply</p>
                <div className="space-y-3">
                  {observationOptions.map(o => (
                    <button
                      key={o}
                      onClick={() => toggleObs(o)}
                      className={`selection-card w-full text-left ${observations.includes(o) ? 'selected' : ''}`}
                    >
                      <p className="font-medium text-foreground text-sm">{o}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Take photos of what you've observed</h2>
                <p className="text-muted-foreground text-sm mb-6">These are stored on-device only and can be shared with the client</p>
                <div className="space-y-3">
                  {photoSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => togglePhoto(slot)}
                      className={`selection-card w-full flex items-center gap-4 ${photos.includes(slot) ? 'selected' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                        <Camera size={22} className={photos.includes(slot) ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{slot}</p>
                        {photos.includes(slot) && (
                          <p className="text-xs text-primary mt-0.5">Photo captured</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Anything else to note?</h2>
                <p className="text-muted-foreground text-sm mb-6">Optional — add any additional observations or recommendations</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Recommended loosening edges on next install"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Observation summary</h2>
                <div className="card-elevated p-5 mb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="text-sm font-medium text-foreground">{clientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Observations</p>
                      <ul className="mt-1 space-y-1">
                        {observations.map(o => (
                          <li key={o} className="text-sm text-foreground">• {o}</li>
                        ))}
                      </ul>
                    </div>
                    {photos.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Photos</p>
                        <p className="text-sm text-foreground">{photos.join(', ')}</p>
                      </div>
                    )}
                    {notes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm text-foreground">{notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mb-6">
                  This observation does not constitute a medical diagnosis.
                </p>

                <button
                  onClick={handleShare}
                  className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press mb-3 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Share with client
                </button>
                <button
                  onClick={handleSave}
                  className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save observation
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next button for steps 1-4 */}
        {step < 5 && (
          <div className="pb-8">
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
              }`}
            >
              {step === 3 ? (photos.length > 0 ? 'Next' : 'Skip photos') : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* Confirm exit */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card">
              <h3 className="font-semibold text-lg mb-2">Discard observation?</h3>
              <p className="text-sm text-muted-foreground mb-6">Your progress won't be saved.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl border border-border font-medium text-sm btn-press">Continue</button>
                <button onClick={() => navigate('/stylist')} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-press">Discard</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylistObservation;
