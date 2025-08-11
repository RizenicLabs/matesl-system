import { z } from 'zod';
import {
  UserRole,
  ProcedureCategory,
  Language,
  ProcedureDifficulty,
} from '../enums';

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

// Procedure schemas
export const CreateProcedureSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  titleSi: z.string().min(1, 'Sinhala title is required'),
  titleTa: z.string().min(1, 'Tamil title is required'),
  description: z.string().optional(),
  category: z.nativeEnum(ProcedureCategory),
  steps: z.array(ProcedureStepSchema),
  requirements: z.array(z.any()),
  fees: z.array(z.any()),
  offices: z.array(z.any()),
  lastUpdated: z.date(),
  version: z.number().int().positive(),
  status: z.string(),
  estimatedDuration: z.string().optional(),
  difficulty: z.nativeEnum(ProcedureDifficulty).optional(),
  keywords: z.array(z.string()).optional(),
  searchTags: z.array(z.string()).optional(),
});

// Auth schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Chat schemas
export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  language: z.nativeEnum(Language).optional(),
});

// Search schemas
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  category: z.nativeEnum(ProcedureCategory).optional(),
  language: z.nativeEnum(Language).optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
});

// User profile schemas
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Validation types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type CreateProcedureRequest = z.infer<typeof CreateProcedureSchema>;
