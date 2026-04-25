import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsClient } from '../productsClient';

vi.mock('../apiUtils', () => ({
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from '../apiUtils';

beforeEach(() => {
  vi.clearAllMocks();
  fetchWithAuth.mockResolvedValue({});
});

// ── describe.each: one block per simple endpoint ──────────────────────────────
// Each row verifies the URL and HTTP method without repeating test structure.

describe.each([
  { method: 'getById',      args: [42],  expectedUrl: '/api/products/42',               httpMethod: undefined },
  { method: 'getById',      args: [99],  expectedUrl: '/api/products/99',               httpMethod: undefined },
  { method: 'getStock',     args: [],    expectedUrl: '/api/products/stock',             httpMethod: undefined },
  { method: 'getStockById', args: [7],   expectedUrl: '/api/products/7/stock',           httpMethod: undefined },
  { method: 'getStockById', args: [13],  expectedUrl: '/api/products/13/stock',          httpMethod: undefined },
  { method: 'resolveAlert', args: [5],   expectedUrl: '/api/products/alerts/5/resolve',  httpMethod: 'PATCH'   },
  { method: 'resolveAlert', args: [21],  expectedUrl: '/api/products/alerts/21/resolve', httpMethod: 'PATCH'   },
])('$method($args)', ({ method, args, expectedUrl, httpMethod }) => {
  it('calls fetchWithAuth with the correct URL', () => {
    productsClient[method](...args);
    const [url] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(expectedUrl);
  });

  it(`uses ${httpMethod ?? 'GET'} as the HTTP method`, () => {
    productsClient[method](...args);
    const [, options] = fetchWithAuth.mock.calls[0];
    if (httpMethod) {
      expect(options?.method).toBe(httpMethod);
    } else {
      expect(options).toBeUndefined();
    }
  });
});

// ── it.each: getList query parameter construction ─────────────────────────────
// Verifies that empty/null/undefined values are filtered out and valid
// values are appended to the query string correctly.

describe('getList — query parameter filtering', () => {
  it.each([
    { params: undefined,                              expectedSearch: ''                         },
    { params: {},                                     expectedSearch: ''                         },
    { params: { name: 'widget' },                     expectedSearch: 'name=widget'              },
    { params: { categoryId: 3 },                      expectedSearch: 'categoryId=3'             },
    { params: { name: 'widget', categoryId: '3' },    expectedSearch: 'name=widget&categoryId=3' },
    { params: { name: '' },                           expectedSearch: ''                         },
    { params: { name: null },                         expectedSearch: ''                         },
    { params: { name: undefined },                    expectedSearch: ''                         },
    { params: { name: 'gadget', categoryId: null },   expectedSearch: 'name=gadget'              },
  ])('builds correct query string for $params', ({ params, expectedSearch }) => {
    productsClient.getList(params);
    const [calledUrl] = fetchWithAuth.mock.calls[0];
    const searchPart = calledUrl.split('?')[1] ?? '';
    expect(searchPart).toBe(expectedSearch);
  });
});

// ── describe.each: getAlerts unresolvedOnly flag ──────────────────────────────

describe.each([
  { unresolvedOnly: true,  expectsParam: true  },
  { unresolvedOnly: false, expectsParam: false },
])('getAlerts(unresolvedOnly=$unresolvedOnly)', ({ unresolvedOnly, expectsParam }) => {
  it('appends or omits the unresolvedOnly query param correctly', () => {
    productsClient.getAlerts(unresolvedOnly);
    const [calledUrl] = fetchWithAuth.mock.calls[0];
    if (expectsParam) {
      expect(calledUrl).toContain('unresolvedOnly=true');
    } else {
      expect(calledUrl).not.toContain('unresolvedOnly');
    }
  });
});

// ── it.each: create and update send correct method and body ──────────────────

describe('mutating methods', () => {
  it.each([
    {
      label:   'create sends POST to base URL',
      call:    () => productsClient.create({ name: 'Widget', price: 9.99 }),
      method:  'POST',
      bodyObj: { name: 'Widget', price: 9.99 },
      urlEnd:  '/api/products',
    },
    {
      label:   'update sends PUT to /api/products/:id',
      call:    () => productsClient.update(3, { name: 'Updated', price: 5 }),
      method:  'PUT',
      bodyObj: { name: 'Updated', price: 5 },
      urlEnd:  '/api/products/3',
    },
  ])('$label', ({ call, method, bodyObj, urlEnd }) => {
    call();
    const [url, options] = fetchWithAuth.mock.calls[0];
    expect(url).toBe(urlEnd);
    expect(options.method).toBe(method);
    expect(JSON.parse(options.body)).toEqual(bodyObj);
  });
});
