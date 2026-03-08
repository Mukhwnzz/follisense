import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Stethoscope, ArrowLeft, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const computeRisk = (checkIn: { itch?: string; tenderness?: string; hairline?: string; flaking?: string; shedding?: string } | null): RiskLevel => {
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

const RiskOutput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCheckIn, riskOverride, setRiskOverride } = useApp();

  const paramRisk = searchParams.get('risk') as RiskLevel | null;
  const risk: RiskLevel = paramRisk || riskOverride || computeRisk(currentCheckIn);

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
        {/* Top */}
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
          {/* Circle */}
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
                <p className="text-sm text-muted-foreground">
                  Your current routine is working well. We'll check in again at your next mid-cycle or wash day.
                </p>
              </div>

              <div className="rounded-2xl bg-sage-light p-5 mb-8">
                <p className="text-sm text-foreground">
                  <strong>Tip:</strong> A lightweight scalp oil between wash days can help maintain moisture balance and reduce itching.
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
                    'Apply a lightweight, non-comedogenic scalp oil to soothe irritation',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">{i + 1}</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card-elevated p-5 mb-8">
                <h3 className="font-semibold mb-2">We'll reassess</h3>
                <p className="text-sm text-muted-foreground">
                  At your next wash day check-in, we'll compare to see if things have improved. If symptoms get worse before then, you can do an early check-in anytime.
                </p>
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
                  Persistent or worsening symptoms across cycles can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.
                </p>
              </div>

              <div className="card-elevated p-5 mb-4">
                <h3 className="font-semibold mb-2">Your clinical summary is ready</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've prepared a structured summary of your symptoms that you can share with a GP, trichologist, or dermatologist.
                </p>
                <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold btn-press">
                  View clinical summary
                </button>
              </div>

              <div className="card-elevated p-5 mb-8">
                <h3 className="font-semibold mb-2">Who to see</h3>
                <p className="text-sm text-muted-foreground">
                  A trichologist specialises in hair and scalp conditions. A dermatologist can investigate further. Your GP can refer you.
                </p>
              </div>

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
