import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrength } from '../components/auth/PasswordStrength';

describe('PasswordStrength', () => {
  it('shows "Enter a password" when value is empty', () => {
    render(<PasswordStrength value="" />);
    expect(screen.getByText('Enter a password')).toBeInTheDocument();
  });

  it('shows "Weak" when only length criterion is met', () => {
    // Length >= 8, no uppercase, no digit, no special → score 1
    render(<PasswordStrength value="passwordlong" />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('shows "Fair" when length and uppercase are met', () => {
    // Length >= 8, uppercase, no digit, no special → score 2
    render(<PasswordStrength value="Password" />);
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('shows "Good" when length, uppercase and digit are met', () => {
    // Length >= 8, uppercase, digit, no special → score 3
    render(<PasswordStrength value="Password1" />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows "Strong" when all four criteria are met', () => {
    // Length >= 8, uppercase, digit, special → score 4
    render(<PasswordStrength value="Password1!" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('renders four indicator bars', () => {
    const { container } = render(<PasswordStrength value="" />);
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    expect(bars.length).toBe(4);
  });

  it('has no active bars for an empty password', () => {
    const { container } = render(<PasswordStrength value="" />);
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    bars.forEach((bar) => {
      expect(bar.className).toContain('bg-zinc-200');
    });
  });

  it('activates bars proportional to score', () => {
    const { container } = render(<PasswordStrength value="Password1" />);
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    const activeBars = Array.from(bars).filter((b) => !b.className.includes('bg-zinc-200'));
    expect(activeBars.length).toBe(3);
  });
});
