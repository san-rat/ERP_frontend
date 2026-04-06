export async function fetchWithAuth(url, options = {}) {
  const token = sessionStorage.getItem("erp_token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const API = import.meta.env.VITE_API_BASE_URL || "";
  const fullUrl = url.startsWith("http") ? url : `${API}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
       console.warn("API returned 401 Unauthorized. Not clearing session to prevent loops.");
    }
    const message = data?.message || `API Error: ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Normalization logic: OrderService uses `{ success, message, data }`
  // Returns raw `data` property if Wrapped, else returns full `data` payload
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data; 
  }

  return data;
}
