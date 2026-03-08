import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Stethoscope, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const computeBaselineRisk = (itch: string, tenderness: string, hairline: string, hairHealth: string): 'green' | 'amber' | 'red' => {
  const mildest = ['None', 'No concerns'];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  const hairMildest = ['Healthy — no concerns'];
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

const buildBaselineFlaggedSymptoms = (itch: string, tenderness: string, hairline: string, hairHealth: string): string[] => {
  const flagged: string[] = [];
  const severe = ['Severe', 'Very concerned'];
  const moderate = ['Moderate', 'Noticeable change'];
  if (severe.includes(itch)) flagged.push('severe itching');
  else if (moderate.includes(itch)) flagged.push('moderate itching');
  else if (itch === 'Mild') flagged.push('mild itching');
  if (severe.includes(tenderness)) flagged.push('severe tenderness');
  else if (moderate.includes(tenderness)) flagged.push('some tenderness');
  else if (tenderness === 'Mild') flagged.push('mild tenderness');
  if (severe.includes(hairline)) flagged.push('concern about your hairline');
  else if (moderate.includes(hairline)) flagged.push('noticeable hairline changes');
  else if (hairline === 'Slight concern') flagged.push('slight hairline concern');
  if (hairHealth === "Concerned about my hair's condition") flagged.push("concern about your hair's condition");
  else if (hairHealth === 'Noticeably dry, brittle, or breaking more than usual') flagged.push('noticeable dryness and breakage');
  else if (hairHealth === 'Some dryness or breakage but nothing unusual') flagged.push('some dryness');
  return flagged;
};

const getBaselineTips = (itch: string, tenderness: string, hairline: string, hairHealth: string): string[] => {
  const tips: string[] = [];
  if (itch === 'Moderate' || itch === 'Mild' || itch === 'Severe') tips.push('Try pressing gently with a fingertip instead of scratching — it relieves itch without damaging the scalp. If your scalp feels dry or tight, a fragrance-free scalp moisturiser or hydrating mist may help.');
  if (tenderness === 'Moderate' || tenderness === 'Mild' || tenderness === 'Severe') tips.push('If your current style feels tight, don\'t re-tighten loose areas — let them be. It\'s okay to take it down early.');
  if (hairline === 'Noticeable change' || hairline === 'Slight concern' || hairline === 'Very concerned') tips.push('Give your hairline a break from tension — consider asking your stylist to keep installations looser around your edges.');
  if (hairHealth.includes('dry') || hairHealth.includes('brittle') || hairHealth.includes('breakage') || hairHealth.includes('Concerned')) tips.push('A deep conditioning treatment can help restore moisture and reduce breakage over time.');
  if (tips.length === 0) tips.push('Consistency is key — regular check-ins will help you spot patterns early.');
  return tips;
};

const BaselineResponse = () => {
  const navigate = useNavigate();
  const { baselineRisk } = useApp();

  // Read baseline answers from sessionStorage
  const stored = sessionStorage.getItem('follisense-baseline-answers');
  const baselineAnswers = stored ? JSON.parse(stored) : {};
  const bItch = baselineAnswers.itch || '';
  const bTenderness = baselineAnswers.tenderness || '';
  const bHairline = baselineAnswers.hairline || '';
  const bHairHealth = baselineAnswers.hairHealth || '';

  const risk = baselineRisk || computeBaselineRisk(bItch, bTenderness, bHairline, bHairHealth);
  const symptoms = buildBaselineFlaggedSymptoms(bItch, bTenderness, bHairline, bHairHealth);
  const tips = getBaselineTips(bItch, bTenderness, bHairline, bHairHealth);

  const buildAmberBody = (s: string[]): string => {
    if (s.length === 0) return "We've noted a few things as your starting point.";
    const joined = s.length === 1 ? s[0] : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1];
    return `You mentioned ${joined}. We've noted that as your starting point. As you check in over the coming weeks, we'll track whether these improve, stay the same, or need attention.`;
  };

  const severe = ['Severe', 'Very concerned', "Concerned about my hair's condition"];
  const isSevereItch = severe.includes(bItch);
  const isSevereTenderness = severe.includes(bTenderness);
  const isSevereHairline = severe.includes(bHairline);
  const isSevereHairHealth = severe.includes(bHairHealth) || bHairHealth === "Concerned about my hair's condition";
  const severeCount = [isSevereItch, isSevereTenderness, isSevereHairline, isSevereHairHealth].filter(Boolean).length;

  const handleContinue = () => {
    navigate('/onboarding?step=6');
  };

  if (risk === 'green') return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-center mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
              <Check size={32} className="text-primary" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center mb-3">Everything looks good</h2>
          <p className="text-muted-foreground text-center mb-8 leading-relaxed">Your scalp and hair seem to be in a healthy place right now. We'll use this as your baseline and track how things change over time.</p>
          <button onClick={handleContinue} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">Continue</button>
        </motion.div>
      </div>
    </div>
  );

  if (risk === 'amber') return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-center mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-warning/15 flex items-center justify-center">
              <Eye size={32} className="text-warning" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center mb-3">Thanks for sharing that</h2>
          <p className="text-muted-foreground text-center mb-6 leading-relaxed">{buildAmberBody(symptoms)}</p>
          <div className="card-elevated p-5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={16} className="text-warning" strokeWidth={1.8} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tips[0]}</p>
            </div>
          </div>
          <button onClick={handleContinue} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">Continue</button>
        </motion.div>
      </div>
    </div>
  );

  // Red
  let redHeading = "Let's get you the right help";
  let redBody = "You've flagged several things that are bothering you, and we take all of them seriously. Rather than trying to figure this out alone, we'd really recommend speaking to a trichologist or dermatologist who can look at the full picture. In the meantime, FolliSense will track everything so you have a clear history to bring to your appointment.";

  if (severeCount <= 1) {
    if (isSevereItch || isSevereTenderness) {
      redHeading = "That sounds really uncomfortable";
      redBody = "Constant itching and pain aren't something you should just push through. Your scalp is trying to tell you something, and the fact that you're here means you're already taking the right step. Let's get you some support.";
    } else if (isSevereHairline) {
      redHeading = "We're glad you're paying attention to this";
      redBody = "Hairline changes can feel scary, but noticing them is the first and most important step. The earlier you get a professional opinion, the more options you'll have. Many hairline concerns are reversible when caught early.";
    } else if (isSevereHairHealth) {
      redHeading = "Your hair is telling you something";
      redBody = "When your hair changes significantly in texture, density, or strength, it's often a signal that something is going on underneath — whether that's your scalp, your nutrition, your hormones, or your styling routine. A specialist can help pinpoint the cause.";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-center mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center">
              <Stethoscope size={32} className="text-destructive" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center mb-3">{redHeading}</h2>
          <p className="text-muted-foreground text-center mb-6 leading-relaxed">{redBody}</p>
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-3">Who can help</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed"><strong className="text-foreground">Trichologist</strong> — specialises in hair and scalp conditions. Best first step for hair-specific concerns.</p>
              <p className="text-sm text-muted-foreground leading-relaxed"><strong className="text-foreground">Dermatologist</strong> — can investigate skin and scalp conditions in depth and prescribe treatment.</p>
              <p className="text-sm text-muted-foreground leading-relaxed"><strong className="text-foreground">GP</strong> — can run blood tests, check for underlying causes, and refer you onwards.</p>
            </div>
          </div>
          <div className="card-elevated p-5 mb-4">
            <h3 className="font-semibold mb-3">In the meantime</h3>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">• {tip}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-accent p-4 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">Setting up FolliSense now means you'll be building a symptom timeline that's really useful to bring to any consultation.</p>
          </div>
          <button onClick={() => navigate('/clinician-summary')} className="w-full h-12 rounded-xl border-2 border-border font-semibold text-sm btn-press mb-4 flex items-center justify-center gap-2">
            <Stethoscope size={16} strokeWidth={1.8} /> View your baseline summary
          </button>
          <button onClick={handleContinue} className="w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors bg-primary text-primary-foreground">Continue setup</button>
        </motion.div>
      </div>
    </div>
  );
};

export default BaselineResponse;
