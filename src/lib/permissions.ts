/**
 * Central permission matrix for Sreshta Logistics + Sreshta Foods.
 *
 * Canonical naming: MODULE_RESOURCE_ACTION
 * Used by:
 *  - API route handlers (assertPermission)
 *  - Admin Sidebar / UI visibility (can / hasAnyPermission)
 *
 * Do not invent a second permission system.
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CO_LOADER"
  | "LOGISTICS_MANAGER"
  | "LOGISTICS_OPERATOR"
  | "FOOD_MANAGER"
  | "FOOD_OPERATOR"
  | "ACCOUNTANT"
  | "VIEWER";

export type Permission =
  // Logistics – AWB
  | "LOGISTICS_AWB_CREATE"
  | "LOGISTICS_AWB_UPDATE"
  | "LOGISTICS_AWB_VIEW"
  // Logistics – Tracking
  | "LOGISTICS_TRACKING_UPDATE"
  | "LOGISTICS_TRACKING_VIEW"
  | "LOGISTICS_TRACKING_STAGE_MANAGE"
  // Logistics – Invoices
  | "LOGISTICS_INVOICE_CREATE"
  | "LOGISTICS_INVOICE_VIEW"
  // Logistics – Rates & Fuel
  | "LOGISTICS_RATE_VIEW"
  | "LOGISTICS_RATE_MANAGE"
  | "LOGISTICS_FUEL_SURCHARGE_VIEW"
  | "LOGISTICS_FUEL_SURCHARGE_MANAGE"
  // Logistics – Co-loaders
  | "LOGISTICS_COLOADER_VIEW"
  | "LOGISTICS_COLOADER_MANAGE"
  // Logistics – Operations
  | "LOGISTICS_DAY_END"
  | "LOGISTICS_EXCEL_IMPORT"
  | "LOGISTICS_REPORTS_VIEW"
  | "LOGISTICS_SETTINGS"
  // Logistics – Masters
  | "LOGISTICS_MASTERS_VIEW"
  | "LOGISTICS_MASTERS_MANAGE"
  // Food – Products
  | "FOOD_PRODUCT_CREATE"
  | "FOOD_PRODUCT_UPDATE"
  | "FOOD_PRODUCT_VIEW"
  // Food – Orders
  | "FOOD_ORDER_UPDATE"
  | "FOOD_ORDER_VIEW"
  // Food – Inventory
  | "FOOD_INVENTORY_UPDATE"
  | "FOOD_INVENTORY_VIEW"
  // Food – Categories / Coupons / Settings
  | "FOOD_CATEGORY_MANAGE"
  | "FOOD_COUPON_MANAGE"
  | "FOOD_SETTINGS"
  // Platform
  | "ADMIN_USER_MANAGE"
  | "ADMIN_ROLE_MANAGE"
  | "ADMIN_AUDIT_VIEW";

export type PermissionUser = {
  userId: string;
  role: UserRole | null;
};

const ALL_PERMISSIONS: readonly Permission[] = [
  "LOGISTICS_AWB_CREATE",
  "LOGISTICS_AWB_UPDATE",
  "LOGISTICS_AWB_VIEW",
  "LOGISTICS_TRACKING_UPDATE",
  "LOGISTICS_TRACKING_VIEW",
  "LOGISTICS_TRACKING_STAGE_MANAGE",
  "LOGISTICS_INVOICE_CREATE",
  "LOGISTICS_INVOICE_VIEW",
  "LOGISTICS_RATE_VIEW",
  "LOGISTICS_RATE_MANAGE",
  "LOGISTICS_FUEL_SURCHARGE_VIEW",
  "LOGISTICS_FUEL_SURCHARGE_MANAGE",
  "LOGISTICS_COLOADER_VIEW",
  "LOGISTICS_COLOADER_MANAGE",
  "LOGISTICS_DAY_END",
  "LOGISTICS_EXCEL_IMPORT",
  "LOGISTICS_REPORTS_VIEW",
  "LOGISTICS_SETTINGS",
  "LOGISTICS_MASTERS_VIEW",
  "LOGISTICS_MASTERS_MANAGE",
  "FOOD_PRODUCT_CREATE",
  "FOOD_PRODUCT_UPDATE",
  "FOOD_PRODUCT_VIEW",
  "FOOD_ORDER_UPDATE",
  "FOOD_ORDER_VIEW",
  "FOOD_INVENTORY_UPDATE",
  "FOOD_INVENTORY_VIEW",
  "FOOD_CATEGORY_MANAGE",
  "FOOD_COUPON_MANAGE",
  "FOOD_SETTINGS",
  "ADMIN_USER_MANAGE",
  "ADMIN_ROLE_MANAGE",
  "ADMIN_AUDIT_VIEW",
] as const;

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,

  ADMIN: ALL_PERMISSIONS,

  /**
   * Co-loader (e.g. WF439):
   * - Create / update AWB
   * - Update tracking checkboxes
   * - View / create invoices
   * - View fuel surcharges (apply in booking)
   * - Day-end, masters (view/use), reports
   * - Cannot manage fuel, co-loaders, or tracking stages
   */
  CO_LOADER: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_CREATE",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_FUEL_SURCHARGE_VIEW",
    "LOGISTICS_DAY_END",
    "LOGISTICS_EXCEL_IMPORT",
    "LOGISTICS_REPORTS_VIEW",
    "LOGISTICS_MASTERS_VIEW",
    "LOGISTICS_MASTERS_MANAGE",
    "FOOD_ORDER_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_PRODUCT_VIEW",
  ],

  LOGISTICS_MANAGER: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_CREATE",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_RATE_MANAGE",
    "LOGISTICS_FUEL_SURCHARGE_VIEW",
    "LOGISTICS_DAY_END",
    "LOGISTICS_EXCEL_IMPORT",
    "LOGISTICS_REPORTS_VIEW",
    "LOGISTICS_SETTINGS",
    "LOGISTICS_MASTERS_VIEW",
    "LOGISTICS_MASTERS_MANAGE",
  ],

  LOGISTICS_OPERATOR: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_FUEL_SURCHARGE_VIEW",
    "LOGISTICS_DAY_END",
    "LOGISTICS_MASTERS_VIEW",
  ],

  FOOD_MANAGER: [
    "FOOD_PRODUCT_CREATE",
    "FOOD_PRODUCT_UPDATE",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_UPDATE",
    "FOOD_INVENTORY_VIEW",
    "FOOD_CATEGORY_MANAGE",
    "FOOD_COUPON_MANAGE",
    "FOOD_SETTINGS",
  ],

  FOOD_OPERATOR: [
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_VIEW",
  ],

  ACCOUNTANT: [
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_INVOICE_CREATE",
    "LOGISTICS_REPORTS_VIEW",
    "LOGISTICS_AWB_VIEW",
    "FOOD_ORDER_VIEW",
  ],

  VIEWER: [
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_FUEL_SURCHARGE_VIEW",
    "LOGISTICS_REPORTS_VIEW",
    "LOGISTICS_MASTERS_VIEW",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_VIEW",
  ],
};

export function can(
  user: PermissionUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user?.role) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function assertPermission(
  user: PermissionUser | null | undefined,
  permission: Permission,
): void {
  if (!can(user, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
}

export function getPermissionsForRole(
  role: UserRole,
): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasAnyPermission(
  user: PermissionUser | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((p) => can(user, p));
}

export function hasAllPermissions(
  user: PermissionUser | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((p) => can(user, p));
}

/** Convenience: is this a platform-level admin? */
export function isPlatformAdmin(
  user: PermissionUser | null | undefined,
): boolean {
  return (
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
  );
}

/** Convenience: can manage fuel surcharges / co-loaders / stages? */
export function isSuperAdminOnly(
  user: PermissionUser | null | undefined,
): boolean {
  return user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
}