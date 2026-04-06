import { fetchWithAuth } from "./apiUtils";

const BASE_URL = "/api/products";

export const productsClient = {
  getList: (params) => {
    // Construct query parameters
    const url = new URL(BASE_URL, window.location.origin);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          url.searchParams.append(key, params[key]);
        }
      });
    }
    return fetchWithAuth(url.toString());
  },

  getById: (id) => fetchWithAuth(`${BASE_URL}/${id}`),
  
  create: (payload) => fetchWithAuth(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  }),

  update: (id, payload) => fetchWithAuth(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),

  getStock: () => fetchWithAuth(`${BASE_URL}/stock`),

  getStockById: (id) => fetchWithAuth(`${BASE_URL}/${id}/stock`),
};
