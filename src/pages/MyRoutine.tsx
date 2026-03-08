import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Droplets, Sun, Utensils, AlertTriangle, Stethoscope, RefreshCw, Clock, Repeat, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface RoutineStep {
  step: string;
  detail: string;
  duration?: string;
  frequency?: string;
}

interface Routine {
  summary: string;
  wash_day: RoutineStep[];
  mid_cycle: RoutineStep[];
  daily: RoutineStep[];
  weekly_nutrition: { tip: string }[];
  avoid: { item: string }[];
  notes: string;
}

const generateMockRoutine = (data: any): Routine => {
  const hairType = data.hairType || '4c';
  const styles = data.protectiveStyles?.length > 0 ? data.protectiveStyles : ['braids'];
  const washFreq = data.washFrequency || data.wornOutWashFrequency || 'Every 7–10 days';
  const goals = data.goals?.length > 0 ? data.goals : ['General scalp and hair health'];
  const hasItch = data.baselineItch === 'Moderate' || data.baselineItch === 'Severe';
  const isMale = data.gender === 'man';

  return {
    summary: `A ${isMale ? '' : 'wash-cycle-based '}scalp care routine for your ${hairType} hair, focused on ${goals[0]?.toLowerCase() || 'scalp health'}.`,
    wash_day: [
      {
        step: 'Pre-wash scalp massage',
        detail: `Use your fingertips to gently massage your scalp for circulation before wetting your hair. No product needed for this step.`,
        duration: '3 mins',
      },
      {
        step: 'Cleanse with sulphate-free shampoo',
        detail: `Focus the shampoo on your scalp, not your lengths. Work it in with your fingertips, not your nails. Rinse thoroughly.`,
        duration: '5 mins',
      },
      {
        step: 'Condition mid-lengths to ends',
        detail: `Apply conditioner from mid-length down. Your scalp doesn't need conditioner — it can cause buildup.`,
        duration: '5 mins',
      },
      {
        step: 'Moisturise and seal lengths',
        detail: `Apply a water-based leave-in to damp hair. Seal with a light cream or butter on your lengths only — keep your scalp clear.`,
        duration: '3 mins',
      },
    ],
    mid_cycle: [
      {
        step: hasItch ? 'Scalp relief check' : 'Scalp check',
        detail: hasItch
          ? `If your scalp feels itchy or tight, use a fragrance-free scalp mist or hydrating spray. Avoid scratching — press gently with a fingertip instead.`
          : `Part your hair in a few places and check for flaking, redness, or buildup. No product needed — just observation.`,
        frequency: 'Every 3–4 days',
      },
      {
        step: 'Refresh your style',
        detail: styles.includes('Box braids') || styles.includes('Cornrows') || styles.includes('Twists')
          ? `Spritz edges and hairline with water or a light refresher spray. Re-tie your satin scarf at night.`
          : `Detangle gently from ends to roots. Reapply leave-in if hair feels dry on the lengths.`,
        frequency: 'As needed',
      },
    ],
    daily: [
      {
        step: 'Satin protection at night',
        detail: isMale
          ? `Use a satin-lined durag or wave cap. Make sure the tie isn't too tight around your hairline.`
          : `Sleep on a satin pillowcase or wear a satin bonnet. This reduces friction and breakage overnight.`,
      },
      {
        step: 'Hydration',
        detail: `Drink at least 2 litres of water. Your scalp is skin — it needs hydration from the inside too.`,
      },
      {
        step: 'Leave your scalp alone',
        detail: `Resist the urge to scratch, pick at flakes, or apply products between washes unless there's a specific reason to.`,
      },
    ],
    weekly_nutrition: [
      { tip: 'Include iron-rich foods like spinach, lentils, or red meat — iron deficiency is a common cause of hair shedding.' },
      { tip: 'Get adequate vitamin D through sunlight or supplementation, especially in winter. Low levels are linked to hair loss.' },
      { tip: 'Eat protein at every meal — hair is made of keratin, which requires amino acids from dietary protein.' },
      ...(data.baselineHairHealth === 'Dry or brittle'
        ? [{ tip: 'Add omega-3 fatty acids (oily fish, walnuts, flaxseed) to support scalp hydration from within.' }]
        : []),
    ],
    avoid: [
      { item: `Heavy oils or butters directly on the scalp — these can clog follicles, worsen buildup, and aggravate conditions like seborrheic dermatitis.` },
      ...(styles.some((s: string) => ['Box braids', 'Cornrows', 'Twists'].includes(s))
        ? [{ item: `Re-tightening edges or hairline braids — if they're loose, leave them. Traction damage is cumulative and often permanent.` }]
        : []),
      ...(data.chemicalProcessing && data.chemicalProcessing !== 'None'
        ? [{ item: `Overlapping chemical treatments on previously processed hair — this causes breakage at the demarcation line.` }]
        : []),
      { item: `Scratching your scalp with your nails — it damages the skin barrier and can introduce bacteria.` },
    ],
    notes: goals.includes('Protect my edges / grow my hairline back')
      ? 'Your goal of protecting your edges is important. Traction alopecia is the most common cause of hairline thinning in people with textured hair, and it\'s largely preventable. Keep tension low, avoid tight styles at the hairline, and monitor for early signs like bumps or tenderness.'
      : goals.includes('Understand my hair loss or thinning')
      ? 'Hair loss can have many causes — hormonal, nutritional, or related to styling practices. Track your symptoms consistently so you can identify patterns. If thinning is progressive or concentrated in specific areas, a trichologist or dermatologist can help with diagnosis.'
      : 'Consistency matters more than complexity. Follow this routine for 4–6 weeks before expecting visible changes. If symptoms worsen or new concerns arise, consider booking a consultation with a trichologist.',
  };
};

