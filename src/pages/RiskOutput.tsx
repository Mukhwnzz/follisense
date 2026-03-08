import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Stethoscope, ArrowLeft, Leaf, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { HealthProfileData, CheckInData } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const computeScalpRisk = (checkIn: CheckInData | null): RiskLevel => {
  if (!checkIn) return 'amber';
  const mildest = ['None', 'No', 'No change', 'Normal'];
  const severe = ['Severe', 'Yes, painful', 'Heavy flaking', "I'm concerned", 'Alarming amount'];
  const secondSevere = ['Moderate', 'Yes, noticeably', 'Some flaking', 'Noticeable thinning', 'Noticeable change', 'Significantly more', 'Looks a bit different', 'Looks a bit thinner'];
  const values = [checkIn.itch, checkIn.tenderness, checkIn.hairline, checkIn.flaking, checkIn.shedding].filter(Boolean) as string[];
  if (values.every(v => mildest.includes(v))) return 'green';
  if (values.some(v => severe.includes(v))) return 'red';
  const secondCount = values.filter(v => secondSevere.includes(v)).length;
  if (secondCount >= 3) return 'red';
  return 'amber';
};

const getHairConcernLevel = (checkIn: CheckInData | null): 'none' | 'mild' | 'moderate' | 'severe' => {
  if (!checkIn) return 'none';
  const hairMild = ['Soft and moisturised as usual', 'No breakage', 'Looks healthy, no changes', 'No, hair feels normal'];
  const hairModerate = ['A bit dry', 'A little — mostly at the ends', 'A bit dull or lacklustre', 'A little more breakage or dryness than usual'];
  const hairSevere = [
    'Very dry or brittle', 'Different texture than usual',
    'Moderate — breaking along the length', 'Significant — breaking at the root or in patches',
    'Noticeably thinner or less volume', 'Significant change in appearance or density',
    'Yes, noticeably more', "Yes, I'm concerned",
  ];
  const hairValues = [checkIn.hairFeel, checkIn.hairBreakage, checkIn.hairAppearance, checkIn.hairConcern].filter(Boolean) as string[];
  if (hairValues.length === 0) return 'none';
  if (hairValues.some(v => hairSevere.includes(v))) return 'severe';
  if (hairValues.some(v => hairModerate.includes(v))) return 'mild';
  if (hairValues.every(v => hairMild.includes(v))) return 'none';
  return 'mild';
};

const computeRisk = (checkIn: CheckInData | null): RiskLevel => {
  const scalpRisk = computeScalpRisk(checkIn);
  const hairLevel = getHairConcernLevel(checkIn);
  if (scalpRisk === 'green' && (hairLevel === 'moderate' || hairLevel === 'severe')) return 'amber';
  if (scalpRisk === 'amber' && (hairLevel === 'moderate' || hairLevel === 'severe')) return 'red';
  return scalpRisk;
};

const getHairGuidance = (checkIn: CheckInData | null): { heading: string; content: string }[] => {
  if (!checkIn) return [];
  const guidance: { heading: string; content: string }[] = [];
  const dryValues = ['A bit dry', 'Very dry or brittle'];
  const breakageValues = ['A little — mostly at the ends', 'Moderate — breaking along the length', 'Significant — breaking at the root or in patches'];
  const textureValues = ['Different texture than usual'];
  const midCycleDry = ['A little more breakage or dryness than usual', 'Yes, noticeably more', "Yes, I'm concerned"];
  const allHairValues = [checkIn.hairFeel, checkIn.hairBreakage, checkIn.hairAppearance, checkIn.hairConcern].filter(Boolean) as string[];
  if (allHairValues.some(v => dryValues.includes(v)) || allHairValues.some(v => midCycleDry.includes(v))) {
    guidance.push({ heading: 'Dryness', content: "Dry, brittle hair can signal that your scalp isn't getting enough moisture. Try a lightweight scalp hydrator and make sure you're deep conditioning at your next wash." });
  }
  if (allHairValues.some(v => breakageValues.includes(v))) {
    guidance.push({ heading: 'Breakage', content: "Breakage — especially along the length or at the root — can be caused by tension, dryness, or product buildup. If it's concentrated around your hairline, that's worth monitoring closely." });
  }
  if (allHairValues.some(v => textureValues.includes(v))) {
    guidance.push({ heading: 'Texture change', content: "Changes in how your hair feels can indicate protein/moisture imbalance, hormonal changes, or scalp health shifts. If it persists through your next cycle, it's worth investigating." });
  }
  return guidance;
};

