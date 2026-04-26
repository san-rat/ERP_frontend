import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from '../adminClient';
import * as client from '../client';

vi.mock('../client', () => ({
  apiFetch: vi.fn(),
}));

const mockOk = (body) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });

const mockNoContent = () =>
  Promise.resolve({ ok: true, status: 204, text: async () => '' });

const mockError = (status, message) =>
  Promise.resolve({
    ok: false,
    status,
    json: async () => ({ message }),
    text: async () => JSON.stringify({ message }),
  });

describe('adminClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOverview fetches the admin dashboard overview', async () => {
    const mockData = { totalUsers: 10, admins: 1 };
    vi.mocked(client.apiFetch).mockReturnValue(mockOk(mockData));

    const result = await adminApi.getOverview();

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/dashboard/overview');
    expect(result).toEqual(mockData);
  });

  it('getUsers fetches all users with no filters', async () => {
    vi.mocked(client.apiFetch).mockReturnValue(mockOk([]));

    await adminApi.getUsers();

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users');
  });

  it('getUsers appends non-empty query params', async () => {
    vi.mocked(client.apiFetch).mockReturnValue(mockOk([]));

    await adminApi.getUsers({ role: 'Manager', search: '' });

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users?role=Manager');
  });

  it('createManager sends a POST to the managers endpoint', async () => {
    const payload = { username: 'jsmith', email: 'j@example.com' };
    vi.mocked(client.apiFetch).mockReturnValue(mockOk({ id: 1, ...payload }));

    await adminApi.createManager(payload);

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users/managers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('createEmployee sends a POST to the employees endpoint', async () => {
    const payload = { username: 'emp1', email: 'emp@example.com' };
    vi.mocked(client.apiFetch).mockReturnValue(mockOk({ id: 2, ...payload }));

    await adminApi.createEmployee(payload);

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('updateUser sends a PUT request with updated data', async () => {
    const id = 5;
    const payload = { username: 'updated', email: 'up@example.com', role: 'Manager' };
    vi.mocked(client.apiFetch).mockReturnValue(mockOk({ id, ...payload }));

    await adminApi.updateUser(id, payload);

    expect(client.apiFetch).toHaveBeenCalledWith(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  });

  it('updateUserStatus sends a PATCH with isActive flag', async () => {
    vi.mocked(client.apiFetch).mockReturnValue(mockNoContent());

    await adminApi.updateUserStatus(7, false);

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users/7/status', {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    });
  });

  it('resetUserPassword sends a POST to the reset endpoint', async () => {
    vi.mocked(client.apiFetch).mockReturnValue(mockNoContent());

    await adminApi.resetUserPassword(3);

    expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users/3/reset-password', {
      method: 'POST',
    });
  });

  it('throws when the server returns an error', async () => {
    vi.mocked(client.apiFetch).mockReturnValue(mockError(403, 'Forbidden'));

    await expect(adminApi.getOverview()).rejects.toThrow('Forbidden');
  });

  it('falls back to default message when response body is not valid JSON', async () => {
    // Simulate a 200 OK where json() unexpectedly throws (e.g. empty body)
    vi.mocked(client.apiFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new Error('Unexpected end of JSON'); },
    });

    // handleResponse catches the json() failure → uses the fallback object
    // then since ok=true, returns { message: "Failed to parse..." }
    const result = await adminApi.getOverview();
    expect(result).toEqual({ message: 'Failed to parse optimal JSON response.' });
  });
});
