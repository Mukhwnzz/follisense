import type { CheckInData } from '@/contexts/AppContext';

type RiskLevel = 'green' | 'amber' | 'red';

const NONE_VALUES = ['None', 'No', 'No change', 'Normal', 'No concerns', 'No changes noticed', 'No thinning', 'No scalp issues', 'No razor bumps', 'No irritation after cuts', 'No buildup or odour', 'No tenderness', 'No breakage'];

export const getSeverityLevel = (value: string | undefined): number => {
  if (!value || NONE_VALUES.includes(value)) return 0;
  const v = value.toLowerCase();
  if (v.includes('minor') || v.includes('mild') || v.includes('slight') || v.includes('a few') || v.includes('occasional')) return 1;
  if (v.includes('noticeable') || v.includes('moderate') || v.includes('regular') || v.includes('frequent') || v.includes('burning')) return 2;
  if (v.includes('significant') || v.includes('severe') || v.includes('clear recession') || v.includes('persistent') || v.includes('constant') || v.includes('intense') || v.includes('painful without')) return 3;
  return 1;
};

/**
 * Constellation-based male triage risk.
 * 
 * Severity scoring: None=0, Mild=1, Moderate=2, Severe=3
 * Sum all symptom scores for total severity score.
 * 
 * GREEN: Total score 0-1. No hairline changes. Norwood unchanged.
 * AMBER: Total score 2-4 OR mild recession/thinning across 2+ check-ins OR first-time moderate thinning OR persistent irritation 2+ check-ins.
 * RED: Total score 5+ OR any single severe symptom OR noticeable/significant hairline change OR thinning worsening OR Norwood increased.
 */
