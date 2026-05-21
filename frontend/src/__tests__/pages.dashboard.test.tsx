import type { ReactElement } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock('@/services/admin.service', () => ({
  getUserOverview: vi.fn(),
  getAdminOverview: vi.fn(),
  getAdminUsers: vi.fn(),
  setAdminUserActive: vi.fn(),
  getAdminNotifications: vi.fn(),
}));

vi.mock('@/services/farm.service', () => ({
  getMyFarms: vi.fn(),
  submitFarm: vi.fn(),
}));

vi.mock('@/services/weather.service', () => ({
  getWeatherForFarm: vi.fn(),
}));

vi.mock('@/services/soil.service', () => ({
  getSoilForFarm: vi.fn(),
}));

vi.mock('@/services/recommendation.service', () => ({
  getMyRecommendations: vi.fn(),
}));

vi.mock('@/services/notification.service', () => ({
  getMyNotifications: vi.fn(),
}));

vi.mock('@/services/profile.service', () => ({
  updateProfileRequest: vi.fn(),
}));

import {
  getAdminNotifications,
  getAdminOverview,
  getAdminUsers,
  getUserOverview,
  setAdminUserActive,
} from '@/services/admin.service';
import { getMyFarms, submitFarm } from '@/services/farm.service';
import { getWeatherForFarm } from '@/services/weather.service';
import { getSoilForFarm } from '@/services/soil.service';
import { getMyRecommendations } from '@/services/recommendation.service';
import { getMyNotifications } from '@/services/notification.service';
import { updateProfileRequest } from '@/services/profile.service';

import { FarmerOverviewPage } from '@/pages/dashboard/FarmerOverviewPage';
import { FarmerFarmsPage } from '@/pages/dashboard/FarmerFarmsPage';
import { FarmerWeatherPage } from '@/pages/dashboard/FarmerWeatherPage';
import { FarmerSoilPage } from '@/pages/dashboard/FarmerSoilPage';
import { FarmerRecommendationsPage } from '@/pages/dashboard/FarmerRecommendationsPage';
import { FarmerNotificationsPage } from '@/pages/dashboard/FarmerNotificationsPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';

