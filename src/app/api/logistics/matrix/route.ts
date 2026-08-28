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
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";
import {
  TRACKING_STATUSES,
  type TrackingStatus,
  type TrackingStageConfig,
} from "@/types/tracking";

const MATRIX_DOC_ID = "default";

const STATUS_LABELS: Record<TrackingStatus, string> = {
  BOOKED: "Booked",
  PICKUP_REQUESTED: "Pickup Requested",
  PICKED_UP: "Picked Up",
  AT_ORIGIN: "At Origin",
  IN_TRANSIT: "In Transit",
  ARRIVED_DESTINATION: "Arrived Destination",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  ON_HOLD: "On Hold",
  EXCEPTION: "Exception",
  CANCELLED: "Cancelled",
};

function isTrackingStatus(value: string): value is TrackingStatus {
  return (TRACKING_STATUSES as readonly string[]).includes(value);
}

function buildDefaultStages(
  enabledMap?: Record<string, boolean>,
): TrackingStageConfig[] {
  return TRACKING_STATUSES.map((code, index) => ({
    id: `TS-${String(index + 1).padStart(3, "0")}`,
    trackingStageId: `TS-${String(index + 1).padStart(3, "0")}`,
    code,
    label: STATUS_LABELS[code],
    enabled:
      enabledMap && enabledMap[code] !== undefined
        ? Boolean(enabledMap[code])
        : true,
    sortOrder: index + 1,
  }));
}

function normalizeStages(raw: unknown): TrackingStageConfig[] {
  const list = Array.isArray(raw) ? raw : [];

  const mapped = list
    .map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      const code = String(row.code || "").trim().toUpperCase();

      if (!isTrackingStatus(code)) return null;

      return {
        id: String(
          row.id ||
            row.trackingStageId ||
            `TS-${String(index + 1).padStart(3, "0")}`,
        ),
        trackingStageId: String(
          row.trackingStageId ||
            row.id ||
            `TS-${String(index + 1).padStart(3, "0")}`,
        ),
        code,
        label: String(row.label || STATUS_LABELS[code]),
        enabled: row.enabled === undefined ? true : Boolean(row.enabled),
        sortOrder: Number(row.sortOrder || index + 1),
      } satisfies TrackingStageConfig;
    })
    .filter(Boolean) as TrackingStageConfig[];

  const byCode = new Map(mapped.map((stage) => [stage.code, stage]));

  return TRACKING_STATUSES.map((code, index) => {
    const existing = byCode.get(code);

    if (existing) {
      return {
        ...existing,
        sortOrder: existing.sortOrder || index + 1,
        label: existing.label || STATUS_LABELS[code],
      };
    }

    return {
      id: `TS-${String(index + 1).padStart(3, "0")}`,
      trackingStageId: `TS-${String(index + 1).padStart(3, "0")}`,
      code,
      label: STATUS_LABELS[code],
      enabled: true,
      sortOrder: index + 1,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

function matrixRef() {
  return adminDb
    .collection(
      FIRESTORE_COLLECTIONS.TRACKING_STAGE_CONFIGS || "trackingStageConfigs",
    )
    .doc(MATRIX_DOC_ID);
}

function readStagesFromDoc(data?: DocumentData | null): TrackingStageConfig[] {
  if (!data) return buildDefaultStages();
  return normalizeStages(data.stages);
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

    if (!can(user, "LOGISTICS_AWB_VIEW")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view the tracking matrix.",
        403,
      );
    }

    const snapshot = await matrixRef().get();

    if (!snapshot.exists) {
      const defaults = buildDefaultStages();
      return successResponse({ stages: defaults });
    }

    const stages = readStagesFromDoc(snapshot.data());
    return successResponse({ stages });
  } catch (error) {
    console.error("GET /api/logistics/tracking/matrix failed", error);

    return errorResponse(
      "TRACKING_MATRIX_LOAD_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load tracking matrix.",
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_UPDATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update the tracking matrix.",
        403,
      );
    }

    let body: { stages?: unknown };

    try {
      body = (await request.json()) as { stages?: unknown };
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    if (!Array.isArray(body.stages) || body.stages.length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "stages array is required.",
        400,
      );
    }

    const stages = normalizeStages(body.stages);
    const now = new Date().toISOString();

    await matrixRef().set(
      {
        id: MATRIX_DOC_ID,
        stages,
        updatedAt: now,
        updatedBy: user.userId,
      },
      { merge: true },
    );

    await writeAuditLog({
      userId: user.userId,
      action: "TRACKING_MATRIX_UPDATE",
      module: "LOGISTICS",
      resourceType: "trackingStageConfig",
      resourceId: MATRIX_DOC_ID,
      metadata: {
        enabledCount: stages.filter((s) => s.enabled).length,
        total: stages.length,
      },
    });

    return successResponse(
      { stages },
      200,
      "Tracking matrix saved successfully.",
    );
  } catch (error) {
    console.error("PUT /api/logistics/tracking/matrix failed", error);

    return errorResponse(
      "TRACKING_MATRIX_SAVE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to save tracking matrix.",
      500,
    );
  }
}