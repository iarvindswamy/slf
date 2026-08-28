import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";
import {
  isValidEmail,
  isValidPhone,
  isValidIndianPinCode,
  validateRequiredFields,
} from "@/utils/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const date = String(body.date || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const pinCode = String(body.pinCode || "").trim();
    const shipmentType = String(body.shipmentType || "").trim();
    const weight =
      body.weight === undefined || body.weight === ""
        ? null
        : Number(body.weight);
    const message = String(body.message || "").trim();

    const required = validateRequiredFields(
      {
        name,
        phone,
        date,
        address,
        city,
        pinCode,
        shipmentType,
      },
      {
        name: "Name",
        phone: "Phone",
        date: "Preferred date",
        address: "Pickup address",
        city: "City",
        pinCode: "PIN code",
        shipmentType: "Shipment type",
      },
    );

    if (!required.valid) {
      const firstError = Object.values(required.errors)[0];
      return errorResponse("VALIDATION_ERROR", firstError, 400);
    }

    if (!isValidPhone(phone)) {
      return errorResponse(
        "INVALID_PHONE",
        "Please enter a valid Indian phone number.",
        400,
      );
    }

    if (email && !isValidEmail(email)) {
      return errorResponse(
        "INVALID_EMAIL",
        "Please enter a valid email address.",
        400,
      );
    }

    if (!isValidIndianPinCode(pinCode)) {
      return errorResponse(
        "INVALID_PIN",
        "Please enter a valid 6-digit PIN code.",
        400,
      );
    }

    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return errorResponse(
        "INVALID_WEIGHT",
        "Weight must be a valid non-negative number.",
        400,
      );
    }

    const allowedTypes = ["document", "parcel", "commercial", "cargo"];
    if (!allowedTypes.includes(shipmentType)) {
      return errorResponse(
        "INVALID_SHIPMENT_TYPE",
        "Invalid shipment type.",
        400,
      );
    }

    // Basic date check (YYYY-MM-DD)
    const preferredDate = new Date(date);
    if (Number.isNaN(preferredDate.getTime())) {
      return errorResponse(
        "INVALID_DATE",
        "Please enter a valid preferred date.",
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.PICKUP_REQUESTS)
      .doc();

    const payload = {
      id: ref.id,
      pickupRequestId: ref.id,
      name,
      phone,
      email: email || null,
      preferredDate: date,
      address,
      city,
      pinCode,
      shipmentType,
      weight,
      message: message || null,
      status: "NEW",
      source: "PUBLIC_PICKUP_REQUEST",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return successResponse(
      {
        pickupRequestId: ref.id,
        status: "NEW",
      },
      201,
      "Pickup request submitted successfully.",
    );
  } catch (error) {
    console.error("POST /api/logistics/pickup-request:", error);
    return errorResponse(
      "PICKUP_REQUEST_FAILED",
      "Unable to submit pickup request right now.",
      500,
    );
  }
}