import {
  Language,
  ProcedureCategory,
  ProcedureDifficulty,
  ProcedureStatus,
  UserRole,
} from '../enums';

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
  // Google OAuth fields
  googleId?: string;
  emailVerified: boolean;
  verifyToken?: string;
  resetToken?: string;
  resetExpiresAt?: Date;
  // Relations
  chatSessions?: ChatSession[];
  searchHistory?: SearchHistory[];
}

export interface ChatSession {
  id: string;
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user?: User;
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
  // Metadata
  intent?: string;
  entities?: Record<string, any>;
  procedureId?: string;
  // Relations
  session?: ChatSession;
  procedure?: Procedure;
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
  // SEO and search
  slug: string;
  keywords: string[];
  searchTags: string[];
  // Relations
  steps?: ProcedureStep[];
  requirements?: Requirement[];
  fees?: Fee[];
  procedureOffices?: ProcedureOffice[];
  messages?: ChatMessage[];
  searches?: SearchHistory[];
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
  // Relations
  procedure?: Procedure;
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
  // Relations
  procedure?: Procedure;
}

export interface Fee {
  id: string;
  procedureId: string;
  description: string;
  amount: number;
  currency: string;
  isOptional: boolean;
  // Relations
  procedure?: Procedure;
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
  // Relations
  procedureOffices?: ProcedureOffice[];
}

export interface ProcedureOffice {
  procedureId: string;
  officeId: string;
  isMain: boolean;
  // Relations
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
  // Relations
  user?: User;
  procedure?: Procedure;
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
