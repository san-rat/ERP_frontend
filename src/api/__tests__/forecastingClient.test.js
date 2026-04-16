import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forecastingClient } from '../forecastingClient';
import * as apiUtils from '../../apiUtils';

vi.mock('../../apiUtils', () => ({
  fetchWithAuth: vi.fn()
}));

describe('forecastingClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProductMetrics fetches aggregated product performance data', async () => {
    const mockData = { products: [{ productId: 'P1', totalRevenue: 5000 }] };
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockData);

    const result = await forecastingClient.getProductMetrics();
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/analytics/products/metrics');
    expect(result).toEqual(mockData);
  });

  it('getSingleProductMetrics fetches metrics for one item', async () => {
    await forecastingClient.getSingleProductMetrics('PROD-1');
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/analytics/product/PROD-1/metrics');
  });

  it('getSingleProductAnalysis fetches trend and intelligence data', async () => {
    await forecastingClient.getSingleProductAnalysis('PROD-1');
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/analytics/product/PROD-1/analysis');
  });

  it('getLatestForecast fetches the 30-day demand prediction', async () => {
    await forecastingClient.getLatestForecast('PROD-1');
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/forecast/product/PROD-1/latest');
  });

  it('getRetrainingSchedule fetches AI sync dates', async () => {
    await forecastingClient.getRetrainingSchedule();
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/retraining/status');
  });

  it('generateForecast sends a POST request to trigger analysis', async () => {
    const mockNewForecast = { algorithm: 'Prophet' };
    vi.mocked(apiUtils.fetchWithAuth).mockResolvedValue(mockNewForecast);

    const result = await forecastingClient.generateForecast('PROD-1');
    
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/forecast/product', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'PROD-1',
        forecastDays: 30,
        algorithm: 'Prophet',
        includeConfidenceInterval: true,
        confidenceLevel: 95,
      }),
    });
    expect(result).toEqual(mockNewForecast);
  });

  it('retrainModel sends a POST request to start model training', async () => {
    await forecastingClient.retrainModel();
    expect(apiUtils.fetchWithAuth).toHaveBeenCalledWith('/api/ml/forecast/retraining/trigger', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Manual retraining from manager dashboard' }),
    });
  });
});
