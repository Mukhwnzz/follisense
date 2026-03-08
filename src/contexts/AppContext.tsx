import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BaselinePhoto {
  area: string;
  captured: boolean;
  date: string;
}

export interface OnboardingData {
  gender: string;
  hairType: string;
  chemicalProcessing: string;
  lastChemicalTreatment: string;
  chemicalProcessingMultiple: string[];
  protectiveStyles: string[];
  barberFrequency: string;
  locRetwistFrequency: string;
  maleStyleFrequency: string;
  otherStyle: string;
  protectiveStyleFrequency: string;
  isWornOutOnly: boolean;
  cycleLength: string;
  cycleLengthMin: string;
  cycleLengthMax: string;
  washFrequency: string;
  washFrequencyPerCycle: string;
  betweenWashCare: string[];
  otherBetweenWashCare: string;
  wornOutWashFrequency: string;
  restyleFrequency: string;
  baselineItch: string;
  baselineTenderness: string;
  baselineHairline: string;
  baselineHairHealth: string;
  scalpProducts: string[];
  otherProduct: string;
  productFrequency: string;
  // Menstrual
  menstrualTracking: string;
  lastPeriodDate: string;
  menstrualCycleLength: string;
  hormonalContraception: string;
  // Goals
  goals: string[];
  hairProducts: string[];
  otherHairProduct: string;
  hairProductFrequency: string;
  scalpProductFrequency: string;
}

export interface CheckInData {
  itch: string;
  tenderness: string;
  hairline: string;
  flaking?: string;
  shedding?: string;
  hairFeel?: string;
  hairBreakage?: string;
  hairAppearance?: string;
  hairConcern?: string;
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

export interface StylistObservationEntry {
  id: string;
  date: string;
  stylistName: string;
  observations: string[];
  notes?: string;
  risk: 'green' | 'amber' | 'red';
}

export interface HealthProfileData {
  sweat: string;
  exercise: string;
  heatStyling: string;
  satinCovering: string;
  medicalConditions: string[];
  pregnancyStatus: string;
  medications: string;
  medicationDetails: string;
  lastBloodTest: string;
  bloodLevels: Record<string, string>;
  skinConditions: string[];
  skinConditionDetails: string;
  sensitiveSkin: string;
  recentStressors: string[];
  previousHairLoss: string;
  diagnosedCondition: string;
  diagnosedConditionDetails: string;
  familyHistory: string;
}

export interface QuickLogEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: string;
}

export interface ResearchData {
  consented: boolean;
  consentDate: string | null;
  photoCount: number;
  dismissed: boolean;
}

const defaultHealthProfile: HealthProfileData = {
  sweat: '',
  exercise: '',
  heatStyling: '',
  satinCovering: '',
  medicalConditions: [],
  pregnancyStatus: '',
  medications: '',
  medicationDetails: '',
  lastBloodTest: '',
  bloodLevels: {},
  skinConditions: [],
  skinConditionDetails: '',
  sensitiveSkin: '',
  recentStressors: [],
  previousHairLoss: '',
  diagnosedCondition: '',
  diagnosedConditionDetails: '',
  familyHistory: '',
};

interface AppContextType {
  userName: string;
  setUserName: (n: string) => void;
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
  healthProfile: HealthProfileData;
  setHealthProfile: (d: HealthProfileData) => void;
  baselinePhotos: BaselinePhoto[];
  setBaselinePhotos: (photos: BaselinePhoto[]) => void;
  baselineRisk: 'green' | 'amber' | 'red' | null;
  setBaselineRisk: (r: 'green' | 'amber' | 'red' | null) => void;
  baselineDate: string | null;
  setBaselineDate: (d: string | null) => void;
  quickLogs: QuickLogEntry[];
  addQuickLog: (entry: QuickLogEntry) => void;
  research: ResearchData;
  setResearch: (d: ResearchData) => void;
  incrementResearchPhotos: () => void;
  checkInCount: number;
  setCheckInCount: (n: number) => void;
  resetAll: () => void;
}

const defaultOnboarding: OnboardingData = {
  gender: '',
  hairType: '',
  chemicalProcessing: '',
  lastChemicalTreatment: '',
  chemicalProcessingMultiple: [],
  protectiveStyles: [],
  barberFrequency: '',
  locRetwistFrequency: '',
  maleStyleFrequency: '',
  otherStyle: '',
  protectiveStyleFrequency: '',
  isWornOutOnly: false,
  cycleLength: '',
  cycleLengthMin: '',
  cycleLengthMax: '',
  washFrequency: '',
  washFrequencyPerCycle: '',
  betweenWashCare: [],
  otherBetweenWashCare: '',
  wornOutWashFrequency: '',
  restyleFrequency: '',
  baselineItch: '',
  baselineTenderness: '',
  baselineHairline: '',
  baselineHairHealth: '',
  scalpProducts: [],
  otherProduct: '',
  productFrequency: '',
  menstrualTracking: '',
  lastPeriodDate: '',
  menstrualCycleLength: '',
  hormonalContraception: '',
  goals: [],
  hairProducts: [],
  otherHairProduct: '',
  hairProductFrequency: '',
  scalpProductFrequency: '',
};

