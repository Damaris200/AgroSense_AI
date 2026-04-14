import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Protected routes — dashboard and beyond will be added as services are built */}
      <Route element={<ProtectedRoute />}>
        {/* e.g. <Route path="/dashboard" element={<DashboardPage />} /> */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
