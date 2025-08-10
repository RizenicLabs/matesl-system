export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
  CONTENT_MANAGER = 'content_manager',
  SUPER_ADMIN = 'super_admin'
}

export enum ProcedureCategory {
  IDENTITY_DOCUMENTS = 'identity_documents',
  BIRTH_CERTIFICATES = 'birth_certificates',
  PASSPORTS = 'passports',
  EDUCATION = 'education',
  BUSINESS = 'business',
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  HEALTH = 'health',
  SOCIAL_SERVICES = 'social_services',
  OTHER = 'other'
}

export enum ProcedureStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review'
}

export enum Language {
  EN = 'en',
  SI = 'si',
  TA = 'ta'
}

export enum MessageType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}