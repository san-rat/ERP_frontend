import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from '../apiUtils';

describe('apiUtils', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    sessionStorage.clear();
  });

  it('normalizes 400 errors properly', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Invalid SKU format' })
    });

    try {
      await fetchWithAuth('/api/test');
    } catch (e) {
      expect(e.message).toBe('Invalid SKU format');
      expect(e.status).toBe(400);
    }
  });

  it('redirects on 401', async () => {
    sessionStorage.setItem('erp_token', 'test');
    delete window.location;
    window.location = { href: '' };

    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
    });

    try {
      await fetchWithAuth('/api/test');
    } catch (e) {
      expect(e.message).toMatch(/Session expired/);
      expect(sessionStorage.getItem('erp_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    }
  });
});
