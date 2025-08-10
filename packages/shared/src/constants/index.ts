// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  CHAT: {
    SEND: '/chat/send',
    HISTORY: '/chat/history',
    SESSIONS: '/chat/sessions',
  },
  PROCEDURES: {
    SEARCH: '/procedures/search',
    GET_BY_ID: '/procedures',
    GET_BY_CATEGORY: '/procedures/category',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
  },
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  CHAT_SESSION: 'chat:session',
  PROCEDURES: 'procedures',
  SEARCH_RESULTS: 'search:results',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
} as const;

// Rate limiting
export const RATE_LIMITS = {
  CHAT_MESSAGES: 50, // per minute
  API_REQUESTS: 100, // per minute
  LOGIN_ATTEMPTS: 5, // per 15 minutes
} as const;

// AI Configuration
export const AI_CONFIG = {
  MAX_TOKENS: 150,
  TEMPERATURE: 0.7,
  CONFIDENCE_THRESHOLD: 0.6,
  SUPPORTED_LANGUAGES: ['en', 'si', 'ta'],
} as const;

// Sri Lankan specific constants
export const SRI_LANKA = {
  PROVINCES: [
    'Western',
    'Central',
    'Southern',
    'Northern',
    'Eastern',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa',
  ],
  DISTRICTS: [
    'Colombo', 'Gampaha', 'Kalutara', // Western
    'Kandy', 'Matale', 'Nuwara Eliya', // Central
    'Galle', 'Matara', 'Hambantota', // Southern
    'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya', // Northern
    'Ampara', 'Batticaloa', 'Trincomalee', // Eastern
    'Kurunegala', 'Puttalam', // North Western
    'Anuradhapura', 'Polonnaruwa', // North Central
    'Badulla', 'Monaragala', // Uva
    'Ratnapura', 'Kegalle', // Sabaragamuwa
  ],
  CURRENCY: 'LKR',
  PHONE_CODE: '+94',
} as const;