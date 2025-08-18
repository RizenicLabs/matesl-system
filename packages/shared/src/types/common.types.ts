import {
  Language,
  ProcedureCategory,
  ProcedureDifficulty,
  ProcedureStatus,
  UserRole,
  NotificationType,
} from '../enums';
import { AIResponse } from './ai-service.types';
import {
  ChatMessage,
  ChatSession,
  FAQ,
  Fee,
  Office,
  Procedure,
} from './database.types';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  code?: string;
  timestamp: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Chat types
export interface ChatResponse extends AIResponse {
  sessionId: string;
  procedures?: Procedure[];
  offices?: Office[];
  faqs?: FAQ[];
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

// Search types
export interface SearchResult {
  procedures: Procedure[];
  offices: Office[];
  faqs: FAQ[];
  total: number;
  suggestions: string[];
  facets?: SearchFacets;
}

export interface SearchFacets {
  categories: FacetCount[];
  difficulties: FacetCount[];
  provinces: FacetCount[];
}

export interface FacetCount {
  key: string;
  count: number;
  label: string;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// Dashboard/Admin types
export interface DashboardStats {
  totalUsers: number;
  totalProcedures: number;
  totalChatSessions: number;
  totalSearches: number;
  popularProcedures: PopularProcedure[];
  recentActivity: ActivityItem[];
}

export interface PopularProcedure {
  id: string;
  title: string;
  category: ProcedureCategory;
  searchCount: number;
  chatCount: number;
}

export interface ActivityItem {
  id: string;
  type:
    | 'user_registered'
    | 'procedure_created'
    | 'chat_started'
    | 'search_performed';
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

// Language-specific content types
export interface MultiLanguageContent {
  en: string;
  si: string;
  ta: string;
}

export interface LocalizedProcedure {
  id: string;
  title: string;
  description?: string;
  category: ProcedureCategory;
  difficulty: ProcedureDifficulty;
  estimatedDuration?: string;
  steps: LocalizedProcedureStep[];
  requirements: LocalizedRequirement[];
  fees: Fee[];
}

export interface LocalizedProcedureStep {
  id: string;
  order: number;
  instruction: string;
  estimatedTime?: string;
  tips: string[];
  requiredDocs: string[];
}

export interface LocalizedRequirement {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  order: number;
}

export interface LocalizedOffice {
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  contactNumbers: string[];
  email?: string;
  website?: string;
  workingHours: string;
  latitude?: number;
  longitude?: number;
}

export interface LocalizedFAQ {
  id: string;
  question: string;
  answer: string;
  category: ProcedureCategory;
}

// Filter and sorting types
export interface ProcedureFilters {
  category?: ProcedureCategory;
  difficulty?: ProcedureDifficulty;
  status?: ProcedureStatus;
  language?: Language;
  search?: string;
}

export interface SortOptions {
  field: 'title' | 'createdAt' | 'lastUpdated' | 'difficulty';
  direction: 'asc' | 'desc';
}

// Form state types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncState<T = any> extends LoadingState {
  data?: T;
  lastFetched?: Date;
}

// WebSocket message types
export interface WSMessage {
  type: 'chat_message' | 'typing_start' | 'typing_stop' | 'session_update';
  data: any;
  timestamp: Date;
}

export interface WSChatMessage extends WSMessage {
  type: 'chat_message';
  data: {
    sessionId: string;
    message: ChatMessage;
  };
}

// Export utility types
export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRequest<T> = Partial<Omit<T, 'id' | 'createdAt'>> & {
  id: string;
};
export type ApiEndpoint = keyof typeof import('../constants').API_ENDPOINTS;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
