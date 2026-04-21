import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsClient } from '../productsClient';
import * as apiUtils from '../apiUtils';

vi.mock('../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('productsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getList keeps product queries relative to the API gateway', async () => {
    const mockProducts = [{ id: '1', name: 'Product A' }];
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockProducts);

    const result = await productsClient.getList({ name: 'desk', categoryId: 2, empty: '' });

    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/products?name=desk&categoryId=2');
    expect(result).toEqual(mockProducts);
  });

  it('getById fetches a single product', async () => {
    const id = 'PROD-123';
    await productsClient.getById(id);
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith(`/api/products/${id}`);
  });

  it('update sends a PUT request with product data', async () => {
    const id = 'PROD-123';
    const updateData = { price: 25.99 };
    await productsClient.update(id, updateData);
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  });

  it('getAlerts keeps alert requests relative to the API gateway', async () => {
    await productsClient.getAlerts(true);

    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/products/alerts?unresolvedOnly=true');
  });
});
