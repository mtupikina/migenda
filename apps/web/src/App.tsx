import { Route, Routes } from 'react-router-dom';

import { CreateAccountPage } from './pages/CreateAccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordConfirmPage } from './pages/ResetPasswordConfirmPage';
import { AppRouteStubPage } from './pages/AppRouteStubPage';
import { LogoutPage } from './pages/LogoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/get-started" element={null} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/confirm" element={<ResetPasswordConfirmPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/search" element={<AppRouteStubPage />} />
      <Route path="/reports" element={<AppRouteStubPage />} />
      <Route path="/team" element={<AppRouteStubPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
