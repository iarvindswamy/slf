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
  isValidGSTIN,
} from "@/utils/validators";

type VendorStatus = "ACTIVE" | "INACTIVE";

type VendorRecord = {
  id: string;
  vendorId: string;
  name: string;
  code?: string;
  vendorType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstin?: string;
  bankDetails?: string;
  status: VendorStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  code?: string;
  vendorType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstin?: string;
  bankDetails?: string;
  status?: VendorStatus;
};

type UpdateBody = CreateBody & {
  vendorId?: string;
};

function normalizeVendor(id: string, data: DocumentData): VendorRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    vendorId: String(data.vendorId || id),
    name: String(data.name || "").trim(),
    code: data.code ? String(data.code).trim() : undefined,
    vendorType: data.vendorType
      ? String(data.vendorType).trim()
      : undefined,
    contactPerson: data.contactPerson
      ? String(data.contactPerson).trim()
      : undefined,
    phone: data.phone ? String(data.phone).trim() : undefined,
    email: data.email ? String(data.email).trim() : undefined,
    address: data.address ? String(data.address).trim() : undefined,
    city: data.city ? String(data.city).trim() : undefined,
    gstin: data.gstin
      ? String(data.gstin).trim().toUpperCase()
      : undefined,
    bankDetails: data.bankDetails
      ? String(data.bankDetails).trim()
      : undefined,
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
      errors.push("Vendor name is required.");
    }
  }

  if (body.phone?.trim() && !isValidPhone(body.phone)) {
    errors.push("Please enter a valid Indian phone number.");
  }

  if (body.email?.trim() && !isValidEmail(body.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (body.gstin?.trim() && !isValidGSTIN(body.gstin)) {
    errors.push("Please enter a valid GSTIN.");
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
        "You do not have permission to view vendors.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.VENDORS)
      .get();

    let vendors = snapshot.docs.map((doc) =>
      normalizeVendor(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      vendors = vendors.filter((item) => item.status === status);
    }

    if (q) {
      vendors = vendors.filter((item) =>
        [
          item.vendorId,
          item.name,
          item.code,
          item.vendorType,
          item.contactPerson,
          item.phone,
          item.email,
          item.city,
          item.gstin,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    vendors.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(vendors);
  } catch (error) {
    console.error("GET /api/logistics/vendors failed", error);

    return errorResponse(
      "VENDORS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load vendors.",
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
        "You do not have permission to create vendors.",
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
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.VENDORS).doc();
    const enabled = body.status !== "INACTIVE";

    const record: VendorRecord = {
      id: ref.id,
      vendorId: ref.id,
      name: body.name!.trim(),
      code: body.code?.trim() || undefined,
      vendorType: body.vendorType?.trim() || undefined,
      contactPerson: body.contactPerson?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      email: body.email?.trim() || undefined,
      address: body.address?.trim() || undefined,
      city: body.city?.trim() || undefined,
      gstin: body.gstin?.trim().toUpperCase() || undefined,
      bankDetails: body.bankDetails?.trim() || undefined,
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "VENDOR_CREATE",
      module: "LOGISTICS",
      resourceType: "vendor",
      resourceId: record.vendorId,
      metadata: {
        name: record.name,
        vendorType: record.vendorType,
      },
    });

    return successResponse(record, 201, "Vendor created.");
  } catch (error) {
    console.error("POST /api/logistics/vendors failed", error);

    return errorResponse(
      "VENDOR_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create vendor.",
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
        "You do not have permission to update vendors.",
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

    const vendorId = body.vendorId?.trim();

    if (!vendorId) {
      return errorResponse(
        "VENDOR_ID_REQUIRED",
        "vendorId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.VENDORS)
      .doc(vendorId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "VENDOR_NOT_FOUND",
        "Vendor was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.code !== undefined) patch.code = body.code.trim() || null;
    if (body.vendorType !== undefined) {
      patch.vendorType = body.vendorType.trim() || null;
    }
    if (body.contactPerson !== undefined) {
      patch.contactPerson = body.contactPerson.trim() || null;
    }
    if (body.phone !== undefined) patch.phone = body.phone.trim() || null;
    if (body.email !== undefined) patch.email = body.email.trim() || null;
    if (body.address !== undefined) {
      patch.address = body.address.trim() || null;
    }
    if (body.city !== undefined) patch.city = body.city.trim() || null;
    if (body.gstin !== undefined) {
      patch.gstin = body.gstin.trim().toUpperCase() || null;
    }
    if (body.bankDetails !== undefined) {
      patch.bankDetails = body.bankDetails.trim() || null;
    }
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeVendor(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "VENDOR_UPDATE",
      module: "LOGISTICS",
      resourceType: "vendor",
      resourceId: record.vendorId,
      metadata: patch,
    });

    return successResponse(record, 200, "Vendor updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/vendors failed", error);

    return errorResponse(
      "VENDOR_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update vendor.",
      500,
    );
  }
}