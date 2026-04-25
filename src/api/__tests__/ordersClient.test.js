import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordersClient } from '../ordersClient';

vi.mock('../apiUtils', () => ({
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from '../apiUtils';

beforeEach(() => {
  vi.clearAllMocks();
  fetchWithAuth.mockResolvedValue({});
});

// ── describe.each: no-argument GET endpoints ──────────────────────────────────

describe.each([
  { method: 'getAll',     expectedUrl: '/api/orders'                 },
  { method: 'getSummary', expectedUrl: '/api/orders/reports/summary' },
])('$method', ({ method, expectedUrl }) => {
  it('calls fetchWithAuth with the correct URL', () => {
    ordersClient[method]();
    const [url] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(expectedUrl);
  });

  it('passes no options (plain GET)', () => {
    ordersClient[method]();
    const [, options] = fetchWithAuth.mock.calls[0];
    expect(options).toBeUndefined();
  });
});

// ── it.each: updateStatus sends the correct payload for every status ──────────
// Each row represents one business-level status transition that the app
// supports. Verifies the URL, method, and serialised body for each.

describe('updateStatus — order status transitions', () => {
  it.each([
    { id: 1,  status: 'Processing', note: undefined         },
    { id: 2,  status: 'Shipped',    note: 'Via FedEx'       },
    { id: 3,  status: 'Delivered',  note: undefined          },
    { id: 4,  status: 'Cancelled',  note: 'Customer request' },
    { id: 10, status: 'On Hold',    note: undefined          },
  ])(
    'sends PUT to /api/orders/$id/status with status="$status"',
    ({ id, status, note }) => {
      const payload = { status, ...(note !== undefined && { note }) };
      ordersClient.updateStatus(id, payload);

      const [url, options] = fetchWithAuth.mock.calls[0];
      expect(url).toBe(`/api/orders/${id}/status`);
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body)).toEqual(payload);
    }
  );
});

// ── it.each: updateStatus uses the correct order ID in the URL ────────────────

describe('updateStatus — order ID routing', () => {
  it.each([1, 42, 100, 999])(
    'uses order ID %i in the URL path',
    (id) => {
      ordersClient.updateStatus(id, { status: 'Shipped' });
      const [url] = fetchWithAuth.mock.calls[0];
      expect(url).toBe(`/api/orders/${id}/status`);
    }
  );
});
