import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mlClient } from '../mlClient';
import * as apiUtils from '../../apiUtils';

vi.mock('../../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('mlClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getChurnPrediction fetches risk assessment for a specific customer', async () => {
    const customerId = '550e8400-e29b-41d4-a716-446655440000';
    const mockPrediction = { churnProbability: 0.25, predictedAt: new Date().toISOString() };
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockPrediction);

    const result = await mlClient.getChurnPrediction(customerId);
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/churn', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    });
    expect(result).toEqual(mockPrediction);
  });
});
