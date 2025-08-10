import { Language, ProcedureCategory, ProcedureStatus, UserRole } from "@shared/enums";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  sessionId: string;
  message: string;
  response: string;
  timestamp: Date;
  category: ProcedureCategory;
  confidence: number;
  language: Language;
}

export interface Procedure {
  id: string;
  title: string;
  titleSi: string;
  titleTa: string;
  category: ProcedureCategory;
  steps: ProcedureStep[];
  requirements: Requirement[];
  fees: Fee[];
  offices: Office[];
  lastUpdated: Date;
  version: number;
  status: ProcedureStatus;
}

export interface ProcedureStep {
  order: number;
  instruction: string;
  instructionSi: string;
  instructionTa: string;
  estimatedTime?: string;
  requiredDocuments?: string[];
  tips?: string[];
}

export interface Requirement {
  id: string;
  name: string;
  nameSi: string;
  nameTa: string;
  description?: string;
  isRequired: boolean;
}

export interface Fee {
  id: string;
  description: string;
  amount: number;
  currency: string;
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
  workingHours: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}