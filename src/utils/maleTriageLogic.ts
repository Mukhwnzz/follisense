import type { CheckInData } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns', 'No changes noticed', 'No thinning', 'No scalp issues', 'No razor bumps', 'No irritation after cuts', 'No buildup or odour', 'No tenderness', 'No breakage'];

const getSeverityLevel = (value: string | undefined): number => {
  if (!value || NONE_VALUES.includes(value)) return 0;
  const v = value.toLowerCase();
  if (v.includes('minor') || v.includes('mild') || v.includes('slight') || v.includes('a few') || v.includes('occasional')) return 1;
  if (v.includes('noticeable') || v.includes('moderate') || v.includes('regular') || v.includes('frequent') || v.includes('burning')) return 2;
  if (v.includes('significant') || v.includes('severe') || v.includes('clear recession') || v.includes('persistent') || v.includes('constant') || v.includes('intense') || v.includes('painful without')) return 3;
  return 1;
};

/**
 * Compute male-specific triage risk.
 * 
 * GREEN: No reported hairline changes, no symptoms beyond mild single occurrence, Norwood unchanged.
 * AMBER: Mild recession/thinning across 2+ check-ins, OR first-time moderate thinning, OR persistent irritation 2+ check-ins.
 * RED: Noticeable/significant hairline change, OR thinning worsening, OR Norwood increased, OR severe symptoms.
 */
export const computeMaleTriageRisk = (
  current: CheckInData,
  history: CheckInData[],
  norwoodBaseline?: string,
  norwoodCurrent?: string,
): RiskLevel => {
  // Map male symptom keys
  const symptomKeys = ['hairlineChange', 'thinning', 'scalpIssues', 'razorBumps', 'barberIrritation', 'buildup', 'tenderness', 'breakage',
    // Also check standard keys
    'itch', 'flaking', 'dryness', 'bumps', 'hairline', 'shedding'];

  const levels: Record<string, number> = {};
  let activeCount = 0;

  for (const key of symptomKeys) {
    const val = (current as any)[key] as string | undefined;
    const level = getSeverityLevel(val);
    levels[key] = level;
    if (level > 0) activeCount++;
  }

  // RED: Norwood increased from baseline
  if (norwoodBaseline && norwoodCurrent) {
    const stageOrder = ['1', '2', '3', '3v', '4', '5', '6', '7'];
    const baseIdx = stageOrder.indexOf(norwoodBaseline);
    const currIdx = stageOrder.indexOf(norwoodCurrent);
    if (currIdx > baseIdx) return 'red';
  }

  // RED: Noticeable or significant hairline change
  const hairlineLevel = levels.hairlineChange || levels.hairline || 0;
  if (hairlineLevel >= 2) return 'red';

  // RED: Any severe symptom
  if (Object.values(levels).some(l => l >= 3)) return 'red';

  // RED: Thinning worsening between check-ins
  if (history.length > 0) {
    const prevThinning = getSeverityLevel((history[0] as any).thinning || (history[0] as any).hairline);
    const currThinning = levels.thinning || levels.hairline || 0;
    if (currThinning > prevThinning && currThinning >= 2) return 'red';
  }

  // AMBER: First-time moderate thinning
  const thinningLevel = levels.thinning || levels.hairline || 0;
  if (thinningLevel >= 2) return 'amber';

  // AMBER: Mild recession/thinning across 2+ check-ins
  if (thinningLevel >= 1 && history.length > 0) {
    const prevPresent = getSeverityLevel((history[0] as any).thinning || (history[0] as any).hairline) > 0;
    if (prevPresent) return 'amber';
  }

  // AMBER: Persistent irritation/razor bumps across 2+ check-ins
  for (const key of ['razorBumps', 'barberIrritation']) {
    if (levels[key] >= 1 && history.length > 0) {
      const prevLevel = getSeverityLevel((history[0] as any)[key]);
      if (prevLevel >= 1) return 'amber';
    }
  }

  // AMBER: Minor hairline change reported
  if (hairlineLevel >= 1) return 'amber';

  return 'green';
};

export const getMaleTriageMessage = (risk: RiskLevel): string => {
  if (risk === 'green') return "Based on what you've shared, no concerning changes detected. Keep tracking.";
  if (risk === 'amber') return "You've reported some changes worth monitoring. We'll flag if this progresses.";
  return "Your recent check-ins suggest your hairline may be changing. We'd recommend seeing a dermatologist or trichologist. Here's a summary you can take with you.";
};

export const getMaleTriageReasoning = (risk: RiskLevel, responses: Record<string, string>): string | null => {
  if (risk === 'green') return null;

  const hairlineVal = responses.hairlineChange || responses.hairline || '';
  const hairlineLevel = getSeverityLevel(hairlineVal);

  if (risk === 'red') {
    if (hairlineLevel >= 2) {
      return "Your self-assessment suggests your hairline may be changing. A dermatologist can assess what's happening and discuss options early.";
    }
    if (Object.values(responses).some(v => getSeverityLevel(v) >= 3)) {
      const sevKey = Object.entries(responses).find(([_, v]) => getSeverityLevel(v) >= 3)?.[0];
      return `${sevKey ? sevKey.replace(/([A-Z])/g, ' $1').toLowerCase().trim() : 'A symptom'} at this level needs professional attention.`;
    }
    return "Your symptom pattern suggests changes worth investigating with a professional.";
  }

  if (risk === 'amber') {
    const active = Object.entries(responses)
      .filter(([_, v]) => getSeverityLevel(v) > 0)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
    return `You've flagged ${active.join(', ')} at a level worth watching.`;
  }

  return null;
};
