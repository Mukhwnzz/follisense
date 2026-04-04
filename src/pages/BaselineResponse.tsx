import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Stethoscope, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const NONE_VALUES = ['None', 'No concerns', 'No change', 'Healthy, no concerns'];

const computeBaselineRisk = (itch: string, tenderness: string, hairline: string, hairHealth: string): RiskLevel => {
  const mildest = ['None', 'No concerns'];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  const hairMildest = ['Healthy, no concerns'];
  const hairModerate = ['Noticeably dry, brittle, or breaking more than usual', "Concerned about my hair's condition"];
  const scalpValues = [itch, tenderness, hairline];
  const allScalpMild = scalpValues.every(v => mildest.includes(v));
  const allMild = allScalpMild && hairMildest.includes(hairHealth);
  if (allMild) return 'green';
  if (scalpValues.some(v => severe.includes(v))) return 'red';
  const moderateCount = scalpValues.filter(v => moderate.includes(v)).length;
  if (moderateCount >= 2) return 'red';
  if (allScalpMild && hairModerate.includes(hairHealth)) return 'amber';
  if (!allScalpMild && hairModerate.includes(hairHealth) && moderateCount >= 1) return 'red';
  return allScalpMild ? 'green' : 'amber';
};

const SEVERITY_MAP: Record<string, string> = {
  'Mild': 'mild', 'Moderate': 'moderate', 'Severe': 'severe',
  'Slight concern': 'mild', 'Noticeable change': 'moderate', 'Very concerned': 'severe',
  'Some dryness or breakage but nothing unusual': 'mild',
  'Noticeably dry, brittle, or breaking more than usual': 'moderate',
  "Concerned about my hair's condition": 'severe',
};

const buildFlaggedSymptoms = (itch: string, tenderness: string, hairline: string, hairHealth: string): { label: string; severity: string }[] => {
  const flagged: { label: string; severity: string }[] = [];
  if (itch && !NONE_VALUES.includes(itch)) flagged.push({ label: 'Itching', severity: SEVERITY_MAP[itch] || itch.toLowerCase() });
  if (tenderness && !NONE_VALUES.includes(tenderness)) flagged.push({ label: 'Tenderness', severity: SEVERITY_MAP[tenderness] || tenderness.toLowerCase() });
  if (hairline && !NONE_VALUES.includes(hairline)) flagged.push({ label: 'Hairline changes', severity: SEVERITY_MAP[hairline] || hairline.toLowerCase() });
  if (hairHealth && !['Healthy, no concerns'].includes(hairHealth)) flagged.push({ label: 'Hair health', severity: SEVERITY_MAP[hairHealth] || hairHealth.toLowerCase() });
  return flagged;
};

