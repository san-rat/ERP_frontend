import { fetchWithAuth } from "./apiUtils";

const ML_API_BASE = "/api/ml";

export const mlClient = {
  getChurnPrediction: (customerId) =>
    fetchWithAuth(`${ML_API_BASE}/churn`, {
      method: "POST",
      body: JSON.stringify({ customerId }),
    }),
  predictAll: () =>
    fetchWithAuth(`${ML_API_BASE}/churn/predict-all`, {
      method: "POST",
    }),
};
