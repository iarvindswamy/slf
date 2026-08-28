export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LOGISTICS_MANAGER"
  | "LOGISTICS_OPERATOR"
  | "FOOD_MANAGER"
  | "FOOD_OPERATOR"
  | "ACCOUNTANT"
  | "VIEWER";

export type UserModule =
  | "LOGISTICS"
  | "FOOD"
  | "BOTH";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export type User = {
  id: string;
  userId: string;

  email: string;
  displayName?: string;
  phone?: string;

  role: UserRole;
  module: UserModule;

  status: UserStatus;

  photoURL?: string;

  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type UserCreateInput = {
  email: string;
  displayName?: string;
  phone?: string;
  role: UserRole;
  module: UserModule;
};

export type UserUpdateInput = {
  displayName?: string;
  phone?: string;
  role?: UserRole;
  module?: UserModule;
  status?: UserStatus;
};

export type UserSession = {
  user: User | null;
  userId: string | null;
  role: UserRole | null;
  module: UserModule | null;
  isAuthenticated: boolean;
  loading: boolean;
};

export type RoleDefinition = {
  id: UserRole;
  name: string;
  description?: string;
};

export type AuditLogModule =
  | "LOGISTICS"
  | "FOOD"
  | "SYSTEM";

export type AuditLog = {
  id: string;
  auditLogId: string;

  userId: string;

  action: string;

  module: AuditLogModule;

  resourceType: string;

  resourceId?: string;

  timestamp: string;

  metadata?: Record<
    string,
    unknown
  >;
};