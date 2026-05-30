import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import BalancePage from './pages/BalancePage';
import SettingsPage from './pages/SettingsPage';
import SetupPage from './pages/SetupPage';

export default function App() {
  const { configured, loading, firebaseUser, profile } = useApp();

  if (!configured) return <SetupPage />;
  if (loading) return <div className="screen center">載入中…</div>;

  if (!firebaseUser) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (!profile?.spaceId) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
