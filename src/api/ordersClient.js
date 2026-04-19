import { fetchWithAuth } from "./apiUtils";

// Relative path — fetchWithAuth prepends VITE_API_BASE_URL (http://localhost:5000)
// so all requests go through ApiGateway which proxies /api/orders/* to OrderService.
const ORDER_API_BASE = "/api/orders";

export const ordersClient = {
  getAll: () => fetchWithAuth(ORDER_API_BASE),
  getSummary: () => fetchWithAuth(`${ORDER_API_BASE}/reports/summary`),
  updateStatus: (id, payload) =>
    fetchWithAuth(`${ORDER_API_BASE}/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};