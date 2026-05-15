import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Landing   from './pages/Landing.jsx';
import Login     from './pages/Login.jsx';
import Register  from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About     from './pages/About.jsx';

// Redirects unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

// Redirects already-logged-in users to /dashboard
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/about"    element={<About />} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}
