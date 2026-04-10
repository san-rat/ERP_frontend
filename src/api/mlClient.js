import { fetchWithAuth } from "./apiUtils";

// Relative path — fetchWithAuth prepends VITE_API_BASE_URL (http://localhost:5000)
// Gateway route: /api/ml/churn/* -> PredictionService /api/ml/predictions/*
const ML_API_BASE = "/api/ml/churn";

export const mlClient = {
  getChurnPrediction: (customerId) =>
    fetchWithAuth(`${ML_API_BASE}/churn`, {
      method: "POST",
      body: JSON.stringify({ customerId }),
    }),
};