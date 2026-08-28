import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

type AuditModule = "LOGISTICS" | "FOOD" | "SYSTEM";

type AuditLogRecord = {
  id: string;
  auditLogId: string;
  userId: string;
  action: string;
  module: AuditModule;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

function normalizeModule(value: unknown): AuditModule {
  const raw = String(value || "SYSTEM").toUpperCase();
  if (raw === "LOGISTICS" || raw === "FOOD" || raw === "SYSTEM") {
    return raw;
  }
  return "SYSTEM";
}

function normalizeLog(id: string, data: DocumentData): AuditLogRecord {
  return {
    id,
    auditLogId: String(data.auditLogId || id),
    userId: String(data.userId || "UNKNOWN"),
    action: String(data.action || "UNKNOWN"),
    module: normalizeModule(data.module),
    resourceType: String(data.resourceType || "unknown"),
    resourceId: data.resourceId ? String(data.resourceId) : undefined,
    timestamp: String(data.timestamp || data.createdAt || new Date().toISOString()),
    metadata:
      data.metadata && typeof data.metadata === "object"
        ? (data.metadata as Record<string, unknown>)
        : undefined,
  };
}

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

    if (!can(user, "ADMIN_AUDIT_VIEW") && !can(user, "ADMIN_USER_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view audit logs.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get("module")?.toUpperCase();
    const action = searchParams.get("action")?.trim().toLowerCase();
    const userId = searchParams.get("userId")?.trim();
    const q = searchParams.get("q")?.trim().toLowerCase();
    const limitParam = Number(searchParams.get("limit") ?? 100);
    const limit = Math.min(Math.max(limitParam || 100, 1), 300);

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.AUDIT_LOGS || "auditLogs")
      .get();

    let logs = snapshot.docs.map((doc) => normalizeLog(doc.id, doc.data()));

    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    if (
      moduleFilter === "LOGISTICS" ||
      moduleFilter === "FOOD" ||
      moduleFilter === "SYSTEM"
    ) {
      logs = logs.filter((item) => item.module === moduleFilter);
    }

    if (userId) {
      logs = logs.filter((item) => item.userId === userId);
    }

    if (action) {
      logs = logs.filter((item) =>
        item.action.toLowerCase().includes(action),
      );
    }

    if (q) {
      logs = logs.filter((item) =>
        [
          item.auditLogId,
          item.userId,
          item.action,
          item.module,
          item.resourceType,
          item.resourceId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    logs = logs.slice(0, limit);

    return successResponse({
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error("GET /api/admin/audit-logs failed", error);

    return errorResponse(
      "AUDIT_LOGS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load audit logs.",
      500,
    );
  }
}