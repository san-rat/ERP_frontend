import { fetchWithAuth } from "./apiUtils";

const ORDER_API_BASE = "http://localhost:5003/api/orders";

export const ordersClient = {
  getAll: () => fetchWithAuth(`${ORDER_API_BASE}`),
  getSummary: () => fetchWithAuth(`${ORDER_API_BASE}/reports/summary`),
};