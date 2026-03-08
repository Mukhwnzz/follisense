import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  hairType: string;
  protectiveStyles: string[];
  cycleLength: string;
  washFrequency: string;
  baselineItch: string;
  baselineTenderness: string;
  baselineHairline: string;
  scalpProducts: string[];
  productFrequency: string;
}

export interface CheckInData {
  itch: string;
  tenderness: string;
  hairline: string;
  flaking?: string;
  shedding?: string;
  newProducts?: string;
  newProductDetails?: string;
  type: 'mid-cycle' | 'wash-day';
  date: string;
}

export interface SalonVisit {
  id: string;
  date: string;
  services: string[];
  stylistName?: string;
  notes?: string;
}

export interface ClientObservation {
  id: string;
  clientName: string;
  date: string;
  observations: string[];
  photos: string[];
  notes?: string;
  risk: 'green' | 'amber' | 'red';
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
  salonVisits: SalonVisit[];
  addSalonVisit: (v: SalonVisit) => void;
  riskOverride: 'green' | 'amber' | 'red' | null;
  setRiskOverride: (r: 'green' | 'amber' | 'red' | null) => void;
  stylistMode: boolean;
  setStylistMode: (v: boolean) => void;
  clientObservations: ClientObservation[];
  addClientObservation: (o: ClientObservation) => void;
  stylistObservations: StylistObservationEntry[];
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
  scalpProducts: [],
  productFrequency: '',
};

const demoHistory: CycleEntry[] = [
  { id: '1', style: 'Braids', startDate: 'Jan 5', endDate: 'Feb 2', days: 28, risk: 'green', checkIn: { itch: 'None', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 2' } },
  { id: '2', style: 'Twists', startDate: 'Feb 3', endDate: 'Feb 20', days: 17, risk: 'green', checkIn: { itch: 'Mild', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 20' } },
  { id: '3', style: 'Braids', startDate: 'Feb 21', endDate: 'Mar 18', days: 25, risk: 'amber', checkIn: { itch: 'Moderate', tenderness: 'A little', hairline: 'Looks a bit thinner', flaking: 'Some flaking', shedding: 'More than usual', type: 'wash-day', date: 'Mar 18' } },
  { id: '4', style: 'Wig', startDate: 'Mar 19', endDate: 'Apr 2', days: 14, risk: 'amber', checkIn: { itch: 'Mild', tenderness: 'Yes, noticeably', hairline: 'Looks a bit thinner', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Apr 2' } },
  { id: '5', style: 'Braids', startDate: 'Apr 3', endDate: 'Present', days: 14, risk: 'green' },
];

const demoSalonVisits: SalonVisit[] = [
  { id: 'sv1', date: 'Feb 2', services: ['Wash', 'Style installation'], stylistName: 'Ama' },
  { id: 'sv2', date: 'Mar 19', services: ['Style removal/takedown', 'Treatment'], stylistName: 'Ama', notes: 'Deep conditioning treatment' },
];

const demoClientObservations: ClientObservation[] = [
  { id: 'co1', clientName: 'A.M.', date: 'Mar 5', observations: ['Thinning at hairline / edges', 'Signs of traction damage'], photos: ['Hairline / edges'], notes: 'Recommended loosening edges on next install', risk: 'amber' },
  { id: 'co2', clientName: 'T.K.', date: 'Mar 3', observations: ['Nothing of concern'], photos: [], risk: 'green' },
  { id: 'co3', clientName: 'S.J.', date: 'Feb 28', observations: ['Excessive flaking or buildup', 'Scalp redness or irritation'], photos: ['Crown / vertex'], notes: 'Suggested anti-dandruff shampoo', risk: 'amber' },
  { id: 'co4', clientName: 'R.B.', date: 'Feb 20', observations: ['Thinning at crown / vertex', 'Tender or sore areas'], photos: ['Crown / vertex', 'Hairline / edges'], risk: 'red' },
];

// Dummy stylist observations visible in consumer History
export interface StylistObservationEntry {
  id: string;
  date: string;
  stylistName: string;
  observations: string[];
  notes?: string;
  risk: 'green' | 'amber' | 'red';
}

const demoStylistObservations: StylistObservationEntry[] = [
  { id: 'so1', date: 'Mar 5', stylistName: 'Ama', observations: ['Thinning at hairline / edges', 'Signs of traction damage'], notes: 'Recommended loosening edges on next install', risk: 'amber' },
  { id: 'so2', date: 'Feb 2', stylistName: 'Ama', observations: ['Nothing of concern'], risk: 'green' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInData | null>(null);
  const [riskOverride, setRiskOverride] = useState<'green' | 'amber' | 'red' | null>(null);
  const [stylistMode, setStylistMode] = useState(false);
  const [salonVisits, setSalonVisits] = useState<SalonVisit[]>(demoSalonVisits);
  const [clientObservations, setClientObservations] = useState<ClientObservation[]>(demoClientObservations);

  const addSalonVisit = (v: SalonVisit) => setSalonVisits(prev => [v, ...prev]);
  const addClientObservation = (o: ClientObservation) => setClientObservations(prev => [o, ...prev]);

  const resetAll = () => {
    setOnboardingComplete(false);
    setOnboardingData(defaultOnboarding);
    setCurrentCheckIn(null);
    setRiskOverride(null);
    setStylistMode(false);
    setSalonVisits(demoSalonVisits);
    setClientObservations(demoClientObservations);
  };

  return (
    <AppContext.Provider value={{
      onboardingComplete, setOnboardingComplete,
      onboardingData, setOnboardingData,
      currentCheckIn, setCurrentCheckIn,
      history: demoHistory,
      salonVisits, addSalonVisit,
      riskOverride, setRiskOverride,
      stylistMode, setStylistMode,
      clientObservations, addClientObservation,
      stylistObservations: demoStylistObservations,
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
