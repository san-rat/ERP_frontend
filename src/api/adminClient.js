import { apiFetch } from "./client";

/**
 * Standardizes API responses to avoid repetitive try-catches.
 */
const handleResponse = async (response) => {
  if (response.status === 204) return { success: true };
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Failed to parse optimal JSON response." };
  }
  
  if (!response.ok) {
    throw new Error(data.message || `Server Error: ${response.status}`);
  }
  return data;
};

export const adminApi = {
  getOverview: () => 
    apiFetch("/api/admin/dashboard/overview").then(handleResponse),

  getUsers: (params = {}) => {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v))).toString();
    return apiFetch(`/api/admin/users${query ? '?' + query : ''}`).then(handleResponse);
  },

  createManager: (payload) => 
    apiFetch("/api/admin/users/managers", {
      method: "POST",
      body: JSON.stringify(payload)
    }).then(handleResponse),

  createEmployee: (payload) => 
    apiFetch("/api/admin/users/employees", {
      method: "POST",
      body: JSON.stringify(payload)
    }).then(handleResponse),

  updateUser: (id, payload) => 
    apiFetch(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }).then(handleResponse),

  updateUserStatus: (id, isActive) => 
    apiFetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive })
    }).then(handleResponse),

  resetUserPassword: (id) => 
    apiFetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST"
    }).then(handleResponse)
};
