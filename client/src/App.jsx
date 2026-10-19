import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Builder from "./pages/Builder.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import AnalysisDetail from "./pages/AnalysisDetail.jsx";
import CoverLetters from "./pages/CoverLetters.jsx";
import Templates from "./pages/Templates.jsx";
import Settings from "./pages/Settings.jsx";
import Spinner from "./components/Spinner.jsx";

function Protected({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <Spinner full label="Loading your workspace…" />;
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  // Only /login <-> /register get the swipe transition; everything else
  // keeps the previous instant behavior (shared key, no exit animation).
  const isAuthSwitch =
    location.pathname === "/login" || location.pathname === "/register";
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isAuthSwitch ? location.pathname : "main"}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/builder"
            element={
              <Protected>
                <Builder />
              </Protected>
            }
          />
          <Route
            path="/builder/:id"
            element={
              <Protected>
                <Builder />
              </Protected>
            }
          />
          <Route
            path="/analyzer"
            element={
              <Protected>
                <Analyzer />
              </Protected>
            }
          />
          <Route
            path="/analyzer/history"
            element={
              <Protected>
                <Analyzer />
              </Protected>
            }
          />
          <Route
            path="/analyzer/:id"
            element={
              <Protected>
                <AnalysisDetail />
              </Protected>
            }
          />
          <Route
            path="/coverletters"
            element={
              <Protected>
                <CoverLetters />
              </Protected>
            }
          />
          <Route
            path="/templates"
            element={
              <Protected>
                <Templates />
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppRoutes />
    </MotionConfig>
  );
}
