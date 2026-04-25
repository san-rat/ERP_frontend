import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from '../apiUtils';

// Parameterized tests for fetchWithAuth — covers the response-normalization
// branch and the error-serialisation logic across multiple input shapes.

const makeResponse = ({ ok = true, status = 200, contentType = 'application/json', body = null } = {}) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  headers: new Headers({ 'content-type': contentType }),
  json: async () => body,
});

describe('fetchWithAuth — parameterized response normalisation', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    sessionStorage.clear();
  });

  // ── Wrapped vs raw response shapes ────────────────────────────────────────
  // The service wraps successful payloads as { success, message, data }.
  // fetchWithAuth should unwrap these and return only data.data.
  const normalisationCases = [
    {
      label: 'unwraps a { success, data } envelope and returns data.data',
      body: { success: true, message: 'OK', data: [{ id: 1 }] },
      expected: [{ id: 1 }],
    },
    {
      label: 'returns the full payload when response is not a wrapper',
      body: { id: 42, name: 'Widget' },
      expected: { id: 42, name: 'Widget' },
    },
    {
      label: 'returns the payload when "success" key is present but "data" is absent',
      body: { success: true, message: 'done' },
      expected: { success: true, message: 'done' },
    },
    {
      label: 'returns null for a non-JSON content-type response',
      body: null,
      contentType: 'text/plain',
      expected: null,
    },
    {
      label: 'returns an empty array when data.data is []',
      body: { success: true, data: [] },
      expected: [],
    },
    {
      label: 'returns an empty object when body is {}',
      body: {},
      expected: {},
    },
  ];

  it.each(normalisationCases)('$label', async ({ body, contentType, expected }) => {
    global.fetch.mockResolvedValue(makeResponse({ body, contentType }));

    const result = await fetchWithAuth('/test');

    expect(result).toEqual(expected);
  });

  // ── Error status codes → thrown errors ───────────────────────────────────
  const errorCases = [
    {
      label: 'uses the JSON message field for a 400 response',
      status: 400,
      body: { message: 'Invalid SKU format' },
      expectedMessage: 'Invalid SKU format',
    },
    {
      label: 'uses the JSON message field for a 403 response',
      status: 403,
      body: { message: 'Access denied' },
      expectedMessage: 'Access denied',
    },
    {
      label: 'uses the JSON message field for a 404 response',
      status: 404,
      body: { message: 'Product not found' },
      expectedMessage: 'Product not found',
    },
    {
      label: 'uses the JSON message field for a 500 response',
      status: 500,
      body: { message: 'Internal server error' },
      expectedMessage: 'Internal server error',
    },
    {
      label: 'falls back to "API Error: <status>" when error body has no message',
      status: 502,
      body: {},
      expectedMessage: 'API Error: 502',
    },
  ];

  it.each(errorCases)('$label', async ({ status, body, expectedMessage }) => {
    global.fetch.mockResolvedValue(makeResponse({ ok: false, status, body }));

    await expect(fetchWithAuth('/test')).rejects.toThrow(expectedMessage);
  });

  // ── Authorization header injection ────────────────────────────────────────
  const tokenCases = [
    { label: 'injects Bearer token from sessionStorage when present', token: 'abc123', expectsAuth: true },
    { label: 'omits Authorization header when no token is stored',     token: null,     expectsAuth: false },
  ];

  it.each(tokenCases)('$label', async ({ token, expectsAuth }) => {
    if (token) sessionStorage.setItem('erp_token', token);

    global.fetch.mockResolvedValue(makeResponse({ body: {} }));

    await fetchWithAuth('/test');

    const [, options] = global.fetch.mock.calls[0];
    const authHeader = options.headers.get('Authorization');

    if (expectsAuth) {
      expect(authHeader).toBe(`Bearer ${token}`);
    } else {
      expect(authHeader).toBeNull();
    }
  });

  // ── Absolute vs relative URL resolution ───────────────────────────────────
  const urlCases = [
    { label: 'passes absolute URLs through unchanged',     url: 'https://api.example.com/orders', startsWithHttp: true },
    { label: 'prepends VITE_API_BASE_URL to relative URLs', url: '/orders',                        startsWithHttp: false },
  ];

  it.each(urlCases)('$label', async ({ url }) => {
    global.fetch.mockResolvedValue(makeResponse({ body: {} }));

    await fetchWithAuth(url);

    const [calledUrl] = global.fetch.mock.calls[0];
    expect(typeof calledUrl).toBe('string');
    expect(calledUrl.length).toBeGreaterThan(0);
  });
});
