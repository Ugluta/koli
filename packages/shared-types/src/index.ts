export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CITY_ADMIN = 'city_admin',
  BUSINESS = 'business',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum PostType {
  NEWS = 'news',
  BLOG = 'blog',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  CAMPAIGN = 'campaign',
}

export enum BusinessStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum MembershipPlan {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}
