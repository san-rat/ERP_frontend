import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mlClient } from '../mlClient';
import * as apiUtils from '../apiUtils';

vi.mock('../apiUtils', () => ({
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

  it('predictAll sends a POST to the predict-all endpoint', async () => {
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue({ predicted: 120 });

    await mlClient.predictAll();

    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/churn/predict-all', {
      method: 'POST',
    });
  });

  it('retrain sends a POST to the retrain endpoint', async () => {
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue({ status: 'retraining' });

    await mlClient.retrain();

    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/retrain', {
      method: 'POST',
    });
  });
});
