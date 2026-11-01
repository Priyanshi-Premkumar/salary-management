import type {
  AuthResponse,
  CreateEmployeeRequest,
  DepartmentSalaryStats,
  CountrySalaryStats,
  EmployeeDetail,
  EmployeeSummary,
  OverviewMetrics,
  PageResponse,
  SalaryAuditLog,
  SalaryBandResponse,
  ThresholdResponse,
  UpdateEmployeeRequest,
} from '../types';

const API_BASE = '/api/v1';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} Error`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Invalid credentials');
      }
      return res.json();
    },
    getCurrentUser: () => fetchWithAuth<{ id: number; email: string; role: string }>('/auth/me'),
  },

  employees: {
    list: (params: {
      search?: string;
      country?: string;
      department?: string;
      status?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.country) query.set('country', params.country);
      if (params.department) query.set('department', params.department);
      if (params.status) query.set('status', params.status);
      if (params.page !== undefined) query.set('page', params.page.toString());
      if (params.size !== undefined) query.set('size', params.size.toString());
      if (params.sortBy) query.set('sortBy', params.sortBy);
      if (params.sortDirection) query.set('sortDirection', params.sortDirection);

      return fetchWithAuth<PageResponse<EmployeeSummary>>(`/employees?${query.toString()}`);
    },

    getById: (id: number) => fetchWithAuth<EmployeeDetail>(`/employees/${id}`),

    create: (data: CreateEmployeeRequest) =>
      fetchWithAuth<EmployeeDetail>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: UpdateEmployeeRequest) =>
      fetchWithAuth<EmployeeDetail>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    downloadCsv: async (params: { search?: string; country?: string; department?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.country) query.set('country', params.country);
      if (params.department) query.set('department', params.department);
      if (params.status) query.set('status', params.status);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/employees/export?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to download CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  },

  compensation: {
    revise: (
      employeeId: number,
      data: {
        newBaseSalary: number;
        newBonus?: number;
        currency: string;
        changeReason: string;
        effectiveDate: string;
      }
    ) =>
      fetchWithAuth<any>(`/employees/${employeeId}/compensation`, {
        method: 'POST',
        body: JSON.stringify({
          newBaseSalary: data.newBaseSalary,
          newBonus: data.newBonus || 0,
          currency: data.currency,
          effectiveFrom: data.effectiveDate,
          reason: data.changeReason,
        }),
      }),

    getHistory: (employeeId: number) =>
      fetchWithAuth<any[]>(`/employees/${employeeId}/salary-history`),
  },

  analytics: {
    getOverview: (asOfDate?: string) => {
      const q = asOfDate ? `?asOfDate=${asOfDate}` : '';
      return fetchWithAuth<OverviewMetrics>(`/analytics/overview${q}`);
    },

    getDepartments: (currency?: string, asOfDate?: string) => {
      const params = new URLSearchParams();
      if (currency) params.set('currency', currency);
      if (asOfDate) params.set('asOfDate', asOfDate);
      const q = params.toString() ? `?${params.toString()}` : '';
      return fetchWithAuth<DepartmentSalaryStats[]>(`/analytics/departments${q}`);
    },

    getCountries: (asOfDate?: string) => {
      const q = asOfDate ? `?asOfDate=${asOfDate}` : '';
      return fetchWithAuth<CountrySalaryStats[]>(`/analytics/countries${q}`);
    },

    getSalaryBands: (currency: string, asOfDate?: string) => {
      const params = new URLSearchParams({ currency });
      if (asOfDate) params.set('asOfDate', asOfDate);
      return fetchWithAuth<SalaryBandResponse>(`/analytics/salary-bands?${params.toString()}`);
    },

    getThreshold: (threshold: number, currency: string, asOfDate?: string) => {
      const params = new URLSearchParams({
        threshold: threshold.toString(),
        currency,
      });
      if (asOfDate) params.set('asOfDate', asOfDate);
      return fetchWithAuth<ThresholdResponse>(`/analytics/threshold?${params.toString()}`);
    },
  },

  audit: {
    list: (params: { employeeId?: number; page?: number; size?: number }) => {
      const q = new URLSearchParams();
      if (params.employeeId) q.set('employeeId', params.employeeId.toString());
      if (params.page !== undefined) q.set('page', params.page.toString());
      if (params.size !== undefined) q.set('size', params.size.toString());
      return fetchWithAuth<PageResponse<SalaryAuditLog>>(`/audit-logs?${q.toString()}`);
    },

    downloadCsv: async (employeeId?: number) => {
      const q = employeeId ? `?employeeId=${employeeId}` : '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/audit-logs/export${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to download audit log CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  },

  admin: {
    seed: (force: boolean = false) =>
      fetchWithAuth<{ executed: boolean; message: string; employeeCount: number; durationMillis: number }>(
        `/admin/seed-data?force=${force}`,
        { method: 'POST' }
      ),
  },
};
