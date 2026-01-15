// API Client for Inversie backend
const API_BASE_URL = 'http://localhost:3000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string | null;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Auth API
export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  type: 'CLIENT' | 'BEWINDVOERDER';
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  biometricsEnabled: boolean;
  textSize: string;
  highContrast: boolean;
}

export const authApi = {
  login: (email: string, pin: string) =>
    apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, pin },
    }),

  logout: (token: string) =>
    apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      token,
    }),

  me: (token: string) =>
    apiRequest<User>('/api/auth/me', { token }),

  changePin: (token: string, currentPin: string, newPin: string) =>
    apiRequest<{ message: string }>('/api/auth/pin/change', {
      method: 'POST',
      token,
      body: { currentPin, newPin },
    }),
};

// Potjes API
export interface Potje {
  id: string;
  clientId: string;
  name: string;
  icon: string | null;
  monthlyBudget: number;
  currentSpent: number;
  resetDay: number;
  createdAt: string;
  updatedAt: string;
}

export const potjesApi = {
  getAll: (token: string) =>
    apiRequest<Potje[]>('/api/potjes', { token }),

  getById: (token: string, id: string) =>
    apiRequest<Potje>(`/api/potjes/${id}`, { token }),
};

// Decisions API
export interface Decision {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  amount: number;
  potjeId: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  needsHelp: boolean;
  bewindvoerderMessage: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  potje?: Potje;
  reflection?: Reflection;
}

export interface Reflection {
  id: string;
  decisionId: string;
  satisfactionRating: number;
  notes: string | null;
  createdAt: string;
}

export const decisionsApi = {
  getAll: (token: string) =>
    apiRequest<Decision[]>('/api/decisions', { token }),

  getById: (token: string, id: string) =>
    apiRequest<Decision>(`/api/decisions/${id}`, { token }),

  create: (token: string, data: { title: string; description?: string; amount: number; potjeId: string; needsHelp?: boolean }) =>
    apiRequest<Decision>('/api/decisions', {
      method: 'POST',
      token,
      body: data,
    }),

  addReflection: (token: string, id: string, data: { satisfactionRating: number; notes?: string }) =>
    apiRequest<Reflection>(`/api/decisions/${id}/reflection`, {
      method: 'POST',
      token,
      body: data,
    }),
};

// Money Requests API
export interface MoneyRequest {
  id: string;
  clientId: string;
  amount: number;
  category: string;
  description: string | null;
  photoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  bewindvoerderMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const moneyRequestsApi = {
  getAll: (token: string) =>
    apiRequest<MoneyRequest[]>('/api/money-requests', { token }),

  create: (token: string, data: { amount: number; category: string; description?: string; photoUrl: string }) =>
    apiRequest<MoneyRequest>('/api/money-requests', {
      method: 'POST',
      token,
      body: data,
    }),
};

// Transactions API
export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  balanceAfter: number | null;
  importedAt: string;
}

export const transactionsApi = {
  getAll: (token: string, filters?: { startDate?: string; endDate?: string; category?: string }) =>
    apiRequest<Transaction[]>(`/api/transactions${filters ? '?' + new URLSearchParams(filters as any).toString() : ''}`, { token }),
};

// Savings Goals API
export interface SavingsGoal {
  id: string;
  clientId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  imageUrl: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const savingsGoalsApi = {
  getAll: (token: string) =>
    apiRequest<SavingsGoal[]>('/api/savings-goals', { token }),

  create: (token: string, data: { name: string; targetAmount: number; targetDate?: string; imageUrl?: string }) =>
    apiRequest<SavingsGoal>('/api/savings-goals', {
      method: 'POST',
      token,
      body: data,
    }),

  update: (token: string, id: string, data: Partial<SavingsGoal>) =>
    apiRequest<SavingsGoal>(`/api/savings-goals/${id}`, {
      method: 'PUT',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    apiRequest<{ message: string }>(`/api/savings-goals/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Notifications API
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (token: string) =>
    apiRequest<Notification[]>('/api/notifications', { token }),

  markRead: (token: string, id: string) =>
    apiRequest<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
      token,
    }),

  markAllRead: (token: string) =>
    apiRequest<{ message: string }>('/api/notifications/read-all', {
      method: 'PUT',
      token,
    }),
};

// Bewindvoerder API
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pendingDecisions: number;
  pendingMoneyRequests: number;
  lastActivity: string | null;
}

export const bewindvoerderApi = {
  getClients: (token: string) =>
    apiRequest<Client[]>('/api/bewindvoerder/clients', { token }),

  getClientDecisions: (token: string, clientId: string) =>
    apiRequest<Decision[]>(`/api/bewindvoerder/clients/${clientId}/decisions`, { token }),

  getClientMoneyRequests: (token: string, clientId: string) =>
    apiRequest<MoneyRequest[]>(`/api/bewindvoerder/clients/${clientId}/money-requests`, { token }),

  approveDecision: (token: string, decisionId: string, message?: string) =>
    apiRequest<Decision>(`/api/bewindvoerder/decisions/${decisionId}/approve`, {
      method: 'POST',
      token,
      body: { message },
    }),

  denyDecision: (token: string, decisionId: string, message: string) =>
    apiRequest<Decision>(`/api/bewindvoerder/decisions/${decisionId}/deny`, {
      method: 'POST',
      token,
      body: { message },
    }),

  approveMoneyRequest: (token: string, requestId: string, message?: string) =>
    apiRequest<MoneyRequest>(`/api/bewindvoerder/money-requests/${requestId}/approve`, {
      method: 'POST',
      token,
      body: { message },
    }),

  denyMoneyRequest: (token: string, requestId: string, message: string) =>
    apiRequest<MoneyRequest>(`/api/bewindvoerder/money-requests/${requestId}/deny`, {
      method: 'POST',
      token,
      body: { message },
    }),
};
