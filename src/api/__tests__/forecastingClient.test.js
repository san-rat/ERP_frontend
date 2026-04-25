import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forecastingClient } from '../forecastingClient';

vi.mock('../apiUtils', () => ({
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from '../apiUtils';

const BASE = '/api/ml/forecast';

beforeEach(() => {
  vi.clearAllMocks();
  fetchWithAuth.mockResolvedValue({});
});

// ── describe.each: no-argument GET endpoints ──────────────────────────────────

describe.each([
  { method: 'getProductMetrics',     expectedUrl: `${BASE}/analytics/products/metrics` },
  { method: 'getAllForecasts',        expectedUrl: `${BASE}/products`                    },
  { method: 'getRetrainingSchedule', expectedUrl: `${BASE}/retraining/status`           },
])('$method (no args)', ({ method, expectedUrl }) => {
  it('calls fetchWithAuth with the correct URL', () => {
    forecastingClient[method]();
    const [url] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(expectedUrl);
  });

  it('uses GET (no options object)', () => {
    forecastingClient[method]();
    const [, options] = fetchWithAuth.mock.calls[0];
    expect(options).toBeUndefined();
  });
});

// ── it.each: product-ID endpoints map to the correct URL ─────────────────────

describe('product-ID endpoints', () => {
  it.each([
    {
      method:      'getSingleProductMetrics',
      productId:   'PROD-001',
      expectedUrl: `${BASE}/analytics/product/PROD-001/metrics`,
    },
    {
      method:      'getSingleProductMetrics',
      productId:   42,
      expectedUrl: `${BASE}/analytics/product/42/metrics`,
    },
    {
      method:      'getSingleProductAnalysis',
      productId:   'PROD-002',
      expectedUrl: `${BASE}/analytics/product/PROD-002/analysis`,
    },
    {
      method:      'getSingleProductAnalysis',
      productId:   7,
      expectedUrl: `${BASE}/analytics/product/7/analysis`,
    },
    {
      method:      'getLatestForecast',
      productId:   'PROD-003',
      expectedUrl: `${BASE}/forecast/product/PROD-003/latest`,
    },
    {
      method:      'getLatestForecast',
      productId:   99,
      expectedUrl: `${BASE}/forecast/product/99/latest`,
    },
  ])(
    '$method($productId) → $expectedUrl',
    ({ method, productId, expectedUrl }) => {
      forecastingClient[method](productId);
      const [url] = fetchWithAuth.mock.calls[0];
      expect(url).toBe(expectedUrl);
    }
  );
});

// ── describe.each: generateForecast POST body varies by forecastDays ──────────

describe.each([
  { productId: 'P1', days: undefined, expectedDays: 30 },
  { productId: 'P2', days: 7,         expectedDays: 7  },
  { productId: 'P3', days: 14,        expectedDays: 14 },
  { productId: 'P4', days: 90,        expectedDays: 90 },
])('generateForecast($productId, days=$days)', ({ productId, days, expectedDays }) => {
  it('sends POST to the forecast endpoint', () => {
    days === undefined
      ? forecastingClient.generateForecast(productId)
      : forecastingClient.generateForecast(productId, days);

    const [url, options] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(`${BASE}/forecast/product`);
    expect(options.method).toBe('POST');
  });

  it('includes the correct forecastDays in the request body', () => {
    days === undefined
      ? forecastingClient.generateForecast(productId)
      : forecastingClient.generateForecast(productId, days);

    const body = JSON.parse(fetchWithAuth.mock.calls[0][1].body);
    expect(body.productId).toBe(productId);
    expect(body.forecastDays).toBe(expectedDays);
    expect(body.algorithm).toBe('Prophet');
    expect(body.includeConfidenceInterval).toBe(true);
    expect(body.confidenceLevel).toBe(95);
  });
});

// ── retrainModel: POST with no payload ───────────────────────────────────────

describe('retrainModel', () => {
  it('sends POST to the retrain endpoint', () => {
    forecastingClient.retrainModel();
    const [url, options] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(`${BASE}/ml/retrain`);
    expect(options.method).toBe('POST');
  });

  it('sends no body', () => {
    forecastingClient.retrainModel();
    const [, options] = fetchWithAuth.mock.calls[0];
    expect(options.body).toBeUndefined();
  });
});
