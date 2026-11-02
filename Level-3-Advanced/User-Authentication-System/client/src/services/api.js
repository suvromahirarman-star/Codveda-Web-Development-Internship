/**
 * AUTHGUARD API Client
 * Centralized HTTP service for interacting with the Express authentication backend.
 * Codveda Level 3 Task 2 - User Authentication System
 */

const BASE_URL = '/api';

/**
 * Core fetch wrapper with JSON serialization and Bearer token attachment.
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {object} options - Fetch options (method, headers, body, token)
 * @returns {Promise<any>}
 */
async function request(endpoint, { method = 'GET', body, headers = {}, token } = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new Error('Network error: Unable to reach the authentication server. Please check your connection.');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth Endpoints
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: (token) =>
    request('/auth/me', {
      method: 'GET',
      token,
    }),

  updateProfile: (profileData, token) =>
    request('/auth/profile', {
      method: 'PUT',
      body: profileData,
      token,
    }),

  changePassword: (currentPassword, newPassword, token) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
      token,
    }),

  getAdminData: (token) =>
    request('/auth/admin-only', {
      method: 'GET',
      token,
    }),

  // System Health
  checkHealth: () =>
    request('/health', {
      method: 'GET',
    }),
};

