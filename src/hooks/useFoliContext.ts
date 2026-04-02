import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { FoliUserContext } from '@/services/foliPrompt';

export function useFoliContext(): FoliUserContext {
  const { onboardingData } = useApp();

  return useMemo(() => ({
    name: 'there',                                        // ← Supabase person wires later
    hairType: onboardingData.hairType || 'type4',
    currentStyle: onboardingData.protectiveStyles?.[0] || 'natural',
    styleDaysIn: 0,                                       // ← Supabase person wires later
    concerns: onboardingData.goals || [],
    daysSinceWash: 0,                                     // ← Supabase person wires later
    daysSinceCheckin: 0,                                  // ← Supabase person wires later
    scalpAnalysis: null,                                  // ← Python person wires later
  }), [onboardingData]);
}