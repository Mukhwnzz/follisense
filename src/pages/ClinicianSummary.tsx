import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { computeHistoricalRisk } from '@/utils/triageLogic';
import { toast } from 'sonner';

const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns'];

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
  hairFeel: 'Hair texture/feel',
  hairAppearance: 'Hair appearance',
  hairConcern: 'Hair concern',
};

const SEVERITY_LABEL_MAP: Record<string, string> = {
  'Mild': 'mild', 'A little': 'mild', 'Some flaking': 'mild',
  'Slight concern': 'mild', 'A bit dry': 'mild',
  'Moderate': 'moderate', 'Yes, noticeably': 'moderate',
  'Noticeable change': 'moderate', 'More than usual': 'moderate',
  'Looks a bit thinner': 'moderate',
  'Severe': 'severe', 'Yes, painful': 'severe',
  'Very concerned': 'severe', 'Alarming amount': 'severe',
  'Heavy flaking': 'severe', 'Significant': 'severe',
};

const getSeverityLabel = (v: string): string => SEVERITY_LABEL_MAP[v] || v.toLowerCase();

const SYMPTOM_KEYS: (keyof typeof SYMPTOM_LABEL_MAP)[] = [
  'itch', 'tenderness', 'hairline', 'flaking', 'shedding', 'bumps', 'dryness', 'razorBumps', 'barberIrritation',
];

