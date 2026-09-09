// src/services/api.js — Multi-company API layer

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const tokenStorage = {
  getAccess:   ()       => localStorage.getItem('eco_access'),
  getRefresh:  ()       => localStorage.getItem('eco_refresh'),
  setTokens:   (a, r)   => { localStorage.setItem('eco_access', a); localStorage.setItem('eco_refresh', r); },
  clearTokens: ()       => { localStorage.removeItem('eco_access'); localStorage.removeItem('eco_refresh'); },
};

let isRefreshing = false;

const apiRequest = async (endpoint, options = {}, retry = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = tokenStorage.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body,
  };

  const response = await fetch(url, config);

  if (response.status === 401 && retry && !isRefreshing) {
    const body = await response.json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED') {
      isRefreshing = true;
      try {
        const refreshed = await authApi.refresh();
        tokenStorage.setTokens(refreshed.accessToken, refreshed.refreshToken);
        isRefreshing = false;
        return apiRequest(endpoint, options, false);
      } catch {
        isRefreshing = false;
        tokenStorage.clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const requestError = new Error(error.message || `HTTP error ${response.status}`);
    requestError.status = response.status;
    requestError.code = error.code;
    throw requestError;
  }

  const data = await response.json();
  return data.data !== undefined ? data.data : data;
};

export const authApi = {
  async register(userData) {
    return apiRequest('/api/auth/register', { method: 'POST', body: userData });
  },
  async login(email, password) {
    const data = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  async refresh() {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) throw new Error('No refresh token');
    return apiRequest('/api/auth/refresh', { method: 'POST', body: { refreshToken } }, false);
  },
  async logout() {
    const refreshToken = tokenStorage.getRefresh();
    try { await apiRequest('/api/auth/logout', { method: 'POST', body: { refreshToken } }, false); }
    finally { tokenStorage.clearTokens(); }
  },
  async getSecurityQuestions(email) {
    return apiRequest('/api/auth/forgot-password/questions', { method: 'POST', body: { email } });
  },
  async resetPasswordWithQuestions(data) {
    return apiRequest('/api/auth/reset-password/questions', { method: 'POST', body: data });
  },
  async verifyEmail(token) {
    return apiRequest(`/api/auth/verify-email?token=${encodeURIComponent(String(token))}`);
  },
  async resendVerification(email) {
    return apiRequest('/api/auth/resend-verification', { method: 'POST', body: { email } });
  },
  async saveSecurityQuestions(questions) {
    return apiRequest('/api/account/security-questions', { method: 'POST', body: { questions } });
  },
  async getMe() { return apiRequest('/api/auth/me'); },
};

export const accountApi = {
  async setupSecurityQuestions({ currentPassword, questions }) {
    return apiRequest('/api/account/security-questions', {
      method: 'POST',
      body: { currentPassword, questions },
    });
  },
};

export const companyApi = {
  async list()           { return apiRequest('/api/companies'); },
  async get(id)          { return apiRequest(`/api/companies/${id}`); },
  async create(data)     { return apiRequest('/api/companies', { method: 'POST', body: data }); },
  async update(id, data) { return apiRequest(`/api/companies/${id}`, { method: 'PUT', body: data }); },
  async remove(id)       { return apiRequest(`/api/companies/${id}`, { method: 'DELETE' }); },
};

export const emissionsApi = {
  async getAllEntries(companyId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/companies/${companyId}/emissions${q ? `?${q}` : ''}`);
  },
  async createEntry(companyId, data)     { return apiRequest(`/api/companies/${companyId}/emissions`, { method: 'POST', body: data }); },
  async updateEntry(companyId, id, data) { return apiRequest(`/api/companies/${companyId}/emissions/${id}`, { method: 'PUT', body: data }); },
  async deleteEntry(companyId, id)       { return apiRequest(`/api/companies/${companyId}/emissions/${id}`, { method: 'DELETE' }); },
  async getMonthlyData(companyId, year)  {
    const q = year ? `?year=${year}` : '';
    return apiRequest(`/api/companies/${companyId}/emissions/monthly${q}`);
  },
  async getBreakdownData(companyId, month, year) {
    const p = new URLSearchParams();
    if (month) p.append('month', month);
    if (year)  p.append('year', year);
    return apiRequest(`/api/companies/${companyId}/emissions/breakdown${p.toString() ? `?${p}` : ''}`);
  },
  async getTotalEmissions(companyId, month, year) {
    const p = new URLSearchParams();
    if (month) p.append('month', month);
    if (year) p.append('year', year);
    return apiRequest(`/api/companies/${companyId}/emissions/total${p.toString() ? `?${p}` : ''}`);
  },
  async getYearlyComparison(companyId) { return apiRequest(`/api/companies/${companyId}/emissions/yearly`); },

  async getScore(companyId, month, year) {
    const p = new URLSearchParams();
    if (month) p.append('month', month);
    if (year) p.append('year', year);
    return apiRequest(`/api/companies/${companyId}/emissions/score${p.toString() ? `?${p}` : ''}`);
  },
  async getPrediction(companyId, year) {
    const q = year ? `?year=${year}` : '';
    return apiRequest(`/api/companies/${companyId}/emissions/prediction${q}`);
  },
};

export const reportsApi = {
  async generateReport(companyId, month, year) {
    return apiRequest(`/api/companies/${companyId}/reports?month=${month}&year=${year}`);
  },
  async getHistory(companyId) {
    return apiRequest(`/api/companies/${companyId}/reports/history`);
  },
};

export default { authApi, companyApi, emissionsApi, reportsApi };
