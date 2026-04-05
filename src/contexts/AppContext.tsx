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
  chemicalBrand: string;
  chemicalBrandOther: string;
  chemicalFrequency: string;
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
  menstrualTracking: string;
  lastPeriodDate: string;
  menstrualCycleLength: string;
  hormonalContraception: string;
  goals: string[];
  hairProducts: string[];
  otherHairProduct: string;
  hairProductFrequency: string;
  scalpProductFrequency: string;
  // Male-specific fields
  norwoodBaseline: string;
  familyHistory: string;
  cutCadence: string;
}

export interface CheckInData {
  itch: string;
  tenderness: string;
  hairline: string;
  flaking?: string;
  shedding?: string;
  bumps?: string;
  dryness?: string;
  razorBumps?: string;
  barberIrritation?: string;
  hairFeel?: string;
  hairBreakage?: string;
  hairAppearance?: string;
  hairConcern?: string;
  newProducts?: string;
  newProductDetails?: string;
  type: 'mid-cycle' | 'wash-day' | 'baseline';
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
  photoAreas: string[];
  notes?: string;
  risk: 'green' | 'amber' | 'red';
  location?: string;
  locationCity?: string;
  service?: string;
  comparison?: string;
  clientType?: 'new' | 'returning';
}

export interface StylistLocation {
  id: string;
  name: string;
  city: string;
  isPrimary: boolean;
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
  location?: string;
  observations: string[];
  notes?: string;
  comparison?: string;
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
  sweat: '', exercise: '', heatStyling: '', satinCovering: '',
  medicalConditions: [], pregnancyStatus: '', medications: '', medicationDetails: '',
  lastBloodTest: '', bloodLevels: {}, skinConditions: [], skinConditionDetails: '',
  sensitiveSkin: '', recentStressors: [], previousHairLoss: '',
  diagnosedCondition: '', diagnosedConditionDetails: '', familyHistory: '',
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
  checkInHistory: CheckInData[];
  addToCheckInHistory: (c: CheckInData) => void;
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
  stylistLocations: StylistLocation[];
  setStylistLocations: (locs: StylistLocation[]) => void;
  addStylistLocation: (loc: StylistLocation) => void;
  removeStylistLocation: (id: string) => void;
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
  progressiveDismissed: Record<string, boolean>;
  dismissProgressivePrompt: (key: string) => void;
  resetAll: () => void;
}

const defaultOnboarding: OnboardingData = {
  gender: '', hairType: '', chemicalProcessing: '', lastChemicalTreatment: '',
  chemicalProcessingMultiple: [], chemicalBrand: '', chemicalBrandOther: '', chemicalFrequency: '',
  protectiveStyles: [], barberFrequency: '',
  locRetwistFrequency: '', maleStyleFrequency: '', otherStyle: '',
  protectiveStyleFrequency: '', isWornOutOnly: false, cycleLength: '',
  cycleLengthMin: '', cycleLengthMax: '', washFrequency: '',
  washFrequencyPerCycle: '', betweenWashCare: [], otherBetweenWashCare: '',
  wornOutWashFrequency: '', restyleFrequency: '', baselineItch: '',
  baselineTenderness: '', baselineHairline: '', baselineHairHealth: '',
  scalpProducts: [], otherProduct: '', productFrequency: '',
  menstrualTracking: '', lastPeriodDate: '', menstrualCycleLength: '',
  hormonalContraception: '', goals: [], hairProducts: [],
  otherHairProduct: '', hairProductFrequency: '', scalpProductFrequency: '',
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
  { id: 'co1', clientName: 'A.M.', date: 'Mar 5', observations: ['Thinning at hairline or edges', 'Signs of traction damage'], photos: ['Hairline / edges'], photoAreas: ['Hairline or temples'], notes: 'Recommended loosening edges on next install', risk: 'amber', location: 'Natural Touch Studio', locationCity: 'Lekki', service: 'Style installation (braids, cornrows, twists, etc.)', comparison: 'Worse than last time', clientType: 'returning' },
  { id: 'co2', clientName: 'T.K.', date: 'Mar 3', observations: ['General check, nothing concerning'], photos: [], photoAreas: [], risk: 'green', location: 'Natural Touch Studio', locationCity: 'Lekki', service: 'Wash', clientType: 'new' },
  { id: 'co3', clientName: 'S.J.', date: 'Feb 28', observations: ['Excessive flaking or buildup', 'Scalp redness or irritation'], photos: ['Crown / vertex'], photoAreas: ['Crown or vertex'], notes: 'Suggested anti-dandruff shampoo', risk: 'amber', location: 'Natural Touch Studio', locationCity: 'Lekki', service: 'Scalp treatment', comparison: 'About the same', clientType: 'returning' },
  { id: 'co4', clientName: 'R.B.', date: 'Feb 20', observations: ['Thinning at crown or vertex', 'Tender or sore areas'], photos: ['Crown / vertex', 'Hairline / edges'], photoAreas: ['Crown or vertex', 'Hairline or temples'], risk: 'red', location: 'Home Studio', locationCity: 'Ikeja', service: 'General consultation', clientType: 'new' },
];

