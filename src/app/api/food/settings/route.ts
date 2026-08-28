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
import { isValidEmail, isValidPhone } from "@/utils/validators";

type FoodSettings = {
  storeName: string;
  defaultCurrency: string;
  supportEmail: string;
  supportPhone: string;
  allowProductVariants: boolean;
  showOutOfStockProducts: boolean;
  allowProductReviews: boolean;
  acceptNewOrders: boolean;
  requirePaymentBeforeProcessing: boolean;
  enableOrderNotifications: boolean;
  paymentProvider: string;
  enableCashfreePayments: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

const SETTINGS_DOC_ID = "food";

const DEFAULT_SETTINGS: FoodSettings = {
  storeName: "Sreshta Foods",
  defaultCurrency: "INR",
  supportEmail: "",
  supportPhone: "",
  allowProductVariants: true,
  showOutOfStockProducts: false,
  allowProductReviews: false,
  acceptNewOrders: true,
  requirePaymentBeforeProcessing: true,
  enableOrderNotifications: true,
  paymentProvider: "Cashfree",
  enableCashfreePayments: false,
};

function settingsRef() {
  return adminDb
    .collection(FIRESTORE_COLLECTIONS.SETTINGS || "settings")
    .doc(SETTINGS_DOC_ID);
}

function normalizeSettings(data?: DocumentData | null): FoodSettings {
  const raw = data || {};

  return {
    storeName: String(raw.storeName || DEFAULT_SETTINGS.storeName).trim(),
    defaultCurrency: String(
      raw.defaultCurrency || DEFAULT_SETTINGS.defaultCurrency,
    )
      .trim()
      .toUpperCase(),
    supportEmail: String(raw.supportEmail || "").trim().toLowerCase(),
    supportPhone: String(raw.supportPhone || "").trim(),
    allowProductVariants:
      raw.allowProductVariants === undefined
        ? DEFAULT_SETTINGS.allowProductVariants
        : Boolean(raw.allowProductVariants),
    showOutOfStockProducts:
      raw.showOutOfStockProducts === undefined
        ? DEFAULT_SETTINGS.showOutOfStockProducts
        : Boolean(raw.showOutOfStockProducts),
    allowProductReviews:
      raw.allowProductReviews === undefined
        ? DEFAULT_SETTINGS.allowProductReviews
        : Boolean(raw.allowProductReviews),
    acceptNewOrders:
      raw.acceptNewOrders === undefined
        ? DEFAULT_SETTINGS.acceptNewOrders
        : Boolean(raw.acceptNewOrders),
    requirePaymentBeforeProcessing:
      raw.requirePaymentBeforeProcessing === undefined
        ? DEFAULT_SETTINGS.requirePaymentBeforeProcessing
        : Boolean(raw.requirePaymentBeforeProcessing),
    enableOrderNotifications:
      raw.enableOrderNotifications === undefined
        ? DEFAULT_SETTINGS.enableOrderNotifications
        : Boolean(raw.enableOrderNotifications),
    paymentProvider: String(
      raw.paymentProvider || DEFAULT_SETTINGS.paymentProvider,
    ).trim(),
    enableCashfreePayments:
      raw.enableCashfreePayments === undefined
        ? DEFAULT_SETTINGS.enableCashfreePayments
        : Boolean(raw.enableCashfreePayments),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
  };
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

    if (
      !can(user, "FOOD_PRODUCT_VIEW") &&
      !can(user, "FOOD_ORDER_VIEW") &&
      !can(user, "ADMIN_USER_MANAGE")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view food settings.",
        403,
      );
    }

    const snapshot = await settingsRef().get();

    if (!snapshot.exists) {
      return successResponse(DEFAULT_SETTINGS);
    }

    return successResponse(normalizeSettings(snapshot.data()));
  } catch (error) {
    console.error("GET /api/food/settings failed", error);

    return errorResponse(
      "FOOD_SETTINGS_LOAD_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load food settings.",
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

    if (
      !can(user, "FOOD_PRODUCT_UPDATE") &&
      !can(user, "FOOD_ORDER_UPDATE") &&
      !can(user, "ADMIN_USER_MANAGE")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update food settings.",
        403,
      );
    }

    let body: Partial<FoodSettings>;

    try {
      body = (await request.json()) as Partial<FoodSettings>;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const storeName = String(body.storeName || "").trim();
    const defaultCurrency = String(body.defaultCurrency || "")
      .trim()
      .toUpperCase();
    const supportEmail = String(body.supportEmail || "")
      .trim()
      .toLowerCase();
    const supportPhone = String(body.supportPhone || "").trim();

    if (!storeName) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Store name is required.",
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

    if (supportEmail && !isValidEmail(supportEmail)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Please enter a valid support email.",
        400,
      );
    }

    if (supportPhone && !isValidPhone(supportPhone)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Please enter a valid support phone number.",
        400,
      );
    }

    const now = new Date().toISOString();

    const record: FoodSettings = {
      storeName,
      defaultCurrency,
      supportEmail,
      supportPhone,
      allowProductVariants: Boolean(body.allowProductVariants),
      showOutOfStockProducts: Boolean(body.showOutOfStockProducts),
      allowProductReviews: Boolean(body.allowProductReviews),
      acceptNewOrders: Boolean(body.acceptNewOrders),
      requirePaymentBeforeProcessing: Boolean(
        body.requirePaymentBeforeProcessing,
      ),
      enableOrderNotifications: Boolean(body.enableOrderNotifications),
      paymentProvider: String(body.paymentProvider || "Cashfree").trim(),
      enableCashfreePayments: Boolean(body.enableCashfreePayments),
      updatedAt: now,
      updatedBy: user.userId,
    };

    await settingsRef().set(record, { merge: true });

    await writeAuditLog({
      userId: user.userId,
      action: "FOOD_SETTINGS_UPDATE",
      module: "FOOD",
      resourceType: "settings",
      resourceId: SETTINGS_DOC_ID,
      metadata: {
        storeName: record.storeName,
        acceptNewOrders: record.acceptNewOrders,
        enableCashfreePayments: record.enableCashfreePayments,
      },
    });

    return successResponse(record, 200, "Food settings saved.");
  } catch (error) {
    console.error("PUT /api/food/settings failed", error);

    return errorResponse(
      "FOOD_SETTINGS_SAVE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to save food settings.",
      500,
    );
  }
}