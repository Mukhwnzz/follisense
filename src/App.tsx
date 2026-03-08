import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Onboarding from "./pages/Onboarding";
import BaselineResponse from "./pages/BaselineResponse";
import HomePage from "./pages/HomePage";
import MidCycleCheckIn from "./pages/MidCycleCheckIn";
import WashDayAssessment from "./pages/WashDayAssessment";
import RiskOutput from "./pages/RiskOutput";
import ClinicianSummary from "./pages/ClinicianSummary";
import HealthProfile from "./pages/HealthProfile";
import HistoryPage from "./pages/HistoryPage";
import LearnPage from "./pages/LearnPage";
import ProfilePage from "./pages/ProfilePage";
import StylistHome from "./pages/StylistHome";
import StylistObservation from "./pages/StylistObservation";
import StylistClients from "./pages/StylistClients";
import StylistSignUpPage from "./pages/StylistSignUpPage";
import StylistLoginPage from "./pages/StylistLoginPage";
import StylistOnboarding from "./pages/StylistOnboarding";
import StylistProfilePage from "./pages/StylistProfilePage";
import ChatPage from "./pages/ChatPage";
import ProductDirectory from "./pages/ProductDirectory";
import ResearchProgramme from "./pages/ResearchProgramme";
import FindSpecialist from "./pages/FindSpecialist";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MyRoutine from "./pages/MyRoutine";
import StylistLearnPage from "./pages/StylistLearnPage";
import ScalpQuiz from "./pages/ScalpQuiz";
import SalonCheckIn from "./pages/SalonCheckIn";
import StylistQuickIntake from "./pages/StylistQuickIntake";
import SpotIt from "./pages/SpotIt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/baseline-response" element={<BaselineResponse />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/my-routine" element={<MyRoutine />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/mid-cycle" element={<MidCycleCheckIn />} />
              <Route path="/wash-day" element={<WashDayAssessment />} />
              <Route path="/results" element={<RiskOutput />} />
              <Route path="/clinician-summary" element={<ClinicianSummary />} />
              <Route path="/health-profile" element={<HealthProfile />} />
              <Route path="/products" element={<ProductDirectory />} />
              <Route path="/research" element={<ResearchProgramme />} />
              <Route path="/find-specialist" element={<FindSpecialist />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/spot-it" element={<SpotIt />} />
              <Route path="/salon-checkin" element={<SalonCheckIn />} />
              <Route path="/stylist/signup" element={<StylistSignUpPage />} />
              <Route path="/stylist/login" element={<StylistLoginPage />} />
              <Route path="/stylist/onboarding" element={<StylistOnboarding />} />
              <Route path="/stylist" element={<StylistHome />} />
              <Route path="/stylist/learn" element={<StylistLearnPage />} />
              <Route path="/stylist/observation" element={<StylistObservation />} />
              <Route path="/stylist/quiz" element={<ScalpQuiz />} />
              <Route path="/stylist/quick-intake" element={<StylistQuickIntake />} />
              <Route path="/stylist/clients" element={<StylistClients />} />
              <Route path="/stylist/profile" element={<StylistProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
