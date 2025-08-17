// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    GOOGLE: '/auth/google',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
  },
  CHAT: {
    SEND: '/chat/send',
    HISTORY: '/chat/history',
    SESSIONS: '/chat/sessions',
    CREATE_SESSION: '/chat/sessions/create',
  },
  PROCEDURES: {
    SEARCH: '/procedures/search',
    GET_BY_ID: '/procedures',
    GET_BY_CATEGORY: '/procedures/category',
    GET_ALL: '/procedures',
    GET_BY_SLUG: '/procedures/slug',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    SEARCH_HISTORY: '/users/search-history',
  },
  ADMIN: {
    PROCEDURES: '/admin/procedures',
    USERS: '/admin/users',
    OFFICES: '/admin/offices',
    SYSTEM_CONFIG: '/admin/system-config',
    FAQS: '/admin/faqs',
  },
  OFFICES: {
    SEARCH: '/offices/search',
    GET_BY_DISTRICT: '/offices/district',
    GET_BY_PROVINCE: '/offices/province',
  },
  FAQS: {
    SEARCH: '/faqs/search',
    GET_BY_CATEGORY: '/faqs/category',
  },
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  CHAT_SESSION: 'chat:session',
  PROCEDURES: 'procedures',
  SEARCH_RESULTS: 'search:results',
  OFFICES: 'offices',
  FAQS: 'faqs',
  SYSTEM_CONFIG: 'system:config',
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
  SEARCH_REQUESTS: 30, // per minute
} as const;

// AI Configuration
export const AI_CONFIG = {
  MAX_TOKENS: 150,
  TEMPERATURE: 0.7,
  CONFIDENCE_THRESHOLD: 0.6,
  MIN_CONFIDENCE_THRESHOLD: 0.3,
  SUPPORTED_LANGUAGES: ['EN', 'SI', 'TA'],
  DEFAULT_LANGUAGE: 'EN',
} as const;

// Chat session configuration
export const CHAT_CONFIG = {
  MAX_MESSAGES_PER_SESSION: 50,
  SESSION_TIMEOUT_HOURS: 24,
  ANONYMOUS_SESSION_RETENTION_DAYS: 7,
  USER_SESSION_RETENTION_MONTHS: 3,
} as const;

// Procedure configuration
export const PROCEDURE_CONFIG = {
  MAX_STEPS: 20,
  MAX_REQUIREMENTS: 15,
  MAX_FEES: 10,
  MAX_KEYWORDS: 20,
  MAX_SEARCH_TAGS: 15,
  SLUG_MAX_LENGTH: 100,
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
    // Western Province
    'Colombo',
    'Gampaha',
    'Kalutara',
    // Central Province
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    // Southern Province
    'Galle',
    'Matara',
    'Hambantota',
    // Northern Province
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Mullaitivu',
    'Vavuniya',
    // Eastern Province
    'Ampara',
    'Batticaloa',
    'Trincomalee',
    // North Western Province
    'Kurunegala',
    'Puttalam',
    // North Central Province
    'Anuradhapura',
    'Polonnaruwa',
    // Uva Province
    'Badulla',
    'Monaragala',
    // Sabaragamuwa Province
    'Ratnapura',
    'Kegalle',
  ],
  CURRENCY: 'LKR',
  PHONE_CODE: '+94',
  DEFAULT_WORKING_HOURS: '8:00 AM - 4:30 PM',
} as const;

// Language mappings
export const LANGUAGE_MAPPINGS = {
  EN: 'English',
  SI: 'සිංහල',
  TA: 'தமிழ்',
} as const;

// Procedure category mappings for display
export const PROCEDURE_CATEGORY_LABELS = {
  IDENTITY_DOCUMENTS: {
    EN: 'Identity Documents',
    SI: 'හැඳුනුම්පත් ලේඛන',
    TA: 'அடையாள ஆவணங்கள்',
  },
  BIRTH_CERTIFICATES: {
    EN: 'Birth Certificates',
    SI: 'උප්පැන්න සහතික',
    TA: 'பிறப்பு சான்றிதழ்கள்',
  },
  PASSPORTS: {
    EN: 'Passports',
    SI: 'විදේශගත පත්‍ර',
    TA: 'கடவுச்சீட்டுகள்',
  },
  EDUCATION: {
    EN: 'Education',
    SI: 'අධ්‍යාපනය',
    TA: 'கல்வி',
  },
  BUSINESS: {
    EN: 'Business',
    SI: 'ව්‍යාපාර',
    TA: 'வணிகம்',
  },
  PROPERTY: {
    EN: 'Property',
    SI: 'දේපළ',
    TA: 'சொத்து',
  },
  VEHICLE: {
    EN: 'Vehicle',
    SI: 'වාහන',
    TA: 'வாகனம்',
  },
  HEALTH: {
    EN: 'Health',
    SI: 'සෞඛ්‍ය',
    TA: 'சுகாதாரம்',
  },
  SOCIAL_SERVICES: {
    EN: 'Social Services',
    SI: 'සමාජ සේවා',
    TA: 'சமூக சேவைகள்',
  },
  OTHER: {
    EN: 'Other',
    SI: 'වෙනත්',
    TA: 'மற்றவை',
  },
} as const;
