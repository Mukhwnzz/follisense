import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Eye, ImageIcon, ChevronRight, CheckCircle2, Shield, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { consumerConditions } from '@/data/conditionGuide';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg:         '#141414',
  card:       '#1E1E1E',
  cardBorder: 'rgba(255,255,255,0.08)',
  ink:        '#F5F5F5',
  sub:        'rgba(255,255,255,0.5)',
  warm:       'rgba(255,255,255,0.65)',
  gold:       '#D4A866',
  goldDeep:   '#C49A50',
  gold10:     'rgba(212,168,102,0.12)',
  goldBorder: 'rgba(212,168,102,0.35)',
  mid:        'rgba(255,255,255,0.12)',
  white:      '#FFFFFF',
};

const symptomOptions = [
  { id: 'flaking',            label: 'Flaking or buildup',            description: 'White or yellowish flakes, oily or dry residue on scalp',                        icon: '🫧' },
  { id: 'redness',            label: 'Redness or irritation',         description: 'Pink, red, or inflamed patches on the scalp',                                    icon: '🔴' },
  { id: 'bumps',              label: 'Bumps (folliculitis)',           description: 'Small pimple-like bumps at hair follicles',                                       icon: '⚡' },
  { id: 'hairline-thinning',  label: 'Thinning at hairline or edges', description: 'Hair loss concentrated around temples, edges, or where styles grip',              icon: '📍' },
  { id: 'hairline-recession', label: 'Hairline moving backward',      description: 'Gradual, even recession of the frontal hairline, possibly with eyebrow thinning', icon: '↗️' },
  { id: 'crown-thinning',     label: 'Thinning at the crown',         description: 'Hair becoming sparse or see-through at the top of the head',                      icon: '🎯' },
  { id: 'widening-part',      label: 'Widening part line',            description: 'Your part line is becoming wider or more visible over time',                       icon: '📏' },
  { id: 'tenderness',         label: 'Tenderness or soreness',        description: 'Pain or sensitivity when touching the scalp',                                      icon: '💢' },
  { id: 'nothing',            label: 'Nothing concerning',            description: 'Just exploring — no current issues',                                               icon: '✅' },
];

interface ConditionMatch {
  conditionId: string; name: string; likelihood: 'possible' | 'likely';
  message: string; selfCareTips: string[]; severity: 'mild' | 'moderate' | 'severe';
}

