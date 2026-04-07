import { fetchWithAuth } from "./apiUtils";

/**
 * Forecasting Microservice Client
 * Default Port: 5005
 */
const FORECASTING_API_BASE = "http://localhost:5005/api/forecasting";

export const forecastingClient = {
  getProductMetrics: () => fetchWithAuth(`${FORECASTING_API_BASE}/Analytics/products/metrics`),
};