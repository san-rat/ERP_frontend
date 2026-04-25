import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationPanel from '../NotificationPanel';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../../context/NotificationContext', () => ({
  useNotifications: vi.fn(),
}));

import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

const defaultNotifications = () => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAllRead: vi.fn(),
  resolveNotification: vi.fn(),
  refresh: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  useNotifications.mockReturnValue(defaultNotifications());
});

// ── describe.each: role-specific label & hint text ────────────────────────────

describe.each([
  {
    role:          'ADMIN',
    expectedLabel: 'Notification Centre',
    expectedHint:  'System activity will appear here',
  },
  {
    role:          'MANAGER',
    expectedLabel: 'Manager Alerts',
    expectedHint:  'Low stock alerts requiring your attention',
  },
  {
    role:          'EMPLOYEE',
    expectedLabel: 'Notifications',
    expectedHint:  'Items needing attention in your workspace',
  },
])('role-specific header for $role', ({ role, expectedLabel, expectedHint }) => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role } });
  });

  it('renders the correct panel label when opened', () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('renders the correct role hint when opened', () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    expect(screen.getByText(expectedHint)).toBeInTheDocument();
  });
});

// ── describe.each: Admin vs non-Admin empty state copy ────────────────────────

describe.each([
  {
    role:            'ADMIN',
    expectedMessage: 'No notifications yet',
    expectedSub:     'Stock alerts go to Managers & Employees. System events will appear here.',
  },
  {
    role:            'MANAGER',
    expectedMessage: 'All clear!',
    expectedSub:     'No active stock alerts right now.',
  },
  {
    role:            'EMPLOYEE',
    expectedMessage: 'All clear!',
    expectedSub:     'No active stock alerts right now.',
  },
])('empty state message for $role', ({ role, expectedMessage, expectedSub }) => {
  it('shows the correct empty state text', () => {
    useAuth.mockReturnValue({ user: { role } });
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    expect(screen.getByText(expectedSub)).toBeInTheDocument();
  });
});

// ── it.each: unread badge count display ───────────────────────────────────────

describe('unread badge count', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: 'MANAGER' } });
  });

  it.each([
    { unreadCount: 0,  expectsBadge: false, badgeText: null  },
    { unreadCount: 1,  expectsBadge: true,  badgeText: '1'   },
    { unreadCount: 5,  expectsBadge: true,  badgeText: '5'   },
    { unreadCount: 9,  expectsBadge: true,  badgeText: '9'   },
    { unreadCount: 10, expectsBadge: true,  badgeText: '9+'  },
    { unreadCount: 12, expectsBadge: true,  badgeText: '9+'  },
  ])(
    'shows badge "$badgeText" for unreadCount=$unreadCount',
    ({ unreadCount, expectsBadge, badgeText }) => {
      useNotifications.mockReturnValue({ ...defaultNotifications(), unreadCount });
      render(<NotificationPanel />);

      if (expectsBadge) {
        expect(screen.getByText(badgeText)).toBeInTheDocument();
      } else {
        // Badge element should not exist when count is zero
        expect(screen.queryByText('0')).not.toBeInTheDocument();
      }
    }
  );
});

// ── it.each: notification list items are rendered ────────────────────────────

describe('notification list rendering', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: 'MANAGER' } });
  });

  it.each([
    {
      title:   'Widget Alpha low stock',
      message: 'Widget Alpha is running low — only 3 units remaining (threshold: 10).',
      sku:     'SKU-001',
      qty:     3,
      threshold: 10,
    },
    {
      title:   'Gadget Beta low stock',
      message: 'Gadget Beta is running low — only 1 units remaining (threshold: 20).',
      sku:     'SKU-002',
      qty:     1,
      threshold: 20,
    },
  ])(
    'renders notification titled "$title"',
    ({ title, message, sku, qty, threshold }) => {
      const notification = {
        id: 1, read: false, triggeredAt: new Date().toISOString(),
        title, message, sku,
        quantityAtAlert: qty, lowStockThreshold: threshold,
      };
      useNotifications.mockReturnValue({
        ...defaultNotifications(),
        notifications: [notification],
        unreadCount: 1,
      });

      render(<NotificationPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(`SKU: ${sku}`)).toBeInTheDocument();
    }
  );
});

// ── describe.each: Refresh button disabled only for Admin ─────────────────────

describe.each([
  { role: 'ADMIN',    expectsDisabled: true  },
  { role: 'MANAGER',  expectsDisabled: false },
  { role: 'EMPLOYEE', expectsDisabled: false },
])('Refresh button for $role', ({ role, expectsDisabled }) => {
  it('is disabled only for Admin', () => {
    useAuth.mockReturnValue({ user: { role } });
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));

    const refreshBtn = screen.getByTitle(
      role === 'ADMIN' ? 'Stock alerts not available for Admin' : 'Refresh'
    );
    if (expectsDisabled) {
      expect(refreshBtn).toBeDisabled();
    } else {
      expect(refreshBtn).not.toBeDisabled();
    }
  });
});

// ── Panel visibility ──────────────────────────────────────────────────────────

describe('panel visibility', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: 'EMPLOYEE' } });
  });

  it('panel is hidden before the bell is clicked', () => {
    render(<NotificationPanel />);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('panel opens on bell click', () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('panel closes on the X button click', () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // The X button has no accessible name — query by its position in the header actions
    const allButtons = screen.getAllByRole('button');
    const closeBtn = allButtons[allButtons.length - 1]; // last button in the header row
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});
