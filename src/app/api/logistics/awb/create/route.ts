import { NextRequest } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  can,
} from "@/lib/permissions";

import {
  writeAuditLog,
} from "@/lib/audit";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

import {
  calculateChargeableWeight,
  calculateVolumetricWeight,
} from "@/utils/calculations";

import {
  isValidGSTIN,
  positiveNumber,
  positiveInteger,
  requiredString,
} from "@/utils/validators";

import type {
  TrackingStatus,
  ShipmentPiece,
} from "@/types/logistics";

type CreateAWBBody = {
  customerId?: string;

  senderId?: string;
  receiverId?: string;

  origin?: string;
  destination?: string;

  serviceId?: string;
  serviceType?: string;

  shipmentDate?: string;
  description?: string;

  pieces?: Array<{
    quantity?: number;
    actualWeightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    description?: string;
  }>;

  gstin?: string;

  freight?: number;
  fuelSurcharge?: number;
  handlingCharges?: number;
  pickupCharges?: number;
  deliveryCharges?: number;
  otherCharges?: number;
  discount?: number;
  gstRate?: number;
};

function generateAWB() {
  const timestamp =
    Date.now()
      .toString()
      .slice(-8);

  const random =
    Math.floor(
      1000 +
        Math.random() * 9000,
    );

  return `SR${timestamp}${random}`;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (
      !can(
        user,
        "LOGISTICS_AWB_CREATE",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create an AWB.",
        403,
      );
    }

    let body: CreateAWBBody;

    try {
      body =
        await request.json();
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const customerId =
      requiredString(
        body.customerId,
        "customerId",
      );

    const senderId =
      requiredString(
        body.senderId,
        "senderId",
      );

    const receiverId =
      requiredString(
        body.receiverId,
        "receiverId",
      );

    const origin =
      requiredString(
        body.origin,
        "origin",
      );

    const destination =
      requiredString(
        body.destination,
        "destination",
      );

    const serviceId =
      requiredString(
        body.serviceId,
        "serviceId",
      );

    const shipmentDate =
      body.shipmentDate ??
      new Date().toISOString();

    const piecesInput =
      body.pieces ?? [];

    if (
      piecesInput.length === 0
    ) {
      return errorResponse(
        "PIECES_REQUIRED",
        "At least one shipment piece is required.",
        400,
      );
    }

    const pieces: ShipmentPiece[] =
      piecesInput.map(
        (piece, index) => {
          const quantity =
            positiveInteger(
              piece.quantity ?? 1,
              `pieces[${index}].quantity`,
            );

          const actualWeightKg =
            positiveNumber(
              piece.actualWeightKg ?? 0,
              `pieces[${index}].actualWeightKg`,
            );

          const lengthCm =
            positiveNumber(
              piece.lengthCm ?? 0,
              `pieces[${index}].lengthCm`,
            );

          const widthCm =
            positiveNumber(
              piece.widthCm ?? 0,
              `pieces[${index}].widthCm`,
            );

          const heightCm =
            positiveNumber(
              piece.heightCm ?? 0,
              `pieces[${index}].heightCm`,
            );

          const volumetricWeightKg =
            calculateVolumetricWeight(
              lengthCm,
              widthCm,
              heightCm,
              quantity,
            );

          return {
            pieceId:
              `piece_${index + 1}`,
            quantity,
            actualWeightKg,
            lengthCm,
            widthCm,
            heightCm,
            volumetricWeightKg,
            description:
              piece.description?.trim(),
          };
        },
      );

    const actualWeightKg =
      pieces.reduce(
        (
          total,
          piece,
        ) =>
          total +
          (piece.actualWeightKg ?? 0) *
            piece.quantity,
        0,
      );

    const volumetricWeightKg =
      pieces.reduce(
        (
          total,
          piece,
        ) =>
          total +
          (piece.volumetricWeightKg ??
            0),
        0,
      );

    const chargeableWeightKg =
      calculateChargeableWeight(
        actualWeightKg,
        volumetricWeightKg,
      );

    const gstin =
      body.gstin?.trim();

    if (
      gstin &&
      !isValidGSTIN(gstin)
    ) {
      return errorResponse(
        "INVALID_GSTIN",
        "GSTIN is invalid.",
        400,
      );
    }

    const freight =
      positiveNumber(
        body.freight ?? 0,
        "freight",
      );

    const fuelSurcharge =
      positiveNumber(
        body.fuelSurcharge ?? 0,
        "fuelSurcharge",
      );

    const handlingCharges =
      positiveNumber(
        body.handlingCharges ?? 0,
        "handlingCharges",
      );

    const pickupCharges =
      positiveNumber(
        body.pickupCharges ?? 0,
        "pickupCharges",
      );

    const deliveryCharges =
      positiveNumber(
        body.deliveryCharges ?? 0,
        "deliveryCharges",
      );

    const otherCharges =
      positiveNumber(
        body.otherCharges ?? 0,
        "otherCharges",
      );

    const discount =
      positiveNumber(
        body.discount ?? 0,
        "discount",
      );

    const taxableAmount =
      Math.max(
        0,
        freight +
          fuelSurcharge +
          handlingCharges +
          pickupCharges +
          deliveryCharges +
          otherCharges -
          discount,
      );

    const gstRate =
      body.gstRate ?? 18;

    const totalTax =
      taxableAmount *
      (gstRate / 100);

    const total =
      taxableAmount +
      totalTax;

    const awb =
      generateAWB();

    const now =
      new Date().toISOString();

    const trackingStageId =
      "BOOKED";

    const awbRef =
      adminDb
        .collection("awbs")
        .doc();

    const trackingEventRef =
      adminDb
        .collection("trackingEvents")
        .doc();

    const awbData = {
      awb,

      customerId,
      senderId,
      receiverId,

      origin,
      destination,

      serviceId,
      serviceType:
        body.serviceType ??
        null,

      shipmentDate,

      description:
        body.description?.trim() ??
        null,

      pieces,

      actualWeightKg,
      volumetricWeightKg,
      chargeableWeightKg,

      gstDetails: {
        gstin: gstin ?? null,
        taxableAmount,
        cgst:
          totalTax / 2,
        sgst:
          totalTax / 2,
        igst: 0,
        totalTax,
      },

      charges: {
        freight,
        fuelSurcharge,
        handlingCharges,
        pickupCharges,
        deliveryCharges,
        otherCharges,
        discount,
        taxableAmount,
        gst: totalTax,
        total,
      },

      currentStatus:
        "BOOKED" as TrackingStatus,

      latestLocation:
        origin,

      createdBy:
        user.userId,

      updatedBy:
        user.userId,

      createdAt: now,
      updatedAt: now,
    };

    const trackingEvent = {
      trackingEventId:
        trackingEventRef.id,

      awb,

      trackingStageId,

      status:
        "BOOKED" as TrackingStatus,

      location: origin,

      remarks:
        "Shipment booked.",

      eventTime: now,

      createdBy:
        user.userId,

      createdAt:
        FieldValue.serverTimestamp(),
    };

    const batch =
      adminDb.batch();

    batch.set(
      awbRef,
      {
        ...awbData,
        awbDocumentId:
          awbRef.id,
      },
    );

    batch.set(
      trackingEventRef,
      trackingEvent,
    );

    await batch.commit();

    await writeAuditLog({
      userId:
        user.userId,
      action:
        "AWB_CREATED",
      resourceType:
        "AWB",
      resourceId:
        awb,
      metadata: {
        customerId,
        senderId,
        receiverId,
        origin,
        destination,
        serviceId,
        chargeableWeightKg,
      },
    });

    return successResponse(
      {
        awb,
        status:
          "BOOKED",
        trackingEventId:
          trackingEventRef.id,
        shipment: awbData,
      },
      201,
      "AWB created successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/logistics/awb/create:",
      error,
    );

    return errorResponse(
      "AWB_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to create AWB.",
      500,
    );
  }
}