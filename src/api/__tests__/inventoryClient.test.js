import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryClient } from '../inventoryClient';
import * as apiUtils from '../../apiUtils';

vi.mock('../../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('inventoryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getLevels fetches current inventory levels', async () => {
    const mockLevels = [{ productId: '1', stock: 100 }];
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockLevels);

    const result = await inventoryClient.getLevels();
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/inventory');
    expect(result).toEqual(mockLevels);
  });

  it('updateStock sends a PATCH request to update stock', async () => {
    const productId = 'PROD-123';
    await inventoryClient.updateStock(productId, 50);
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith(`/inventory/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 50 })
    });
  });
});