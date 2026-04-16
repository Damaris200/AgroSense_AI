import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import { api, extractApiError, type ApiEnvelope } from '../services/auth.service';
import type { AuthResponse } from '../types/auth';

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
  const { setSession } = useAuth();

  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError('');
    try {
      const res = await api.post<ApiEnvelope<AuthResponse>>('/api/auth/login', values);
      setSession(res.data.data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(extractApiError(error, 'Unable to sign in right now.'));
    }
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    form,
    onSubmit,
    apiError,
    showPassword,
    togglePassword,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}
