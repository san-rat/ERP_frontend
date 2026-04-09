import { fetchWithAuth } from "./apiUtils";

/**
 * Forecasting Microservice Client
 * Default Port: 5005
 */
const FORECASTING_API_BASE = "http://localhost:5005/api/forecasting";

export const forecastingClient = {
  getProductMetrics: () => fetchWithAuth(`${FORECASTING_API_BASE}/Analytics/products/metrics`),
  getSingleProductMetrics: (productId) => fetchWithAuth(`${FORECASTING_API_BASE}/Analytics/product/${productId}/metrics`),
  getSingleProductAnalysis: (productId) => fetchWithAuth(`${FORECASTING_API_BASE}/Analytics/product/${productId}/analysis`),
  getLatestForecast: (productId) => fetchWithAuth(`${FORECASTING_API_BASE}/Forecast/product/${productId}/latest`),
  generateForecast: (productId, days = 30) => fetchWithAuth(`${FORECASTING_API_BASE}/Forecast/product`, {
    method: 'POST',
    body: JSON.stringify({ productId, forecastDays: days, algorithm: "Prophet", includeConfidenceInterval: true, confidenceLevel: 0.95 })
  }),
  retrainModel: (productId) => fetchWithAuth(`${FORECASTING_API_BASE}/Retraining/product/${productId}`, {
    method: 'POST'
  }),
  getRetrainingSchedule: (productId) => fetchWithAuth(`${FORECASTING_API_BASE}/Retraining/schedule/${productId}`),
};