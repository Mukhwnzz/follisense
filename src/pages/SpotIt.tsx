import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Eye, ImageIcon, ChevronRight, CheckCircle2, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { consumerConditions } from '@/data/conditionGuide';

const symptomOptions = [
  {
    id: 'flaking',
    label: 'Flaking or buildup',
    description: 'White or yellowish flakes, oily or dry residue on scalp',
    icon: '🫧',
  },
  {
    id: 'redness',
    label: 'Redness or irritation',
    description: 'Pink, red, or inflamed patches on the scalp',
    icon: '🔴',
  },
  {
    id: 'bumps',
    label: 'Bumps (folliculitis)',
    description: 'Small pimple-like bumps at hair follicles',
    icon: '⚡',
  },
  {
    id: 'hairline-thinning',
    label: 'Thinning at hairline or edges',
    description: 'Hair loss concentrated around temples, edges, or where styles grip',
    icon: '📍',
  },
  {
    id: 'hairline-recession',
    label: 'Hairline moving backward',
    description: 'Gradual, even recession of the frontal hairline, possibly with eyebrow thinning',
    icon: '↗️',
  },
  {
    id: 'crown-thinning',
    label: 'Thinning at the crown',
    description: 'Hair becoming sparse or see-through at the top of the head',
    icon: '🎯',
  },
  {
    id: 'widening-part',
    label: 'Widening part line',
    description: 'Your part line is becoming wider or more visible over time',
    icon: '📏',
  },
  {
    id: 'tenderness',
    label: 'Tenderness or soreness',
    description: 'Pain or sensitivity when touching the scalp',
    icon: '💢',
  },
  {
    id: 'nothing',
    label: 'Nothing concerning',
    description: 'Just exploring — no current issues',
    icon: '✅',
  },
];

