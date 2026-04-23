import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import { api, extractApiError, type ApiEnvelope } from '../services/auth.service';
import type { AuthResponse } from '../types/auth';
import {
  enablePasskeyForSession,
  hasPasskeyCredential,
  isPasskeySupported,
  signInWithPasskey,
} from '../utils/passkey';

// ── Schema ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLoginForm() {
  const navigate = useNavigate();
  const { setSession, logout } = useAuth();

  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasskeySubmitting, setIsPasskeySubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError('');
    try {
      const res = await api.post<ApiEnvelope<AuthResponse>>('/api/auth/login', values);
      const session = res.data.data;
      setSession(session);

      if (isPasskeySupported() && !hasPasskeyCredential()) {
        const shouldEnable = window.confirm(
          'Enable passkey sign-in on this device? This lets you sign in with fingerprint/face next time.',
        );

        if (shouldEnable) {
          const result = await enablePasskeyForSession(session);
          if (!result.enabled) {
            setApiError(result.message);
          }
        }
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(extractApiError(error, 'Unable to sign in right now.'));
    }
  });

  async function onPasskeySignIn() {
    setApiError('');
    setIsPasskeySubmitting(true);

    try {
      const session = await signInWithPasskey();
      setSession(session);

      const meRes = await api.get<ApiEnvelope<{ user: AuthResponse['user'] }>>('/api/auth/me');
      setSession({ user: meRes.data.data.user, token: session.token });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      logout();
      setApiError(extractApiError(error, 'Passkey sign-in failed. Use email and password.'));
    } finally {
      setIsPasskeySubmitting(false);
    }
  }

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    form,
    onSubmit,
    apiError,
    showPassword,
    togglePassword,
    onPasskeySignIn,
    isPasskeySubmitting,
    isPasskeySupported: isPasskeySupported(),
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}