const getMatches = (selected: string[], gender?: string): ConditionMatch[] => {
  const isMale = gender === 'man', isFemale = gender === 'woman', isNeutral = !isMale && !isFemale;
  const matches: ConditionMatch[] = [];
  if (selected.includes('hairline-thinning')) matches.push({ conditionId: 'traction-alopecia', name: 'Traction alopecia', likelihood: selected.includes('tenderness') ? 'likely' : 'possible', message: 'This could be consistent with early traction alopecia — hair loss caused by repeated tension from tight styles.', selfCareTips: ['Loosen or remove any tight styles immediately', 'Give your hairline a break between installations', "Avoid re-tightening edges — if they're loose, leave them"], severity: selected.includes('tenderness') ? 'moderate' : 'mild' });
  if (selected.includes('crown-thinning')) {
    if (isFemale || isNeutral) matches.push({ conditionId: 'fphl', name: 'Female pattern hair loss (FPHL)', likelihood: selected.includes('widening-part') ? 'likely' : 'possible', message: "Thinning at the crown could be consistent with female pattern hair loss.", selfCareTips: ['See a dermatologist or trichologist for proper diagnosis', 'Track changes with photos — especially your part line and crown', "Ask about minoxidil — it's the most evidence-based treatment for FPHL"], severity: 'moderate' });
    if (isMale || isNeutral) matches.push({ conditionId: 'mphl', name: 'Male pattern hair loss (MPHL)', likelihood: selected.includes('hairline-recession') ? 'likely' : 'possible', message: 'Thinning at the crown could be consistent with male pattern hair loss.', selfCareTips: ['See a dermatologist or trichologist for proper diagnosis', 'Track changes with photos to monitor progression', 'Ask about evidence-based treatments like minoxidil or finasteride'], severity: 'moderate' });
    matches.push({ conditionId: 'ccca', name: 'CCCA (Central Centrifugal Cicatricial Alopecia)', likelihood: selected.includes('tenderness') ? 'likely' : 'possible', message: 'Thinning at the crown could be consistent with CCCA, a condition that primarily affects women of African descent.', selfCareTips: ['Avoid tension and heat at the crown area', 'Document the area with photos to track changes', 'See a dermatologist — early treatment is critical for this condition'], severity: 'moderate' });
  }
  if (selected.includes('widening-part') && !selected.includes('crown-thinning') && (isFemale || isNeutral)) matches.push({ conditionId: 'fphl', name: 'Female pattern hair loss (FPHL)', likelihood: 'possible', message: 'A widening part line is one of the earliest signs of female pattern hair loss.', selfCareTips: ['See a dermatologist or trichologist for proper diagnosis', 'Track changes with photos — especially your part line', "Ask about minoxidil — it's the most evidence-based treatment for FPHL"], severity: 'mild' });
  if (selected.includes('hairline-recession')) {
    if (isMale || isNeutral) matches.push({ conditionId: 'mphl', name: 'Male pattern hair loss (MPHL)', likelihood: selected.includes('crown-thinning') ? 'likely' : 'possible', message: 'Gradual recession of your hairline could be consistent with male pattern hair loss.', selfCareTips: ['See a dermatologist or trichologist for proper diagnosis', 'Track changes with photos to monitor progression', 'Ask about evidence-based treatments like minoxidil or finasteride'], severity: 'moderate' });
    matches.push({ conditionId: 'frontal-fibrosing-alopecia', name: 'Frontal fibrosing alopecia (FFA)', likelihood: 'possible', message: "Gradual, even recession of the frontal hairline could be consistent with frontal fibrosing alopecia.", selfCareTips: ['See a dermatologist as soon as possible — early treatment can slow progression', 'Document your hairline with photos to track changes', 'Mention any eyebrow thinning as well — it helps with diagnosis'], severity: 'moderate' });
  }
  if (selected.includes('flaking')) matches.push({ conditionId: 'seborrheic-dermatitis', name: 'Seborrheic dermatitis', likelihood: selected.includes('redness') ? 'likely' : 'possible', message: 'This could be consistent with seborrheic dermatitis — a common, manageable condition caused by yeast overgrowth, not poor hygiene.', selfCareTips: ['Try a medicated shampoo with ketoconazole or zinc pyrithione', 'Cleanse your scalp regularly, even under protective styles', 'Avoid heavy oils and butters directly on the scalp'], severity: 'mild' });
  if (selected.includes('bumps')) matches.push({ conditionId: 'folliculitis', name: 'Folliculitis', likelihood: 'possible', message: 'Small bumps at the hair follicle could be consistent with folliculitis.', selfCareTips: ['Keep the area clean and avoid touching it', "Loosen or remove the style if it's causing irritation", 'A warm compress can help with inflammation'], severity: selected.includes('tenderness') ? 'moderate' : 'mild' });
  if (selected.includes('redness') && !selected.includes('flaking') && !selected.includes('bumps')) matches.push({ conditionId: 'chemical-damage', name: 'Chemical or heat irritation', likelihood: 'possible', message: 'Redness or irritation could be a reaction to a recent chemical treatment, heat styling, or a product irritant.', selfCareTips: ['Stop all chemical and heat treatments on the affected area', 'Use gentle, fragrance-free products', 'Let the area heal completely before further processing'], severity: 'mild' });
  if (selected.includes('tenderness') && !selected.includes('hairline-thinning') && !selected.includes('crown-thinning') && !selected.includes('bumps')) matches.push({ conditionId: 'traction-alopecia', name: 'Tension-related soreness', likelihood: 'possible', message: "Scalp tenderness can be a sign of too much tension from styling.", selfCareTips: ['Loosen the tightest sections of your current style', "Pain after installation is a warning sign — don't tough it out", 'Consider asking your stylist for a looser grip next time'], severity: 'mild' });
  return matches;
};