const demoStylistObservations: StylistObservationEntry[] = [
  { id: 'so1', date: 'Feb 25', stylistName: 'Ama', location: 'Natural Touch Studio, Lekki', observations: ['Thinning at hairline or edges', 'Signs of traction damage'], notes: 'Stylist noted: slight thinning at temples. Recommended loosening edges on next install.', comparison: 'Worse than last time', risk: 'amber' },
  { id: 'so2', date: 'Feb 2', stylistName: 'Ama', location: 'Natural Touch Studio, Lekki', observations: ['General check, nothing concerning'], comparison: 'About the same', risk: 'green' },
];

const defaultStylistLocations: StylistLocation[] = [
  { id: 'loc1', name: 'Natural Touch Studio', city: 'Lekki', isPrimary: true },
  { id: 'loc2', name: 'Home Studio', city: 'Ikeja', isPrimary: false },
];

// Demo check-in history for triage comparison
const demoCheckInHistory: CheckInData[] = [
  { itch: 'Mild', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Apr 2' },
  { itch: 'Moderate', tenderness: 'A little', hairline: 'Looks a bit thinner', flaking: 'Some flaking', shedding: 'More than usual', type: 'wash-day', date: 'Mar 18' },
  { itch: 'Mild', tenderness: 'None', hairline: 'No change', flaking: 'None', shedding: 'Normal', type: 'wash-day', date: 'Feb 20' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInData | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInData[]>(demoCheckInHistory);
  const [riskOverride, setRiskOverride] = useState<'green' | 'amber' | 'red' | null>(null);
  const [stylistMode, setStylistMode] = useState(false);
  const [salonVisits, setSalonVisits] = useState<SalonVisit[]>(demoSalonVisits);
  const [clientObservations, setClientObservations] = useState<ClientObservation[]>(demoClientObservations);
  const [stylistLocations, setStylistLocations] = useState<StylistLocation[]>(defaultStylistLocations);
  const [healthProfile, setHealthProfile] = useState<HealthProfileData>(defaultHealthProfile);
  const [baselinePhotos, setBaselinePhotos] = useState<BaselinePhoto[]>([]);
  const [baselineRisk, setBaselineRisk] = useState<'green' | 'amber' | 'red' | null>(null);
  const [baselineDate, setBaselineDate] = useState<string | null>(null);
  const [quickLogs, setQuickLogs] = useState<QuickLogEntry[]>([]);
  const [research, setResearch] = useState<ResearchData>({ consented: false, consentDate: null, photoCount: 0, dismissed: false });
  const [checkInCount, setCheckInCount] = useState(3);
  const [progressiveDismissed, setProgressiveDismissed] = useState<Record<string, boolean>>({});

  const addSalonVisit = (v: SalonVisit) => setSalonVisits(prev => [v, ...prev]);
  const addClientObservation = (o: ClientObservation) => setClientObservations(prev => [o, ...prev]);
  const addQuickLog = (entry: QuickLogEntry) => setQuickLogs(prev => [entry, ...prev]);
  const addStylistLocation = (loc: StylistLocation) => setStylistLocations(prev => [...prev, loc]);
  const removeStylistLocation = (id: string) => setStylistLocations(prev => prev.filter(l => l.id !== id));
  const incrementResearchPhotos = () => setResearch(prev => ({ ...prev, photoCount: prev.photoCount + 1 }));
  const addToCheckInHistory = (c: CheckInData) => setCheckInHistory(prev => [c, ...prev]);
  const dismissProgressivePrompt = (key: string) => setProgressiveDismissed(prev => ({ ...prev, [key]: true }));

  const resetAll = () => {
    setUserName('');
    setOnboardingComplete(false);
    setOnboardingData(defaultOnboarding);
    setCurrentCheckIn(null);
    setCheckInHistory([]);
    setRiskOverride(null);
    setStylistMode(false);
    setSalonVisits(demoSalonVisits);
    setClientObservations(demoClientObservations);
    setStylistLocations(defaultStylistLocations);
    setHealthProfile(defaultHealthProfile);
    setBaselinePhotos([]);
    setBaselineRisk(null);
    setBaselineDate(null);
    setQuickLogs([]);
    setResearch({ consented: false, consentDate: null, photoCount: 0, dismissed: false });
    setCheckInCount(0);
    setProgressiveDismissed({});
  };

  return (
    <AppContext.Provider value={{
      userName, setUserName,
      onboardingComplete, setOnboardingComplete,
      onboardingData, setOnboardingData,
      currentCheckIn, setCurrentCheckIn,
      checkInHistory, addToCheckInHistory,
      history: demoHistory,
      salonVisits, addSalonVisit,
      riskOverride, setRiskOverride,
      stylistMode, setStylistMode,
      clientObservations, addClientObservation,
      stylistObservations: demoStylistObservations,
      stylistLocations, setStylistLocations, addStylistLocation, removeStylistLocation,
      healthProfile, setHealthProfile,
      baselinePhotos, setBaselinePhotos,
      baselineRisk, setBaselineRisk,
      baselineDate, setBaselineDate,
      quickLogs, addQuickLog,
      research, setResearch, incrementResearchPhotos,
      checkInCount, setCheckInCount,
      progressiveDismissed, dismissProgressivePrompt,
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
