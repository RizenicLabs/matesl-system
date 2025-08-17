import {
  Language,
  ProcedureCategory,
  ProcedureDifficulty,
  ProcedureStatus,
  UserRole,
} from '../enums';

// Base types from database
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  emailVerified: boolean;
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
  estimatedDuration?: string;
  difficulty: ProcedureDifficulty;
  slug: string;
  keywords: string[];
  searchTags: string[];
  lastUpdated: Date;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  entities?: any;
  procedureId?: string;
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
  };
}

// AI Service types
export interface AIResponse {
  message: string;
  confidence: number;
  intent: string;
  entities: any;
  suggestedActions: SuggestedAction[];
  language: Language;
}

export interface SuggestedAction {
  type: 'search' | 'procedure' | 'office' | 'requirement';
  label: string;
  data: any;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
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

// Chat types
export interface ChatResponse extends AIResponse {
  sessionId: string;
  procedures?: Procedure[];
}

// Search types

export interface SearchResult {
  procedures: Procedure[];
  total: number;
  suggestions: string[];
}
