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
  isValidGSTIN,
} from "@/utils/validators";

type CustomerStatus = "ACTIVE" | "INACTIVE";

type CustomerRecord = {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstin?: string;
  billingContact?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

type CreateCustomerBody = {
  name?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstin?: string;
  billingContact?: string;
  status?: CustomerStatus;
};

type UpdateCustomerBody = CreateCustomerBody & {
  customerId?: string;
};

function normalizeCustomer(
  id: string,
  data: DocumentData,
): CustomerRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();

  return {
    id,
    customerId: String(data.customerId || id),
    name: String(data.name || "").trim(),
    phone: String(data.phone || "").trim(),
    email: data.email ? String(data.email).trim() : undefined,
    billingAddress: data.billingAddress
      ? String(data.billingAddress).trim()
      : undefined,
    city: data.city ? String(data.city).trim() : undefined,
    state: data.state ? String(data.state).trim() : undefined,
    postalCode: data.postalCode
      ? String(data.postalCode).trim()
      : undefined,
    gstin: data.gstin ? String(data.gstin).trim().toUpperCase() : undefined,
    billingContact: data.billingContact
      ? String(data.billingContact).trim()
      : undefined,
    status: statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

function validatePayload(body: CreateCustomerBody, partial = false) {
  const errors: string[] = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push("Customer name is required.");
    }
  }

  if (!partial || body.phone !== undefined) {
    if (!body.phone?.trim()) {
      errors.push("Phone is required.");
    } else if (!isValidPhone(body.phone)) {
      errors.push("Please enter a valid Indian phone number.");
    }
  }

  if (body.email?.trim() && !isValidEmail(body.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (body.postalCode?.trim() && !isValidIndianPinCode(body.postalCode)) {
    errors.push("Please enter a valid 6-digit PIN code.");
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
        "You do not have permission to view customers.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.CUSTOMERS)
      .get();

    let customers = snapshot.docs.map((doc) =>
      normalizeCustomer(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      customers = customers.filter((item) => item.status === status);
    }

    if (q) {
      customers = customers.filter((item) =>
        [
          item.customerId,
          item.name,
          item.phone,
          item.email,
          item.city,
          item.state,
          item.gstin,
          item.billingContact,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    customers.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(customers);
  } catch (error) {
    console.error("GET /api/logistics/customers failed", error);

    return errorResponse(
      "CUSTOMERS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load customers.",
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
        "You do not have permission to create customers.",
        403,
      );
    }

    let body: CreateCustomerBody;

    try {
      body = (await request.json()) as CreateCustomerBody;
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
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.CUSTOMERS).doc();

    const record: CustomerRecord = {
      id: ref.id,
      customerId: ref.id,
      name: body.name!.trim(),
      phone: body.phone!.trim(),
      email: body.email?.trim() || undefined,
      billingAddress: body.billingAddress?.trim() || undefined,
      city: body.city?.trim() || undefined,
      state: body.state?.trim() || undefined,
      postalCode: body.postalCode?.trim() || undefined,
      gstin: body.gstin?.trim().toUpperCase() || undefined,
      billingContact: body.billingContact?.trim() || undefined,
      status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "CUSTOMER_CREATE",
      module: "LOGISTICS",
      resourceType: "customer",
      resourceId: record.customerId,
      metadata: {
        name: record.name,
        phone: record.phone,
      },
    });

    return successResponse(record, 201, "Customer created.");
  } catch (error) {
    console.error("POST /api/logistics/customers failed", error);

    return errorResponse(
      "CUSTOMER_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create customer.",
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
        "You do not have permission to update customers.",
        403,
      );
    }

    let body: UpdateCustomerBody;

    try {
      body = (await request.json()) as UpdateCustomerBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const customerId = body.customerId?.trim();

    if (!customerId) {
      return errorResponse(
        "CUSTOMER_ID_REQUIRED",
        "customerId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.CUSTOMERS)
      .doc(customerId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "CUSTOMER_NOT_FOUND",
        "Customer was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.phone !== undefined) patch.phone = body.phone.trim();
    if (body.email !== undefined) {
      patch.email = body.email.trim() || null;
    }
    if (body.billingAddress !== undefined) {
      patch.billingAddress = body.billingAddress.trim() || null;
    }
    if (body.city !== undefined) patch.city = body.city.trim() || null;
    if (body.state !== undefined) patch.state = body.state.trim() || null;
    if (body.postalCode !== undefined) {
      patch.postalCode = body.postalCode.trim() || null;
    }
    if (body.gstin !== undefined) {
      patch.gstin = body.gstin.trim().toUpperCase() || null;
    }
    if (body.billingContact !== undefined) {
      patch.billingContact = body.billingContact.trim() || null;
    }
    if (body.status !== undefined) patch.status = body.status;

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeCustomer(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "CUSTOMER_UPDATE",
      module: "LOGISTICS",
      resourceType: "customer",
      resourceId: record.customerId,
      metadata: patch,
    });

    return successResponse(record, 200, "Customer updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/customers failed", error);

    return errorResponse(
      "CUSTOMER_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update customer.",
      500,
    );
  }
}