const baseUser = {
  id:        'user-1',
  name:      'Farmer Jane',
  email:     'farmer@example.com',
  role:      'farmer'  as const,
  phone:     '+2348012345678',
  locale:    'en'      as const,
  isActive:  true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  mockUseTheme.mockReturnValue({
    isDark: false,
    theme: 'light',
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  });
  mockUseAuth.mockReturnValue({
    user: baseUser,
    token: 'token-123',
    isAuthenticated: true,
    isLoading: false,
    setSession: vi.fn(),
    logout: vi.fn(),
  });

  vi.mocked(getUserOverview).mockResolvedValue({
    stats: {
      farmsRegistered: 2,
      analysesRun: 3,
      recommendations: 1,
      notificationsSent: 4,
    },
    recentActivity: [
      {
        id: 'activity-1',
        type: 'farm',
        text: 'Submitted North Field',
        timestamp: '2026-01-01T08:00:00.000Z',
      },
    ],
  });

  vi.mocked(getMyFarms).mockResolvedValue([
    {
      id: 'farm-1',
      submissionId: 'sub-1',
      userId: 'user-1',
      name: 'North Field',
      cropType: 'Maize',
      location: 'Yaounde',
      gpsLat: 3.8,
      gpsLng: 11.5,
      createdAt: '2026-01-01T08:00:00.000Z',
    },
  ]);

  vi.mocked(getWeatherForFarm).mockResolvedValue([
    {
      id: 'weather-1',
      farmId: 'farm-1',
      temperature: 28.2,
      humidity: 55,
      rainfall: 1.2,
      windSpeed: 3.4,
      description: 'Sunny intervals',
      fetchedAt: '2026-01-02T08:00:00.000Z',
    },
  ]);

  vi.mocked(getSoilForFarm).mockResolvedValue([
    {
      id: 'soil-1',
      farmId: 'farm-1',
      ph: 6.2,
      moisture: 48,
      nitrogen: 180,
      phosphorus: 60,
      potassium: 210,
      analyzedAt: '2026-01-02T08:00:00.000Z',
    },
  ]);

  vi.mocked(getMyRecommendations).mockResolvedValue([
    {
      id: 'rec-1',
      farmId: 'farm-1',
      userId: 'user-1',
      submissionId: 'sub-1',
      content: 'This is a long recommendation message that exceeds one hundred and sixty characters to ensure the read more toggle appears for the farmer dashboard recommendations view.',
      model: 'ft-gpt-4.1-mini',
      generatedAt: '2026-01-02T08:00:00.000Z',
    },
  ]);

  vi.mocked(getMyNotifications).mockResolvedValue([
    {
      id: 'notif-1',
      userId: 'user-1',
      farmId: 'farm-1',
      message: 'Recommendation ready for North Field',
      channel: 'email',
      sentAt: '2026-01-03T08:00:00.000Z',
    },
  ]);

  vi.mocked(getAdminOverview).mockResolvedValue({
    stats: {
      totalUsers: 12,
      totalFarms: 4,
      notificationsSent: 20,
      eventsProcessed: 120,
    },
    services: [
      { name: 'api-gateway', status: 'healthy' },
      { name: 'ai-service', status: 'degraded' },
    ],
    recentEvents: [
      {
        id: 'evt-1',
        eventType: 'farm.submitted',
        submissionId: 'sub-1',
        loggedAt: '2026-01-04T08:00:00.000Z',
      },
    ],
  });

  vi.mocked(getAdminUsers).mockResolvedValue([
    {
      id: 'admin-user-1',
      name: 'Admin Zara',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      locale: 'en',
      createdAt: '2026-01-01',
    },
  ]);

  vi.mocked(setAdminUserActive).mockResolvedValue({
    id: 'admin-user-1',
    name: 'Admin Zara',
    email: 'admin@example.com',
    role: 'admin',
    isActive: false,
    locale: 'en',
    createdAt: '2026-01-01',
  });

  vi.mocked(getAdminNotifications).mockResolvedValue([
    {
      id: 'admin-notif-1',
      userId: 'user-1',
      farmId: 'farm-1',
      message: 'Notification delivered',
      channel: 'email',
      sentAt: '2026-01-05T08:00:00.000Z',
      recipient: 'farmer@example.com',
      status: 'sent',
    },
    {
      id: 'admin-notif-2',
      userId: 'user-1',
      farmId: 'farm-1',
      message: 'Notification failed',
      channel: 'sms',
      sentAt: '2026-01-05T09:00:00.000Z',
      recipient: '+2348012345678',
      status: 'failed',
    },
  ]);

  vi.mocked(submitFarm).mockResolvedValue({ submissionId: 'sub-2' });

  vi.mocked(updateProfileRequest).mockResolvedValue({
    ...baseUser,
    name: 'Farmer Jane Updated',
  });
});

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Farmer dashboard pages', () => {
  it('renders overview metrics and recent activity', async () => {
    renderWithRouter(<FarmerOverviewPage />);

    expect(await screen.findByText('Submitted North Field')).toBeInTheDocument();
    expect(screen.getByText('Farms Registered')).toBeInTheDocument();
  });

  it('submits a farm through the modal flow', async () => {
    vi.mocked(getMyFarms).mockResolvedValueOnce([]);

    const user = userEvent.setup();
    renderWithRouter(<FarmerFarmsPage />);

    expect(await screen.findByText('No farms yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit a Farm/i }));
    expect(screen.getByText('Submit a New Farm')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Farm Name'), 'River Plot');
    await user.type(screen.getByLabelText('Location / Village'), 'Yaounde');
    await user.type(screen.getByLabelText('Crop Type'), 'Cassava');
    await user.type(screen.getByLabelText('GPS Latitude'), '6.4541');
    await user.type(screen.getByLabelText('GPS Longitude'), '7.5087');

    await user.click(screen.getByRole('button', { name: /Submit Farm/i }));

    expect(await screen.findByText('Farm submitted!')).toBeInTheDocument();
    expect(submitFarm).toHaveBeenCalledWith({
      name: 'River Plot',
      cropType: 'Cassava',
      location: 'Yaounde',
      gpsLat: 6.4541,
      gpsLng: 7.5087,
    });
  });

  it('renders weather cards when data is available', async () => {
    renderWithRouter(<FarmerWeatherPage />);

    expect(await screen.findByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Sunny intervals')).toBeInTheDocument();
  });

  it('renders soil metrics when data is available', async () => {
    renderWithRouter(<FarmerSoilPage />);

    expect(await screen.findByText('Phosphorus')).toBeInTheDocument();
  });

  it('toggles recommendation expansion', async () => {
    const user = userEvent.setup();
    renderWithRouter(<FarmerRecommendationsPage />);

    const readMore = await screen.findByRole('button', { name: /Read more/i });
    await user.click(readMore);
    expect(screen.getByRole('button', { name: /Show less/i })).toBeInTheDocument();
  });

  it('renders notification history rows', async () => {
    renderWithRouter(<FarmerNotificationsPage />);

    expect(await screen.findByText('Recommendation ready for North Field')).toBeInTheDocument();
  });

  it('updates profile and shows success state', async () => {
    const user = userEvent.setup();
    const setSession = vi.fn();

    mockUseAuth.mockReturnValue({
      user: baseUser,
      token: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      setSession,
      logout: vi.fn(),
    });

    renderWithRouter(<ProfilePage />);

    await user.clear(screen.getByLabelText('Display name'));
    await user.type(screen.getByLabelText('Display name'), 'Farmer Jane Updated');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
    expect(setSession).toHaveBeenCalledWith({
      user: { ...baseUser, name: 'Farmer Jane Updated' },
      token: 'token-123',
    });
  });
});

describe('Admin dashboard pages', () => {
  it('renders overview stats and service health', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...baseUser, role: 'admin' },
      token: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(<AdminOverviewPage />);

    expect(await screen.findByText('api-gateway')).toBeInTheDocument();
    expect(screen.getByText('farm.submitted')).toBeInTheDocument();
  });

  it('filters and toggles users in admin users page', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...baseUser, role: 'admin' },
      token: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithRouter(<AdminUsersPage />);

    expect(await screen.findByText('Admin Zara')).toBeInTheDocument();

    await user.click(screen.getByTitle('Deactivate user'));

    await waitFor(() => {
      expect(setAdminUserActive).toHaveBeenCalledWith('admin-user-1', false);
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('filters admin notifications by status', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...baseUser, role: 'admin' },
      token: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithRouter(<AdminNotificationsPage />);

    expect(await screen.findByText('Notification delivered')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'failed' }));

    expect(screen.getByText('Notification failed')).toBeInTheDocument();
  });
});
