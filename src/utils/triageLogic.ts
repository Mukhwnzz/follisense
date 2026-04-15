import type { CheckInData } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns'];
const MILD_VALUES = ['Mild', 'A little', 'Some flaking', 'Slight concern', 'A bit dry', 'A little more breakage or dryness than usual', 'Slightly wider'];
const MODERATE_VALUES = ['Moderate', 'Yes, noticeably', 'Noticeable change', 'More than usual', 'Looks a bit thinner', 'Noticeably dry, brittle, or breaking more than usual', 'Noticeably wider', 'Noticeable'];
const SEVERE_VALUES = ['Severe', 'Yes, painful', 'Very concerned', 'Alarming amount', 'Heavy flaking', "Concerned about my hair's condition", 'Significant', 'Significantly wider'];

const SYMPTOM_KEYS: (keyof CheckInData)[] = ['itch', 'tenderness', 'hairline', 'centerPart', 'crownThinning', 'flaking', 'shedding', 'bumps', 'dryness', 'razorBumps', 'barberIrritation'];

const getSeverityLevel = (value: string | undefined): number => {
  if (!value || NONE_VALUES.includes(value)) return 0;
  if (MILD_VALUES.includes(value)) return 1;
  if (MODERATE_VALUES.includes(value)) return 2;
  if (SEVERE_VALUES.includes(value)) return 3;
  return 1; // default to mild for unknown values
};

const isSymptomPresent = (value: string | undefined): boolean => {
  return !!value && !NONE_VALUES.includes(value);
};

/**
 * Historical triage: compares current check-in against history.
 * 
 * GREEN: No symptoms, or mild single symptom first time, or resolved.
 * AMBER: Mild persisting 2+ check-ins, first-time moderate, any tenderness, self-care guidance.
 * RED: Persisting 3+ without improvement, severe at any point, worsened amber,
 *      3+ simultaneous symptoms, hairline recession + tenderness.
 */
export const computeHistoricalRisk = (
  current: CheckInData,
  history: CheckInData[] // ordered newest first
): RiskLevel => {
  const currentSymptoms: Record<string, number> = {};
  let activeSymptomCount = 0;

  for (const key of SYMPTOM_KEYS) {
    const val = current[key] as string | undefined;
    const level = getSeverityLevel(val);
    currentSymptoms[key] = level;
    if (level > 0) activeSymptomCount++;
  }

  // RED: Any severe symptom at any point
  if (Object.values(currentSymptoms).some(l => l >= 3)) return 'red';

  // RED: 3+ simultaneous symptoms
  if (activeSymptomCount >= 3) return 'red';

  // RED: Hairline recession + tenderness
  if (currentSymptoms.hairline >= 1 && currentSymptoms.tenderness >= 1) return 'red';

  // RED: Crown/vertex thinning + tenderness (CCCA risk)
  if (currentSymptoms.crownThinning >= 1 && currentSymptoms.tenderness >= 1) return 'red';

  // Check persistence and worsening against history
  for (const key of SYMPTOM_KEYS) {
    const currentLevel = currentSymptoms[key];
    if (currentLevel === 0) continue;

    // Count consecutive check-ins with this symptom present
    let persistenceCount = 1; // current
    for (const prev of history) {
      if (isSymptomPresent(prev[key] as string | undefined)) {
        persistenceCount++;
      } else {
        break; // streak broken
      }
    }

    // RED: Symptom persisting 3+ check-ins without improvement
    if (persistenceCount >= 3) {
      // Check if it improved at all
      const lastLevel = history.length > 0 ? getSeverityLevel(history[0][key] as string | undefined) : 0;
      if (currentLevel >= lastLevel) return 'red'; // no improvement
    }

    // RED: AMBER symptoms that worsened between check-ins
    if (history.length > 0) {
      const lastLevel = getSeverityLevel(history[0][key] as string | undefined);
      if (lastLevel >= 2 && currentLevel > lastLevel) return 'red'; // was moderate+, got worse
      if (lastLevel >= 1 && currentLevel > lastLevel && persistenceCount >= 2) return 'red'; // worsening trend
    }
  }

  // AMBER checks
  for (const key of SYMPTOM_KEYS) {
    const currentLevel = currentSymptoms[key];
    if (currentLevel === 0) continue;

    // AMBER: Any tenderness reported
    if (key === 'tenderness' && currentLevel >= 1) return 'amber';

    // AMBER: First-time moderate symptoms
    if (currentLevel >= 2) return 'amber';

    // AMBER: Mild persisting 2+ check-ins
    if (currentLevel === 1 && history.length > 0) {
      const prevPresent = isSymptomPresent(history[0][key] as string | undefined);
      if (prevPresent) return 'amber';
    }
  }

  // GREEN: No symptoms, or mild single symptom first time, or resolved
  return 'green';
};

/**
 * Generate triage guidance based on risk level and symptom patterns.
 */
export const getTriageGuidance = (
  risk: RiskLevel,
  current: CheckInData,
  history: CheckInData[]
): { heading: string; message: string }[] => {
  const guidance: { heading: string; message: string }[] = [];

  if (risk === 'amber') {
    // Identify which symptoms are persisting
    for (const key of SYMPTOM_KEYS) {
      if (!isSymptomPresent(current[key] as string | undefined)) continue;
      const prevCount = history.filter(h => isSymptomPresent(h[key] as string | undefined)).length;
      if (prevCount >= 1) {
        guidance.push({
          heading: `Persistent ${key}`,
          message: `Your ${key} has been present across ${prevCount + 1} check-ins. We recommend self-care and will reassess at your next check-in.`,
        });
      }
    }
  }

  if (risk === 'red') {
    guidance.push({
      heading: 'Professional review recommended',
      message: 'Based on your symptom patterns, we recommend consulting a trichologist or dermatologist. Your clinician summary has been generated automatically.',
    });
  }

  return guidance;
};
