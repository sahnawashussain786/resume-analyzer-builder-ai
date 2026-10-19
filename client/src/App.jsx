import { useRef } from "react";
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

// /login and /register slide like pages on a horizontal wheel:
// login -> register pushes content left (new page enters from the right),
// register -> login slides it back to the right (new page enters from left).
const AUTH_PAGE_ORDER = { "/login": 0, "/register": 1 };

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
  center: { x: "0%" },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
};

function AppRoutes() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Capture the navigation direction at the moment the route changes.
  // Going to /register slides everything left (+1); to /login, right (-1).
  const prevPathRef = useRef(null);
  const directionRef = useRef(1);
  if (prevPathRef.current !== location.pathname) {
    directionRef.current = AUTH_PAGE_ORDER[location.pathname] === 1 ? 1 : -1;
    prevPathRef.current = location.pathname;
  }
  const direction = directionRef.current;

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={isAuthPage ? location.pathname : "main"}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
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