const SpotIt = () => {
  const navigate = useNavigate();
  const { addQuickLog, onboardingData } = useApp();
  const [step, setStep]         = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSymptom = (id: string) => {
    if (id === 'nothing') { setSelected(['nothing']); return; }
    setSelected(prev => { const f = prev.filter(x => x !== 'nothing'); return f.includes(id) ? f.filter(x => x !== id) : [...f, id]; });
  };

  const matches         = getMatches(selected, onboardingData?.gender);
  const nothingSelected = selected.includes('nothing');

  const handleSaveAndFinish = () => {
    const symptomLabels = selected.map(id => symptomOptions.find(o => o.id === id)?.label || id);
    const overallSeverity = matches.some(m => m.severity === 'severe') ? 'Severe' : matches.some(m => m.severity === 'moderate') ? 'Moderate' : 'Mild';
    addQuickLog({ id: `spot-${Date.now()}`, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), symptoms: symptomLabels, severity: nothingSelected ? 'None' : overallSeverity });
    navigate('/home');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        body, #root, .page-container, main { background: #141414 !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: dm, padding: '20px 20px 80px', boxSizing: 'border-box' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: C.card, border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color={C.sub} strokeWidth={1.8} />
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ width: 28, height: 4, borderRadius: 4, background: i <= step ? C.gold : C.mid, transition: 'background 0.25s' }} />
            ))}
          </div>
          <button onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: C.card, border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color={C.sub} strokeWidth={1.8} />
          </button>
        </div>

        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: '0.12em', textTransform: 'uppercase' }}>FolliSense</span>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 */}
          {step === 1 && (
            <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Eye size={15} color={C.gold} strokeWidth={1.8} />
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Spot It</span>
              </div>
              <h2 style={{ fontFamily: playfair, fontSize: 24, fontWeight: 500, color: C.ink, margin: '0 0 6px', lineHeight: 1.2 }}>
                What are you seeing on your scalp?
              </h2>
              <p style={{ fontFamily: dm, fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.5 }}>
                Select everything that matches. This isn't a diagnosis — it's a starting point.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {symptomOptions.map(opt => {
                  const sel = selected.includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => toggleSymptom(opt.id)} style={{
                      width: '100%', textAlign: 'left', padding: '13px 16px', borderRadius: 16, boxSizing: 'border-box',
                      border: sel ? `1.5px solid ${C.gold}` : `1px solid ${C.cardBorder}`,
                      background: sel ? C.gold10 : C.card,
                      cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                      boxShadow: sel ? `0 4px 20px rgba(212,168,102,0.15)` : '0 1px 4px rgba(0,0,0,0.3)',
                      transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{opt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: sel ? C.gold : C.ink, margin: 0 }}>{opt.label}</p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: C.sub, margin: '3px 0 0', lineHeight: 1.45 }}>{opt.description}</p>
                      </div>
                      {sel && <CheckCircle2 size={17} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Visual reference placeholders */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Visual reference — textured hair & darker skin tones
                </p>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' as any }}>
                  {[
                    { label: 'Flaking / buildup', desc: 'Yellowish or dry flakes on coily hair' },
                    { label: 'Folliculitis bumps', desc: 'Small inflamed bumps on darker skin' },
                    { label: 'Hairline thinning', desc: 'Thinning at temples from tight styles' },
                    { label: 'Hairline recession', desc: 'Even frontal recession with smooth skin' },
                    { label: 'Crown thinning', desc: 'Sparse hair at vertex on textured hair' },
                    { label: 'Widening part line', desc: 'Part becoming visibly wider over time' },
                  ].map((photo, i) => (
                    <div key={i} style={{ flexShrink: 0, width: 140 }}>
                      <div style={{ width: 140, height: 100, borderRadius: 12, border: `1px dashed ${C.goldBorder}`, background: C.gold10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 5 }}>
                        <ImageIcon size={16} color={C.gold} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                        <span style={{ fontFamily: dm, fontSize: 9, color: C.sub, textAlign: 'center', padding: '0 8px', lineHeight: 1.4 }}>{photo.desc}</span>
                      </div>
                      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: C.ink }}>{photo.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={selected.length === 0} style={{
                width: '100%', height: 52, borderRadius: 16, border: 'none',
                background: selected.length > 0 ? C.gold : C.card,
                color: selected.length > 0 ? C.bg : C.sub,
                fontFamily: dm, fontSize: 14, fontWeight: 700,
                cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selected.length > 0 ? '0 4px 20px rgba(212,168,102,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                See what it could be
              </button>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && (
            <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
              {nothingSelected ? (
                <div>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: C.gold10, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 20px' }}>
                    <Shield size={26} color={C.gold} strokeWidth={1.6} />
                  </div>
                  <h2 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: C.ink, textAlign: 'center', margin: '0 0 10px' }}>All clear — nothing flagged</h2>
                  <p style={{ fontFamily: dm, fontSize: 13, color: C.sub, textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
                    Great that you're checking in. Regular self-checks are one of the best things you can do for your scalp health.
                  </p>
                  <div style={{ background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 16, padding: '14px 16px', marginBottom: 28 }}>
                    <p style={{ fontFamily: dm, fontSize: 13, color: C.warm, lineHeight: 1.6, margin: 0 }}>
                      💡 Try doing a quick visual check every time you wash your hair or take down a style.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: C.ink, margin: '0 0 6px' }}>Here's what we found</h2>
                  <p style={{ fontFamily: dm, fontSize: 13, color: C.sub, margin: '0 0 18px', lineHeight: 1.5 }}>Based on what you selected. This is not a diagnosis.</p>

                  <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '12px 14px', marginBottom: 18 }}>
                    <p style={{ fontFamily: dm, fontSize: 11, color: C.sub, lineHeight: 1.6, margin: 0 }}>
                      <strong style={{ color: C.ink }}>Important:</strong> Only a qualified professional can diagnose a scalp condition.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {matches.map((match, i) => {
                      const condition   = consumerConditions.find(c => c.id === match.conditionId);
                      const severityCol = match.severity === 'severe' ? '#ff7060' : match.severity === 'moderate' ? C.gold : '#70d060';
                      return (
                        <div key={i} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityCol, flexShrink: 0, marginTop: 5 }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{match.name}</p>
                              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: match.likelihood === 'likely' ? C.gold : C.sub }}>
                                {match.likelihood === 'likely' ? 'More likely match' : 'Possible match'}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontFamily: dm, fontSize: 12, color: C.warm, lineHeight: 1.6, margin: '0 0 12px' }}>{match.message}</p>
                          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>What you can do</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: match.severity !== 'mild' || condition ? 12 : 0 }}>
                            {match.selfCareTips.map((tip, j) => (
                              <div key={j} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                                <CheckCircle2 size={12} color={C.gold} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontFamily: dm, fontSize: 12, color: C.warm, margin: 0, lineHeight: 1.5 }}>{tip}</p>
                              </div>
                            ))}
                          </div>
                          {match.severity !== 'mild' && (
                            <div style={{ background: C.gold10, border: `1px solid ${C.goldBorder}`, borderRadius: 10, padding: '9px 12px', marginBottom: condition ? 10 : 0 }}>
                              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: C.gold, margin: 0 }}>
                                {match.severity === 'severe' ? 'Consider seeing a trichologist or dermatologist soon.' : 'Worth monitoring. If it worsens, consider seeing a professional.'}
                              </p>
                            </div>
                          )}
                          {condition && (
                            <button onClick={() => navigate(`/learn?condition=${match.conditionId}`)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 12, background: C.gold10, border: `1px solid ${C.goldBorder}`, cursor: 'pointer', textAlign: 'left' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Eye size={12} color={C.gold} strokeWidth={1.8} />
                                <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 500, color: C.ink }}>Learn more about {match.name}</span>
                              </div>
                              <ChevronRight size={12} color={C.sub} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: '16px', marginBottom: 24 }}>
                    <p style={{ fontFamily: playfair, fontSize: 15, fontWeight: 500, color: C.ink, margin: '0 0 12px' }}>Next steps</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Find a specialist', desc: 'Trichologists and dermatologists near you', Icon: ExternalLink, path: '/find-specialist' },
                        { label: 'Do a full scalp check-in', desc: 'Track your symptoms in detail', Icon: CheckCircle2, path: '/wash-day' },
                      ].map(a => (
                        <button key={a.label} onClick={() => navigate(a.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, background: C.gold10, border: `1px solid ${C.goldBorder}`, cursor: 'pointer', textAlign: 'left' }}>
                          <a.Icon size={15} color={C.gold} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                          <div>
                            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>{a.label}</p>
                            <p style={{ fontFamily: dm, fontSize: 11, color: C.sub, margin: '1px 0 0' }}>{a.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleSaveAndFinish} style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', background: C.gold, color: C.bg, fontFamily: dm, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,168,102,0.3)' }}>
                Save to my history
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SpotIt;