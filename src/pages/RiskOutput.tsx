import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Stethoscope, ArrowLeft, Leaf, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { computeHistoricalRisk, getTriageGuidance } from '@/utils/triageLogic';
import type { HealthProfileData, CheckInData } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const SYMPTOM_LABEL_MAP: Record<string, string> = {
  itch: 'Itching',
  tenderness: 'Tenderness',
  hairline: 'Hairline changes',
  flaking: 'Flaking',
  shedding: 'Shedding',
  bumps: 'Bumps or irritation',
  dryness: 'Dryness',
  razorBumps: 'Razor bumps or ingrowns',
  barberIrritation: 'Irritation after barber visits',
  hairBreakage: 'Breakage',
  hairFeel: 'Hair feel',
  hairAppearance: 'Hair appearance',
  hairConcern: 'Hair concern',
};

const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns'];

const SEVERITY_LABEL_MAP: Record<string, string> = {
  'Mild': 'mild',
  'A little': 'mild',
  'Some flaking': 'mild',
  'Slight concern': 'mild',
  'A bit dry': 'mild',
  'Moderate': 'moderate',
  'Yes, noticeably': 'moderate',
  'Noticeable change': 'moderate',
  'More than usual': 'moderate',
  'Looks a bit thinner': 'moderate',
  'Severe': 'severe',
  'Yes, painful': 'severe',
  'Very concerned': 'severe',
  'Alarming amount': 'severe',
  'Heavy flaking': 'severe',
  'Significant': 'severe',
};

const getSeverityLabel = (value: string): string => {
  return SEVERITY_LABEL_MAP[value] || value.toLowerCase();
};

const getFlaggedSymptoms = (checkIn: CheckInData | null): { label: string; severity: string }[] => {
  if (!checkIn) return [];
  const flagged: { label: string; severity: string }[] = [];
  const keys: (keyof CheckInData)[] = ['itch', 'tenderness', 'hairline', 'flaking', 'shedding', 'bumps', 'dryness', 'razorBumps', 'barberIrritation'];
  for (const key of keys) {
    const val = checkIn[key] as string | undefined;
    if (val && !NONE_VALUES.includes(val)) {
      flagged.push({
        label: SYMPTOM_LABEL_MAP[key] || key,
        severity: getSeverityLabel(val),
      });
    }
  }
  return flagged;
};

const hasTelogenTriggers = (hp: HealthProfileData): string[] => {
  const triggers: string[] = [];
  if (hp.pregnancyStatus === 'Postpartum (within 12 months)') triggers.push('postpartum status');
  const validStressors = (hp.recentStressors || []).filter(s => s !== 'None of these' && s !== 'Prefer not to say');
  triggers.push(...validStressors);
  return triggers;
};

const getReasoningLine = (flagged: { label: string; severity: string }[], risk: RiskLevel): string | null => {
  if (risk === 'green') return null;
  const count = flagged.length;
  if (count === 0) return null;
  const hasSevere = flagged.some(f => f.severity === 'severe');
  if (hasSevere) return "You've reported a severe symptom. We take that seriously and recommend professional input.";
  if (count >= 3) return `You've flagged ${count} areas of concern. While each one on its own may feel mild, experiencing several at once can sometimes point to something worth checking with a professional.`;
  if (count === 2) return `You've flagged ${count} areas of concern. We're keeping a close eye on both.`;
  return `We've noticed a pattern with your ${flagged[0].label.toLowerCase()} that's worth watching.`;
};

const getPriorityLine = (goals: string[], flagged: { label: string; severity: string }[], risk: RiskLevel): string | null => {
  if (goals.length === 0) return null;
  const goalLower = goals.map(g => g.toLowerCase());
  const flaggedLower = flagged.map(f => f.label.toLowerCase());

  // Check if any priority matches a flagged symptom
  const matchedGoal = goals.find(g => {
    const gl = g.toLowerCase();
    return flaggedLower.some(f =>
      f.includes(gl) || gl.includes(f) ||
      (gl.includes('thin') && f.includes('thin')) ||
      (gl.includes('itch') && f.includes('itch')) ||
      (gl.includes('flak') && f.includes('flak')) ||
      (gl.includes('break') && f.includes('break')) ||
      (gl.includes('edge') && f.includes('hairline')) ||
      (gl.includes('dry') && f.includes('dry')) ||
      (gl.includes('shed') && f.includes('shed'))
    );
  });

  if (risk === 'green') {
    const primary = goals[0];
    return `You're staying on top of ${primary.toLowerCase()}. That's exactly the right approach.`;
  }

  if (matchedGoal) {
    return `You told us ${matchedGoal.toLowerCase()} matters most to you. Based on what you've shared, here's what we're seeing.`;
  }

  return null;
};

