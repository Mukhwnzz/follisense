import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  hairType: string;
  protectiveStyles: string[];
  cycleLength: string;
  washFrequency: string;
  baselineItch: string;
  baselineTenderness: string;
  baselineHairline: string;
}

export interface CheckInData {
  itch: string;
  tenderness: string;
  hairline: string;
  flaking?: string;
  shedding?: string;
  type: 'mid-cycle' | 'wash-day';
  date: string;
}

export interface CycleEntry {
  id: string;
  style: string;
  startDate: string;
  endDate: string;
  days: number;
  risk: 'green' | 'amber' | 'red';
  checkIn?: CheckInData;
}

interface AppContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  onboardingData: OnboardingData;
  setOnboardingData: (d: OnboardingData) => void;
  currentCheckIn: CheckInData | null;
  setCurrentCheckIn: (d: CheckInData | null) => void;
  history: CycleEntry[];
  riskOverride: 'green' | 'amber' | 'red' | null;
  setRiskOverride: (r: 'green' | 'amber' | 'red' | null) => void;
  resetAll: () => void;
}

const defaultOnboarding: OnboardingData = {
  hairType: '',
  protectiveStyles: [],
  cycleLength: '',
  washFrequency: '',
  baselineItch: '',
  baselineTenderness: '',
  baselineHairline: '',
};

const demoHistory: CycleEntry[] = [
  { id: '1', style: 'Braids', startDate: 'Jan 5', endDate: 'Feb 2', days: 28, risk: 'green', checkIn: { itch: 'None', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 2' } },
  { id: '2', style: 'Twists', startDate: 'Feb 3', endDate: 'Feb 20', days: 17, risk: 'green', checkIn: { itch: 'Mild', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 20' } },
  { id: '3', style: 'Braids', startDate: 'Feb 21', endDate: 'Mar 18', days: 25, risk: 'amber', checkIn: { itch: 'Moderate', tenderness: 'A little', hairline: 'Looks a bit thinner', flaking: 'Some flaking', shedding: 'More than usual', type: 'wash-day', date: 'Mar 18' } },
  { id: '4', style: 'Wig', startDate: 'Mar 19', endDate: 'Apr 2', days: 14, risk: 'amber', checkIn: { itch: 'Mild', tenderness: 'Yes, noticeably', hairline: 'Looks a bit thinner', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Apr 2' } },
  { id: '5', style: 'Braids', startDate: 'Apr 3', endDate: 'Present', days: 14, risk: 'green' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInData | null>(null);
  const [riskOverride, setRiskOverride] = useState<'green' | 'amber' | 'red' | null>(null);

  const resetAll = () => {
    setOnboardingComplete(false);
    setOnboardingData(defaultOnboarding);
    setCurrentCheckIn(null);
    setRiskOverride(null);
  };

  return (
    <AppContext.Provider value={{
      onboardingComplete, setOnboardingComplete,
      onboardingData, setOnboardingData,
      currentCheckIn, setCurrentCheckIn,
      history: demoHistory,
      riskOverride, setRiskOverride,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
