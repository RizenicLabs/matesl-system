import { format, isValid } from 'date-fns';
import { Language } from '../enums';

// Date utilities
export const formatDate = (date: Date, formatString = 'yyyy-MM-dd'): string => {
  if (!isValid(date)) return '';
  return format(date, formatString);
};

// Language utilities
export const detectLanguage = (text: string): Language => {
  // Simple language detection for Sinhala Unicode range
  const sinhalaRegex = /[\u0D80-\u0DFF]/;
  // Tamil Unicode range
  const tamilRegex = /[\u0B80-\u0BFF]/;
  
  if (sinhalaRegex.test(text)) return Language.SI;
  if (tamilRegex.test(text)) return Language.TA;
  return Language.EN;
};

// Text utilities
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

// Response helpers
export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message,
});

export const createErrorResponse = (error: string, statusCode = 500) => ({
  success: false,
  error,
  statusCode,
});

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