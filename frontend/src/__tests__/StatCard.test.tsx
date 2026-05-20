import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Leaf } from 'lucide-react';

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

import { StatCard } from '../components/dashboard/StatCard';

describe('StatCard (light mode)', () => {
  it('renders the label text', () => {
    render(<StatCard label="Total Farms" value={42} icon={<Leaf />} />);
    expect(screen.getByText('Total Farms')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<StatCard label="Total Farms" value={42} icon={<Leaf />} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<StatCard label="Status" value="Active" icon={<Leaf />} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the sub text when provided', () => {
    render(<StatCard label="Total Farms" value={42} icon={<Leaf />} sub="All time" />);
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('does not render sub text when omitted', () => {
    render(<StatCard label="Total Farms" value={42} icon={<Leaf />} />);
    expect(screen.queryByText('All time')).toBeNull();
  });

  it('renders value 0 correctly', () => {
    render(<StatCard label="Events" value={0} icon={<Leaf />} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('StatCard (dark mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock('../context/ThemeContext', () => ({
      useTheme: () => ({ isDark: true }),
    }));
  });

  it('still renders label and value in dark mode', async () => {
    const { StatCard: DarkStatCard } = await import('../components/dashboard/StatCard');
    render(<DarkStatCard label="Notifications" value={5} icon={<Leaf />} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
