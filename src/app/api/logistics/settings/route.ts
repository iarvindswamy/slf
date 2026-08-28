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

type LogisticsSettings = {
  companyDisplayName: string;
  defaultServiceCenter: string;
  defaultCurrency: string;
  requireCustomerSelection: boolean;
  requireReceiverPhone: boolean;
  requireShipmentDescription: boolean;
  enablePublicTracking: boolean;
  showLatestLocationPublicly: boolean;
  showInternalNotesPublicly: boolean;
  enableTransactionalNotifications: boolean;
  enableWhatsAppIntegration: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

const SETTINGS_DOC_ID = "logistics";

const DEFAULT_SETTINGS: LogisticsSettings = {
  companyDisplayName: "Sreshta Logistics",
  defaultServiceCenter: "",
  defaultCurrency: "INR",
  requireCustomerSelection: true,
  requireReceiverPhone: true,
  requireShipmentDescription: true,
  enablePublicTracking: true,
  showLatestLocationPublicly: true,
  showInternalNotesPublicly: false,
  enableTransactionalNotifications: true,
  enableWhatsAppIntegration: false,
};

function normalizeSettings(data?: DocumentData | null): LogisticsSettings {
  const raw = data || {};

  return {
    companyDisplayName: String(
      raw.companyDisplayName || DEFAULT_SETTINGS.companyDisplayName,
    ).trim(),
    defaultServiceCenter: String(raw.defaultServiceCenter || "").trim(),
    defaultCurrency: String(
      raw.defaultCurrency || DEFAULT_SETTINGS.defaultCurrency,
    )
      .trim()
      .toUpperCase(),
    requireCustomerSelection:
      raw.requireCustomerSelection === undefined
        ? DEFAULT_SETTINGS.requireCustomerSelection
        : Boolean(raw.requireCustomerSelection),
    requireReceiverPhone:
      raw.requireReceiverPhone === undefined
        ? DEFAULT_SETTINGS.requireReceiverPhone
        : Boolean(raw.requireReceiverPhone),
    requireShipmentDescription:
      raw.requireShipmentDescription === undefined
        ? DEFAULT_SETTINGS.requireShipmentDescription
        : Boolean(raw.requireShipmentDescription),
    enablePublicTracking:
      raw.enablePublicTracking === undefined
        ? DEFAULT_SETTINGS.enablePublicTracking
        : Boolean(raw.enablePublicTracking),
    showLatestLocationPublicly:
      raw.showLatestLocationPublicly === undefined
        ? DEFAULT_SETTINGS.showLatestLocationPublicly
        : Boolean(raw.showLatestLocationPublicly),
    showInternalNotesPublicly:
      raw.showInternalNotesPublicly === undefined
        ? DEFAULT_SETTINGS.showInternalNotesPublicly
        : Boolean(raw.showInternalNotesPublicly),
    enableTransactionalNotifications:
      raw.enableTransactionalNotifications === undefined
        ? DEFAULT_SETTINGS.enableTransactionalNotifications
        : Boolean(raw.enableTransactionalNotifications),
    enableWhatsAppIntegration:
      raw.enableWhatsAppIntegration === undefined
        ? DEFAULT_SETTINGS.enableWhatsAppIntegration
        : Boolean(raw.enableWhatsAppIntegration),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
  };
}

function settingsRef() {
  return adminDb
    .collection(FIRESTORE_COLLECTIONS.SETTINGS || "settings")
    .doc(SETTINGS_DOC_ID);
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
        "You do not have permission to view logistics settings.",
        403,
      );
    }

    const snapshot = await settingsRef().get();

    if (!snapshot.exists) {
      return successResponse(DEFAULT_SETTINGS);
    }

    return successResponse(normalizeSettings(snapshot.data()));
  } catch (error) {
    console.error("GET /api/logistics/settings failed", error);

    return errorResponse(
      "SETTINGS_LOAD_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load logistics settings.",
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
        "You do not have permission to update logistics settings.",
        403,
      );
    }

    let body: Partial<LogisticsSettings>;

    try {
      body = (await request.json()) as Partial<LogisticsSettings>;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const companyDisplayName = String(
      body.companyDisplayName || "",
    ).trim();
    const defaultCurrency = String(body.defaultCurrency || "")
      .trim()
      .toUpperCase();

    if (!companyDisplayName) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Company display name is required.",
        400,
      );
    }

    if (!defaultCurrency) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Default currency is required.",
        400,
      );
    }

    const now = new Date().toISOString();

    const record: LogisticsSettings = {
      companyDisplayName,
      defaultServiceCenter: String(body.defaultServiceCenter || "").trim(),
      defaultCurrency,
      requireCustomerSelection: Boolean(body.requireCustomerSelection),
      requireReceiverPhone: Boolean(body.requireReceiverPhone),
      requireShipmentDescription: Boolean(body.requireShipmentDescription),
      enablePublicTracking: Boolean(body.enablePublicTracking),
      showLatestLocationPublicly: Boolean(body.showLatestLocationPublicly),
      showInternalNotesPublicly: Boolean(body.showInternalNotesPublicly),
      enableTransactionalNotifications: Boolean(
        body.enableTransactionalNotifications,
      ),
      enableWhatsAppIntegration: Boolean(body.enableWhatsAppIntegration),
      updatedAt: now,
      updatedBy: user.userId,
    };

    await settingsRef().set(record, { merge: true });

    await writeAuditLog({
      userId: user.userId,
      action: "LOGISTICS_SETTINGS_UPDATE",
      module: "LOGISTICS",
      resourceType: "settings",
      resourceId: SETTINGS_DOC_ID,
      metadata: {
        companyDisplayName: record.companyDisplayName,
        defaultCurrency: record.defaultCurrency,
      },
    });

    return successResponse(record, 200, "Logistics settings saved.");
  } catch (error) {
    console.error("PUT /api/logistics/settings failed", error);

    return errorResponse(
      "SETTINGS_SAVE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to save logistics settings.",
      500,
    );
  }
}