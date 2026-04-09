import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsClient } from '../productsClient';
import * as apiUtils from '../../apiUtils';

vi.mock('../../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('productsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches all products from the correct endpoint', async () => {
    const mockProducts = [{ id: '1', name: 'Product A' }];
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockProducts);

    const result = await productsClient.getAll();
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/products');
    expect(result).toEqual(mockProducts);
  });

  it('getById fetches a single product', async () => {
    const id = 'PROD-123';
    await productsClient.getById(id);
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith(`/products/${id}`);
  });

  it('update sends a PUT request with product data', async () => {
    const id = 'PROD-123';
    const updateData = { price: 25.99 };
    await productsClient.update(id, updateData);
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  });
});