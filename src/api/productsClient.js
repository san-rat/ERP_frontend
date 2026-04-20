import { fetchWithAuth } from "./apiUtils";

const BASE_URL = "/api/products";
const buildRelativeUrl = (path, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

export const productsClient = {
  getList: (params) => fetchWithAuth(buildRelativeUrl(BASE_URL, params)),

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

  // Alerts
  getAlerts: (unresolvedOnly = false) =>
    fetchWithAuth(
      buildRelativeUrl(
        `${BASE_URL}/alerts`,
        unresolvedOnly ? { unresolvedOnly: "true" } : {}
      )
    ),
  
  resolveAlert: (id) => fetchWithAuth(`${BASE_URL}/alerts/${id}/resolve`, { method: "PATCH" }),
};
