import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { USER_ROLES } from "@/utils/constants";
import type { UserRole } from "@/types/user";
import type { Permission } from "@/lib/permissions";

/**
 * Mirrors server ROLE_PERMISSIONS from @/lib/permissions.
 * Keep in sync with that file — single source for enforcement is still `can()`.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPER_ADMIN: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_CREATE",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_RATE_MANAGE",
    "FOOD_PRODUCT_CREATE",
    "FOOD_PRODUCT_UPDATE",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_UPDATE",
    "FOOD_INVENTORY_VIEW",
    "ADMIN_USER_MANAGE",
    "ADMIN_AUDIT_VIEW",
  ],
  ADMIN: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_CREATE",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "LOGISTICS_RATE_MANAGE",
    "FOOD_PRODUCT_CREATE",
    "FOOD_PRODUCT_UPDATE",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_UPDATE",
    "FOOD_INVENTORY_VIEW",
    "ADMIN_USER_MANAGE",
    "ADMIN_AUDIT_VIEW",
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
  ],
  LOGISTICS_OPERATOR: [
    "LOGISTICS_AWB_CREATE",
    "LOGISTICS_AWB_UPDATE",
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_UPDATE",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
  ],
  FOOD_MANAGER: [
    "FOOD_PRODUCT_CREATE",
    "FOOD_PRODUCT_UPDATE",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_UPDATE",
    "FOOD_INVENTORY_VIEW",
  ],
  FOOD_OPERATOR: [
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_UPDATE",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_VIEW",
  ],
  ACCOUNTANT: ["LOGISTICS_INVOICE_VIEW", "LOGISTICS_INVOICE_CREATE"],
  VIEWER: [
    "LOGISTICS_AWB_VIEW",
    "LOGISTICS_TRACKING_VIEW",
    "LOGISTICS_INVOICE_VIEW",
    "LOGISTICS_RATE_VIEW",
    "FOOD_PRODUCT_VIEW",
    "FOOD_ORDER_VIEW",
    "FOOD_INVENTORY_VIEW",
  ],
};

const ROLE_META: Record<
  UserRole,
  { description: string; module: "LOGISTICS" | "FOOD" | "BOTH" }
> = {
  SUPER_ADMIN: {
    description: "Full platform administration.",
    module: "BOTH",
  },
  ADMIN: {
    description: "General administrative access.",
    module: "BOTH",
  },
  LOGISTICS_MANAGER: {
    description: "Logistics management operations.",
    module: "LOGISTICS",
  },
  LOGISTICS_OPERATOR: {
    description: "Day-to-day logistics operations.",
    module: "LOGISTICS",
  },
  FOOD_MANAGER: {
    description: "Food business management.",
    module: "FOOD",
  },
  FOOD_OPERATOR: {
    description: "Food operational tasks.",
    module: "FOOD",
  },
  ACCOUNTANT: {
    description: "Billing and accounting operations.",
    module: "BOTH",
  },
  VIEWER: {
    description: "Read-only access.",
    module: "BOTH",
  },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    // Any authenticated admin user can view role catalog;
    // user management still requires ADMIN_USER_MANAGE.
    if (
      !can(user, "ADMIN_USER_MANAGE") &&
      !can(user, "ADMIN_AUDIT_VIEW") &&
      !can(user, "LOGISTICS_AWB_VIEW") &&
      !can(user, "FOOD_ORDER_VIEW")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view roles.",
        403,
      );
    }

    const roles = (Object.values(USER_ROLES) as UserRole[]).map((name) => {
      const permissions = [...(ROLE_PERMISSIONS[name] || [])];
      const meta = ROLE_META[name];

      return {
        name,
        description: meta.description,
        module: meta.module,
        permissionsCount: permissions.length,
        permissions,
      };
    });

    return successResponse({ roles });
  } catch (error) {
    console.error("GET /api/admin/roles failed", error);

    return errorResponse(
      "ROLES_LIST_FAILED",
      error instanceof Error ? error.message : "Failed to load roles.",
      500,
    );
  }
}