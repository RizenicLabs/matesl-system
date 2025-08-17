import { Language } from '../enums';
import { ApiResponse } from '../types';
import { format, isValid } from 'date-fns';

// API Response helpers
export function createSuccessResponse<T>(
  message: string,
  data?: T
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  message: string,
  error?: string
): ApiResponse {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
}

// Language detection utility
export const detectLanguage = (text: string): Language => {
  // Simple language detection for Sinhala Unicode range
  const sinhalaRegex = /[\u0D80-\u0DFF]/;
  // Tamil Unicode range
  const tamilRegex = /[\u0B80-\u0BFF]/;

  if (sinhalaRegex.test(text)) return Language.SI;
  if (tamilRegex.test(text)) return Language.TA;
  return Language.EN;
};

// Text processing utilities
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// ID generation
export const generateId = (): string => {
  return crypto.randomUUID();
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Sri Lankan phone number regex
  const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Error handling
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Array utilities
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

// Date utilities
export const formatDate = (date: Date, formatString = 'yyyy-MM-dd'): string => {
  if (!isValid(date)) return '';
  return format(date, formatString);
};

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(d);
}

// Security utilities
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;

  const masked = name.substring(0, 2) + '*'.repeat(name.length - 2);
  return `${masked}@${domain}`;
};
