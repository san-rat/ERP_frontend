import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlertsMenu from '../AlertsMenu';

// Mock the API client so no real network calls are made
vi.mock('../../../api/productsClient', () => ({
  productsClient: {
    getAlerts: vi.fn(),
    resolveAlert: vi.fn(),
  },
}));

import { productsClient } from '../../../api/productsClient';

const makeAlerts = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    productName: `Product ${i + 1}`,
    sku: `SKU-00${i + 1}`,
    quantityAtAlert: 5 + i,
    lowStockThreshold: 20,
  }));

beforeEach(() => {
  vi.clearAllMocks();
  productsClient.resolveAlert.mockResolvedValue({});
});

// ── describe.each: badge count varies with alert list length ──────────────────

describe.each([
  { count: 0, expectsBadge: false, badgeText: null },
  { count: 1, expectsBadge: true,  badgeText: '1'  },
  { count: 3, expectsBadge: true,  badgeText: '3'  },
  { count: 9, expectsBadge: true,  badgeText: '9'  },
])('bell badge when there are $count alert(s)', ({ count, expectsBadge, badgeText }) => {
  it('shows or hides the badge correctly', async () => {
    productsClient.getAlerts.mockResolvedValue(makeAlerts(count));
    render(<AlertsMenu />);

    await waitFor(() => {
      if (expectsBadge) {
        expect(screen.getByText(badgeText)).toBeInTheDocument();
      } else {
        expect(screen.queryByText('0')).not.toBeInTheDocument();
      }
    });
  });
});

// ── describe.each: dropdown content for each alert-count state ────────────────

describe.each([
  {
    label:         'empty state',
    alerts:        [],
    expectsEmpty:  true,
    expectsAlerts: false,
  },
  {
    label:         'single alert',
    alerts:        makeAlerts(1),
    expectsEmpty:  false,
    expectsAlerts: true,
  },
  {
    label:         'multiple alerts',
    alerts:        makeAlerts(3),
    expectsEmpty:  false,
    expectsAlerts: true,
  },
])('dropdown content — $label', ({ alerts, expectsEmpty, expectsAlerts }) => {
  it('renders the correct content after opening the dropdown', async () => {
    productsClient.getAlerts.mockResolvedValue(alerts);
    render(<AlertsMenu />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      if (expectsEmpty) {
        expect(screen.getByText('No active alerts.')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('No active alerts.')).not.toBeInTheDocument();
      }
    });

    if (expectsAlerts) {
      alerts.forEach((a) => {
        expect(screen.getByText(a.productName)).toBeInTheDocument();
        expect(screen.getByText(`SKU: ${a.sku}`)).toBeInTheDocument();
      });
    }
  });
});

// ── it.each: alert row fields are all rendered ────────────────────────────────

describe('alert row field rendering', () => {
  it.each([
    { productName: 'Widget Alpha', sku: 'SKU-001', qty: 4,  threshold: 10 },
    { productName: 'Gadget Beta',  sku: 'SKU-002', qty: 1,  threshold: 20 },
    { productName: 'Tool Gamma',   sku: 'SKU-003', qty: 12, threshold: 50 },
  ])(
    'renders all fields for "$productName" (SKU $sku)',
    async ({ productName, sku, qty, threshold }) => {
      productsClient.getAlerts.mockResolvedValue([
        { id: 1, productName, sku, quantityAtAlert: qty, lowStockThreshold: threshold },
      ]);
      render(<AlertsMenu />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(productName)).toBeInTheDocument();
        expect(screen.getByText(`SKU: ${sku}`)).toBeInTheDocument();
        expect(
          screen.getByText(`Stock: ${qty} (Threshold: ${threshold})`)
        ).toBeInTheDocument();
      });
    }
  );
});

// ── Resolve removes the alert from the list ───────────────────────────────────

describe('resolve alert', () => {
  it('removes the resolved alert from the list', async () => {
    const alerts = makeAlerts(2);
    productsClient.getAlerts.mockResolvedValue(alerts);
    render(<AlertsMenu />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Product 1')).toBeInTheDocument());

    const resolveButtons = screen.getAllByTitle('Mark as Resolved');
    fireEvent.click(resolveButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});

// ── Heading is always visible inside the open dropdown ────────────────────────

describe('dropdown heading', () => {
  it('shows "Low Stock Alerts" heading when the dropdown is open', async () => {
    productsClient.getAlerts.mockResolvedValue([]);
    render(<AlertsMenu />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    });
  });
});
