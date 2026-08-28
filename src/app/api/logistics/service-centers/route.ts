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
  isValidEmail,
  isValidPhone,
  isValidIndianPinCode,
} from "@/utils/validators";

type ServiceCenterStatus = "ACTIVE" | "INACTIVE";

type ServiceCenterRecord = {
  id: string;
  serviceCenterId: string;
  name: string;
  code?: string;
  manager?: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: ServiceCenterStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  code?: string;
  manager?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status?: ServiceCenterStatus;
};

type UpdateBody = CreateBody & {
  serviceCenterId?: string;
};

function normalizeServiceCenter(
  id: string,
  data: DocumentData,
): ServiceCenterRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    serviceCenterId: String(data.serviceCenterId || id),
    name: String(data.name || "").trim(),
    code: data.code ? String(data.code).trim() : undefined,
    manager: data.manager ? String(data.manager).trim() : undefined,
    phone: data.phone ? String(data.phone).trim() : undefined,
    email: data.email ? String(data.email).trim() : undefined,
    address: data.address ? String(data.address).trim() : undefined,
    city: String(data.city || "").trim(),
    state: data.state ? String(data.state).trim() : undefined,
    postalCode: data.postalCode
      ? String(data.postalCode).trim()
      : undefined,
    country: data.country ? String(data.country).trim() : "India",
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
      errors.push("Service center name is required.");
    }
  }

  if (!partial || body.city !== undefined) {
    if (!body.city?.trim()) {
      errors.push("City is required.");
    }
  }

  if (body.phone?.trim() && !isValidPhone(body.phone)) {
    errors.push("Please enter a valid Indian phone number.");
  }

  if (body.email?.trim() && !isValidEmail(body.email)) {
    errors.push("Please enter a valid email address.");
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
        "You do not have permission to view service centers.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICE_CENTERS)
      .get();

    let centers = snapshot.docs.map((doc) =>
      normalizeServiceCenter(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      centers = centers.filter((item) => item.status === status);
    }

    if (q) {
      centers = centers.filter((item) =>
        [
          item.serviceCenterId,
          item.name,
          item.code,
          item.manager,
          item.phone,
          item.email,
          item.city,
          item.state,
          item.postalCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    centers.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(centers);
  } catch (error) {
    console.error("GET /api/logistics/service-centers failed", error);

    return errorResponse(
      "SERVICE_CENTERS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load service centers.",
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
        "You do not have permission to create service centers.",
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
    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICE_CENTERS)
      .doc();
    const enabled = body.status !== "INACTIVE";

    const record: ServiceCenterRecord = {
      id: ref.id,
      serviceCenterId: ref.id,
      name: body.name!.trim(),
      code: body.code?.trim() || undefined,
      manager: body.manager?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      email: body.email?.trim() || undefined,
      address: body.address?.trim() || undefined,
      city: body.city!.trim(),
      state: body.state?.trim() || undefined,
      postalCode: body.postalCode?.trim() || undefined,
      country: body.country?.trim() || "India",
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "SERVICE_CENTER_CREATE",
      module: "LOGISTICS",
      resourceType: "serviceCenter",
      resourceId: record.serviceCenterId,
      metadata: { name: record.name, city: record.city },
    });

    return successResponse(record, 201, "Service center created.");
  } catch (error) {
    console.error("POST /api/logistics/service-centers failed", error);

    return errorResponse(
      "SERVICE_CENTER_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create service center.",
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
        "You do not have permission to update service centers.",
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

    const serviceCenterId = body.serviceCenterId?.trim();

    if (!serviceCenterId) {
      return errorResponse(
        "SERVICE_CENTER_ID_REQUIRED",
        "serviceCenterId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICE_CENTERS)
      .doc(serviceCenterId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "SERVICE_CENTER_NOT_FOUND",
        "Service center was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.code !== undefined) patch.code = body.code.trim() || null;
    if (body.manager !== undefined) {
      patch.manager = body.manager.trim() || null;
    }
    if (body.phone !== undefined) patch.phone = body.phone.trim() || null;
    if (body.email !== undefined) patch.email = body.email.trim() || null;
    if (body.address !== undefined) {
      patch.address = body.address.trim() || null;
    }
    if (body.city !== undefined) patch.city = body.city.trim();
    if (body.state !== undefined) patch.state = body.state.trim() || null;
    if (body.postalCode !== undefined) {
      patch.postalCode = body.postalCode.trim() || null;
    }
    if (body.country !== undefined) {
      patch.country = body.country.trim() || "India";
    }
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeServiceCenter(
      updated.id,
      updated.data() || {},
    );

    await writeAuditLog({
      userId: user.userId,
      action: "SERVICE_CENTER_UPDATE",
      module: "LOGISTICS",
      resourceType: "serviceCenter",
      resourceId: record.serviceCenterId,
      metadata: patch,
    });

    return successResponse(record, 200, "Service center updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/service-centers failed", error);

    return errorResponse(
      "SERVICE_CENTER_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update service center.",
      500,
    );
  }
}