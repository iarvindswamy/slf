import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  isValidEmail,
  isValidPhone,
  validateRequiredFields,
} from "@/utils/validators";

const BOOKING_REQUESTS = "bookingRequests";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const shipmentType = String(body.shipmentType || "").trim();
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    const weight =
      body.weight === undefined || body.weight === ""
        ? null
        : Number(body.weight);
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    const required = validateRequiredFields(
      { name, phone, shipmentType, origin, destination },
      {
        name: "Full name",
        phone: "Phone",
        shipmentType: "Shipment type",
        origin: "Origin",
        destination: "Destination",
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

    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return errorResponse(
        "INVALID_WEIGHT",
        "Weight must be a valid non-negative number.",
        400,
      );
    }

    const allowedShipmentTypes = [
      "document",
      "parcel",
      "commercial",
      "cargo",
    ];
    if (!allowedShipmentTypes.includes(shipmentType)) {
      return errorResponse(
        "INVALID_SHIPMENT_TYPE",
        "Invalid shipment type.",
        400,
      );
    }

    const ref = adminDb.collection(BOOKING_REQUESTS).doc();

    const payload = {
      id: ref.id,
      bookingRequestId: ref.id,
      name,
      phone,
      email: email || null,
      shipmentType,
      origin,
      destination,
      weight,
      service: service || null,
      message: message || null,
      status: "NEW",
      source: "PUBLIC_BOOK_FREIGHT",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return successResponse(
      {
        bookingRequestId: ref.id,
        status: "NEW",
      },
      201,
      "Booking request submitted successfully.",
    );
  } catch (error) {
    console.error("POST /api/logistics/book-request:", error);
    return errorResponse(
      "BOOK_REQUEST_FAILED",
      "Unable to submit booking request right now.",
      500,
    );
  }
}