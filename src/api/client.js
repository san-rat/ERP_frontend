/**
 * Centralized API client
 * All requests go through the VITE_API_BASE_URL env variable.
 * - Local dev:  set in .env.local  → http://localhost:5000
 * - Production: set in Vercel env  → https://<your-azure-gateway-url>
 */
const API = import.meta.env.VITE_API_BASE_URL;

const parseResponse = async (response) => {
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}.`);
    }

    return data;
};

/* ── Auth endpoints ── */
export const authApi = {
    login: (credentials) =>
        fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        }).then(parseResponse),

    register: (data) =>
        fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(parseResponse),
};

/* ── Generic authenticated fetch helper ── */
export const apiFetch = (path, options = {}) => {
    const token = sessionStorage.getItem("erp_token");
    return fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
};
