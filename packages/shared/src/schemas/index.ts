import { z } from 'zod';
import {
  UserRole,
  ProcedureCategory,
  ProcedureStatus,
  ProcedureDifficulty,
  Language,
} from '../enums';

// Base entity schemas
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  googleId: z.string().optional(),
  emailVerified: z.boolean(),
  verifyToken: z.string().optional(),
  resetToken: z.string().optional(),
  resetExpiresAt: z.date().optional(),
});

export const ChatSessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ChatMessageSchema = z.object({
  id: z.string().cuid(),
  sessionId: z.string().cuid(),
  message: z.string().min(1),
  response: z.string().min(1),
  confidence: z.number().min(0).max(1),
  category: z.nativeEnum(ProcedureCategory),
  language: z.nativeEnum(Language),
  timestamp: z.date(),
  intent: z.string().optional(),
  entities: z.any().optional(),
  procedureId: z.string().cuid().optional(),
});

export const ProcedureStepSchema = z.object({
  id: z.string().cuid(),
  procedureId: z.string().cuid(),
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  instructionSi: z.string().min(1),
  instructionTa: z.string().min(1),
  estimatedTime: z.string().optional(),
  tips: z.array(z.string()),
  requiredDocs: z.array(z.string()),
});

export const RequirementSchema = z.object({
  id: z.string().cuid(),
  procedureId: z.string().cuid(),
  name: z.string().min(1),
  nameSi: z.string().min(1),
  nameTa: z.string().min(1),
  description: z.string().optional(),
  isRequired: z.boolean(),
  order: z.number().int().positive(),
});

export const FeeSchema = z.object({
  id: z.string().cuid(),
  procedureId: z.string().cuid(),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().default('LKR'),
  isOptional: z.boolean(),
});

export const OfficeSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  nameSi: z.string().min(1),
  nameTa: z.string().min(1),
  address: z.string().min(1),
  district: z.string().min(1),
  province: z.string().min(1),
  contactNumbers: z.array(z.string()),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  workingHours: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProcedureSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  titleSi: z.string().min(1),
  titleTa: z.string().min(1),
  description: z.string().optional(),
  category: z.nativeEnum(ProcedureCategory),
  status: z.nativeEnum(ProcedureStatus),
  version: z.number().int().positive(),
  lastUpdated: z.date(),
  createdAt: z.date(),
  estimatedDuration: z.string().optional(),
  difficulty: z.nativeEnum(ProcedureDifficulty),
  slug: z.string().min(1),
  keywords: z.array(z.string()),
  searchTags: z.array(z.string()),
});

export const FAQSchema = z.object({
  id: z.string().cuid(),
  question: z.string().min(1),
  questionSi: z.string().min(1),
  questionTa: z.string().min(1),
  answer: z.string().min(1),
  answerSi: z.string().min(1),
  answerTa: z.string().min(1),
  category: z.nativeEnum(ProcedureCategory),
  keywords: z.array(z.string()),
  searchTags: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SearchHistorySchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().optional(),
  query: z.string().min(1),
  category: z.nativeEnum(ProcedureCategory).optional(),
  language: z.nativeEnum(Language),
  resultsCount: z.number().int().nonnegative(),
  clickedResult: z.string().cuid().optional(),
  timestamp: z.date(),
});

// Request/Response schemas
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().cuid().optional(),
  language: z.nativeEnum(Language).default(Language.EN),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
  category: z.nativeEnum(ProcedureCategory).optional(),
  language: z.nativeEnum(Language).default(Language.EN),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
});

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
      .min(8, 'New password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Admin schemas
export const CreateProcedureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleSi: z.string().min(1, 'Sinhala title is required'),
  titleTa: z.string().min(1, 'Tamil title is required'),
  description: z.string().optional(),
  category: z.nativeEnum(ProcedureCategory),
  difficulty: z
    .nativeEnum(ProcedureDifficulty)
    .default(ProcedureDifficulty.EASY),
  estimatedDuration: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  searchTags: z.array(z.string()).default([]),
  steps: z.array(
    z.object({
      order: z.number().int().positive(),
      instruction: z.string().min(1),
      instructionSi: z.string().min(1),
      instructionTa: z.string().min(1),
      estimatedTime: z.string().optional(),
      tips: z.array(z.string()).default([]),
      requiredDocs: z.array(z.string()).default([]),
    })
  ),
  requirements: z
    .array(
      z.object({
        name: z.string().min(1),
        nameSi: z.string().min(1),
        nameTa: z.string().min(1),
        description: z.string().optional(),
        isRequired: z.boolean().default(true),
        order: z.number().int().positive(),
      })
    )
    .default([]),
  fees: z
    .array(
      z.object({
        description: z.string().min(1),
        amount: z.number().nonnegative(),
        currency: z.string().default('LKR'),
        isOptional: z.boolean().default(false),
      })
    )
    .default([]),
});

export const UpdateProcedureSchema = CreateProcedureSchema.partial().extend({
  id: z.string().cuid(),
});

export const CreateOfficeSchema = z.object({
  name: z.string().min(1, 'Office name is required'),
  nameSi: z.string().min(1, 'Sinhala name is required'),
  nameTa: z.string().min(1, 'Tamil name is required'),
  address: z.string().min(1, 'Address is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),
  contactNumbers: z
    .array(z.string())
    .min(1, 'At least one contact number is required'),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  workingHours: z.string().min(1, 'Working hours are required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const CreateFAQSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  questionSi: z.string().min(1, 'Sinhala question is required'),
  questionTa: z.string().min(1, 'Tamil question is required'),
  answer: z.string().min(1, 'Answer is required'),
  answerSi: z.string().min(1, 'Sinhala answer is required'),
  answerTa: z.string().min(1, 'Tamil answer is required'),
  category: z.nativeEnum(ProcedureCategory),
  keywords: z.array(z.string()).default([]),
  searchTags: z.array(z.string()).default([]),
});

// Email verification schema
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Reset password schema
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type CreateProcedureRequest = z.infer<typeof CreateProcedureSchema>;
export type UpdateProcedureRequest = z.infer<typeof UpdateProcedureSchema>;
export type CreateOfficeRequest = z.infer<typeof CreateOfficeSchema>;
export type CreateFAQRequest = z.infer<typeof CreateFAQSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailSchema>;
export type ResetPasswordRequestType = z.infer<
  typeof ResetPasswordRequestSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
