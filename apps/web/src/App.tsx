import { Route, Routes } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={null} />
      <Route path="/reset-password" element={null} />
      <Route path="/dashboard" element={null} />
    </Routes>
  );
}
