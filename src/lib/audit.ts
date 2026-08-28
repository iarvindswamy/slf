import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

type WriteAuditLogInput = {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  module?: "LOGISTICS" | "FOOD" | "SYSTEM";
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(
  input: WriteAuditLogInput,
): Promise<void> {
  try {
    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.AUDIT_LOGS)
      .doc();

    await ref.set({
      id: ref.id,
      auditLogId: ref.id,
      userId: input.userId,
      action: input.action,
      module: input.module || "FOOD",
      resourceType: input.resourceType,
      resourceId: input.resourceId || null,
      timestamp: new Date().toISOString(),
      metadata: input.metadata || {},
    });
  } catch (error) {
    // Do not fail the main request if audit write fails
    console.error("writeAuditLog failed", error);
  }
}