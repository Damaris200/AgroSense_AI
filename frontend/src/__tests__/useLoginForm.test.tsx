import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockSetSession = vi.fn();
const mockLogout = vi.fn();
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockSignInWithPasskey = vi.fn();

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
    logout: mockLogout,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
  extractApiError: () => 'Unable to sign in right now.',
}));

vi.mock('@/utils/passkey', () => ({
  enablePasskeyForSession: vi.fn(async () => ({ enabled: true })),
  hasPasskeyCredential: vi.fn(() => true),
  isPasskeySupported: vi.fn(() => true),
  signInWithPasskey: (...args: unknown[]) => mockSignInWithPasskey(...args),
}));

import { useLoginForm } from '@/hooks/useLoginForm';

function wrapper({ children }: { readonly children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useLoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetSession.mockReset();
    mockLogout.mockReset();
    mockPost.mockReset();
    mockGet.mockReset();
    mockSignInWithPasskey.mockReset();
    vi.stubGlobal('confirm', vi.fn(() => false));
  });

  it('navigates admin users to /admin on successful password login', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          user: { role: 'admin' },
          token: 'token-1',
        },
      },
    });

    const { result } = renderHook(() => useLoginForm(), { wrapper });

    act(() => {
      result.current.form.setValue('email', 'admin@example.com');
      result.current.form.setValue('password', 'Password9');
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault() {}, persist() {} } as unknown as Event);
    });

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('routes passkey sign in to farmer dashboard', async () => {
    mockSignInWithPasskey.mockResolvedValueOnce({ user: { role: 'farmer' }, token: 'passkey-token' });
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          user: { role: 'farmer' },
        },
      },
    });

    const { result } = renderHook(() => useLoginForm(), { wrapper });

    await act(async () => {
      await result.current.onPasskeySignIn();
    });

    expect(mockSetSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});
