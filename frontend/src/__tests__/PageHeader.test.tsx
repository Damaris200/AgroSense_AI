import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

import { PageHeader } from '@/components/dashboard/PageHeader';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="User Management" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Management');
  });

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="Dashboard" subtitle="Overview of your farms" />);
    expect(screen.getByText('Overview of your farms')).toBeInTheDocument();
  });

  it('does not render a subtitle element when omitted', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText('Overview of your farms')).toBeNull();
  });

  it('renders the action element when provided', () => {
    render(<PageHeader title="Farms" action={<button type="button">New Farm</button>} />);
    expect(screen.getByRole('button', { name: 'New Farm' })).toBeInTheDocument();
  });

  it('does not render action area when omitted', () => {
    render(<PageHeader title="Farms" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
