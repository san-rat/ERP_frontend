import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordersClient } from '../ordersClient';
import * as apiUtils from '../apiUtils';

vi.mock('../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('ordersClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches all orders from the correct endpoint', async () => {
    const mockOrders = [{ id: 'ORD-001', totalAmount: 150.50 }];
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockOrders);

    const result = await ordersClient.getAll();
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/orders');
    expect(result).toEqual(mockOrders);
  });

  it('getSummary fetches the order dashboard summary', async () => {
    const mockSummary = { pending: 5, processing: 2, shipped: 8 };
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockSummary);

    const result = await ordersClient.getSummary();
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/orders/reports/summary');
    expect(result).toEqual(mockSummary);
  });
});
