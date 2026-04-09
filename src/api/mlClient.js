import { fetchWithAuth } from "./apiUtils";

/**
 * Machine Learning Microservice Client
 * Default Port: 5006
 */
const ML_API_BASE = "http://localhost:5006/api/ml";

export const mlClient = {
  getChurnPrediction: (customerId) => fetchWithAuth(`${ML_API_BASE}/Predictions/churn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ customerId })
  }),
};