import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Camera, Share2, Save, Plus, MapPin, ChevronDown, Upload } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const observationOptions = [
  'General check, nothing concerning',
  'Scalp redness or irritation',
  'Thinning at hairline or edges',
  'Thinning at crown or vertex',
  'Excessive flaking or buildup',
  'Tender or sore areas',
  'Bumps or lesions',
  'Signs of traction damage',
  'Dryness or brittle hair',
  'Breakage along the length',
  'Unusual shedding during wash',
  'Chemical or heat damage visible',
];

const serviceOptions = [
  'Wash',
  'Style installation (braids, cornrows, twists, etc.)',
  'Style removal or takedown',
  'Retwist (locs)',
  'Colour or chemical treatment',
  'Cut or trim',
  'Scalp treatment',
  'General consultation',
  'Other',
];

const photoAreaOptions = [
  'Hairline or temples',
  'Crown or vertex',
  'Nape',
  'Part lines',
  'General scalp',
  'Specific area of concern',
];

const noteSuggestions = [
  'Installation was tighter than recommended around the hairline',
  'Client mentioned increased shedding recently',
  'Recommended client see a trichologist',
  'Scalp appeared healthy overall',
  'Product buildup visible at the root',
  'Client reported pain during installation',
];

const comparisonOptions = [
  'Better than last time',
  'About the same',
  'Worse than last time',
  'First time documenting, can\'t compare',
];

const StylistObservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addClientObservation, clientObservations, stylistLocations, addStylistLocation } = useApp();
  const [step, setStep] = useState(1);

  // Step 1: Client info
  const prefilledClient = searchParams.get('client') || '';
  const [clientName, setClientName] = useState(prefilledClient);
  const [clientType, setClientType] = useState<'new' | 'returning' | ''>(prefilledClient ? 'returning' : '');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Step 2: Location
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    stylistLocations.length === 1 ? stylistLocations[0].id : null
  );
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocCountry, setNewLocCountry] = useState('');

  // Step 3: Observations
  const [observations, setObservations] = useState<string[]>([]);

  // Step 4: Context
  const [service, setService] = useState('');
  const [otherService, setOtherService] = useState('');
  const [comparison, setComparison] = useState('');

  // Step 5: Photos
  const [photoAreas, setPhotoAreas] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 6: Notes
  const [notes, setNotes] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);

  const totalSteps = 7;

  // Get unique previous clients
  const previousClients = useMemo(() => {
    const names = new Set<string>();
    clientObservations.forEach(o => names.add(o.clientName));
    return Array.from(names).sort();
  }, [clientObservations]);

  const selectedLocation = stylistLocations.find(l => l.id === selectedLocationId);

  const toggleObs = (o: string) => {
    if (o === 'General check, nothing concerning') {
      setObservations(['General check, nothing concerning']);
    } else {
      setObservations(prev => {
        const filtered = prev.filter(x => x !== 'General check, nothing concerning');
        return filtered.includes(o) ? filtered.filter(x => x !== o) : [...filtered, o];
      });
    }
  };

  const togglePhotoArea = (a: string) => {
    setPhotoAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return clientName.trim().length > 0 && clientType !== '';
      case 2: return selectedLocationId !== null;
      case 3: return observations.length > 0;
      case 4: return service !== '' && (service !== 'Other' || otherService.trim()) && (clientType !== 'returning' || comparison !== '');
      case 5: return true;
      case 6: return true;
      case 7: return true;
      default: return false;
    }
  };

  const computeRisk = (): 'green' | 'amber' | 'red' => {
    if (observations.includes('General check, nothing concerning')) return 'green';
    const severeObs = ['Bumps or lesions', 'Signs of traction damage', 'Chemical or heat damage visible'];
    if (observations.some(o => severeObs.includes(o))) return 'red';
    if (observations.length >= 3) return 'red';
    return 'amber';
  };

  const handleSave = (startAnother = false) => {
    const loc = selectedLocation;
    addClientObservation({
      id: `co-${Date.now()}`,
      clientName: clientName.trim(),
      date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      observations,
      photos,
      photoAreas,
      notes: notes || undefined,
      risk: computeRisk(),
      location: loc?.name,
      locationCity: loc?.city,
      service: service === 'Other' ? otherService : service,
      comparison: clientType === 'returning' ? comparison : undefined,
      clientType: clientType as 'new' | 'returning',
    });
    toast.success('Observation saved');
    if (startAnother) {
      setStep(1);
      setClientName('');
      setClientType('');
      setObservations([]);
      setPhotos([]);
      setPhotoAreas([]);
      setNotes('');
      setService('');
      setOtherService('');
      setComparison('');
    } else {
      navigate('/stylist');
    }
  };

  const handleShare = async () => {
    const loc = selectedLocation;
    const text = `FolliSense Client Observation\n\nClient: ${clientName}\nDate: ${new Date().toLocaleDateString()}${loc ? `\nLocation: ${loc.name}, ${loc.city}` : ''}\nService: ${service === 'Other' ? otherService : service}\n\nObservations:\n${observations.map(o => `• ${o}`).join('\n')}${comparison ? `\n\nComparison to last visit: ${comparison}` : ''}${notes ? `\n\nNotes: ${notes}` : ''}\n\nThis observation does not constitute a medical diagnosis.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'FolliSense Observation', text }); } catch { toast.info('Sharing cancelled'); }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  const handleAddLocation = () => {
    if (!newLocName.trim()) return;
    const newLoc = { id: `loc-${Date.now()}`, name: newLocName.trim(), city: newLocCity.trim(), isPrimary: stylistLocations.length === 0 };
    addStylistLocation(newLoc);
    setSelectedLocationId(newLoc.id);
    setShowAddLocation(false);
    setNewLocName('');
    setNewLocCity('');
    toast.success('Location saved');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : setShowConfirm(true)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => setShowConfirm(true)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="pt-2 pb-8">

            {/* STEP 1: Client info */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">New client observation</h2>
                <p className="text-muted-foreground text-sm mb-6">Client first name or initials</p>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g., Ama or A.K."
                  className="w-full h-14 px-4 rounded-xl border-2 border-border bg-card text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-6"
                  autoFocus
                />

                <p className="text-sm font-medium text-foreground mb-3">Is this a new or returning client?</p>
                <div className="space-y-2 mb-4">
                  {(['new', 'returning'] as const).map(type => (
                    <button key={type} onClick={() => { setClientType(type); if (type === 'returning') setShowClientDropdown(true); else setShowClientDropdown(false); }} className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${clientType === type ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <span className="text-sm font-medium text-foreground">{type === 'new' ? 'New client' : 'Returning client'}</span>
                    </button>
                  ))}
                </div>

                {clientType === 'returning' && previousClients.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Select from previous clients</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {previousClients.map(name => (
                        <button key={name} onClick={() => { setClientName(name); setShowClientDropdown(false); }} className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${clientName === name ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          {name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <p className="text-xs text-muted-foreground mt-4">🔒 We only store first names or initials for your records</p>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">Where are you seeing this client?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select or add a location</p>

                <div className="space-y-2 mb-4">
                  {stylistLocations.map(loc => (
                    <button key={loc.id} onClick={() => setSelectedLocationId(loc.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedLocationId === loc.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{loc.name}</p>
                          {loc.city && <p className="text-xs text-muted-foreground">{loc.city}</p>}
                        </div>
                        {loc.isPrimary && <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>}
                      </div>
                    </button>
                  ))}
                </div>

                {!showAddLocation ? (
                  <button onClick={() => setShowAddLocation(true)} className="w-full p-4 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground flex items-center justify-center gap-2 btn-press">
                    <Plus size={16} /> Add new location
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4 space-y-3">
                    <input type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="e.g., Natural Touch Studio, Lekki branch" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                    <input type="text" value={newLocCity} onChange={e => setNewLocCity(e.target.value)} placeholder="City" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddLocation(false)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium">Cancel</button>
                      <button onClick={handleAddLocation} disabled={!newLocName.trim()} className={`flex-1 h-10 rounded-xl text-sm font-medium ${newLocName.trim() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>Save</button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 3: Observations */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">What are you observing?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select all that apply</p>
                <div className="space-y-2">
                  {observationOptions.map(o => (
                    <button key={o} onClick={() => toggleObs(o)} className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${observations.includes(o) ? 'border-primary bg-primary/5' : 'border-border'} ${o === 'General check, nothing concerning' ? 'mb-2' : ''}`}>
                      <p className="text-sm font-medium text-foreground">{o}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Context */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">Context</h2>
                <p className="text-sm font-medium text-foreground mb-3">What service are you providing today?</p>
                <div className="space-y-2 mb-6">
                  {serviceOptions.map(s => (
                    <button key={s} onClick={() => setService(s)} className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${service === s ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {service === 'Other' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <input type="text" value={otherService} onChange={e => setOtherService(e.target.value)} placeholder="Describe the service" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
                  </motion.div>
                )}

                {clientType === 'returning' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-sm font-medium text-foreground mb-3">How does this compare to their last visit?</p>
                    <div className="space-y-2">
                      {comparisonOptions.map(c => (
                        <button key={c} onClick={() => setComparison(c)} className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${comparison === c ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 5: Photos */}
            {step === 5 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">Take photos</h2>
                <p className="text-muted-foreground text-sm mb-4">Which area are you documenting?</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {photoAreaOptions.map(area => (
                    <button key={area} onClick={() => togglePhotoArea(area)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${photoAreas.includes(area) ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
                      {area}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {(photoAreas.length > 0 ? photoAreas : ['Photo']).map((area, i) => (
                    <div key={area + i} className="card-elevated p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                        <Camera size={22} className={photos.includes(area) ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{area}</p>
                        {photos.includes(area) ? (
                          <p className="text-xs text-primary mt-0.5">Photo captured</p>
                        ) : (
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={() => setPhotos(prev => [...prev, area])} className="text-xs text-primary font-medium flex items-center gap-1">
                              <Camera size={12} /> Take photo
                            </button>
                            <button onClick={() => setPhotos(prev => [...prev, area])} className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <Upload size={12} /> Upload
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Notes */}
            {step === 6 && (
              <div>
                <h2 className="text-lg font-medium mb-2 text-foreground">Anything else to note?</h2>
                <p className="text-muted-foreground text-sm mb-4">Optional — add any additional observations or recommendations</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Type your notes here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none mb-4"
                />
                <p className="text-xs text-muted-foreground mb-2">Quick suggestions (tap to insert)</p>
                <div className="space-y-2">
                  {noteSuggestions.map(s => (
                    <button key={s} onClick={() => setNotes(prev => prev ? `${prev}\n${s}` : s)} className="w-full text-left p-3 rounded-xl border border-border text-xs text-muted-foreground btn-press hover:border-primary hover:text-foreground transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Summary */}
            {step === 7 && (
              <div>
                <h2 className="text-lg font-medium mb-6 text-foreground">Observation summary</h2>
                <div className="card-elevated p-5 mb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Client</p>
                        <p className="text-sm font-medium text-foreground">{clientName}</p>
                      </div>
                      <span className={`status-dot ${computeRisk()} mt-1`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    {selectedLocation && (
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">{selectedLocation.name}{selectedLocation.city ? `, ${selectedLocation.city}` : ''}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p className="text-sm font-medium text-foreground">{service === 'Other' ? otherService : service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Observations</p>
                      <ul className="mt-1 space-y-1">
                        {observations.map(o => (
                          <li key={o} className="text-sm text-foreground">• {o}</li>
                        ))}
                      </ul>
                    </div>
                    {clientType === 'returning' && comparison && (
                      <div>
                        <p className="text-xs text-muted-foreground">Compared to last visit</p>
                        <p className="text-sm font-medium text-foreground">{comparison}</p>
                      </div>
                    )}
                    {photos.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Photos</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {photos.map(p => (
                            <span key={p} className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {notes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm text-foreground whitespace-pre-line">{notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mb-6">This observation does not constitute a medical diagnosis.</p>

                <button onClick={handleShare} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press mb-3 flex items-center justify-center gap-2">
                  <Share2 size={18} /> Share with client
                </button>
                <button onClick={() => handleSave(false)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press flex items-center justify-center gap-2 mb-3">
                  <Save size={18} /> Save observation
                </button>
                <button onClick={() => handleSave(true)} className="w-full h-12 rounded-xl border border-border text-foreground font-medium text-sm btn-press flex items-center justify-center gap-2">
                  <Plus size={16} /> Save and start another
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Next button for steps 1-6 (sticky) */}
        {step < 7 && (
          <div className="flex-shrink-0 py-4">
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${canProceed() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
            >
              {step === 5 ? (photos.length > 0 ? 'Next' : 'Skip photos') : 'Next'}
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
