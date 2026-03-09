import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const ClinicianSummary = () => {
  const navigate = useNavigate();
  const { onboardingData, currentCheckIn, healthProfile, baselineRisk, baselineDate } = useApp();

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const hairTypeLabel: Record<string, string> = {
    '3b': '3b — Loose, springy curls', '3c': '3c — Tight, corkscrew curls',
    '4a': '4a — Dense, S-shaped coils', '4b': '4b — Z-shaped, tightly coiled',
    '4c': '4c — Very tight, densely packed coils', 'unsure': 'Mixed / Unsure',
  };

  const chemLabel = () => {
    const cp = onboardingData.chemicalProcessing;
    if (!cp || cp === 'No, fully natural' || cp === 'Never') return null;
    let label = cp;
    if (cp === 'Multiple') label = onboardingData.chemicalProcessingMultiple?.join(', ') || 'Multiple (unspecified)';
    if (onboardingData.lastChemicalTreatment) label += ` — last treated: ${onboardingData.lastChemicalTreatment}`;
    return label;
  };

  // Build profile fields dynamically
  const fields: { label: string; value: string }[] = [];
  if (onboardingData.hairType) fields.push({ label: 'Hair type', value: hairTypeLabel[onboardingData.hairType] || onboardingData.hairType });
  const chem = chemLabel();
  if (chem) fields.push({ label: 'Chemical processing', value: chem });
  if (onboardingData.protectiveStyles.length > 0) fields.push({ label: 'Current style(s)', value: onboardingData.protectiveStyles.join(', ') });
  if (onboardingData.cycleLength) fields.push({ label: 'Typical cycle length', value: onboardingData.cycleLength });
  if (onboardingData.washFrequency) fields.push({ label: 'Wash frequency', value: onboardingData.washFrequency });
  if (onboardingData.wornOutWashFrequency) fields.push({ label: 'Wash frequency', value: onboardingData.wornOutWashFrequency });

  // Menstrual data — hidden for male users
  const isMale = onboardingData.gender === 'man';
  const menstrualFields: { label: string; value: string }[] = [];
  if (!isMale && onboardingData.menstrualTracking === "Yes, I'd like to track") {
    const getCycleDay = (): number | null => {
      if (!onboardingData.lastPeriodDate) return null;
      const lastPeriod = new Date(onboardingData.lastPeriodDate);
      const diffDays = Math.floor((Date.now() - lastPeriod.getTime()) / 86400000);
      return diffDays > 0 ? diffDays : null;
    };
    const getCycleLengthNum = (): number => {
      const mapping: Record<string, number> = { '21–25 days': 23, '26–30 days': 28, '31–35 days': 33 };
      return mapping[onboardingData.menstrualCycleLength] || 28;
    };
    const cycleDay = getCycleDay();
    const cycleLen = getCycleLengthNum();
    if (cycleDay) menstrualFields.push({ label: 'Menstrual cycle', value: `Day ${cycleDay % cycleLen || cycleLen} of ~${cycleLen} day cycle` });
    if (onboardingData.hormonalContraception) menstrualFields.push({ label: 'Hormonal contraception', value: onboardingData.hormonalContraception });
    const status = onboardingData.menstrualCycleLength === 'Irregular' ? 'Irregular' : 'Regular';
    menstrualFields.push({ label: 'Menstrual status', value: status });
  }

  // Symptoms: only show if check-in data exists
  const hasCheckIn = !!currentCheckIn;
  const symptoms: { label: string; value: string }[] = [];
  if (hasCheckIn) {
    if (currentCheckIn.itch) symptoms.push({ label: 'Itch', value: currentCheckIn.itch });
    if (currentCheckIn.tenderness) symptoms.push({ label: 'Tenderness', value: currentCheckIn.tenderness });
    if (currentCheckIn.flaking) symptoms.push({ label: 'Flaking', value: currentCheckIn.flaking });
    if (currentCheckIn.hairline) symptoms.push({ label: 'Hairline changes', value: currentCheckIn.hairline });
    if (currentCheckIn.shedding) symptoms.push({ label: 'Shedding', value: currentCheckIn.shedding });
  }

  // Hair condition from check-in
  const hairCondition: { label: string; value: string }[] = [];
  if (hasCheckIn) {
    if (currentCheckIn.hairFeel) hairCondition.push({ label: 'Current texture/feel', value: currentCheckIn.hairFeel });
    if (currentCheckIn.hairBreakage) hairCondition.push({ label: 'Breakage', value: currentCheckIn.hairBreakage });
    if (currentCheckIn.hairAppearance) hairCondition.push({ label: 'Overall appearance', value: currentCheckIn.hairAppearance });
    if (currentCheckIn.hairConcern) hairCondition.push({ label: 'Hair concern', value: currentCheckIn.hairConcern });
  }

  // Baseline comparison
  const baselineFields: { label: string; value: string }[] = [];
  if (onboardingData.baselineItch) baselineFields.push({ label: 'Baseline itch', value: onboardingData.baselineItch });
  if (onboardingData.baselineTenderness) baselineFields.push({ label: 'Baseline tenderness', value: onboardingData.baselineTenderness });
  if (onboardingData.baselineHairline) baselineFields.push({ label: 'Baseline hairline', value: onboardingData.baselineHairline });
  if (onboardingData.baselineHairHealth) baselineFields.push({ label: 'Baseline hair health', value: onboardingData.baselineHairHealth });

  // Products
  const hasScalpProducts = onboardingData.scalpProducts.length > 0;
  const hasHairProducts = onboardingData.hairProducts.length > 0 && !onboardingData.hairProducts.every(p => p === 'None');

  const negatives = symptoms.filter(s => ['None', 'No', 'Normal', 'No change'].includes(s.value));

  // Health context
  const hp = healthProfile;
  const contextItems: { label: string; value: string }[] = [];
  if (hp.medicalConditions.length > 0 && !hp.medicalConditions.includes('None of these') && !hp.medicalConditions.includes('Prefer not to say')) contextItems.push({ label: 'Medical conditions', value: hp.medicalConditions.join(', ') });
  if (hp.pregnancyStatus && hp.pregnancyStatus !== 'No' && hp.pregnancyStatus !== 'Prefer not to say') contextItems.push({ label: 'Reproductive status', value: hp.pregnancyStatus });
  if (hp.medications === 'Yes') contextItems.push({ label: 'Medications', value: hp.medicationDetails || 'Yes (unspecified)' });
  Object.entries(hp.bloodLevels).forEach(([marker, level]) => { if (level === 'Low') contextItems.push({ label: marker, value: 'Low' }); });
  if (hp.skinConditions.length > 0 && !hp.skinConditions.includes('None')) {
    const items = hp.skinConditions.filter(s => s !== 'Other');
    if (hp.skinConditions.includes('Other') && hp.skinConditionDetails) items.push(hp.skinConditionDetails);
    if (items.length) contextItems.push({ label: 'Skin conditions', value: items.join(', ') });
  }
  if (hp.previousHairLoss && hp.previousHairLoss !== 'No') contextItems.push({ label: 'Previous hair loss', value: hp.previousHairLoss });
  if (hp.diagnosedCondition === 'Yes') contextItems.push({ label: 'Diagnosed condition', value: hp.diagnosedConditionDetails || 'Yes (unspecified)' });
  if (hp.familyHistory === 'Yes') contextItems.push({ label: 'Family history', value: 'Hair loss / thinning' });
  const telogenTriggers: string[] = [];
  if (hp.pregnancyStatus === 'Postpartum (within 12 months)') telogenTriggers.push('Postpartum (within 12 months)');
  const validStressors = (hp.recentStressors || []).filter(s => s !== 'None of these' && s !== 'Prefer not to say');
  telogenTriggers.push(...validStressors);
  if (telogenTriggers.length > 0) contextItems.push({ label: 'Potential TE triggers', value: telogenTriggers.join(', ') });

  const hasHealthContext = contextItems.length > 0;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'FolliSense Clinical Summary', text: 'Patient-reported scalp symptom summary' }); } catch { /* cancelled */ }
    } else { toast('Share feature coming soon'); }
  };

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[55%]">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} /></button>
          <div className="flex items-center gap-1.5"><Leaf size={16} className="text-primary" strokeWidth={1.8} /><span className="text-xs font-semibold text-muted-foreground">FolliSense</span></div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-8">
          <h2 className="text-2xl font-semibold mb-1">Clinical Summary</h2>
          <p className="text-muted-foreground text-sm mb-1">Patient-reported scalp and hair symptom summary</p>
          <p className="text-muted-foreground text-xs mb-6">Generated {today}</p>

          {baselineRisk === 'red' && baselineDate && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed"><strong>Note:</strong> Significant symptoms were reported at initial intake on {baselineDate}. No longitudinal trend data available.</p>
            </div>
          )}

          {/* Patient goals */}
          {onboardingData.goals.length > 0 && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Patient Goals</h3>
              <ul className="space-y-1">
                {onboardingData.goals.map(g => (<li key={g} className="text-sm text-foreground">• {g}</li>))}
              </ul>
            </div>
          )}

          {/* Profile */}
          {fields.length > 0 && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Patient Profile</h3>
              <div className="space-y-2.5">
                {fields.map(f => <FieldRow key={f.label} label={f.label} value={f.value} />)}
                {menstrualFields.map(f => <FieldRow key={f.label} label={f.label} value={f.value} />)}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {symptoms.length > 0 && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Symptoms Reported ({currentCheckIn?.type === 'wash-day' ? 'Wash Day' : 'Mid-Cycle'} — {currentCheckIn?.date})</h3>
              <div className="space-y-2.5">
                {symptoms.map(s => <FieldRow key={s.label} label={s.label} value={s.value} />)}
                {currentCheckIn?.newProducts === 'Yes, I tried something new' && currentCheckIn?.newProductDetails && (
                  <FieldRow label="New product this cycle" value={currentCheckIn.newProductDetails} />
                )}
              </div>
            </div>
          )}

          {/* Hair Condition */}
          {hairCondition.length > 0 && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Hair Condition Observations</h3>
              <div className="space-y-2.5">
                {hairCondition.map(item => <FieldRow key={item.label} label={item.label} value={item.value} />)}
              </div>
            </div>
          )}

          {/* Baseline comparison */}
          {baselineFields.length > 0 && baselineDate && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Baseline Assessment ({baselineDate})</h3>
              <div className="space-y-2.5">
                {baselineFields.map(item => <FieldRow key={item.label} label={item.label} value={item.value} />)}
              </div>
            </div>
          )}

          {/* Products */}
          {(hasScalpProducts || hasHairProducts) && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Products Used</h3>
              {hasScalpProducts && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Scalp products ({onboardingData.scalpProductFrequency || onboardingData.productFrequency})</p>
                  {onboardingData.scalpProducts.map(p => (<p key={p} className="text-sm text-foreground">• {p}</p>))}
                </div>
              )}
              {hasHairProducts && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Hair products ({onboardingData.hairProductFrequency})</p>
                  {onboardingData.hairProducts.filter(p => p !== 'None').map(p => (<p key={p} className="text-sm text-foreground">• {p}</p>))}
                </div>
              )}
            </div>
          )}

          {/* Health context */}
          {hasHealthContext && (
            <div className="card-elevated p-4 mb-4">
              <h3 className="text-label mb-3">Patient Health Context</h3>
              <div className="space-y-2.5">
                {contextItems.map(item => <FieldRow key={item.label} label={item.label} value={item.value} />)}
              </div>
            </div>
          )}

          {negatives.length > 0 && (
            <div className="card-elevated p-4 mb-6">
              <h3 className="text-label mb-3">Relevant Negatives</h3>
              <ul className="space-y-1">
                {negatives.map(n => (<li key={n.label} className="text-sm text-muted-foreground">No {n.label.toLowerCase()} concerns reported</li>))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-accent p-4 mb-6">
            <p className="text-xs text-muted-foreground leading-relaxed">FolliSense is a symptom-tracking and triage tool. This summary does not constitute a medical diagnosis. Report generated {today}.</p>
          </div>

          <div className="flex gap-3 mb-3">
            <button onClick={handleShare} className="flex-1 h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2"><Share2 size={16} strokeWidth={1.8} /> Share</button>
            <button onClick={() => toast('PDF download coming soon')} className="flex-1 h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2"><Download size={16} strokeWidth={1.8} /> Download PDF</button>
          </div>
          <button onClick={() => navigate('/find-specialist')} className="w-full h-12 rounded-xl border-2 border-border font-medium text-sm btn-press mb-3 text-muted-foreground">
            Find a specialist to share this with
          </button>
          <button onClick={() => navigate(-1)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">Back to results</button>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicianSummary;
