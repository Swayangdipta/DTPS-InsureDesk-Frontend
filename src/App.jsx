import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

import Layout        from '@/components/layout/Layout';
import LoginPage     from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PoliciesPage  from '@/pages/PoliciesPage';
import PolicyDetailPage from '@/pages/PolicyDetailPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import CalendarPage  from '@/pages/CalendarPage';
import RenewalsPage  from '@/pages/RenewalsPage';
import SettingsPage  from '@/pages/SettingsPage';

// ── Protected route wrapper ───────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

// ── Public route wrapper (redirect if already logged in) ──
const PublicRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <>
      {/* Watermark & sunrise glow — behind everything */}
      <div className="watermark"  aria-hidden="true" />
      <div className="sunrise-glow" aria-hidden="true" />

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={<PublicRoute><LoginPage /></PublicRoute>}
        />

        {/* Protected — all wrapped in the sidebar layout */}
        <Route
          path="/"
          element={<ProtectedRoute><Layout /></ProtectedRoute>}
        >
          <Route index               element={<DashboardPage />} />
          <Route path="policies"     element={<PoliciesPage />} />
          <Route path="policies/:id" element={<PolicyDetailPage />} />
          <Route path="analytics"    element={<AnalyticsPage />} />
          <Route path="calendar"     element={<CalendarPage />} />
          <Route path="renewals"     element={<RenewalsPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