const hasTelogenTriggers = (hp: HealthProfileData): string[] => {
  const triggers: string[] = [];
  if (hp.pregnancyStatus === 'Postpartum (within 12 months)') triggers.push('postpartum status');
  const validStressors = (hp.recentStressors || []).filter(s => s !== 'None of these' && s !== 'Prefer not to say');
  triggers.push(...validStressors);
  return triggers;
};

const getGoalMessage = (goals: string[], risk: RiskLevel): string | null => {
  if (goals.length === 0) return null;
  const goal = goals[0];
  if (risk === 'green') return `Your goal: ${goal}. Based on this check-in, you're on track.`;
  if (risk === 'amber') return `Your goal: ${goal}. We'll watch how this develops.`;
  return `Your goal: ${goal}. Seeking advice now is the best way to protect your progress.`;
};

const RiskOutput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCheckIn, riskOverride, setRiskOverride, healthProfile, onboardingData } = useApp();
  const isMale = onboardingData.gender === 'man';

  const paramRisk = searchParams.get('risk') as RiskLevel | null;
  const risk: RiskLevel = paramRisk || riskOverride || computeRisk(currentCheckIn);
  const telogenTriggers = hasTelogenTriggers(healthProfile);
  const hairGuidance = getHairGuidance(currentCheckIn);
  const goalMessage = getGoalMessage(onboardingData.goals, risk);

  const circleColors: Record<RiskLevel, string> = {
    green: 'bg-primary',
    amber: 'bg-warning',
    red: 'bg-destructive',
  };

  const handleLogoTap = () => {
    const order: RiskLevel[] = ['green', 'amber', 'red'];
    const current = order.indexOf(risk);
    setRiskOverride(order[(current + 1) % 3]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={handleLogoTap} className="flex items-center gap-1.5">
            <Leaf size={18} className="text-primary" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-foreground">ScalpSense</span>
          </button>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pt-6 pb-8">
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`w-28 h-28 rounded-full ${circleColors[risk]} flex items-center justify-center`}
            >
              {risk === 'green' && <Check size={40} className="text-primary-foreground" strokeWidth={2} />}
              {risk === 'amber' && <Eye size={40} className="text-warning-foreground" strokeWidth={1.8} />}
              {risk === 'red' && <Stethoscope size={40} className="text-destructive-foreground" strokeWidth={1.8} />}
            </motion.div>
          </div>

          {/* GREEN */}
          {risk === 'green' && (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">Your scalp looks healthy</h2>
              <p className="text-muted-foreground text-center mb-6">No concerning patterns this cycle</p>
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">Keep it up</h3>
                <p className="text-sm text-muted-foreground">Your current routine is working well. We'll check in again at your next mid-cycle or wash day.</p>
              </div>
              {goalMessage && (
                <div className="rounded-2xl bg-sage-light p-4 mb-4">
                  <p className="text-sm text-foreground">{goalMessage}</p>
                </div>
              )}
              <div className="rounded-2xl bg-sage-light p-5 mb-8">
                <p className="text-sm text-foreground">
                  <strong>Tip:</strong> A gentle scalp massage with your fingertips can help with circulation. You don't need to add product for this to work.
                </p>
              </div>
              <button onClick={() => navigate('/home')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
                Back to dashboard
              </button>
            </div>
          )}

          {/* AMBER */}
          {risk === 'amber' && (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">Some patterns worth watching</h2>
              <p className="text-muted-foreground text-center mb-6">Nothing urgent, but let's keep an eye on a few things</p>
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-3">Recommended next steps</h3>
                <ol className="space-y-3">
                  {[
                    'Gently cleanse your scalp mid-cycle with a sulphate-free rinse',
                    'Avoid re-tightening your edges — if they\'re loose, leave them',
                    'If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help. Avoid heavy oils or butters directly on the scalp as these can clog follicles and worsen buildup.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">{i + 1}</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {hairGuidance.length > 0 && (
                <div className="card-elevated p-5 mb-4">
                  <h3 className="font-semibold mb-3">About your hair</h3>
                  <div className="space-y-3">
                    {hairGuidance.map((g, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{g.heading}:</strong> {g.content}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {telogenTriggers.length > 0 && (
                <div className="rounded-2xl bg-accent p-5 mb-4">
                  <h3 className="font-semibold mb-2">Worth knowing</h3>
                  <p className="text-sm text-muted-foreground">
                    You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response — sometimes called telogen effluvium. It usually resolves within 6–12 months, but monitoring helps.
                  </p>
                </div>
              )}
              {goalMessage && (
                <div className="rounded-2xl bg-sage-light p-4 mb-4">
                  <p className="text-sm text-foreground">{goalMessage}</p>
                </div>
              )}
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">We'll reassess</h3>
                <p className="text-sm text-muted-foreground">At your next wash day, we'll compare. If things get worse, check in anytime.</p>
              </div>
              <div className="card-elevated p-4 mb-4 border border-border">
                <h3 className="font-medium text-foreground text-sm mb-1">Want to get ahead of this?</h3>
                <p className="text-xs text-muted-foreground mb-2">Even though this isn't urgent, speaking to a specialist is never a bad idea.</p>
                <button onClick={() => navigate('/find-specialist')} className="text-xs font-medium text-primary">Find a specialist →</button>
              </div>
              <button onClick={() => navigate('/wash-day')} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press mb-3">
                Start an early check-in
              </button>
              <button onClick={() => navigate('/home')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
                Back to dashboard
              </button>
            </div>
          )}

          {/* RED */}
          {risk === 'red' && (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">We recommend professional advice</h2>
              <p className="text-muted-foreground text-center mb-6">Your symptoms suggest a pattern that would benefit from expert review</p>
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">What this means</h3>
                <p className="text-sm text-muted-foreground">
                  Persistent or worsening symptoms can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.
                </p>
              </div>
              {telogenTriggers.length > 0 && (
                <div className="rounded-2xl bg-accent p-5 mb-4">
                  <h3 className="font-semibold mb-2">Worth knowing</h3>
                  <p className="text-sm text-muted-foreground">
                    You've mentioned {telogenTriggers.join(', ')}. Increased shedding can be a normal temporary response — sometimes called telogen effluvium. It usually resolves within 6–12 months, but monitoring helps.
                  </p>
                </div>
              )}
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">Your clinical summary is ready</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A structured summary you can share with a GP, trichologist, or dermatologist.
                </p>
                <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press">
                  View clinical summary
                </button>
              </div>
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">Who to see</h3>
                <p className="text-sm text-muted-foreground">
                  A trichologist specialises in hair and scalp. A dermatologist can investigate further. Your GP can refer you.
                  {isMale && ' Your barber may also notice changes. Ask them to flag anything they see.'}
                </p>
              </div>
              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">Find a specialist</h3>
                <p className="text-sm text-muted-foreground mb-3">We're building a directory of professionals who understand textured hair.</p>
                <button onClick={() => navigate('/find-specialist')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2">
                  <Search size={16} strokeWidth={1.8} /> Find someone near me
                </button>
              </div>
              {goalMessage && (
                <div className="rounded-2xl bg-sage-light p-4 mb-4">
                  <p className="text-sm text-foreground">{goalMessage}</p>
                </div>
              )}
              <button onClick={() => navigate('/home')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
                Back to dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RiskOutput;
