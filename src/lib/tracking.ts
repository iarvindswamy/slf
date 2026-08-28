import "server-only";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";

import type {
  TrackingEvent,
  TrackingStageConfig,
  TrackingStatus,
  TrackingUpdateInput,
  TrackingModule,
  TrackingMatrixRow,
  PublicTracking,
} from "@/types/tracking";

import { DEFAULT_TRACKING_STATUSES } from "@/types/tracking";

/* -------------------------------------------------------------------------- */
/*  Default operational pipelines (used when no stages configured yet)        */
/* -------------------------------------------------------------------------- */

/** Client operational export pipeline (matches Tracking Matrix UI) */
const DEFAULT_LOGISTICS_PIPELINE: Array<{
  code: string;
  label: string;
}> = [
  { code: "BOOKING_CONFIRMED", label: "BOOKING CONFIRMED" },
  { code: "SHIPMENT_RECEIVED", label: "SHIPMENT RECEIVED" },
  { code: "HANDLING_IN_PROGRESS", label: "HANDLING IN PROGRESS" },
  {
    code: "PROCESSED_AND_PACKED",
    label: "PROCESSED AND PACKED FOR EXPORT",
  },
  {
    code: "SHIPPING_LABEL_GENERATED",
    label: "SHIPPING LABEL GENERATED",
  },
  {
    code: "FORWARDED_TO_AIRPORT",
    label: "SHIPMENT FORWARDED TO AIRPORT",
  },
];

