import { Route, Routes } from 'react-router-dom';

import { ScheduleViewingLayout } from './components/ScheduleViewingLayout';
import { CalendarPage } from './pages/CalendarPage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratedReportPage } from './pages/GeneratedReportPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordConfirmPage } from './pages/ResetPasswordConfirmPage';
import { SearchPage } from './pages/SearchPage';
import { TeamPage } from './pages/TeamPage';
import { LogoutPage } from './pages/LogoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/confirm" element={<ResetPasswordConfirmPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route element={<ScheduleViewingLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar/day/:date" element={<CalendarPage view="day" />} />
        <Route path="/calendar/week/:date" element={<CalendarPage view="week" />} />
        <Route path="/calendar/month/:date" element={<CalendarPage view="month" />} />
      </Route>
      <Route path="/search" element={<SearchPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/reports/generated" element={<GeneratedReportPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
