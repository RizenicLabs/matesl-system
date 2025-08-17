export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ProcedureCategory {
  IDENTITY_DOCUMENTS = 'IDENTITY_DOCUMENTS',
  BIRTH_CERTIFICATES = 'BIRTH_CERTIFICATES',
  PASSPORTS = 'PASSPORTS',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS',
  PROPERTY = 'PROPERTY',
  VEHICLE = 'VEHICLE',
  HEALTH = 'HEALTH',
  SOCIAL_SERVICES = 'SOCIAL_SERVICES',
  OTHER = 'OTHER',
}

export enum ProcedureStatus {
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum ProcedureDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum Language {
  EN = 'EN',
  SI = 'SI',
  TA = 'TA',
}

export enum MessageType {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export enum SearchResultType {
  PROCEDURE = 'PROCEDURE',
  FAQ = 'FAQ',
  OFFICE = 'OFFICE',
}

export enum SystemConfigKey {
  AI_MODEL_CONFIG = 'AI_MODEL_CONFIG',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  FEATURED_PROCEDURES = 'FEATURED_PROCEDURES',
  SYSTEM_ANNOUNCEMENTS = 'SYSTEM_ANNOUNCEMENTS',
}

export enum ChatSessionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}