export const computeMaleTriageRisk = (
  current: CheckInData,
  history: CheckInData[],
  norwoodBaseline?: string,
  norwoodCurrent?: string,
): RiskLevel => {
  const symptomKeys = ['hairlineChange', 'thinning', 'scalpIssues', 'razorBumps', 'barberIrritation', 'buildup', 'tenderness', 'breakage',
    'itch', 'flaking', 'dryness', 'bumps', 'hairline', 'shedding'];

  const levels: Record<string, number> = {};
  let totalScore = 0;
  let activeCount = 0;

  for (const key of symptomKeys) {
    const val = (current as any)[key] as string | undefined;
    const level = getSeverityLevel(val);
    levels[key] = level;
    totalScore += level;
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

  // RED: Total severity score 5+
  if (totalScore >= 5) return 'red';

  // RED: Thinning worsening between check-ins
  if (history.length > 0) {
    const prevThinning = getSeverityLevel((history[0] as any).thinning || (history[0] as any).hairline);
    const currThinning = levels.thinning || levels.hairline || 0;
    if (currThinning > prevThinning && currThinning >= 2) return 'red';
  }

  // AMBER: Total severity score 2-4
  if (totalScore >= 2) return 'amber';

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

export const getMaleTriageMessage = (risk: RiskLevel, totalScore?: number, severeCount?: number): string => {
  if (risk === 'green') return "Based on what you've shared, no concerning changes detected. Keep tracking.";
  if (risk === 'amber') return "You've reported some changes worth monitoring. We'll flag if this progresses.";
  
  // RED - adapt to severity load
  if (severeCount && severeCount >= 3) {
    return "Multiple areas of your scalp health need attention. Please prioritise seeing a specialist. Here's everything they'll need.";
  }
  if (severeCount && severeCount >= 2) {
    return "You've reported several significant concerns. We'd strongly recommend seeing a dermatologist or trichologist soon. Here's a summary you can take with you.";
  }
  return "Your recent check-ins suggest your hairline may be changing. We'd recommend seeing a dermatologist or trichologist. Here's a summary you can take with you.";
};

export const getMaleTriageReasoning = (
  risk: RiskLevel,
  responses: Record<string, string>,
  goals?: string[],
  maleHasShortStyles?: boolean,
  maleHasLongStyles?: boolean,
): string | null => {
  if (risk === 'green') return null;

  const symptomKeys = ['hairlineChange', 'thinning', 'scalpIssues', 'razorBumps', 'barberIrritation', 'buildup', 'tenderness', 'breakage'];
  const activeSymptoms: { key: string; level: number; label: string }[] = [];

  const labelMap: Record<string, string> = {
    hairlineChange: 'Hairline changes',
    thinning: 'Thinning',
    scalpIssues: 'Itching/flaking/dryness',
    razorBumps: 'Razor bumps',
    barberIrritation: 'Barber irritation',
    buildup: 'Buildup',
    tenderness: 'Tenderness',
    breakage: 'Breakage',
  };

  const severityLabel = (l: number) => l === 1 ? 'mild' : l === 2 ? 'moderate' : l === 3 ? 'severe' : 'none';

  for (const key of symptomKeys) {
    const val = responses[key];
    const level = getSeverityLevel(val);
    if (level > 0) {
      activeSymptoms.push({ key, level, label: labelMap[key] || key });
    }
  }

  if (activeSymptoms.length === 0) return null;

  const symptomList = activeSymptoms.map(s => `${s.label} (${severityLabel(s.level)})`).join(', ');
  const severeSymptoms = activeSymptoms.filter(s => s.level >= 3);

  // Check for goal relevance
  let goalNote = '';
  if (goals && goals.length > 0) {
    const primaryGoal = goals[0].toLowerCase();
    const relevantSymptom = activeSymptoms.find(s => 
      (primaryGoal.includes('hairline') && s.key === 'hairlineChange') ||
      (primaryGoal.includes('thin') && s.key === 'thinning') ||
      (primaryGoal.includes('razor') && s.key === 'razorBumps') ||
      (primaryGoal.includes('itch') && s.key === 'scalpIssues') ||
      (primaryGoal.includes('irritat') && s.key === 'barberIrritation')
    );
    if (relevantSymptom) {
      goalNote = ` You told us ${goals[0].toLowerCase()} matters most to you. We're tracking this closely.`;
    }
  }

  if (risk === 'red') {
    const hairlineLevel = getSeverityLevel(responses.hairlineChange);
    if (hairlineLevel >= 2) {
      return `You reported: ${symptomList}. Your self-assessment suggests your hairline may be changing. A dermatologist can assess what's happening and discuss options early.${goalNote}`;
    }
    if (severeSymptoms.length > 0) {
      // Determine cause reference based on styles
      const causeRef = (maleHasLongStyles && !maleHasShortStyles) 
        ? 'traction-related damage or scalp inflammation'
        : 'male pattern hair loss or scalp inflammation';
      return `You reported: ${symptomList}. The combination of these symptoms, particularly ${severeSymptoms.map(s => s.label.toLowerCase()).join(' and ')}, suggests ${causeRef} that warrants professional attention.${goalNote}`;
    }
    return `You reported: ${symptomList}. The combination of these is why we're recommending a professional review.${goalNote}`;
  }

  if (risk === 'amber') {
    return `You've flagged ${symptomList}. Let's see if these steps help.${goalNote}`;
  }

  return null;
};

/**
 * Get severity-aware transition text for after symptom baseline.
 * Used by both male and female flows.
 */
export const getSeverityTransitionText = (responses: Record<string, string>): string => {
  let maxSeverity = 0;
  for (const val of Object.values(responses)) {
    const level = getSeverityLevel(val);
    if (level > maxSeverity) maxSeverity = level;
  }
  if (maxSeverity === 0) return "All clear. Let's see your results.";
  if (maxSeverity === 1) return "Thanks for sharing that. Let's see what it all means.";
  if (maxSeverity === 2) return "Thank you for being honest about that. Let's look at the full picture.";
  return "That took courage to share. We're glad you told us.";
};

/**
 * Compute severity dot summary for triage result screen.
 */
export const computeSeverityDotSummary = (
  responses: Record<string, string>,
  symptomKeys: string[],
): { dots: number[]; flaggedCount: number; totalCount: number; mildCount: number; moderateCount: number; severeCount: number; summaryText: string } => {
  const dots: number[] = [];
  let flaggedCount = 0;
  let mildCount = 0;
  let moderateCount = 0;
  let severeCount = 0;

  for (const key of symptomKeys) {
    const level = getSeverityLevel(responses[key]);
    dots.push(level);
    if (level > 0) {
      flaggedCount++;
      if (level === 1) mildCount++;
      if (level === 2) moderateCount++;
      if (level >= 3) severeCount++;
    }
  }

  const totalCount = symptomKeys.length;

  let summaryText = '';
  if (flaggedCount === 0) {
    summaryText = `0 of ${totalCount} areas flagged. No immediate concerns.`;
  } else if (severeCount === 0 && moderateCount === 0) {
    summaryText = `${flaggedCount} of ${totalCount} areas flagged (mild). No immediate concerns.`;
  } else if (severeCount === 0) {
    summaryText = `${flaggedCount} of ${totalCount} areas flagged, including ${moderateCount} moderate. Worth watching.`;
  } else if (severeCount <= 2) {
    summaryText = `${flaggedCount} of ${totalCount} areas flagged, including ${severeCount} severe. Professional review recommended.`;
  } else {
    summaryText = `${flaggedCount} of ${totalCount} areas flagged, including ${severeCount} severe. Please prioritise seeing a specialist.`;
  }

  return { dots, flaggedCount, totalCount, mildCount, moderateCount, severeCount, summaryText };
};

/**
 * Get interim care steps based on risk level and symptoms.
 */
export const getInterimCareSteps = (
  risk: RiskLevel,
  responses: Record<string, string>,
  isMale: boolean,
): string[] => {
  if (risk === 'green') return [];

  const steps: string[] = [];
  const hasItching = getSeverityLevel(responses.scalpIssues || responses.itch) > 0;
  const hasThinning = getSeverityLevel(responses.thinning || responses.hairline) > 0;
  const hasBumps = getSeverityLevel(responses.bumps || responses.razorBumps) > 0;
  const hasRazorBumps = getSeverityLevel(responses.razorBumps) > 0;
  const hasSevereThinning = getSeverityLevel(responses.thinning || responses.hairline) >= 3;

  if (risk === 'amber') {
    if (hasItching) steps.push('Try a gentle, sulfate-free wash on your next wash day. Avoid scratching.');
    if (hasThinning) steps.push('Avoid tension at the hairline. Low-manipulation styles will help while you monitor.');
    if (hasBumps && !hasRazorBumps) steps.push('Keep the area clean and avoid picking. A warm compress can help.');
    if (hasRazorBumps && isMale) steps.push('Try a single-blade razor or electric trimmer. Shave with the grain.');
    steps.push('Continue your check-ins so we can track whether this is improving.');
  }

  if (risk === 'red') {
    steps.push("Don't panic. Many scalp conditions respond well to treatment when caught early.");
    steps.push("Avoid any changes that could make things worse: no new products, no tight styles, no chemical treatments until you've been seen.");
    steps.push('Take your clinician summary with you. It gives the specialist everything they need.');
    if (hasSevereThinning) steps.push('Handle your hair gently at the affected areas.');
    steps.push("Your next check-in will help us see if things are stabilising.");
  }

  return steps;
};