const ClinicianSummary = () => {
  const navigate = useNavigate();
  const { onboardingData, currentCheckIn, healthProfile, baselineRisk, baselineDate, checkInHistory } = useApp();

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const isMale = onboardingData.gender === 'man';

  // Compute current risk
  const currentRisk = currentCheckIn ? computeHistoricalRisk(currentCheckIn, checkInHistory) : (baselineRisk || 'red');

  // Determine trigger reason
  const getTriggerReason = (): string => {
    if (!currentCheckIn) return 'Baseline assessment';
    let activeCount = 0;
    let hasSevere = false;
    for (const key of SYMPTOM_KEYS) {
      const val = (currentCheckIn as any)[key] as string | undefined;
      if (val && !NONE_VALUES.includes(val)) {
        activeCount++;
        if (['Severe', 'Yes, painful', 'Very concerned', 'Alarming amount', 'Heavy flaking', 'Significant'].includes(val)) hasSevere = true;
      }
    }
    if (hasSevere) return 'Severe symptom reported';
    if (activeCount >= 3) return `${activeCount} simultaneous symptoms`;
    return 'Symptom pattern analysis';
  };

  // Build all flagged symptoms from current check-in
  const getAllSymptoms = (): { label: string; severity: string }[] => {
    if (!currentCheckIn) return [];
    const result: { label: string; severity: string }[] = [];
    for (const key of SYMPTOM_KEYS) {
      const val = (currentCheckIn as any)[key] as string | undefined;
      if (val && !NONE_VALUES.includes(val)) {
        result.push({ label: SYMPTOM_LABEL_MAP[key] || key, severity: getSeverityLabel(val) });
      }
    }
    return result;
  };

  const symptoms = getAllSymptoms();

  // Hair type label
  const hairTypeLabel: Record<string, string> = {
    '3b': '3b, Loose, springy curls', '3c': '3c, Tight, corkscrew curls',
    '4a': '4a, Dense, S-shaped coils', '4b': '4b, Z-shaped, tightly coiled',
    '4c': '4c, Very tight, densely packed coils', 'unsure': 'Mixed / Unsure',
  };

  // Build check-in history for symptom history section
  const getHistoryEntries = (): { date: string; risk: string }[] => {
    const entries: { date: string; risk: string }[] = [];
    // Current
    if (currentCheckIn) {
      const risk = computeHistoricalRisk(currentCheckIn, checkInHistory);
      entries.push({ date: currentCheckIn.date, risk: risk.toUpperCase() });
    }
    // Previous
    for (let i = 0; i < checkInHistory.length; i++) {
      const ci = checkInHistory[i];
      const prevHistory = checkInHistory.slice(i + 1);
      const risk = computeHistoricalRisk(ci, prevHistory);
      entries.push({ date: ci.date, risk: risk.toUpperCase() });
    }
    return entries;
  };

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

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'FolliSense Clinical Summary', text: 'Patient-reported scalp symptom summary' }); } catch { /* cancelled */ }
    } else { toast('Share feature coming soon'); }
  };

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #F0EDE8' }}>
      <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1C', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
    </div>
  );

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#999', marginBottom: 12, marginTop: 24,
    }}>
      {children}
    </h3>
  );

  const historyEntries = getHistoryEntries();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft size={22} color="#1C1C1C" strokeWidth={1.8} /></button>
          <div />
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: 32 }}>
          {/* Title */}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1C', marginBottom: 4 }}>FolliSense Clinician Summary</h1>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>Patient-reported scalp and hair symptom summary</p>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 0 }}>Generated {today}</p>

          {/* Patient Context */}
          <SectionHeading>Patient Context</SectionHeading>
          <div>
            {onboardingData.gender && <FieldRow label="Gender" value={onboardingData.gender === 'man' ? 'Male' : onboardingData.gender === 'woman' ? 'Female' : onboardingData.gender} />}
            {onboardingData.hairType && <FieldRow label="Hair type" value={hairTypeLabel[onboardingData.hairType] || onboardingData.hairType} />}
            {onboardingData.protectiveStyles.length > 0 && <FieldRow label="Current style(s)" value={onboardingData.protectiveStyles.join(', ')} />}
            {onboardingData.cycleLength && <FieldRow label="Style cycle length" value={onboardingData.cycleLength} />}
            {onboardingData.betweenWashCare.length > 0 && <FieldRow label="Between-wash care" value={onboardingData.betweenWashCare.join(', ')} />}
            {onboardingData.washFrequency && <FieldRow label="Wash frequency" value={onboardingData.washFrequency} />}
          </div>

          {/* Patient Goals */}
          {onboardingData.goals.length > 0 && (
            <>
              <SectionHeading>Patient Priorities</SectionHeading>
              <p style={{ fontSize: 13, color: '#1C1C1C', lineHeight: 1.6 }}>
                {onboardingData.goals.join(', ')}
              </p>
            </>
          )}

          {/* Current Symptoms */}
          <SectionHeading>Current Symptoms</SectionHeading>
          {symptoms.length > 0 ? (
            <div>
              {symptoms.map((s, i) => (
                <FieldRow key={i} label={s.label} value={s.severity} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#666' }}>No symptoms reported in latest check-in.</p>
          )}

          {/* Triage Result */}
          <SectionHeading>Triage Result</SectionHeading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              backgroundColor: currentRisk === 'green' ? '#7C9A8E' : currentRisk === 'amber' ? '#C4967A' : '#B85C5C',
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1C', textTransform: 'uppercase' }}>{currentRisk}</span>
          </div>
          <p style={{ fontSize: 13, color: '#666' }}>Triggered by: {getTriggerReason()}</p>

          {/* Symptom History */}
          {historyEntries.length > 0 && (
            <>
              <SectionHeading>Symptom History</SectionHeading>
              <p style={{ fontSize: 13, color: '#1C1C1C', lineHeight: 1.8 }}>
                {historyEntries.map((e, i) => `${e.date}: ${e.risk}`).join(' | ')}
              </p>
            </>
          )}

          {/* Health Context */}
          {contextItems.length > 0 && (
            <>
              <SectionHeading>Health Context</SectionHeading>
              <div>
                {contextItems.map(item => <FieldRow key={item.label} label={item.label} value={item.value} />)}
              </div>
            </>
          )}

          {/* Products */}
          <SectionHeading>Products</SectionHeading>
          {onboardingData.scalpProducts.length > 0 ? (
            <p style={{ fontSize: 13, color: '#1C1C1C', lineHeight: 1.6 }}>
              {onboardingData.scalpProducts.join(', ')}
              {onboardingData.scalpProductFrequency && ` (${onboardingData.scalpProductFrequency})`}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: '#666' }}>Not yet provided</p>
          )}

          {/* Photos */}
          <SectionHeading>Photos</SectionHeading>
          <p style={{ fontSize: 13, color: '#666' }}>
            {baselineDate ? `Baseline photos captured on ${baselineDate}` : 'No baseline photos captured yet'}
          </p>

          {/* Disclaimer */}
          <div style={{
            marginTop: 32, padding: 16, borderTop: '1px solid #E8E4DF',
          }}>
            <p style={{ fontSize: 11, color: '#999', lineHeight: 1.7 }}>
              This summary was generated by FolliSense, a scalp health monitoring tool. It is not a medical diagnosis. It is intended to provide context for a clinical consultation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-3 mt-4">
            <button onClick={handleShare} style={{
              flex: 1, height: 48, borderRadius: 14, border: '1.5px solid #E8E4DF',
              background: '#fff', fontSize: 13, fontWeight: 500, color: '#1C1C1C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
            }}>
              <Share2 size={16} strokeWidth={1.8} /> Share
            </button>
            <button onClick={() => toast('PDF download coming soon')} style={{
              flex: 1, height: 48, borderRadius: 14, border: '1.5px solid #E8E4DF',
              background: '#fff', fontSize: 13, fontWeight: 500, color: '#1C1C1C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
            }}>
              <Download size={16} strokeWidth={1.8} /> Download PDF
            </button>
          </div>
          <button onClick={() => navigate('/find-specialist')} style={{
            width: '100%', height: 48, borderRadius: 14, border: '1.5px solid #E8E4DF',
            background: '#fff', fontSize: 13, fontWeight: 500, color: '#666',
            cursor: 'pointer', marginBottom: 12,
          }}>
            Find a specialist to share this with
          </button>
          <button onClick={() => navigate('/results')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
            Back to results
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicianSummary;