const DEFAULT_FOOD_PIPELINE: Array<{
  code: string;
  label: string;
}> = [
  { code: "ORDER_PLACED", label: "ORDER PLACED" },
  { code: "PACKED", label: "PACKED" },
  { code: "DISPATCHED", label: "DISPATCHED" },
  { code: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY" },
  { code: "DELIVERED", label: "DELIVERED" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function normalizeTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return new Date().toISOString();
}

function normalizeEvent(
  id: string,
  data: FirebaseFirestore.DocumentData,
): TrackingEvent {
  return {
    id,
    trackingEventId: id,
    awb: String(data.awb ?? ""),
    status: String(data.status ?? "BOOKED") as TrackingStatus,
    location:
      typeof data.location === "string" ? data.location : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : undefined,
    timestamp: normalizeTimestamp(data.timestamp),
    updatedBy:
      typeof data.updatedBy === "string" ? data.updatedBy : undefined,
    module:
      data.module === "FOOD" || data.module === "LOGISTICS"
        ? data.module
        : "LOGISTICS",
  };
}

function normalizeStage(
  id: string,
  data: FirebaseFirestore.DocumentData,
): TrackingStageConfig {
  return {
    id,
    trackingStageId: id,
    code: String(data.code ?? ""),
    label: String(data.label ?? data.code ?? ""),
    module: data.module === "FOOD" ? "FOOD" : "LOGISTICS",
    enabled: data.enabled !== false,
    sortOrder:
      typeof data.sortOrder === "number" ? data.sortOrder : 0,
    isSystem: Boolean(data.isSystem),
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

function buildDefaultStages(
  module: TrackingModule,
): TrackingStageConfig[] {
  const pipeline =
    module === "FOOD"
      ? DEFAULT_FOOD_PIPELINE
      : DEFAULT_LOGISTICS_PIPELINE;

  return pipeline.map((item, index) => ({
    id: item.code,
    trackingStageId: item.code,
    code: item.code,
    label: item.label,
    module,
    enabled: true,
    sortOrder: index,
    isSystem: true,
  }));
}

/* -------------------------------------------------------------------------- */
/*  Stage Config CRUD (Super Admin)                                           */
/* -------------------------------------------------------------------------- */

export async function getTrackingStages(
  module: TrackingModule = "LOGISTICS",
): Promise<TrackingStageConfig[]> {
  const snapshot = await adminDb
    .collection("trackingStageConfigs")
    .where("module", "==", module)
    .get();

  const stages = snapshot.docs.map((doc) =>
    normalizeStage(doc.id, doc.data()),
  );

  if (stages.length === 0) {
    return buildDefaultStages(module);
  }

  return stages
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllTrackingStages(
  module: TrackingModule = "LOGISTICS",
): Promise<TrackingStageConfig[]> {
  const snapshot = await adminDb
    .collection("trackingStageConfigs")
    .where("module", "==", module)
    .get();

  const stages = snapshot.docs.map((doc) =>
    normalizeStage(doc.id, doc.data()),
  );

  if (stages.length === 0) {
    return buildDefaultStages(module);
  }

  return stages.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertTrackingStage(
  stage: Omit<TrackingStageConfig, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): Promise<TrackingStageConfig> {
  const now = FieldValue.serverTimestamp();
  const ref = stage.id
    ? adminDb.collection("trackingStageConfigs").doc(stage.id)
    : adminDb.collection("trackingStageConfigs").doc();

  const code = stage.code
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const payload = {
    code,
    label: stage.label.trim(),
    module: stage.module,
    enabled: stage.enabled,
    sortOrder: stage.sortOrder,
    isSystem: stage.isSystem ?? false,
    updatedAt: now,
    ...(stage.id ? {} : { createdAt: now }),
  };

  await ref.set(payload, { merge: true });

  return {
    id: ref.id,
    trackingStageId: ref.id,
    code: payload.code,
    label: payload.label,
    module: payload.module,
    enabled: payload.enabled,
    sortOrder: payload.sortOrder,
    isSystem: payload.isSystem,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteTrackingStage(
  stageId: string,
): Promise<void> {
  const ref = adminDb.collection("trackingStageConfigs").doc(stageId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Stage not found.");
  }

  const data = snap.data();
  if (data?.isSystem) {
    throw new Error("System stages cannot be deleted.");
  }

  await ref.delete();
}

/* -------------------------------------------------------------------------- */
/*  Tracking Events                                                           */
/* -------------------------------------------------------------------------- */

export function validateTrackingEvent(
  input: TrackingUpdateInput,
): void {
  if (!input.awb?.trim()) {
    throw new Error("AWB is required.");
  }
  if (!input.status?.trim()) {
    throw new Error("Status is required.");
  }
}

export async function getTrackingEvents(
  awb: string,
): Promise<TrackingEvent[]> {
  const normalizedAwb = awb.trim();
  if (!normalizedAwb) return [];

  const snapshot = await adminDb
    .collection("trackingEvents")
    .where("awb", "==", normalizedAwb)
    .get();

  return snapshot.docs
    .map((doc) => normalizeEvent(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );
}

export async function addTrackingEvent(
  input: TrackingUpdateInput,
): Promise<TrackingEvent> {
  validateTrackingEvent(input);

  const now = new Date().toISOString();
  const eventRef = adminDb.collection("trackingEvents").doc();
  const batch = adminDb.batch();

  batch.set(eventRef, {
    awb: input.awb.trim(),
    status: input.status,
    location: input.location?.trim() || null,
    description: input.description?.trim() || null,
    timestamp: FieldValue.serverTimestamp(),
    updatedBy: input.updatedBy ?? null,
    module: input.module ?? "LOGISTICS",
  });

  // Keep AWB document in sync
  const awbRef = adminDb.collection("awbs").doc(input.awb.trim());
  batch.set(
    awbRef,
    {
      awb: input.awb.trim(),
      currentStatus: input.status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  return {
    id: eventRef.id,
    trackingEventId: eventRef.id,
    awb: input.awb.trim(),
    status: input.status,
    location: input.location?.trim() || undefined,
    description: input.description?.trim() || undefined,
    timestamp: now,
    updatedBy: input.updatedBy,
    module: input.module ?? "LOGISTICS",
  };
}

/**
 * Toggle a single stage checkbox for an AWB.
 * checked=true  → add event (if missing)
 * checked=false → remove event and set currentStatus to latest remaining
 */
export async function toggleTrackingStage(params: {
  awb: string;
  stageCode: string;
  checked: boolean;
  updatedBy?: string;
  module?: TrackingModule;
}): Promise<TrackingEvent | null> {
  const {
    awb,
    stageCode,
    checked,
    updatedBy,
    module = "LOGISTICS",
  } = params;

  if (!awb.trim() || !stageCode.trim()) {
    throw new Error("AWB and stage code are required.");
  }

  const normalizedAwb = awb.trim();
  const code = stageCode.trim().toUpperCase().replace(/\s+/g, "_");

  const existing = await getTrackingEvents(normalizedAwb);
  const alreadyHas = existing.find((e) => e.status === code);

  if (checked) {
    if (alreadyHas) return alreadyHas;
    return addTrackingEvent({
      awb: normalizedAwb,
      status: code,
      updatedBy,
      module,
    });
  }

  // Uncheck → delete the event
  if (alreadyHas) {
    const batch = adminDb.batch();
    batch.delete(
      adminDb.collection("trackingEvents").doc(alreadyHas.id),
    );

    const remaining = existing.filter((e) => e.id !== alreadyHas.id);
    const latest = remaining[remaining.length - 1];
    const nextStatus = latest?.status ?? "BOOKED";

    const awbRef = adminDb.collection("awbs").doc(normalizedAwb);
    batch.set(
      awbRef,
      {
        awb: normalizedAwb,
        currentStatus: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await batch.commit();
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Matrix & Public helpers                                                   */
/* -------------------------------------------------------------------------- */

export async function getTrackingMatrix(
  awbs: string[],
  module: TrackingModule = "LOGISTICS",
): Promise<TrackingMatrixRow[]> {
  const stages = await getTrackingStages(module);
  const rows: TrackingMatrixRow[] = [];

  for (const awb of awbs) {
    const events = await getTrackingEvents(awb);
    const checkedCodes = new Set(events.map((e) => e.status));
    const latest = events[events.length - 1];

    rows.push({
      awb,
      currentStatus: latest?.status ?? "BOOKED",
      stages: stages.map((s) => {
        const event = events.find((e) => e.status === s.code);
        return {
          code: s.code,
          label: s.label,
          checked: checkedCodes.has(s.code),
          timestamp: event?.timestamp,
        };
      }),
    });
  }

  return rows;
}

export async function getPublicTracking(
  awb: string,
  module: TrackingModule = "LOGISTICS",
): Promise<PublicTracking | null> {
  const normalized = awb.trim();
  if (!normalized) return null;

  const awbSnap = await adminDb
    .collection("awbs")
    .doc(normalized)
    .get();

  if (!awbSnap.exists) return null;

  const data = awbSnap.data()!;
  const events = await getTrackingEvents(normalized);
  const stages = await getTrackingStages(module);

  return {
    awb: normalized,
    currentStatus: (data.currentStatus as TrackingStatus) ?? "BOOKED",
    origin: String(data.origin ?? ""),
    destination: String(data.destination ?? ""),
    shipmentDate: String(
      data.shipmentDate ?? data.bookDate ?? "",
    ),
    latestLocation: events[events.length - 1]?.location,
    events,
    stages,
  };
}