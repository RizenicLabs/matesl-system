import { z } from 'zod';
import { UserRole, ProcedureCategory, Language } from '../enums';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid(),
  message: z.string().min(1),
  response: z.string().min(1),
  timestamp: z.date(),
  category: z.nativeEnum(ProcedureCategory),
  confidence: z.number().min(0).max(1),
  language: z.nativeEnum(Language),
});

export const ProcedureStepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  instructionSi: z.string().min(1),
  instructionTa: z.string().min(1),
  estimatedTime: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
});

export const ProcedureSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  titleSi: z.string().min(1),
  titleTa: z.string().min(1),
  category: z.nativeEnum(ProcedureCategory),
  steps: z.array(ProcedureStepSchema),
  requirements: z.array(z.any()),
  fees: z.array(z.any()),
  offices: z.array(z.any()),
  lastUpdated: z.date(),
  version: z.number().int().positive(),
  status: z.string(),
});

// Request/Response schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  language: z.nativeEnum(Language).optional(),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  category: z.nativeEnum(ProcedureCategory).optional(),
  language: z.nativeEnum(Language).optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
});