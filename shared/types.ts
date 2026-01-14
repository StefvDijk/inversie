// User Types
export type UserType = 'CLIENT' | 'BEWINDVOERDER';
export type TextSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE';

export interface User {
  id: string;
  type: UserType;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  biometricsEnabled: boolean;
  textSize: TextSize;
  highContrast: boolean;
  createdAt: string;
  updatedAt: string;
}

// Potje Types
export interface Potje {
  id: string;
  clientId: string;
  name: string;
  icon?: string;
  monthlyBudget: number;
  currentSpent: number;
  resetDay: number;
  createdAt: string;
  updatedAt: string;
}

// Decision Types
export type RequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface Decision {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  amount: number;
  potjeId: string;
  status: RequestStatus;
  needsHelp: boolean;
  bewindvoerderMessage?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  reflection?: Reflection;
  potje?: Potje;
}

export interface Reflection {
  id: string;
  decisionId: string;
  satisfactionRating: number;
  notes?: string;
  createdAt: string;
}

// Money Request Types
export interface MoneyRequest {
  id: string;
  clientId: string;
  amount: number;
  category: string;
  description?: string;
  photoUrl: string;
  status: RequestStatus;
  bewindvoerderMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  balanceAfter?: number;
  importedAt: string;
}

// Document Types
export interface Document {
  id: string;
  clientId: string;
  originalImageUrl: string;
  originalText?: string;
  simplifiedText?: string;
  actionItems?: string[];
  deadline?: string;
  createdAt: string;
}

// Savings Goal Types
export interface SavingsGoal {
  id: string;
  clientId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  imageUrl?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Survey Types
export type SurveyType = 'INCLUSIEMETER' | 'INCLUSIEF_BESLISSEN';

export interface SurveyResponse {
  id: string;
  clientId: string;
  surveyType: SurveyType;
  responses: Record<string, any>;
  completedAt?: string;
  createdAt: string;
}

// Appointment Types
export type AppointmentType = 'IN_PERSON' | 'PHONE' | 'VIDEO';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Appointment {
  id: string;
  clientId: string;
  bewindvoerderId: string;
  appointmentType: AppointmentType;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  status: AppointmentStatus;
  externalCalendarId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType =
  | 'DECISION_APPROVED'
  | 'DECISION_DENIED'
  | 'MONEY_REQUEST_APPROVED'
  | 'MONEY_REQUEST_DENIED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_REMINDER'
  | 'REFLECTION_PROMPT'
  | 'SURVEY_REMINDER'
  | 'BUDGET_WARNING';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  pin: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}