const stagger = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.2, duration: 0.3 } });

const RiskOutput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCheckIn, riskOverride, setRiskOverride, healthProfile, onboardingData, checkInHistory } = useApp();
  const isMale = onboardingData.gender === 'man';

  const paramRisk = searchParams.get('risk') as RiskLevel | null;
  const historicalRisk = currentCheckIn ? computeHistoricalRisk(currentCheckIn, checkInHistory) : 'amber';
  const risk: RiskLevel = paramRisk || riskOverride || historicalRisk;

  const telogenTriggers = hasTelogenTriggers(healthProfile);
  const triageGuidance = currentCheckIn ? getTriageGuidance(risk, currentCheckIn, checkInHistory) : [];
  const flaggedSymptoms = getFlaggedSymptoms(currentCheckIn);
  const reasoningLine = getReasoningLine(flaggedSymptoms, risk);
  const priorityLine = getPriorityLine(onboardingData.goals, flaggedSymptoms, risk);

  // Determine short-hair male for "what this means" copy
  const shortStyles = ['Low cut/fade', 'Waves', 'Bald/shaved', 'High top'];
  const longStyles = ['Locs or faux locs', 'Twists (two-strand)', 'Cornrows or flat twists', 'Box braids'];
  const styles = onboardingData.protectiveStyles || [];
  const hasLongStyle = styles.some(s => longStyles.includes(s));
  const maleIsShortHairOnly = isMale && !hasLongStyle;

  const bannerColors: Record<RiskLevel, string> = {
    green: '#7C9A8E',
    amber: '#C4967A',
    red: '#B85C5C',
  };

  const labels: Record<RiskLevel, string> = {
    green: 'Looking good',
    amber: 'Worth watching',
    red: 'Professional review recommended',
  };

  const messages: Record<RiskLevel, string> = {
    green: 'Based on what you\'ve shared, there are no red flags right now. Your scalp is looking good.',
    amber: 'Nothing urgent, but let\'s keep an eye on a few things.',
    red: 'Your symptoms suggest a pattern that would benefit from expert review.',
  };

  const handleLogoTap = () => {
    const order: RiskLevel[] = ['green', 'amber', 'red'];
    const current = order.indexOf(risk);
    setRiskOverride(order[(current + 1) % 3]);
  };

  const whatThisMeansText = maleIsShortHairOnly
    ? 'Persistent or worsening symptoms can sometimes indicate conditions like male pattern hair loss or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.'
    : 'Persistent or worsening symptoms can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={handleLogoTap} className="flex items-center gap-1.5">
            <Leaf size={18} className="text-primary" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-foreground">FolliSense</span>
          </button>
          <div className="w-10" />
        </div>

        <div className="pt-6 pb-8">
          {/* Colour banner + icon */}
          <motion.div {...stagger(0)}>
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bannerColors[risk] }}
              >
                {risk === 'green' && <Check size={40} color="#fff" strokeWidth={2} />}
                {risk === 'amber' && <Eye size={40} color="#fff" strokeWidth={1.8} />}
                {risk === 'red' && <Stethoscope size={40} color="#fff" strokeWidth={1.8} />}
              </motion.div>
            </div>
          </motion.div>

          {/* Label */}
          <motion.h2 {...stagger(1)} className="text-2xl font-semibold text-center mb-2">
            {labels[risk]}
          </motion.h2>

          {/* Main message */}
          <motion.p {...stagger(1.5)} className="text-muted-foreground text-center mb-6">
            {messages[risk]}
          </motion.p>

          {/* Reasoning line */}
          {reasoningLine && (
            <motion.div {...stagger(2)} className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#F5F0EB' }}>
              <p className="text-sm" style={{ color: '#7A7570' }}>{reasoningLine}</p>
            </motion.div>
          )}

          {/* Priority line */}
          {priorityLine && (
            <motion.div {...stagger(2.2)} className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'rgba(124,154,142,0.08)' }}>
              <p className="text-sm text-foreground">{priorityLine}</p>
            </motion.div>
          )}

          {/* Flagged symptoms list */}
          <motion.div {...stagger(2.5)} className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-3">Here's what you reported</h3>
            {flaggedSymptoms.length > 0 ? (
              <div className="space-y-2">
                {flaggedSymptoms.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-foreground">{s.label}</span>
                    <span className="text-muted-foreground capitalize">{s.severity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No symptoms flagged.</p>
            )}
          </motion.div>

          {/* Triage guidance (AMBER and RED) */}
          {risk !== 'green' && triageGuidance.length > 0 && (
            <motion.div {...stagger(3)} className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-3">What we're seeing</h3>
              <div className="space-y-3">
                {triageGuidance.map((g, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{g.heading}:</strong> {g.message}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Self-care steps (AMBER and RED) */}
          {risk !== 'green' && (
            <motion.div {...stagger(3.5)} className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-3">Recommended next steps</h3>
              <ol className="space-y-3">
                {(risk === 'amber' ? [
                  'Gently cleanse your scalp mid-cycle with a sulphate-free rinse',
                  "Avoid re-tightening your edges. If they're loose, leave them",
                  'If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help. Avoid heavy oils or butters directly on the scalp as these can clog follicles and worsen buildup.',
                ] : [
                  'Book a consultation with a trichologist or dermatologist',
                  'In the meantime, avoid tight styles and give your scalp a break',
                  'Use gentle, fragrance-free products and avoid anything that stings or burns',
                ]).map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">{i + 1}</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* What this means (AMBER and RED) */}
          {risk !== 'green' && (
            <motion.div {...stagger(4)} className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-2">What this means</h3>
              <p className="text-sm text-muted-foreground">{whatThisMeansText}</p>
            </motion.div>
          )}

          {/* Telogen triggers */}
          {telogenTriggers.length > 0 && (
            <motion.div {...stagger(4.5)} className="rounded-2xl bg-accent p-5 mb-4">
              <h3 className="font-semibold mb-2">Worth knowing</h3>
              <p className="text-sm text-muted-foreground">
                You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response, sometimes called telogen effluvium. It usually resolves within 6-12 months, but monitoring helps.
              </p>
            </motion.div>
          )}

          {/* Generate clinician summary (RED only) */}
          {risk === 'red' && (
            <motion.div {...stagger(5)} className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-2">Your clinical summary is ready</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A structured summary you can share with a GP, trichologist, or dermatologist. This was generated automatically based on your symptom patterns.
              </p>
              <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press">
                View clinical summary
              </button>
            </motion.div>
          )}

          {/* Find a specialist (AMBER and RED) */}
          {risk !== 'green' && (
            <motion.div {...stagger(5.5)} className="card-elevated p-5 mb-4">
              <h3 className="font-semibold mb-2">Find a specialist</h3>
              <p className="text-sm text-muted-foreground mb-3">We're building a directory of professionals who understand textured hair.</p>
              <button onClick={() => navigate('/find-specialist')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2">
                <Search size={16} strokeWidth={1.8} /> Find someone near me
              </button>
            </motion.div>
          )}

          {/* GREEN tip */}
          {risk === 'green' && (
            <motion.div {...stagger(3)} className="rounded-2xl p-5 mb-4" style={{ backgroundColor: 'rgba(124,154,142,0.08)' }}>
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> A gentle scalp massage with your fingertips can help with circulation. You don't need to add product for this to work.
              </p>
            </motion.div>
          )}

          {/* Continue to dashboard */}
          <motion.div {...stagger(6)}>
            <button onClick={() => navigate('/home')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
              Continue to dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RiskOutput;
