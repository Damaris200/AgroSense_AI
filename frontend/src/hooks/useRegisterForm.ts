import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import { api, extractApiError, type ApiEnvelope } from '../services/auth.service';
import type { AuthResponse, AuthUser, Locale } from '../types/auth';

// ── Schema ────────────────────────────────────────────────────────────────────

const phonePattern = /^\+?[1-9]\d{7,14}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || phonePattern.test(value.replace(/[\s-]/g, '')),
      { message: 'Use international format e.g. +2348012345678' },
    ),
  locale: z.enum(['en', 'fr']),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/\d/, 'Must contain at least one number'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizePhone(phone?: string) {
  return phone?.replace(/[\s-]/g, '') || undefined;
}

function mapRegisterError(error: unknown): string {
  const message = extractApiError(error, 'Unable to create your account right now.');
  if (message.toLowerCase().includes('already')) return 'Email already registered.';
  return message;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRegisterForm() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', locale: 'en', password: '' },
    mode: 'onBlur',
  });

  // Expose live password value so PasswordStrength can read it
  const passwordValue = useWatch({ control: form.control, name: 'password', defaultValue: '' });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError('');
    try {
      const payload = { ...values, phone: normalizePhone(values.phone), locale: values.locale as Locale };

      const registerRes = await api.post<ApiEnvelope<{ user: AuthUser; token?: string }>>(
        '/api/auth/register',
        payload,
      );

      const session = registerRes.data.data;

      if (session.token) {
        setSession({ user: session.user, token: session.token });
      } else {
        // Backend returned user but no token — log in automatically
        const loginRes = await api.post<ApiEnvelope<AuthResponse>>('/api/auth/login', {
          email: values.email,
          password: values.password,
        });
        setSession(loginRes.data.data);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(mapRegisterError(error));
    }
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    form,
    onSubmit,
    apiError,
    showPassword,
    togglePassword,
    passwordValue,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}
