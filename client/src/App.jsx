import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Builder from './pages/Builder.jsx';
import Analyzer from './pages/Analyzer.jsx';
import AnalysisDetail from './pages/AnalysisDetail.jsx';
import CoverLetters from './pages/CoverLetters.jsx';
import Templates from './pages/Templates.jsx';
import Settings from './pages/Settings.jsx';
import Spinner from './components/Spinner.jsx';

function Protected({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <Spinner full label="Loading your workspace…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/builder" element={<Protected><Builder /></Protected>} />
      <Route path="/builder/:id" element={<Protected><Builder /></Protected>} />
      <Route path="/analyzer" element={<Protected><Analyzer /></Protected>} />
      <Route path="/analyzer/history" element={<Protected><Analyzer /></Protected>} />
      <Route path="/analyzer/:id" element={<Protected><AnalysisDetail /></Protected>} />
      <Route path="/coverletters" element={<Protected><CoverLetters /></Protected>} />
      <Route path="/templates" element={<Protected><Templates /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
