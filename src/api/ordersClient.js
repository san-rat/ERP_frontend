import { fetchWithAuth } from "./apiUtils";

const BASE_URL = "/api/orders";

export const ordersClient = {
  getAll: () => fetchWithAuth(BASE_URL),
  
  getById: (id) => fetchWithAuth(`${BASE_URL}/${id}`),
  
  updateStatus: (id, payload) => fetchWithAuth(`${BASE_URL}/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
};