const getBaselineTips = (itch: string, tenderness: string, hairline: string, hairHealth: string, isMale: boolean, styleCategory: string): string[] => {
  const tips: string[] = [];
  if (isMale) {
    if (itch === 'Moderate' || itch === 'Mild' || itch === 'Severe') {
      if (styleCategory === 'locs') tips.push('Persistent itching under locs often comes from buildup or product residue. Try a diluted apple cider vinegar rinse or a lightweight scalp oil between washes.');
      else if (styleCategory === 'braids') tips.push('Itching under braids or cornrows is common but constant itching isn\'t normal. A scalp spray or witch hazel mist can help without disturbing the style.');
      else tips.push('Try pressing gently with a fingertip instead of scratching. If your scalp feels dry or tight after a cut, a lightweight scalp moisturiser can help.');
    }
    if (tenderness === 'Moderate' || tenderness === 'Mild' || tenderness === 'Severe') {
      if (styleCategory === 'locs') tips.push('If your scalp is sore after a retwist, talk to your loctician about lighter tension next time.');
      else if (styleCategory === 'braids') tips.push('If your style feels too tight, loosen or remove the tight sections. Don\'t wait for the soreness to pass on its own.');
      else tips.push('If your scalp is sore after a fresh cut or lineup, give it a day. If it persists, it could be irritation from clippers or product.');
    }
    if (hairline === 'Noticeable change' || hairline === 'Slight concern' || hairline === 'Very concerned') {
      tips.push('Give your hairline a break from tension, if you wear a durag or tight styles regularly, loosening up can help.');
    }
    if (hairHealth.includes('dry') || hairHealth.includes('brittle') || hairHealth.includes('breakage') || hairHealth.includes('Concerned')) {
      tips.push('Noticeable changes in your hair\'s texture or density are worth monitoring. A trichologist can check whether it\'s something treatable.');
    }
  } else {
    if (itch === 'Moderate' || itch === 'Mild' || itch === 'Severe') tips.push('Try pressing gently with a fingertip instead of scratching, it relieves itch without damaging the scalp. If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help.');
    if (tenderness === 'Moderate' || tenderness === 'Mild' || tenderness === 'Severe') tips.push('If your current style feels tight, don\'t re-tighten loose areas, let them be. It\'s okay to take it down early.');
    if (hairline === 'Noticeable change' || hairline === 'Slight concern' || hairline === 'Very concerned') tips.push('Give your hairline a break from tension, consider asking your stylist to keep installations looser around your edges.');
    if (hairHealth.includes('dry') || hairHealth.includes('brittle') || hairHealth.includes('breakage') || hairHealth.includes('Concerned')) tips.push('A deep conditioning treatment can help restore moisture and reduce breakage over time.');
  }
  if (tips.length === 0) tips.push('Consistency is key, regular check-ins will help you spot patterns early.');
  return tips;
};

const stagger = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.2, duration: 0.3 } });

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

