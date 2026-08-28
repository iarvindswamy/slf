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
import {
  FIRESTORE_COLLECTIONS,
  SERVICE_TYPES,
} from "@/utils/constants";
import type { ServiceType } from "@/types/logistics";

type ServiceStatus = "ACTIVE" | "INACTIVE";

type ServiceRecord = {
  id: string;
  serviceId: string;
  name: string;
  code?: string;
  type: ServiceType;
  description?: string;
  coverage?: string;
  status: ServiceStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  code?: string;
  type?: ServiceType;
  description?: string;
  coverage?: string;
  status?: ServiceStatus;
};

type UpdateBody = CreateBody & {
  serviceId?: string;
};

function isServiceType(value: string): value is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(value);
}

function normalizeService(
  id: string,
  data: DocumentData,
): ServiceRecord {
  const typeRaw = String(data.type || "DOMESTIC").toUpperCase();
  const type: ServiceType = isServiceType(typeRaw) ? typeRaw : "DOMESTIC";

  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    serviceId: String(data.serviceId || id),
    name: String(data.name || "").trim(),
    code: data.code ? String(data.code).trim() : undefined,
    type,
    description: data.description
      ? String(data.description).trim()
      : undefined,
    coverage: data.coverage ? String(data.coverage).trim() : undefined,
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
    if (!body.name?.trim()) {
      errors.push("Service name is required.");
    }
  }

  if (!partial || body.type !== undefined) {
    if (!body.type || !isServiceType(String(body.type))) {
      errors.push("A valid service type is required.");
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
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_VIEW")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view services.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICES)
      .get();

    let services = snapshot.docs.map((doc) =>
      normalizeService(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      services = services.filter((item) => item.status === status);
    }

    if (type && isServiceType(type)) {
      services = services.filter((item) => item.type === type);
    }

    if (q) {
      services = services.filter((item) =>
        [
          item.serviceId,
          item.name,
          item.code,
          item.type,
          item.description,
          item.coverage,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    services.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(services);
  } catch (error) {
    console.error("GET /api/logistics/services failed", error);

    return errorResponse(
      "SERVICES_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load services.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_CREATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create services.",
        403,
      );
    }

    let body: CreateBody;

    try {
      body = (await request.json()) as CreateBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const errors = validatePayload(body, false);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.SERVICES).doc();
    const enabled = body.status !== "INACTIVE";

    const record: ServiceRecord = {
      id: ref.id,
      serviceId: ref.id,
      name: body.name!.trim(),
      code: body.code?.trim() || undefined,
      type: body.type!,
      description: body.description?.trim() || undefined,
      coverage: body.coverage?.trim() || undefined,
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "SERVICE_CREATE",
      module: "LOGISTICS",
      resourceType: "service",
      resourceId: record.serviceId,
      metadata: {
        name: record.name,
        type: record.type,
      },
    });

    return successResponse(record, 201, "Service created.");
  } catch (error) {
    console.error("POST /api/logistics/services failed", error);

    return errorResponse(
      "SERVICE_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create service.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
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
        "You do not have permission to update services.",
        403,
      );
    }

    let body: UpdateBody;

    try {
      body = (await request.json()) as UpdateBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const serviceId = body.serviceId?.trim();

    if (!serviceId) {
      return errorResponse(
        "SERVICE_ID_REQUIRED",
        "serviceId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICES)
      .doc(serviceId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "SERVICE_NOT_FOUND",
        "Service was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.code !== undefined) patch.code = body.code.trim() || null;
    if (body.type !== undefined) patch.type = body.type;
    if (body.description !== undefined) {
      patch.description = body.description.trim() || null;
    }
    if (body.coverage !== undefined) {
      patch.coverage = body.coverage.trim() || null;
    }
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeService(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "SERVICE_UPDATE",
      module: "LOGISTICS",
      resourceType: "service",
      resourceId: record.serviceId,
      metadata: patch,
    });

    return successResponse(record, 200, "Service updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/services failed", error);

    return errorResponse(
      "SERVICE_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update service.",
      500,
    );
  }
}