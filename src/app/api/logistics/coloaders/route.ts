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

type CoLoaderStatus = "ACTIVE" | "INACTIVE";

type CoLoaderRecord = {
  id: string;
  coloaderId: string;
  name: string;
  location: string;
  contact: string;
  status: CoLoaderStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  location?: string;
  contact?: string;
  status?: CoLoaderStatus;
};

type UpdateBody = CreateBody & {
  id?: string;
  coloaderId?: string;
};

function collectionRef() {
  return adminDb.collection(
    FIRESTORE_COLLECTIONS.CO_LOADERS || "coloaders",
  );
}

function normalizeCoLoader(id: string, data: DocumentData): CoLoaderRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();
  const enabled =
    data.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    coloaderId: String(data.coloaderId || id),
    name: String(data.name || "").trim(),
    location: String(data.location || data.serviceCenter || data.city || "")
      .trim(),
    contact: String(data.contact || data.phone || "").trim(),
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

function validateCreate(body: CreateBody): string[] {
  const errors: string[] = [];

  if (!body.name?.trim()) {
    errors.push("Company name is required.");
  }

  if (!body.location?.trim()) {
    errors.push("Service center / location is required.");
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
        "You do not have permission to view co-loaders.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await collectionRef().get();

    let items = snapshot.docs.map((doc) =>
      normalizeCoLoader(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      items = items.filter((item) => item.status === status);
    }

    if (q) {
      items = items.filter((item) =>
        [
          item.coloaderId,
          item.name,
          item.location,
          item.contact,
          item.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    items.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(items);
  } catch (error) {
    console.error("GET /api/logistics/coloaders failed", error);

    return errorResponse(
      "COLOADERS_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load co-loaders.",
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
        "You do not have permission to create co-loaders.",
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

    const errors = validateCreate(body);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const now = new Date().toISOString();
    const ref = collectionRef().doc();
    const enabled = body.status !== "INACTIVE";

    const record: CoLoaderRecord = {
      id: ref.id,
      coloaderId: ref.id,
      name: body.name!.trim(),
      location: body.location!.trim(),
      contact: body.contact?.trim() || "",
      status: enabled ? "ACTIVE" : "INACTIVE",
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "COLOADER_CREATE",
      module: "LOGISTICS",
      resourceType: "coloader",
      resourceId: record.coloaderId,
      metadata: {
        name: record.name,
        location: record.location,
      },
    });

    return successResponse(record, 201, "Co-loader created.");
  } catch (error) {
    console.error("POST /api/logistics/coloaders failed", error);

    return errorResponse(
      "COLOADER_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create co-loader.",
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
        "You do not have permission to update co-loaders.",
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

    const coloaderId = (body.coloaderId || body.id || "").trim();

    if (!coloaderId) {
      return errorResponse(
        "COLOADER_ID_REQUIRED",
        "id / coloaderId is required.",
        400,
      );
    }

    const ref = collectionRef().doc(coloaderId);
    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "COLOADER_NOT_FOUND",
        "Co-loader was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Company name cannot be empty.",
          400,
        );
      }
      patch.name = body.name.trim();
    }

    if (body.location !== undefined) {
      if (!body.location.trim()) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Location cannot be empty.",
          400,
        );
      }
      patch.location = body.location.trim();
    }

    if (body.contact !== undefined) {
      patch.contact = body.contact.trim();
    }

    if (body.status !== undefined) {
      if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
        return errorResponse(
          "VALIDATION_ERROR",
          "Status must be ACTIVE or INACTIVE.",
          400,
        );
      }
      patch.status = body.status;
      patch.enabled = body.status === "ACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeCoLoader(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "COLOADER_UPDATE",
      module: "LOGISTICS",
      resourceType: "coloader",
      resourceId: record.coloaderId,
      metadata: patch,
    });

    return successResponse(record, 200, "Co-loader updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/coloaders failed", error);

    return errorResponse(
      "COLOADER_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update co-loader.",
      500,
    );
  }
}