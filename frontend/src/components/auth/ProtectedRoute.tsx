import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f3f8f2_0%,#ffffff_55%,#ecfdf5_100%)] px-4">
        <div className="rounded-3xl border border-emerald-100 bg-white px-6 py-5 text-center shadow-lg">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-r-transparent" />
          <p className="mt-4 text-sm font-medium text-zinc-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
