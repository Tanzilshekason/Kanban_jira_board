const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper function to handle API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.detail || responseData.message || 'API request failed');
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Authentication API calls
export const authAPI = {
  register: (userData) => apiRequest('/auth/register/', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login/', 'POST', credentials),
  refreshToken: (refreshToken) => apiRequest('/auth/refresh/', 'POST', { refresh: refreshToken }),
  getProfile: (token) => apiRequest('/auth/profile/', 'GET', null, token),
  getUsers: (token) => apiRequest('/auth/users/', 'GET', null, token),
};

// Tasks API calls
export const tasksAPI = {
  getAll: (token) => apiRequest('/tasks/', 'GET', null, token),
  getById: (id, token) => apiRequest(`/tasks/${id}/`, 'GET', null, token),
  create: (taskData, token) => apiRequest('/tasks/', 'POST', taskData, token),
  update: (id, taskData, token) => apiRequest(`/tasks/${id}/`, 'PATCH', taskData, token),
  delete: (id, token) => apiRequest(`/tasks/${id}/`, 'DELETE', null, token),
};

// Board columns API
export const boardAPI = {
  getColumns: (token) => apiRequest('/board/columns/', 'GET', null, token),
};

// Assignment history API
export const assignmentAPI = {
  getHistory: (taskId, token) => apiRequest(`/tasks/${taskId}/assignment-history/`, 'GET', null, token),
};

// Time logging API
export const timeAPI = {
  getLogs: (taskId, token) => apiRequest(`/tasks/${taskId}/time-logs/`, 'GET', null, token),
  createLog: (taskId, logData, token) => apiRequest(`/tasks/${taskId}/time-logs/create/`, 'POST', logData, token),
};

// Reports API
export const reportsAPI = {
  getTimeReport: (params, token) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/reports/time/?${queryParams}`, 'GET', null, token);
  },
};

// Token management utilities
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  setAccessToken: (token) => localStorage.setItem('access_token', token),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token) => localStorage.setItem('refresh_token', token),
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};