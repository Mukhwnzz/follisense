import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, MapPin, Check, X, MessageSquare, ClipboardCheck, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const regions = ['Front hairline', 'Crown / vertex', 'Nape', 'Left temple', 'Right temple', 'Part line', 'Area of concern'];

const observations = [
  { id: 'thinning', label: 'Thinning' },
  { id: 'redness', label: 'Redness / irritation' },
  { id: 'flaking', label: 'Flaking / buildup' },
  { id: 'tenderness', label: 'Tenderness (reported by client)' },
  { id: 'bumps', label: 'Bumps / folliculitis' },
  { id: 'healthy', label: 'Healthy / no concerns' },
];

interface CapturedPhoto {
  id: string;
  region: string;
  dataUrl: string;
}

const SalonCheckIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=intro, 1=photos, 2=observations, 3=notes, 4=done
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggleObservation = (id: string) => {
    if (id === 'healthy') {
      setSelectedObservations(prev => prev.includes('healthy') ? [] : ['healthy']);
      return;
    }
    setSelectedObservations(prev => {
      const filtered = prev.filter(o => o !== 'healthy');
      return filtered.includes(id) ? filtered.filter(o => o !== id) : [...filtered, id];
    });
  };

  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhotos(prev => [...prev, {
            id: `photo-${Date.now()}`,
            region: selectedRegion,
            dataUrl: ev.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhotos(prev => [...prev, {
            id: `photo-${Date.now()}`,
            region: selectedRegion,
            dataUrl: ev.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleComplete = () => {
    // Save check-in data to localStorage for the client's timeline
    try {
      const existing = JSON.parse(localStorage.getItem('follisense-salon-checkins') || '[]');
      existing.push({
        id: `sc-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        photos: photos.length,
        observations: selectedObservations.map(id => observations.find(o => o.id === id)?.label || id),
        note,
      });
      localStorage.setItem('follisense-salon-checkins', JSON.stringify(existing));
    } catch {}
    toast({ title: 'Check-in saved', description: 'The salon observation has been added to your timeline.' });
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] w-full mx-auto flex-1 flex flex-col px-6 pt-8 pb-6">

        {/* Header with back */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)} className="flex items-center gap-1.5 text-sm text-muted-foreground btn-press">
              <ArrowLeft size={16} /> {step === 0 ? 'Back' : 'Previous'}
            </button>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(s => (
                <div key={s} className={`w-8 h-1.5 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Intro */}
          {step === 0 && (
            <motion.div key="intro" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <ClipboardCheck size={36} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Salon Check-in</h1>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  Hand your phone to your stylist. They'll capture your scalp condition during your appointment.
                </p>
                <div className="rounded-xl bg-secondary/60 border border-secondary p-4 w-full">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    🔒 All data stays in your account. Your stylist doesn't need to log in or create an account.
                  </p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press mt-6">
                Start Check-in
              </button>
            </motion.div>
          )}

          {/* Step 1: Photo capture */}
          {step === 1 && (
            <motion.div key="photos" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-foreground mb-1">Capture the scalp</h2>
              <p className="text-sm text-muted-foreground mb-5">Take photos of different areas. Tag each with the region.</p>

              {/* Region selector */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                {regions.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                      selectedRegion === r ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Photo buttons */}
              <div className="flex gap-3 mb-5">
                <button onClick={handleTakePhoto} className="flex-1 h-28 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 btn-press">
                  <Camera size={28} className="text-primary" />
                  <span className="text-sm font-medium text-primary">Take photo</span>
                </button>
                <button onClick={handleUpload} className="flex-1 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 btn-press">
                  <Upload size={28} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Upload</span>
                </button>
              </div>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{photos.length} photo{photos.length !== 1 ? 's' : ''} captured</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square">
                        <img src={photo.dataUrl} alt={photo.region} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 text-center truncate">{photo.region}</span>
                        <button onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <button onClick={() => setStep(2)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">
                  {photos.length > 0 ? 'Next — Add observations' : 'Skip photos'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Observations */}
          {step === 2 && (
            <motion.div key="observations" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-foreground mb-1">What do you see?</h2>
              <p className="text-sm text-muted-foreground mb-5">Tap all that apply</p>

              <div className="space-y-2.5 mb-6">
                {observations.map(obs => (
                  <button
                    key={obs.id}
                    onClick={() => toggleObservation(obs.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedObservations.includes(obs.id) ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        selectedObservations.includes(obs.id) ? 'bg-primary' : 'border-2 border-border'
                      }`}>
                        {selectedObservations.includes(obs.id) && <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />}
                      </div>
                      <span className="text-base text-foreground font-medium">{obs.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto">
                <button onClick={() => setStep(3)} disabled={selectedObservations.length === 0} className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                  selectedObservations.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
                }`}>
                  Next — Add notes
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Notes */}
          {step === 3 && (
            <motion.div key="notes" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-foreground mb-1">Anything else to note?</h2>
              <p className="text-sm text-muted-foreground mb-5">Optional — add anything the client should know</p>

              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Edges are thinning — suggested looser braid tension next time. Noticed some flaking at the crown."
                className="w-full h-40 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground text-base resize-none focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              />

              <div className="mt-auto pt-4">
                <button onClick={handleComplete} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">
                  Complete check-in
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Check size={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Check-in complete</h2>
              <p className="text-base text-muted-foreground mb-2">Hand the phone back to your client.</p>
              <div className="card-elevated p-4 w-full text-left mb-6">
                <p className="text-sm text-foreground font-medium mb-2">Summary</p>
                <p className="text-sm text-muted-foreground">{photos.length} photo{photos.length !== 1 ? 's' : ''} captured</p>
                <p className="text-sm text-muted-foreground">{selectedObservations.length} observation{selectedObservations.length !== 1 ? 's' : ''} flagged</p>
                {note && <p className="text-sm text-muted-foreground mt-1">Note included</p>}
              </div>
              <button onClick={() => navigate('/home')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press">
                Back to dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalonCheckIn;
