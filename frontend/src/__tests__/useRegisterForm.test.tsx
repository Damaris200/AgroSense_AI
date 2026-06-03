import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockSetSession = vi.fn();
const mockPost = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    setSession: mockSetSession,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
  extractApiError: () => 'Unable to create your account right now.',
}));

import { useRegisterForm } from '@/hooks/useRegisterForm';

function wrapper({ children }: { readonly children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useRegisterForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetSession.mockReset();
    mockPost.mockReset();
  });

  it('uses registration token when backend returns token', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          user: { id: 'u-1', role: 'farmer' },
          token: 'register-token',
        },
      },
    });

    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    act(() => {
      result.current.form.setValue('name', 'Farmer Jane');
      result.current.form.setValue('email', 'farmer@example.com');
      result.current.form.setValue('phone', '+237600000000');
      result.current.form.setValue('locale', 'en');
      result.current.form.setValue('password', 'Password9');
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault() {}, persist() {} } as unknown as Event);
    });

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith({
        user: { id: 'u-1', role: 'farmer' },
        token: 'register-token',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('falls back to login endpoint when register response has no token', async () => {
    mockPost
      .mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 'u-2', role: 'farmer' },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 'u-2', role: 'farmer' },
            token: 'login-token',
          },
        },
      });

    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    act(() => {
      result.current.form.setValue('name', 'Farmer Jane');
      result.current.form.setValue('email', 'farmer@example.com');
      result.current.form.setValue('phone', '+237600000000');
      result.current.form.setValue('locale', 'en');
      result.current.form.setValue('password', 'Password9');
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault() {}, persist() {} } as unknown as Event);
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(mockSetSession).toHaveBeenCalledWith({
        user: { id: 'u-2', role: 'farmer' },
        token: 'login-token',
      });
    });
  });
});
