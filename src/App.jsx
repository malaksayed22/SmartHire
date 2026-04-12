import {
  HashRouter as BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Chatbot from "./components/Chatbot";

// Public
import Landing from "./pages/public/Landing";
import JobBoard from "./pages/public/JobBoard";
import JobDetail from "./pages/public/JobDetail";
import Features from "./pages/public/Features";
import HowItWorks from "./pages/public/HowItWorks";

// Candidate
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateSignup from "./pages/candidate/CandidateSignup";
import CandidatePortal from "./pages/candidate/CandidatePortal";

// HR
import HRLogin from "./pages/hr/HRLogin";
import HRSignup from "./pages/hr/HRSignup";
import HRDashboard from "./pages/hr/HRDashboard";
import HRCandidates from "./pages/hr/HRCandidates";
import CandidateDetail from "./pages/hr/CandidateDetail";
import HRJobs from "./pages/hr/HRJobs";
import HRAutomations from "./pages/hr/HRAutomations";
import HRAnalytics from "./pages/hr/HRAnalytics";

function HRGuard({ children }) {
  const { hrUser } = useAuth();
  return hrUser ? children : <Navigate to="/hr/login" replace />;
}

function CandidateGuard({ children }) {
  const { candidateUser } = useAuth();
  return candidateUser ? children : <Navigate to="/candidate/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Candidate */}
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/signup" element={<CandidateSignup />} />
          <Route
            path="/candidate/portal"
            element={
              <CandidateGuard>
                <CandidatePortal />
              </CandidateGuard>
            }
          />

          {/* HR */}
          <Route path="/hr/login" element={<HRLogin />} />
          <Route path="/hr/signup" element={<HRSignup />} />
          <Route
            path="/hr/dashboard"
            element={
              <HRGuard>
                <HRDashboard />
              </HRGuard>
            }
          />
          <Route
            path="/hr/analytics"
            element={
              <HRGuard>
                <HRAnalytics />
              </HRGuard>
            }
          />
          <Route
            path="/hr/candidates"
            element={
              <HRGuard>
                <HRCandidates />
              </HRGuard>
            }
          />
          <Route
            path="/hr/candidates/:id"
            element={
              <HRGuard>
                <CandidateDetail />
              </HRGuard>
            }
          />
          <Route
            path="/hr/jobs"
            element={
              <HRGuard>
                <HRJobs />
              </HRGuard>
            }
          />
          <Route
            path="/hr/automations"
            element={
              <HRGuard>
                <HRAutomations />
              </HRGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}
