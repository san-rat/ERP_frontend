import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authClient } from '../authClient';
import * as apiUtils from '../../apiUtils';

vi.mock('../../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('authClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login sends credentials to the login endpoint', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue({ token: 'jwt-token' });

    await authClient.login(credentials.email, credentials.password);
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  });

  it('register sends user data to the register endpoint', async () => {
    const userData = { email: 'new@example.com', password: 'password', role: 'EMPLOYEE' };
    await authClient.register(userData);
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  });
});