const demoHistory: CycleEntry[] = [
  { id: '1', style: 'Braids', startDate: 'Jan 5', endDate: 'Feb 2', days: 28, risk: 'green', checkIn: { itch: 'None', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 2' } },
  { id: '2', style: 'Twists', startDate: 'Feb 3', endDate: 'Feb 20', days: 17, risk: 'green', checkIn: { itch: 'Mild', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 20' } },
  { id: '3', style: 'Braids', startDate: 'Feb 21', endDate: 'Mar 18', days: 25, risk: 'amber', checkIn: { itch: 'Moderate', tenderness: 'A little', hairline: 'Looks a bit thinner', flaking: 'Some flaking', shedding: 'More than usual', type: 'wash-day', date: 'Mar 18' } },
  { id: '4', style: 'Wig', startDate: 'Mar 19', endDate: 'Apr 2', days: 14, risk: 'amber', checkIn: { itch: 'Mild', tenderness: 'Yes, noticeably', hairline: 'Looks a bit thinner', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Apr 2' } },
  { id: '5', style: 'Braids', startDate: 'Apr 3', endDate: 'Present', days: 14, risk: 'green' },
];

const demoSalonVisits: SalonVisit[] = [
  { id: 'sv1', date: 'Feb 25', services: ['Wash', 'Treatment'], stylistName: 'Ama', notes: 'Deep conditioning treatment' },
  { id: 'sv2', date: 'Feb 2', services: ['Style installation'], stylistName: 'Ama' },
];

const demoClientObservations: ClientObservation[] = [
  { id: 'co1', clientName: 'A.M.', date: 'Mar 5', observations: ['Thinning at hairline / edges', 'Signs of traction damage'], photos: ['Hairline / edges'], notes: 'Recommended loosening edges on next install', risk: 'amber' },
  { id: 'co2', clientName: 'T.K.', date: 'Mar 3', observations: ['Nothing of concern'], photos: [], risk: 'green' },
  { id: 'co3', clientName: 'S.J.', date: 'Feb 28', observations: ['Excessive flaking or buildup', 'Scalp redness or irritation'], photos: ['Crown / vertex'], notes: 'Suggested anti-dandruff shampoo', risk: 'amber' },
  { id: 'co4', clientName: 'R.B.', date: 'Feb 20', observations: ['Thinning at crown / vertex', 'Tender or sore areas'], photos: ['Crown / vertex', 'Hairline / edges'], risk: 'red' },
];

const demoStylistObservations: StylistObservationEntry[] = [
  { id: 'so1', date: 'Feb 25', stylistName: 'Ama', observations: ['Thinning at hairline / edges', 'Signs of traction damage'], notes: 'Stylist noted: slight thinning at temples', risk: 'amber' },
  { id: 'so2', date: 'Feb 2', stylistName: 'Ama', observations: ['Nothing of concern'], risk: 'green' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInData | null>(null);
  const [riskOverride, setRiskOverride] = useState<'green' | 'amber' | 'red' | null>(null);
  const [stylistMode, setStylistMode] = useState(false);
  const [salonVisits, setSalonVisits] = useState<SalonVisit[]>(demoSalonVisits);
  const [clientObservations, setClientObservations] = useState<ClientObservation[]>(demoClientObservations);
  const [healthProfile, setHealthProfile] = useState<HealthProfileData>(defaultHealthProfile);
  const [baselinePhotos, setBaselinePhotos] = useState<BaselinePhoto[]>([]);
  const [baselineRisk, setBaselineRisk] = useState<'green' | 'amber' | 'red' | null>(null);
  const [baselineDate, setBaselineDate] = useState<string | null>(null);
  const [quickLogs, setQuickLogs] = useState<QuickLogEntry[]>([]);
  const [research, setResearch] = useState<ResearchData>({ consented: false, consentDate: null, photoCount: 0, dismissed: false });
  const [checkInCount, setCheckInCount] = useState(3); // demo: 3 completed

  const addSalonVisit = (v: SalonVisit) => setSalonVisits(prev => [v, ...prev]);
  const addClientObservation = (o: ClientObservation) => setClientObservations(prev => [o, ...prev]);
  const addQuickLog = (entry: QuickLogEntry) => setQuickLogs(prev => [entry, ...prev]);
  const incrementResearchPhotos = () => setResearch(prev => ({ ...prev, photoCount: prev.photoCount + 1 }));

  const resetAll = () => {
    setUserName('');
    setOnboardingComplete(false);
    setOnboardingData(defaultOnboarding);
    setCurrentCheckIn(null);
    setRiskOverride(null);
    setStylistMode(false);
    setSalonVisits(demoSalonVisits);
    setClientObservations(demoClientObservations);
    setHealthProfile(defaultHealthProfile);
    setBaselinePhotos([]);
    setBaselineRisk(null);
    setBaselineDate(null);
    setQuickLogs([]);
    setResearch({ consented: false, consentDate: null, photoCount: 0, dismissed: false });
    setCheckInCount(0);
  };

  return (
    <AppContext.Provider value={{
      userName, setUserName,
      onboardingComplete, setOnboardingComplete,
      onboardingData, setOnboardingData,
      currentCheckIn, setCurrentCheckIn,
      history: demoHistory,
      salonVisits, addSalonVisit,
      riskOverride, setRiskOverride,
      stylistMode, setStylistMode,
      clientObservations, addClientObservation,
      stylistObservations: demoStylistObservations,
      healthProfile, setHealthProfile,
      baselinePhotos, setBaselinePhotos,
      baselineRisk, setBaselineRisk,
      baselineDate, setBaselineDate,
      quickLogs, addQuickLog,
      research, setResearch, incrementResearchPhotos,
      checkInCount, setCheckInCount,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};
