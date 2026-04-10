import { fetchWithAuth } from "./apiUtils";

// Relative path — fetchWithAuth prepends VITE_API_BASE_URL (http://localhost:5000)
// so all requests go through ApiGateway which proxies /api/ml/forecast/* to ForecastService.
const FORECASTING_API_BASE = "/api/ml/forecast";

export const forecastingClient = {
  getProductMetrics: () =>
    fetchWithAuth(`${FORECASTING_API_BASE}/analytics/products/metrics`),

  getSingleProductMetrics: (productId) =>
    fetchWithAuth(`${FORECASTING_API_BASE}/analytics/product/${productId}/metrics`),

  getSingleProductAnalysis: (productId) =>
    fetchWithAuth(`${FORECASTING_API_BASE}/analytics/product/${productId}/analysis`),

  getLatestForecast: (productId) =>
    fetchWithAuth(`${FORECASTING_API_BASE}/forecast/product/${productId}/latest`),

  generateForecast: (productId, days = 30) =>
    fetchWithAuth(`${FORECASTING_API_BASE}/forecast/product`, {
      method: "POST",
      body: JSON.stringify({
        productId,
        forecastDays: days,
        algorithm: "Prophet",
        includeConfidenceInterval: true,
        confidenceLevel: 0.95,
      }),
    }),

  // Global retraining endpoints — backend does not have product-specific routes.
  // RetrainingController.cs: POST /api/forecasting/retraining/trigger
  retrainModel: () =>
    fetchWithAuth(`${FORECASTING_API_BASE}/retraining/trigger`, {
      method: "POST",
      body: JSON.stringify({ reason: "Manual retraining from manager dashboard" }),
    }),

  // RetrainingController.cs: GET /api/forecasting/retraining/status
  getRetrainingSchedule: () =>
    fetchWithAuth(`${FORECASTING_API_BASE}/retraining/status`),
};