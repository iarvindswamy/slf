import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS, USER_ROLES } from "@/utils/constants";
import { isValidEmail } from "@/utils/validators";
import type { UserRole } from "@/types/user";

type UserStatus = "ACTIVE" | "INACTIVE";
type UserModule = "LOGISTICS" | "FOOD" | "BOTH";

type AdminUserRecord = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  module: UserModule;
  status: UserStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  email?: string;
  role?: UserRole;
  module?: UserModule;
  status?: UserStatus;
};

type UpdateBody = CreateBody & {
  userId?: string;
};

const ROLE_VALUES = Object.values(USER_ROLES) as UserRole[];
const MODULE_VALUES: UserModule[] = ["LOGISTICS", "FOOD", "BOTH"];

function isUserRole(value: string): value is UserRole {
  return ROLE_VALUES.includes(value as UserRole);
}

function isUserModule(value: string): value is UserModule {
  return MODULE_VALUES.includes(value as UserModule);
}

function usersRef() {
  return adminDb.collection(FIRESTORE_COLLECTIONS.USERS || "users");
}

function normalizeUser(id: string, data: DocumentData): AdminUserRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  const roleRaw = String(data.role || "VIEWER").toUpperCase();
  const moduleRaw = String(data.module || "BOTH").toUpperCase();

  return {
    id,
    userId: String(data.userId || id),
    name: String(data.name || "").trim(),
    email: String(data.email || "").trim().toLowerCase(),
    role: isUserRole(roleRaw) ? roleRaw : "VIEWER",
    module: isUserModule(moduleRaw) ? moduleRaw : "BOTH",
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

function validatePayload(body: CreateBody, partial = false): string[] {
  const errors: string[] = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) errors.push("Name is required.");
  }

  if (!partial || body.email !== undefined) {
    if (!body.email?.trim()) {
      errors.push("Email is required.");
    } else if (!isValidEmail(body.email)) {
      errors.push("Please enter a valid email address.");
    }
  }

  if (!partial || body.role !== undefined) {
    if (!body.role || !isUserRole(String(body.role))) {
      errors.push("A valid role is required.");
    }
  }

  if (!partial || body.module !== undefined) {
    if (!body.module || !isUserModule(String(body.module))) {
      errors.push("Module must be LOGISTICS, FOOD, or BOTH.");
    }
  }

  if (
    body.status !== undefined &&
    body.status !== "ACTIVE" &&
    body.status !== "INACTIVE"
  ) {
    errors.push("Status must be ACTIVE or INACTIVE.");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHORIZED", "Authentication is required.", 401);
    }

    if (!can(user, "ADMIN_USER_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to manage users.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const moduleFilter = searchParams.get("module");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await usersRef().get();

    let users = snapshot.docs.map((doc) =>
      normalizeUser(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      users = users.filter((item) => item.status === status);
    }

    if (
      moduleFilter === "LOGISTICS" ||
      moduleFilter === "FOOD" ||
      moduleFilter === "BOTH"
    ) {
      users = users.filter((item) => item.module === moduleFilter);
    }

    if (q) {
      users = users.filter((item) =>
        [item.userId, item.name, item.email, item.role, item.module, item.status]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    users.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(users);
  } catch (error) {
    console.error("GET /api/admin/users failed", error);
    return errorResponse(
      "USERS_LIST_FAILED",
      error instanceof Error ? error.message : "Failed to load users.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHORIZED", "Authentication is required.", 401);
    }

    if (!can(user, "ADMIN_USER_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to manage users.",
        403,
      );
    }

    let body: CreateBody;
    try {
      body = (await request.json()) as CreateBody;
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const errors = validatePayload(body, false);
    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const email = body.email!.trim().toLowerCase();

    const existing = await usersRef().where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      return errorResponse(
        "EMAIL_EXISTS",
        "A user with this email already exists.",
        409,
      );
    }

    const now = new Date().toISOString();
    const ref = usersRef().doc();
    const enabled = body.status !== "INACTIVE";

    const record: AdminUserRecord = {
      id: ref.id,
      userId: ref.id,
      name: body.name!.trim(),
      email,
      role: body.role!,
      module: body.module!,
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "ADMIN_USER_CREATE",
      module: "SYSTEM",
      resourceType: "user",
      resourceId: record.userId,
      metadata: {
        email: record.email,
        role: record.role,
        module: record.module,
      },
    });

    return successResponse(record, 201, "User created.");
  } catch (error) {
    console.error("POST /api/admin/users failed", error);
    return errorResponse(
      "USER_CREATE_FAILED",
      error instanceof Error ? error.message : "Failed to create user.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHORIZED", "Authentication is required.", 401);
    }

    if (!can(user, "ADMIN_USER_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to manage users.",
        403,
      );
    }

    let body: UpdateBody;
    try {
      body = (await request.json()) as UpdateBody;
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const userId = body.userId?.trim();
    if (!userId) {
      return errorResponse("USER_ID_REQUIRED", "userId is required.", 400);
    }

    const errors = validatePayload(body, true);
    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = usersRef().doc(userId);
    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse("USER_NOT_FOUND", "User was not found.", 404);
    }

    if (body.email?.trim()) {
      const email = body.email.trim().toLowerCase();
      const dup = await usersRef().where("email", "==", email).limit(5).get();
      const conflict = dup.docs.some((doc) => doc.id !== userId);
      if (conflict) {
        return errorResponse(
          "EMAIL_EXISTS",
          "A user with this email already exists.",
          409,
        );
      }
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.email !== undefined) patch.email = body.email.trim().toLowerCase();
    if (body.role !== undefined) patch.role = body.role;
    if (body.module !== undefined) patch.module = body.module;
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeUser(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "ADMIN_USER_UPDATE",
      module: "SYSTEM",
      resourceType: "user",
      resourceId: record.userId,
      metadata: patch,
    });

    return successResponse(record, 200, "User updated.");
  } catch (error) {
    console.error("PATCH /api/admin/users failed", error);
    return errorResponse(
      "USER_UPDATE_FAILED",
      error instanceof Error ? error.message : "Failed to update user.",
      500,
    );
  }
}