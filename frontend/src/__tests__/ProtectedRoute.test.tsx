import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderRoute(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading spinner while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    renderRoute();

    expect(screen.getByText('Loading your dashboard...')).toBeDefined();
    expect(screen.queryByText('Dashboard Content')).toBeNull();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderRoute();

    expect(screen.getByText('Login Page')).toBeDefined();
    expect(screen.queryByText('Dashboard Content')).toBeNull();
  });

  it('renders the protected child route when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderRoute();

    expect(screen.getByText('Dashboard Content')).toBeDefined();
    expect(screen.queryByText('Login Page')).toBeNull();
    expect(screen.queryByText('Loading your dashboard...')).toBeNull();
  });

  it('renders Outlet content (not Login) after auth resolves to authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderRoute();

    expect(screen.queryByText('Login Page')).toBeNull();
  });
});
