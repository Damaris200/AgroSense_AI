import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { FarmerOverviewPage } from './pages/dashboard/FarmerOverviewPage';
import { FarmerFarmsPage } from './pages/dashboard/FarmerFarmsPage';
import { FarmerWeatherPage } from './pages/dashboard/FarmerWeatherPage';
import { FarmerSoilPage } from './pages/dashboard/FarmerSoilPage';
import { FarmerRecommendationsPage } from './pages/dashboard/FarmerRecommendationsPage';
import { FarmerNotificationsPage } from './pages/dashboard/FarmerNotificationsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Protected routes — dashboard and farmer/admin pages */}
      <Route element={<ProtectedRoute />}>
        {/* Farmer dashboard routes */}
        <Route path="/dashboard" element={<FarmerOverviewPage />} />
        <Route path="/dashboard/farms" element={<FarmerFarmsPage />} />
        <Route path="/dashboard/weather" element={<FarmerWeatherPage />} />
        <Route path="/dashboard/soil" element={<FarmerSoilPage />} />
        <Route path="/dashboard/recommendations" element={<FarmerRecommendationsPage />} />
        <Route path="/dashboard/notifications" element={<FarmerNotificationsPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
