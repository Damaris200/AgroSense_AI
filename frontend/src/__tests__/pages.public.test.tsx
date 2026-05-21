import type { ReactElement } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
const mockUseTheme = vi.fn();
const mockUseLoginForm = vi.fn();
const mockUseRegisterForm = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock('@/hooks/useLoginForm', () => ({
  useLoginForm: () => mockUseLoginForm(),
}));

vi.mock('@/hooks/useRegisterForm', () => ({
  useRegisterForm: () => mockUseRegisterForm(),
}));

import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

const baseForm = {
  register: vi.fn(() => ({})),
};

beforeEach(() => {
  mockUseTheme.mockReturnValue({
    isDark: false,
    theme: 'light',
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  });
  mockUseAuth.mockReturnValue({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    setSession: vi.fn(),
    logout: vi.fn(),
  });
  mockUseLoginForm.mockReturnValue({
    form: baseForm,
    onSubmit: vi.fn((event: Event) => event.preventDefault()),
    apiError: '',
    showPassword: false,
    togglePassword: vi.fn(),
    onPasskeySignIn: vi.fn(),
    isPasskeySubmitting: false,
    isPasskeySupported: true,
    isSubmitting: false,
    errors: {},
  });
  mockUseRegisterForm.mockReturnValue({
    form: baseForm,
    onSubmit: vi.fn((event: Event) => event.preventDefault()),
    apiError: '',
    showPassword: false,
    togglePassword: vi.fn(),
    passwordValue: 'Password1!',
    isSubmitting: false,
    errors: {},
  });
});

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Public pages', () => {
  it('renders the home page hero and CTA links', () => {
    renderWithRouter(<HomePage />);

    expect(screen.getByRole('link', { name: /AgroSense AI home/i })).toBeInTheDocument();
    expect(screen.getByText('Smart Decisions for Every Farm')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Get Started/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Sign In/i }).length).toBeGreaterThan(0);
  });

  it('renders the login form with a disabled passkey button when unsupported', () => {
    mockUseLoginForm.mockReturnValue({
      form: baseForm,
      onSubmit: vi.fn((event: Event) => event.preventDefault()),
      apiError: 'Invalid credentials.',
      showPassword: false,
      togglePassword: vi.fn(),
      onPasskeySignIn: vi.fn(),
      isPasskeySubmitting: false,
      isPasskeySupported: false,
      isSubmitting: false,
      errors: {},
    });

    renderWithRouter(<LoginPage />);

    expect(screen.getByText('Sign in to AgroSense AI')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Passkey/i })).toBeDisabled();
  });

  it('renders the register form fields and primary action', () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByText('Create your AgroSense account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });
});
