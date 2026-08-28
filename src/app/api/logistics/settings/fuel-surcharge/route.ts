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

type FuelStatus = "Active" | "Inactive";

type FuelConfig = {
  name: string;
  effectiveFrom: string;
  percentage: string;
  minimumCharge: string;
  maximumCharge: string;
  status: FuelStatus;
  updatedAt?: string;
  updatedBy?: string;
};

const DOC_ID = "fuelSurcharge";

const DEFAULT_CONFIG: FuelConfig = {
  name: "Standard",
  effectiveFrom: "",
  percentage: "",
  minimumCharge: "",
  maximumCharge: "",
  status: "Active",
};

function configRef() {
  return adminDb
    .collection(FIRESTORE_COLLECTIONS.SETTINGS || "settings")
    .doc(DOC_ID);
}

function normalizeConfig(data?: DocumentData | null): FuelConfig {
  const raw = data || {};
  const statusRaw = String(raw.status || "Active");

  return {
    name: String(raw.name || DEFAULT_CONFIG.name).trim() || "Standard",
    effectiveFrom: String(raw.effectiveFrom || "").trim(),
    percentage: String(
      raw.percentage !== undefined && raw.percentage !== null
        ? raw.percentage
        : "",
    ).trim(),
    minimumCharge: String(
      raw.minimumCharge !== undefined && raw.minimumCharge !== null
        ? raw.minimumCharge
        : "",
    ).trim(),
    maximumCharge: String(
      raw.maximumCharge !== undefined && raw.maximumCharge !== null
        ? raw.maximumCharge
        : "",
    ).trim(),
    status: statusRaw === "Inactive" ? "Inactive" : "Active",
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
  };
}

function validateConfig(config: Partial<FuelConfig>): string[] {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push("Configuration name is required.");
  }

  if (config.percentage !== undefined && String(config.percentage).trim() !== "") {
    const percentage = Number(config.percentage);
    if (!Number.isFinite(percentage) || percentage < 0) {
      errors.push("Percentage must be a valid non-negative number.");
    }
  }

  if (
    config.minimumCharge !== undefined &&
    String(config.minimumCharge).trim() !== ""
  ) {
    const min = Number(config.minimumCharge);
    if (!Number.isFinite(min) || min < 0) {
      errors.push("Minimum charge must be a valid non-negative number.");
    }
  }

  if (
    config.maximumCharge !== undefined &&
    String(config.maximumCharge).trim() !== ""
  ) {
    const max = Number(config.maximumCharge);
    if (!Number.isFinite(max) || max < 0) {
      errors.push("Maximum charge must be a valid non-negative number.");
    }
  }

  const minVal =
    config.minimumCharge && String(config.minimumCharge).trim() !== ""
      ? Number(config.minimumCharge)
      : null;
  const maxVal =
    config.maximumCharge && String(config.maximumCharge).trim() !== ""
      ? Number(config.maximumCharge)
      : null;

  if (
    minVal !== null &&
    maxVal !== null &&
    Number.isFinite(minVal) &&
    Number.isFinite(maxVal) &&
    maxVal < minVal
  ) {
    errors.push("Maximum charge cannot be less than minimum charge.");
  }

  if (
    config.status !== undefined &&
    config.status !== "Active" &&
    config.status !== "Inactive"
  ) {
    errors.push("Status must be Active or Inactive.");
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
        "You do not have permission to view fuel surcharge settings.",
        403,
      );
    }

    const snapshot = await configRef().get();

    if (!snapshot.exists) {
      return successResponse({
        config: DEFAULT_CONFIG,
        fuelSurcharge: DEFAULT_CONFIG,
      });
    }

    const config = normalizeConfig(snapshot.data());

    return successResponse({
      config,
      fuelSurcharge: config,
    });
  } catch (error) {
    console.error(
      "GET /api/logistics/settings/fuel-surcharge failed",
      error,
    );

    return errorResponse(
      "FUEL_SURCHARGE_LOAD_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load fuel surcharge config.",
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
        "You do not have permission to update fuel surcharge settings.",
        403,
      );
    }

    let body: {
      config?: Partial<FuelConfig>;
      fuelSurcharge?: Partial<FuelConfig>;
    } & Partial<FuelConfig>;

    try {
      body = (await request.json()) as typeof body;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const incoming = body.config || body.fuelSurcharge || body;
    const errors = validateConfig(incoming);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const now = new Date().toISOString();

    const record: FuelConfig = {
      name: String(incoming.name || "Standard").trim(),
      effectiveFrom: String(incoming.effectiveFrom || "").trim(),
      percentage: String(incoming.percentage ?? "").trim(),
      minimumCharge: String(incoming.minimumCharge ?? "").trim(),
      maximumCharge: String(incoming.maximumCharge ?? "").trim(),
      status:
        String(incoming.status || "Active") === "Inactive"
          ? "Inactive"
          : "Active",
      updatedAt: now,
      updatedBy: user.userId,
    };

    await configRef().set(record, { merge: true });

    await writeAuditLog({
      userId: user.userId,
      action: "FUEL_SURCHARGE_UPDATE",
      module: "LOGISTICS",
      resourceType: "settings",
      resourceId: DOC_ID,
      metadata: {
        name: record.name,
        percentage: record.percentage,
        status: record.status,
      },
    });

    return successResponse(
      {
        config: record,
        fuelSurcharge: record,
      },
      200,
      "Fuel surcharge configuration saved.",
    );
  } catch (error) {
    console.error(
      "PUT /api/logistics/settings/fuel-surcharge failed",
      error,
    );

    return errorResponse(
      "FUEL_SURCHARGE_SAVE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to save fuel surcharge config.",
      500,
    );
  }
}