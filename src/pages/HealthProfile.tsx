import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, ChevronDown, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const HealthProfile = () => {
  const navigate = useNavigate();
  const { healthProfile, setHealthProfile, onboardingData } = useApp();
  const hp = healthProfile;
  const isMale = onboardingData.gender === 'man';

  const update = <K extends keyof typeof hp>(key: K, value: (typeof hp)[K]) => {
    setHealthProfile({ ...hp, [key]: value });
  };

  const toggleMulti = (key: 'medicalConditions' | 'skinConditions' | 'recentStressors', value: string) => {
    const arr = hp[key];
    update(key, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const sections = [
    { key: 'scalp', label: 'Scalp environment', fields: ['sweat', 'exercise', 'heatStyling', 'satinCovering'] },
    { key: 'medical', label: 'Medical history', fields: ['medicalConditions', 'pregnancyStatus', 'medications'] },
    { key: 'blood', label: 'Recent blood work', fields: ['lastBloodTest', 'bloodLevels'] },
    { key: 'skin', label: 'Other skin conditions', fields: ['skinConditions', 'sensitiveSkin'] },
    { key: 'hair', label: 'Hair history', fields: ['previousHairLoss', 'diagnosedCondition', 'familyHistory'] },
  ];

  const isSectionComplete = (key: string) => {
    switch (key) {
      case 'scalp': return !!(hp.sweat && hp.exercise && hp.heatStyling && hp.satinCovering);
      case 'medical': return !!(hp.medicalConditions.length > 0 && hp.pregnancyStatus && hp.medications && hp.recentStressors.length > 0);
      case 'blood': return !!hp.lastBloodTest;
      case 'skin': return !!(hp.skinConditions.length > 0 && hp.sensitiveSkin);
      case 'hair': return !!(hp.previousHairLoss && hp.diagnosedCondition && hp.familyHistory);
      default: return false;
    }
  };

  const completedCount = sections.filter(s => isSectionComplete(s.key)).length;

  const [openSections, setOpenSections] = useState<string[]>([]);
  const toggleSection = (key: string) => {
    setOpenSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const RadioGroup = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} className={`pill-option ${value === opt ? 'selected' : ''}`}>
          {opt}
        </button>
      ))}
    </div>
  );

  const MultiSelect = ({ selected, options, onToggle }: { selected: string[]; options: string[]; onToggle: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => onToggle(opt)} className={`pill-option ${selected.includes(opt) ? 'selected' : ''}`}>
          {opt}
        </button>
      ))}
    </div>
  );

  const bloodMarkers = ['Iron / Ferritin', 'Vitamin D', 'Thyroid (TSH)', 'B12', 'Zinc'] as const;
  const bloodOptions = ['Normal', 'Low', 'Not tested', "Don't know"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-1.5">
            <Leaf size={16} className="text-primary" strokeWidth={1.8} />
            <span className="text-xs font-semibold text-muted-foreground">FolliSense</span>
          </div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-24">
          <h1 className="text-2xl font-semibold mb-1">Your Health Profile</h1>
          <p className="text-muted-foreground text-sm mb-5">
            This helps us give you better guidance. Fill in as much or as little as you like, you can always come back.
          </p>

          {/* Progress */}
          <div className="card-elevated p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Profile {completedCount}/{sections.length} complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / sections.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Section 1: Scalp environment */}
          <Collapsible open={openSections.includes('scalp')} onOpenChange={() => toggleSection('scalp')}>
            <CollapsibleTrigger className="card-elevated w-full p-4 mb-3 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {isSectionComplete('scalp') && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
                <span className="font-medium text-foreground">Scalp environment</span>
              </div>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${openSections.includes('scalp') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="card-elevated p-5 mb-3 space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Does your scalp tend to sweat a lot?</p>
                  <RadioGroup value={hp.sweat} options={['Not really', 'Sometimes', 'Yes, frequently', 'Yes, especially during exercise']} onChange={v => update('sweat', v)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you exercise regularly?</p>
                  <RadioGroup value={hp.exercise} options={['Rarely', '1 to 2 times a week', '3 to 5 times a week', 'Daily']} onChange={v => update('exercise', v)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you use heat styling tools?</p>
                  <RadioGroup value={hp.heatStyling} options={['Never', 'Occasionally', 'Regularly', 'Frequently']} onChange={v => update('heatStyling', v)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you sleep with a satin/silk covering?</p>
                  <RadioGroup value={hp.satinCovering} options={['Always', 'Sometimes', 'Rarely', 'No']} onChange={v => update('satinCovering', v)} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 2: Medical history */}
          <Collapsible open={openSections.includes('medical')} onOpenChange={() => toggleSection('medical')}>
            <CollapsibleTrigger className="card-elevated w-full p-4 mb-3 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {isSectionComplete('medical') && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
                <span className="font-medium text-foreground">Medical history</span>
              </div>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${openSections.includes('medical') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="card-elevated p-5 mb-3 space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you have any of the following conditions?</p>
                  <MultiSelect
                    selected={hp.medicalConditions}
                    options={['PCOS', 'Thyroid condition', 'Iron deficiency / anaemia', 'Vitamin D deficiency', 'Autoimmune condition', 'Diabetes', 'Eczema / dermatitis', 'Psoriasis', 'Seborrheic dermatitis', 'Androgenetic alopecia (male pattern hair loss)', 'None of these', 'Prefer not to say']}
                    onToggle={v => toggleMulti('medicalConditions', v)}
                  />
                </div>
                {!isMale && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Are you currently pregnant, postpartum, or breastfeeding?</p>
                    <RadioGroup value={hp.pregnancyStatus} options={['No', 'Pregnant', 'Postpartum (within 12 months)', 'Breastfeeding', 'Prefer not to say']} onChange={v => update('pregnancyStatus', v)} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Have you experienced any major changes or stressors in the last 6 months?</p>
                  <MultiSelect
                    selected={hp.recentStressors}
                    options={[
                      ...(isMale ? [] : ['Pregnancy or childbirth']),
                      'Significant emotional stress (bereavement, relationship breakdown, job loss)',
                      'Major illness, surgery, or hospitalisation',
                      'Significant weight loss or dietary change',
                      ...(isMale ? [] : ['Started or stopped hormonal contraception']),
                      'Started or stopped HRT',
                      'None of these',
                      'Prefer not to say',
                    ]}
                    onToggle={v => toggleMulti('recentStressors', v)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Are you taking any medications that might affect your hair?</p>
                  <RadioGroup value={hp.medications} options={['No', 'Yes', 'Not sure']} onChange={v => update('medications', v)} />
                  {hp.medications === 'Yes' && (
                    <input
                      type="text"
                      value={hp.medicationDetails}
                      onChange={e => update('medicationDetails', e.target.value)}
                      placeholder="What medication? (optional)"
                      className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                    />
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 3: Blood work */}
          <Collapsible open={openSections.includes('blood')} onOpenChange={() => toggleSection('blood')}>
            <CollapsibleTrigger className="card-elevated w-full p-4 mb-3 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {isSectionComplete('blood') && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
                <span className="font-medium text-foreground">Recent blood work</span>
              </div>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${openSections.includes('blood') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="card-elevated p-5 mb-3 space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Hair health baseline</p>
                  <p className="text-xs text-muted-foreground mb-3">If you've had recent blood tests, this helps us understand your starting point. All optional.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">When was your last blood test?</p>
                  <RadioGroup value={hp.lastBloodTest} options={['Within 3 months', '3 to 6 months ago', '6 to 12 months ago', 'Over a year ago', 'Never', 'Not sure']} onChange={v => update('lastBloodTest', v)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Do you know your levels for any of these?</p>
                  <div className="space-y-3">
                    {bloodMarkers.map(marker => (
                      <div key={marker}>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">{marker}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {bloodOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => update('bloodLevels', { ...hp.bloodLevels, [marker]: opt })}
                              className={`pill-option text-xs px-3 py-1.5 ${hp.bloodLevels[marker] === opt ? 'selected' : ''}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">We don't store medical records, this is just to help contextualise your scalp health.</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 4: Skin conditions */}
          <Collapsible open={openSections.includes('skin')} onOpenChange={() => toggleSection('skin')}>
            <CollapsibleTrigger className="card-elevated w-full p-4 mb-3 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {isSectionComplete('skin') && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
                <span className="font-medium text-foreground">Other skin conditions</span>
              </div>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${openSections.includes('skin') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="card-elevated p-5 mb-3 space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you experience any skin conditions on your body?</p>
                  <MultiSelect
                    selected={hp.skinConditions}
                    options={['Eczema', 'Psoriasis', 'Keratosis pilaris', 'Hyperpigmentation', 'Keloid scarring', 'Acne', 'Folliculitis or razor bumps', 'None', 'Other']}
                    onToggle={v => toggleMulti('skinConditions', v)}
                  />
                  {hp.skinConditions.includes('Other') && (
                    <input
                      type="text"
                      value={hp.skinConditionDetails}
                      onChange={e => update('skinConditionDetails', e.target.value)}
                      placeholder="Please specify"
                      className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you have sensitive skin?</p>
                  <RadioGroup value={hp.sensitiveSkin} options={['No', 'Somewhat', 'Yes, very']} onChange={v => update('sensitiveSkin', v)} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section 5: Hair history */}
          <Collapsible open={openSections.includes('hair')} onOpenChange={() => toggleSection('hair')}>
            <CollapsibleTrigger className="card-elevated w-full p-4 mb-3 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {isSectionComplete('hair') && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
                <span className="font-medium text-foreground">Hair history</span>
              </div>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${openSections.includes('hair') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="card-elevated p-5 mb-3 space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Have you experienced significant hair loss before?</p>
                  <RadioGroup value={hp.previousHairLoss} options={['No', 'Yes, once', 'Yes, recurring']} onChange={v => update('previousHairLoss', v)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Have you ever been diagnosed with a hair or scalp condition?</p>
                  <RadioGroup value={hp.diagnosedCondition} options={['No', 'Yes', 'Not sure']} onChange={v => update('diagnosedCondition', v)} />
                  {hp.diagnosedCondition === 'Yes' && (
                    <input
                      type="text"
                      value={hp.diagnosedConditionDetails}
                      onChange={e => update('diagnosedConditionDetails', e.target.value)}
                      placeholder="What condition? (optional)"
                      className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mt-3"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Do you have a family history of hair loss or thinning?</p>
                  <RadioGroup value={hp.familyHistory} options={['No', 'Yes', 'Not sure']} onChange={v => update('familyHistory', v)} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthProfile;