const BaselineResponse = () => {
  const navigate = useNavigate();
  const { baselineRisk, onboardingData } = useApp();

  const stored = sessionStorage.getItem('follisense-baseline-answers');
  const baselineAnswers = stored ? JSON.parse(stored) : {};
  const bItch = baselineAnswers.itch || '';
  const bTenderness = baselineAnswers.tenderness || '';
  const bHairline = baselineAnswers.hairline || '';
  const bHairHealth = baselineAnswers.hairHealth || '';

  const risk = baselineRisk || computeBaselineRisk(bItch, bTenderness, bHairline, bHairHealth);
  const flaggedSymptoms = buildFlaggedSymptoms(bItch, bTenderness, bHairline, bHairHealth);

  const isMale = onboardingData?.gender === 'man';
  const styles = onboardingData?.protectiveStyles || [];
  const locStyles = ['Locs or faux locs'];
  const braidStyles = ['Box braids', 'Cornrows or flat twists', 'Twists (two-strand)'];
  const styleCategory = styles.some(s => locStyles.includes(s)) ? 'locs' : styles.some(s => braidStyles.includes(s)) ? 'braids' : 'short';

  const tips = getBaselineTips(bItch, bTenderness, bHairline, bHairHealth, isMale, styleCategory);

  // Short-hair male check for "what this means" copy
  const shortStyles = ['Low cut/fade', 'Waves', 'Bald/shaved', 'High top'];
  const longStylesList = ['Locs or faux locs', 'Twists (two-strand)', 'Cornrows or flat twists', 'Box braids'];
  const hasLongStyle = styles.some(s => longStylesList.includes(s));
  const maleIsShortHairOnly = isMale && !hasLongStyle;

  const whatThisMeansText = maleIsShortHairOnly
    ? 'Persistent or worsening symptoms can sometimes indicate conditions like male pattern hair loss or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.'
    : 'Persistent or worsening symptoms can sometimes indicate conditions like traction alopecia or scalp inflammation that respond best to early treatment. Seeing a professional now gives you the best options.';

  // Reasoning line
  const getReasoningLine = (): string | null => {
    if (risk === 'green') return null;
    const count = flaggedSymptoms.length;
    if (count === 0) return null;
    const hasSevere = flaggedSymptoms.some(f => f.severity === 'severe');
    if (hasSevere) return "You've reported a severe symptom. We take that seriously and recommend professional input.";
    if (count >= 3) return `You've flagged ${count} areas of concern. While each one on its own may feel mild, experiencing several at once can sometimes point to something worth checking with a professional.`;
    if (count === 2) return `You've flagged ${count} areas of concern. We're keeping a close eye on both.`;
    return `We've noticed a pattern with your ${flaggedSymptoms[0].label.toLowerCase()} that's worth watching.`;
  };

  // Priority line
  const getPriorityLine = (): string | null => {
    const goals = onboardingData?.goals || [];
    if (goals.length === 0) return null;
    const flaggedLower = flaggedSymptoms.map(f => f.label.toLowerCase());
    const matchedGoal = goals.find(g => {
      const gl = g.toLowerCase();
      return flaggedLower.some(f =>
        f.includes(gl) || gl.includes(f) ||
        (gl.includes('thin') && f.includes('thin')) ||
        (gl.includes('itch') && f.includes('itch')) ||
        (gl.includes('break') && f.includes('break')) ||
        (gl.includes('edge') && f.includes('hairline')) ||
        (gl.includes('dry') && f.includes('dry'))
      );
    });
    if (risk === 'green') {
      return `You're staying on top of ${goals[0].toLowerCase()}. That's exactly the right approach.`;
    }
    if (matchedGoal) {
      return `You told us ${matchedGoal.toLowerCase()} matters most to you. Based on what you've shared, here's what we're seeing.`;
    }
    return null;
  };

  const messages: Record<RiskLevel, string> = {
    green: 'Your scalp and hair seem to be in a healthy place right now. We\'ll use this as your baseline and track how things change over time.',
    amber: 'We\'ve noted a few things as your starting point. As you check in over the coming weeks, we\'ll track whether these improve, stay the same, or need attention.',
    red: 'Your symptoms suggest a pattern that would benefit from expert review.',
  };

  const reasoningLine = getReasoningLine();
  const priorityLine = getPriorityLine();

  const handleContinue = () => {
    navigate('/onboarding?step=6');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6 pt-12 pb-8">
        {/* Banner icon */}
        <motion.div {...stagger(0)}>
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bannerColors[risk] }}
            >
              {risk === 'green' && <Check size={32} color="#fff" strokeWidth={2} />}
              {risk === 'amber' && <Eye size={32} color="#fff" strokeWidth={1.8} />}
              {risk === 'red' && <Stethoscope size={32} color="#fff" strokeWidth={1.8} />}
            </motion.div>
          </div>
        </motion.div>

        {/* Label */}
        <motion.h2 {...stagger(1)} className="text-xl font-semibold text-foreground text-center mb-3">
          {labels[risk]}
        </motion.h2>

        {/* Main message */}
        <motion.p {...stagger(1.5)} className="text-muted-foreground text-center mb-6 leading-relaxed">
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

        {/* Flagged symptoms */}
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

        {/* Self-care tips (AMBER and RED) */}
        {risk !== 'green' && tips.length > 0 && (
          <motion.div {...stagger(3)} className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-3">Recommended next steps</h3>
            <ol className="space-y-3">
              {tips.map((tip, i) => (
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
          <motion.div {...stagger(3.5)} className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-2">What this means</h3>
            <p className="text-sm text-muted-foreground">{whatThisMeansText}</p>
          </motion.div>
        )}

        {/* Find a specialist (AMBER and RED) */}
        {risk !== 'green' && (
          <motion.div {...stagger(4)}>
            <button onClick={() => navigate('/find-specialist')} className="w-full card-elevated p-4 mb-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Search size={18} className="text-primary" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Find a specialist near you</p>
                <p className="text-xs text-muted-foreground">Search our directory</p>
              </div>
            </button>
          </motion.div>
        )}

        {/* Clinician summary (RED only) */}
        {risk === 'red' && (
          <motion.div {...stagger(4.5)}>
            <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-border font-semibold text-sm btn-press mb-4 flex items-center justify-center gap-2">
              <Stethoscope size={16} strokeWidth={1.8} /> View your baseline summary
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

        {/* Continue */}
        <motion.div {...stagger(5)}>
          <button onClick={handleContinue} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">
            {risk === 'green' ? 'Continue' : 'Continue setup'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BaselineResponse;