const SectionHeader = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
      <Icon size={16} className="text-primary" strokeWidth={1.8} />
    </div>
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
  </div>
);

const MyRoutine = () => {
  const navigate = useNavigate();
  const { onboardingData } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setRoutine(generateMockRoutine(onboardingData));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRegenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setRoutine(generateMockRoutine(onboardingData));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="page-container pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-foreground" strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-semibold text-foreground">My Routine</h1>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center animate-pulse">
            <Sparkles size={24} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Building your routine…</p>
            <p className="text-sm text-muted-foreground mt-1">Personalising based on your profile</p>
          </div>
        </motion.div>
      ) : routine ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary */}
          <div className="card-elevated p-4">
            <p className="text-sm text-foreground leading-relaxed">{routine.summary}</p>
          </div>

          {/* Wash Day */}
          <div>
            <SectionHeader icon={Droplets} title="Wash Day" color="bg-sage-light" />
            <div className="space-y-2">
              {routine.wash_day.map((step, i) => (
                <div key={i} className="card-elevated p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{step.step}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
                    </div>
                    {step.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                        <Clock size={12} /> {step.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mid-Cycle */}
          <div>
            <SectionHeader icon={Repeat} title="Between Washes" color="bg-accent" />
            <div className="space-y-2">
              {routine.mid_cycle.map((step, i) => (
                <div key={i} className="card-elevated p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{step.step}</p>
                      {step.frequency && (
                        <span className="text-xs text-primary font-medium">{step.frequency}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily */}
          <div>
            <SectionHeader icon={Sun} title="Daily Habits" color="bg-sage-light" />
            <div className="space-y-2">
              {routine.daily.map((step, i) => (
                <div key={i} className="card-elevated p-4">
                  <p className="text-sm font-medium text-foreground">{step.step}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <SectionHeader icon={Utensils} title="Nutrition" color="bg-accent" />
            <div className="card-elevated p-4 space-y-3">
              {routine.weekly_nutrition.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary text-xs mt-0.5">•</span>
                  <p className="text-xs text-foreground leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid */}
          <div>
            <SectionHeader icon={AlertTriangle} title="Avoid" color="bg-destructive/10" />
            <div className="card-elevated p-4 space-y-3">
              {routine.avoid.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-destructive text-xs mt-0.5">✕</span>
                  <p className="text-xs text-foreground leading-relaxed">{item.item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          {routine.notes && (
            <div>
              <SectionHeader icon={Stethoscope} title="Notes for You" color="bg-sage-light" />
              <div className="card-elevated p-4">
                <p className="text-xs text-foreground leading-relaxed">{routine.notes}</p>
              </div>
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-3"
          >
            <RefreshCw size={14} /> Regenerate routine
          </button>
        </motion.div>
      ) : null}
    </div>
  );
};

export default MyRoutine;
