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

  it('throws an API error on 401 without clearing the session', async () => {
    sessionStorage.setItem('erp_token', 'test');

    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
    });

    await expect(fetchWithAuth('/api/test')).rejects.toThrow('API Error: 401');
    expect(sessionStorage.getItem('erp_token')).toBe('test');
  });
});
