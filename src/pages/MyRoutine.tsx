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
  const isProtectiveStyle = data.protectiveStyleFrequency === 'Most of the time' || data.protectiveStyleFrequency === 'About half the time';
  const isMale = data.gender === 'man';
  const styles = data.protectiveStyles?.length > 0 ? data.protectiveStyles : ['braids'];

  return {
    summary: isProtectiveStyle
      ? `A ${data.cycleLength || '4-week'} cycle routine built around your ${styles[0] || 'protective style'}`
      : `A weekly scalp and hair care routine for your ${styles[0] || 'hair'}`,
    wash_day: [
      {
        step: 'Scalp cleanse',
        detail: isProtectiveStyle
          ? `Part your ${styles[0] || 'style'} gently and apply diluted sulphate-free shampoo directly to the scalp. Massage with fingertips, not nails.`
          : 'Use a gentle, sulphate-free shampoo. Focus on the scalp, not the lengths. Massage for 2–3 minutes to loosen buildup.',
        duration: '5 mins',
      },
      {
        step: 'Condition',
        detail: 'Apply conditioner to your lengths and ends only. Leave for 3–5 minutes. Detangle gently with a wide-tooth comb starting from the ends.',
        duration: '5 mins',
      },
      {
        step: 'Scalp check',
        detail: 'While your hair is parted for washing, look at your hairline, temples, and crown. Note any redness, bumps, flaking, or thinning. This is your best visibility moment.',
        duration: '2 mins',
      },
      {
        step: 'Complete your FolliSense check-in',
        detail: 'Log your wash day assessment while everything is fresh. Take comparison photos if you can.',
        duration: '3 mins',
      },
    ],
    mid_cycle: isProtectiveStyle ? [
      {
        step: 'Scalp refresh',
        detail: 'Use a lightweight scalp spray or diluted witch hazel to manage buildup between washes.',
        frequency: 'Every 5–7 days',
      },
      {
        step: 'Tension check',
        detail: `Feel around your hairline and where your ${styles[0] || 'style'} grips. If anything feels sore or tight, loosen or remove those sections.`,
        frequency: 'Every few days',
      },
      {
        step: 'Mid-cycle check-in',
        detail: 'Complete your FolliSense mid-cycle questions. Takes 1 minute.',
        frequency: 'Once mid-cycle',
      },
    ] : [
      {
        step: 'Scalp massage',
        detail: 'Gentle fingertip massage for 3–4 minutes to support circulation. No product needed.',
        frequency: '2–3 times per week',
      },
      {
        step: 'Moisture check',
        detail: "Feel your ends. If they're dry or rough, apply a small amount of leave-in conditioner or a light cream.",
        frequency: 'As needed',
      },
    ],
    daily: [
      {
        step: isMale ? 'Satin or silk pillowcase' : 'Satin protection',
        detail: isMale
          ? 'Sleep on a satin pillowcase to reduce friction on your hairline.'
          : 'Sleep with a satin bonnet or on a satin pillowcase to reduce friction on your edges and preserve your style.',
      },
      {
        step: 'Hydrate',
        detail: 'Aim for at least 2 litres of water. Your scalp is skin and it benefits from hydration like the rest of your body.',
      },
      {
        step: 'Hands off',
        detail: "Resist the urge to scratch, pick, or constantly touch your scalp. If it itches, press gently with a fingertip instead.",
      },
    ],
    weekly_nutrition: [
      {
        tip: data.medicalConditions?.includes('Iron deficiency / anaemia')
          ? 'Your iron levels need attention. Include red meat, spinach, or lentils daily. Pair with vitamin C for better absorption. Consider a supplement if your levels are clinically low.'
          : 'Include iron-rich foods regularly: red meat, spinach, lentils, fortified cereals. Iron carries oxygen to your hair follicles.',
      },
      {
        tip: 'Make sure you\'re getting enough protein at every meal. Your hair is made of keratin, which is a protein. Low protein intake directly affects hair growth.',
      },
      {
        tip: data.medicalConditions?.includes('Vitamin D deficiency')
          ? 'You mentioned low vitamin D. Consider supplementing 1000–2000 IU daily, especially if you have darker skin or limited sun exposure.'
          : 'Vitamin D supports hair follicle health. Sources: sunlight, oily fish, fortified foods. People with darker skin synthesise less from sunlight and may benefit from supplementation.',
      },
    ],
    avoid: [
      {
        item: isProtectiveStyle
          ? `Avoid re-tightening your ${styles[0] || 'style'} if it loosens around the hairline. Loose edges are safer than tight ones.`
          : 'Avoid daily heat styling. Every heat pass weakens the protein bonds in your hair. If you use heat, always use a protectant and keep the temperature under 190°C.',
      },
      {
        item: 'Oils work well for the hair shaft, but your scalp might benefit from something lighter between washes, especially under protective styles.',
      },
      {
        item: data.chemicalProcessing !== 'No, fully natural'
          ? 'With chemically processed hair, avoid overlapping chemical treatments on previously processed sections. Focus new applications on new growth only.'
          : 'Avoid tight styles in the same position repeatedly. Alternate where tension falls to give follicles recovery time.',
      },
    ],
    notes: data.teTriggers?.length > 0 && !data.teTriggers?.includes('None of these')
      ? `You mentioned some recent life changes (${data.teTriggers.join(', ')}). Increased shedding in the next few months could be related to this and is often temporary. Monitor it through your check-ins and see a specialist if it persists beyond 6 months.`
      : data.baselineHairline === 'Very concerned' || data.baselineHairline === 'Noticeable change'
        ? 'You flagged hairline concerns at your baseline. This is something to actively monitor. If you don\'t see improvement after reducing tension for 2–3 cycles, book a consultation with a trichologist.'
        : '',
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
