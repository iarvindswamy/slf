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
import { isValidIndianPinCode } from "@/utils/validators";

type DestinationStatus = "ACTIVE" | "INACTIVE";

type DestinationRecord = {
  id: string;
  destinationId: string;
  name: string;
  code?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  serviceCenter?: string;
  serviceCenterId?: string;
  status: DestinationStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateDestinationBody = {
  name?: string;
  code?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceCenter?: string;
  serviceCenterId?: string;
  status?: DestinationStatus;
};

type UpdateDestinationBody = CreateDestinationBody & {
  destinationId?: string;
};

function normalizeDestination(
  id: string,
  data: DocumentData,
): DestinationRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    destinationId: String(data.destinationId || id),
    name: String(data.name || "").trim(),
    code: data.code ? String(data.code).trim() : undefined,
    city: String(data.city || "").trim(),
    state: data.state ? String(data.state).trim() : undefined,
    country: String(data.country || "India").trim(),
    postalCode: data.postalCode
      ? String(data.postalCode).trim()
      : undefined,
    serviceCenter: data.serviceCenter
      ? String(data.serviceCenter).trim()
      : undefined,
    serviceCenterId: data.serviceCenterId
      ? String(data.serviceCenterId).trim()
      : undefined,
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

function validatePayload(body: CreateDestinationBody, partial = false) {
  const errors: string[] = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push("Destination name is required.");
    }
  }

  if (!partial || body.city !== undefined) {
    if (!body.city?.trim()) {
      errors.push("City is required.");
    }
  }

  if (!partial || body.country !== undefined) {
    if (!body.country?.trim()) {
      errors.push("Country is required.");
    }
  }

  if (body.postalCode?.trim() && !isValidIndianPinCode(body.postalCode)) {
    errors.push("Please enter a valid 6-digit PIN code.");
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
        "You do not have permission to view destinations.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.DESTINATIONS)
      .get();

    let destinations = snapshot.docs.map((doc) =>
      normalizeDestination(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      destinations = destinations.filter((item) => item.status === status);
    }

    if (q) {
      destinations = destinations.filter((item) =>
        [
          item.destinationId,
          item.name,
          item.code,
          item.city,
          item.state,
          item.country,
          item.postalCode,
          item.serviceCenter,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    destinations.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(destinations);
  } catch (error) {
    console.error("GET /api/logistics/destinations failed", error);

    return errorResponse(
      "DESTINATIONS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load destinations.",
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
        "You do not have permission to create destinations.",
        403,
      );
    }

    let body: CreateDestinationBody;

    try {
      body = (await request.json()) as CreateDestinationBody;
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
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.DESTINATIONS).doc();
    const enabled = body.status !== "INACTIVE";

    const record: DestinationRecord = {
      id: ref.id,
      destinationId: ref.id,
      name: body.name!.trim(),
      code: body.code?.trim() || undefined,
      city: body.city!.trim(),
      state: body.state?.trim() || undefined,
      country: body.country?.trim() || "India",
      postalCode: body.postalCode?.trim() || undefined,
      serviceCenter: body.serviceCenter?.trim() || undefined,
      serviceCenterId: body.serviceCenterId?.trim() || undefined,
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "DESTINATION_CREATE",
      module: "LOGISTICS",
      resourceType: "destination",
      resourceId: record.destinationId,
      metadata: {
        name: record.name,
        city: record.city,
        country: record.country,
      },
    });

    return successResponse(record, 201, "Destination created.");
  } catch (error) {
    console.error("POST /api/logistics/destinations failed", error);

    return errorResponse(
      "DESTINATION_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create destination.",
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
        "You do not have permission to update destinations.",
        403,
      );
    }

    let body: UpdateDestinationBody;

    try {
      body = (await request.json()) as UpdateDestinationBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const destinationId = body.destinationId?.trim();

    if (!destinationId) {
      return errorResponse(
        "DESTINATION_ID_REQUIRED",
        "destinationId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.DESTINATIONS)
      .doc(destinationId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "DESTINATION_NOT_FOUND",
        "Destination was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.code !== undefined) patch.code = body.code.trim() || null;
    if (body.city !== undefined) patch.city = body.city.trim();
    if (body.state !== undefined) patch.state = body.state.trim() || null;
    if (body.country !== undefined) patch.country = body.country.trim();
    if (body.postalCode !== undefined) {
      patch.postalCode = body.postalCode.trim() || null;
    }
    if (body.serviceCenter !== undefined) {
      patch.serviceCenter = body.serviceCenter.trim() || null;
    }
    if (body.serviceCenterId !== undefined) {
      patch.serviceCenterId = body.serviceCenterId.trim() || null;
    }
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeDestination(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "DESTINATION_UPDATE",
      module: "LOGISTICS",
      resourceType: "destination",
      resourceId: record.destinationId,
      metadata: patch,
    });

    return successResponse(record, 200, "Destination updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/destinations failed", error);

    return errorResponse(
      "DESTINATION_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update destination.",
      500,
    );
  }
}