interface ConditionMatch {
  conditionId: string;
  name: string;
  likelihood: 'possible' | 'likely';
  message: string;
  selfCareTips: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

const getMatches = (selected: string[], gender?: string): ConditionMatch[] => {
  const isMale = gender === 'man';
  const isFemale = gender === 'woman';
  const isNeutral = !isMale && !isFemale;
  const matches: ConditionMatch[] = [];

  if (selected.includes('hairline-thinning')) {
    matches.push({
      conditionId: 'traction-alopecia',
      name: 'Traction alopecia',
      likelihood: selected.includes('tenderness') ? 'likely' : 'possible',
      message: 'This could be consistent with early traction alopecia — hair loss caused by repeated tension from tight styles.',
      selfCareTips: [
        'Loosen or remove any tight styles immediately',
        'Give your hairline a break between installations',
        'Avoid re-tightening edges — if they\'re loose, leave them',
      ],
      severity: selected.includes('tenderness') ? 'moderate' : 'mild',
    });
  }

  if (selected.includes('crown-thinning')) {
    // FPHL match for female / neutral users
    if (isFemale || isNeutral) {
      matches.push({
        conditionId: 'fphl',
        name: 'Female pattern hair loss (FPHL)',
        likelihood: selected.includes('widening-part') ? 'likely' : 'possible',
        message: 'Thinning at the crown could be consistent with female pattern hair loss — the most common cause of hair loss in women. Unlike traction alopecia, it\'s hormonal.',
        selfCareTips: [
          'See a dermatologist or trichologist for proper diagnosis',
          'Track changes with photos — especially your part line and crown',
          'Ask about minoxidil — it\'s the most evidence-based treatment for FPHL',
        ],
        severity: 'moderate',
      });
    }
    // MPHL match for male / neutral users
    if (isMale || isNeutral) {
      matches.push({
        conditionId: 'mphl',
        name: 'Male pattern hair loss (MPHL)',
        likelihood: selected.includes('hairline-recession') ? 'likely' : 'possible',
        message: 'Thinning at the crown could be consistent with male pattern hair loss. Tracking changes early helps.',
        selfCareTips: [
          'See a dermatologist or trichologist for proper diagnosis',
          'Track changes with photos to monitor progression',
          'Ask about evidence-based treatments like minoxidil or finasteride',
        ],
        severity: 'moderate',
      });
    }
    matches.push({
      conditionId: 'ccca',
      name: 'CCCA (Central Centrifugal Cicatricial Alopecia)',
      likelihood: selected.includes('tenderness') ? 'likely' : 'possible',
      message: 'Thinning at the crown could be consistent with CCCA, a condition that primarily affects women of African descent. Early assessment is important.',
      selfCareTips: [
        'Avoid tension and heat at the crown area',
        'Document the area with photos to track changes',
        'See a dermatologist — early treatment is critical for this condition',
      ],
      severity: 'moderate',
    });
  }

  // Widening part line — FPHL match
  if (selected.includes('widening-part') && !selected.includes('crown-thinning')) {
    if (isFemale || isNeutral) {
      matches.push({
        conditionId: 'fphl',
        name: 'Female pattern hair loss (FPHL)',
        likelihood: 'possible',
        message: 'A widening part line is one of the earliest signs of female pattern hair loss. Your frontal hairline is usually preserved while the crown thins.',
        selfCareTips: [
          'See a dermatologist or trichologist for proper diagnosis',
          'Track changes with photos — especially your part line',
          'Ask about minoxidil — it\'s the most evidence-based treatment for FPHL',
        ],
        severity: 'mild',
      });
    }
  }

  if (selected.includes('hairline-recession')) {
    // MPHL match for male / neutral users
    if (isMale || isNeutral) {
      matches.push({
        conditionId: 'mphl',
        name: 'Male pattern hair loss (MPHL)',
        likelihood: selected.includes('crown-thinning') ? 'likely' : 'possible',
        message: 'Gradual recession of your hairline could be consistent with male pattern hair loss — the most common cause of hair loss in men. Early treatment can slow or stop progression.',
        selfCareTips: [
          'See a dermatologist or trichologist for proper diagnosis',
          'Track changes with photos to monitor progression',
          'Ask about evidence-based treatments like minoxidil or finasteride',
        ],
        severity: 'moderate',
      });
    }
    matches.push({
      conditionId: 'frontal-fibrosing-alopecia',
      name: 'Frontal fibrosing alopecia (FFA)',
      likelihood: 'possible',
      message: 'Gradual, even recession of the frontal hairline could be consistent with frontal fibrosing alopecia — a scarring condition that\'s different from traction alopecia.',
      selfCareTips: [
        'See a dermatologist as soon as possible — early treatment can slow progression',
        'Document your hairline with photos to track changes',
        'Mention any eyebrow thinning as well — it helps with diagnosis',
      ],
      severity: 'moderate',
    });
  }

  if (selected.includes('flaking')) {
    matches.push({
      conditionId: 'seborrheic-dermatitis',
      name: 'Seborrheic dermatitis',
      likelihood: selected.includes('redness') ? 'likely' : 'possible',
      message: 'This could be consistent with seborrheic dermatitis — a common, manageable condition caused by yeast overgrowth, not poor hygiene.',
      selfCareTips: [
        'Try a medicated shampoo with ketoconazole or zinc pyrithione',
        'Cleanse your scalp regularly, even under protective styles',
        'Avoid heavy oils and butters directly on the scalp',
      ],
      severity: 'mild',
    });
  }

  if (selected.includes('bumps')) {
    matches.push({
      conditionId: 'folliculitis',
      name: 'Folliculitis',
      likelihood: 'possible',
      message: 'Small bumps at the hair follicle could be consistent with folliculitis — inflammation that often appears after a new style or cut.',
      selfCareTips: [
        'Keep the area clean and avoid touching it',
        'Loosen or remove the style if it\'s causing irritation',
        'A warm compress can help with inflammation',
      ],
      severity: selected.includes('tenderness') ? 'moderate' : 'mild',
    });
  }

  if (selected.includes('redness') && !selected.includes('flaking') && !selected.includes('bumps')) {
    matches.push({
      conditionId: 'chemical-damage',
      name: 'Chemical or heat irritation',
      likelihood: 'possible',
      message: 'Redness or irritation could be a reaction to a recent chemical treatment, heat styling, or a product irritant.',
      selfCareTips: [
        'Stop all chemical and heat treatments on the affected area',
        'Use gentle, fragrance-free products',
        'Let the area heal completely before further processing',
      ],
      severity: 'mild',
    });
  }

  if (selected.includes('tenderness') && !selected.includes('hairline-thinning') && !selected.includes('crown-thinning') && !selected.includes('bumps')) {
    matches.push({
      conditionId: 'traction-alopecia',
      name: 'Tension-related soreness',
      likelihood: 'possible',
      message: 'Scalp tenderness can be a sign of too much tension from styling. If your style feels tight, that\'s your scalp telling you something.',
      selfCareTips: [
        'Loosen the tightest sections of your current style',
        'Pain after installation is a warning sign — don\'t tough it out',
        'Consider asking your stylist for a looser grip next time',
      ],
      severity: 'mild',
    });
  }

  return matches;
};

const SpotIt = () => {
  const navigate = useNavigate();
  const { addQuickLog, onboardingData } = useApp();
  const [step, setStep] = useState(1); // 1: select, 2: photo areas, 3: results
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSymptom = (id: string) => {
    if (id === 'nothing') {
      setSelected(['nothing']);
    } else {
      setSelected(prev => {
        const filtered = prev.filter(x => x !== 'nothing');
        return filtered.includes(id) ? filtered.filter(x => x !== id) : [...filtered, id];
      });
    }
  };

  const matches = getMatches(selected, onboardingData?.gender);
  const nothingSelected = selected.includes('nothing');

  const handleSaveAndFinish = () => {
    // Save to quick log history
    const symptomLabels = selected.map(id => {
      const opt = symptomOptions.find(o => o.id === id);
      return opt?.label || id;
    });
    const overallSeverity = matches.some(m => m.severity === 'severe') ? 'Severe'
      : matches.some(m => m.severity === 'moderate') ? 'Moderate' : 'Mild';

    addQuickLog({
      id: `spot-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      symptoms: symptomLabels,
      severity: nothingSelected ? 'None' : overallSeverity,
    });

    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto px-6 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex gap-1.5">
            {[1, 2].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <X size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {/* STEP 1: Symptom selection */}
            {step === 1 && (
              <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={18} className="text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Spot It</span>
                </div>
                <h2 className="text-lg font-medium mb-2 text-foreground">What are you seeing on your scalp?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select everything that matches. This isn't a diagnosis — it's a starting point.</p>

                <div className="space-y-2.5">
                  {symptomOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleSymptom(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                        selected.includes(opt.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                      </div>
                      {selected.includes(opt.id) && (
                        <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Visual reference placeholders */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Visual reference — on textured hair & darker skin tones</p>
                  <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {[
                      { label: 'Flaking / buildup', desc: 'Yellowish or dry flakes along the part line on coily hair' },
                      { label: 'Folliculitis bumps', desc: 'Small inflamed bumps at follicles on darker skin' },
                      { label: 'Hairline thinning', desc: 'Thinning at the temples and edges from tight styles' },
                      { label: 'Hairline recession (FFA)', desc: 'Even, gradual recession of the frontal hairline with smooth skin' },
                      { label: 'Crown thinning', desc: 'Sparse hair at the vertex on textured hair' },
                      { label: 'Widening part line', desc: 'Part line becoming visibly wider over time on textured hair' },
                      { label: 'Redness / irritation', desc: 'Pinkish or irritated patches on darker scalp skin' },
                      { label: 'Redness / irritation', desc: 'Pinkish or irritated patches on darker scalp skin' },
                    ].map((photo, i) => (
                      <div key={i} className="flex-shrink-0 w-[160px]">
                        <div className="w-[160px] h-[120px] rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-1.5">
                          <ImageIcon size={20} className="text-muted-foreground/50" />
                          <span className="text-[9px] text-muted-foreground text-center px-2 leading-tight">{photo.desc}</span>
                        </div>
                        <p className="text-[11px] font-medium text-foreground mt-1.5">{photo.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Results */}
            {step === 2 && (
              <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="pb-8">
                {nothingSelected ? (
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-4">
                      <Shield size={32} className="text-primary" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground text-center mb-2">All clear — nothing flagged</h2>
                    <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                      Great that you're checking in. Regular self-checks are one of the best things you can do for your scalp health. Keep it up.
                    </p>
                    <div className="rounded-xl bg-secondary/50 p-4 mb-6">
                      <p className="text-sm text-foreground">💡 <strong>Tip:</strong> Try doing a quick visual check every time you wash your hair or take down a style. Look at your hairline, crown, and any areas that felt tight.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-1">Here's what we found</h2>
                    <p className="text-sm text-muted-foreground mb-6">Based on what you selected, here are some possibilities to be aware of. This is not a diagnosis.</p>

                    {/* Disclaimer */}
                    <div className="rounded-xl bg-secondary/60 border border-secondary p-3 mb-5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong>Important:</strong> This guide helps you understand what you might be seeing. Only a qualified professional can diagnose a scalp condition.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {matches.map((match, i) => {
                        const condition = consumerConditions.find(c => c.id === match.conditionId);
                        return (
                          <div key={i} className="card-elevated p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                match.severity === 'severe' ? 'bg-destructive' : match.severity === 'moderate' ? 'bg-amber-500' : 'bg-primary'
                              }`} />
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">{match.name}</h3>
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                  match.likelihood === 'likely' ? 'text-amber-600' : 'text-muted-foreground'
                                }`}>
                                  {match.likelihood === 'likely' ? 'More likely match' : 'Possible match'}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{match.message}</p>

                            {/* Self-care tips */}
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-foreground mb-2">What you can do</p>
                              <ul className="space-y-1.5">
                                {match.selfCareTips.map((tip, j) => (
                                  <li key={j} className="flex gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Severity guidance */}
                            {match.severity !== 'mild' && (
                              <div className={`rounded-lg p-3 mb-3 ${match.severity === 'severe' ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                                <p className={`text-xs font-medium ${match.severity === 'severe' ? 'text-destructive' : 'text-amber-600'}`}>
                                  {match.severity === 'severe'
                                    ? 'Consider seeing a trichologist or dermatologist soon.'
                                    : 'Worth monitoring. If it worsens, consider seeing a professional.'}
                                </p>
                              </div>
                            )}

                            {/* Link to condition detail */}
                            {condition && (
                              <button
                                onClick={() => navigate(`/learn?condition=${match.conditionId}`)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <Eye size={14} className="text-primary" />
                                  <span className="text-xs font-medium text-foreground">Learn more about {match.name}</span>
                                </div>
                                <ChevronRight size={14} className="text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* General next steps */}
                    <div className="mt-6 card-elevated p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Next steps</h3>
                      <div className="space-y-3">
                        <button onClick={() => navigate('/find-specialist')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-left">
                          <ExternalLink size={16} className="text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Find a specialist</p>
                            <p className="text-[11px] text-muted-foreground">Trichologists and dermatologists near you</p>
                          </div>
                        </button>
                        <button onClick={() => navigate('/wash-day')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 text-left">
                          <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Do a full scalp check-in</p>
                            <p className="text-[11px] text-muted-foreground">Track your symptoms in detail</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="py-4 pb-8">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
              className={`w-full h-14 rounded-xl font-semibold text-base transition-colors ${
                selected.length > 0 ? 'bg-primary text-primary-foreground btn-press' : 'bg-border text-muted-foreground'
              }`}
            >
              See what it could be
            </button>
          ) : (
            <button
              onClick={handleSaveAndFinish}
              className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press"
            >
              Save to my history
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotIt;
