import {
  Language,
  ProcedureCategory,
  ProcedureDifficulty,
  ProcedureStatus,
  UserRole,
  MessageType,
  NotificationType,
  SearchResultType,
} from '../enums';

// Base types from database
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  emailVerified: boolean;
  verifyToken?: string;
  resetToken?: string;
  resetExpiresAt?: Date;
}

export interface ChatSession {
  id: string;
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  response: string;
  confidence: number;
  category: ProcedureCategory;
  language: Language;
  timestamp: Date;
  intent?: string;
  entities?: Record<string, any>;
  procedureId?: string;
}

export interface Procedure {
  id: string;
  title: string;
  titleSi: string;
  titleTa: string;
  description?: string;
  category: ProcedureCategory;
  status: ProcedureStatus;
  version: number;
  lastUpdated: Date;
  createdAt: Date;
  estimatedDuration?: string;
  difficulty: ProcedureDifficulty;
  slug: string;
  keywords: string[];
  searchTags: string[];
  // Relations (optional for API responses)
  steps?: ProcedureStep[];
  requirements?: Requirement[];
  fees?: Fee[];
  offices?: ProcedureOffice[];
}

export interface ProcedureStep {
  id: string;
  procedureId: string;
  order: number;
  instruction: string;
  instructionSi: string;
  instructionTa: string;
  estimatedTime?: string;
  tips: string[];
  requiredDocs: string[];
}

export interface Requirement {
  id: string;
  procedureId: string;
  name: string;
  nameSi: string;
  nameTa: string;
  description?: string;
  isRequired: boolean;
  order: number;
}

export interface Fee {
  id: string;
  procedureId: string;
  description: string;
  amount: number;
  currency: string;
  isOptional: boolean;
}

export interface Office {
  id: string;
  name: string;
  nameSi: string;
  nameTa: string;
  address: string;
  district: string;
  province: string;
  contactNumbers: string[];
  email?: string;
  website?: string;
  workingHours: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcedureOffice {
  procedureId: string;
  officeId: string;
  isMain: boolean;
  procedure?: Procedure;
  office?: Office;
}

export interface SearchHistory {
  id: string;
  userId?: string;
  query: string;
  category?: ProcedureCategory;
  language: Language;
  resultsCount: number;
  clickedResult?: string;
  timestamp: Date;
}

export interface SystemConfig {
  key: string;
  value: Record<string, any>;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  questionSi: string;
  questionTa: string;
  answer: string;
  answerSi: string;
  answerTa: string;
  category: ProcedureCategory;
  keywords: string[];
  searchTags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

// AI Service types
export interface AIResponse {
  message: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  suggestedActions: SuggestedAction[];
  language: Language;
  category?: ProcedureCategory;
}

export interface SuggestedAction {
  type: 'search' | 'procedure' | 'office' | 'requirement' | 'faq';
  label: string;
  labelSi?: string;
  labelTa?: string;
  data: any;
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
