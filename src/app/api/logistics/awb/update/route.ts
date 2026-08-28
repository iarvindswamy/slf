import { NextRequest } from "next/server";

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
  isValidGSTIN,
  isValidAWB,
  positiveNumber,
} from "@/utils/validators";

type UpdateAWBBody = {
  awb?: string;

  customerId?: string;
  senderId?: string;
  receiverId?: string;

  origin?: string;
  destination?: string;

  serviceId?: string;
  serviceType?: string;

  shipmentDate?: string;
  description?: string;

  gstin?: string;

  charges?: {
    freight?: number;
    fuelSurcharge?: number;
    handlingCharges?: number;
    pickupCharges?: number;
    deliveryCharges?: number;
    otherCharges?: number;
    discount?: number;
  };
};

export async function PATCH(
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
        "LOGISTICS_AWB_UPDATE",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update an AWB.",
        403,
      );
    }

    let body: UpdateAWBBody;

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

    const awb =
      body.awb?.trim();

    if (
      !awb ||
      !isValidAWB(awb)
    ) {
      return errorResponse(
        "INVALID_AWB",
        "A valid AWB is required.",
        400,
      );
    }

    const query =
      await adminDb
        .collection("awbs")
        .where(
          "awb",
          "==",
          awb,
        )
        .limit(1)
        .get();

    if (query.empty) {
      return errorResponse(
        "AWB_NOT_FOUND",
        "AWB was not found.",
        404,
      );
    }

    const doc =
      query.docs[0];

    const current =
      doc.data();

    const updates: Record<
      string,
      unknown
    > = {
      updatedBy:
        user.userId,
      updatedAt:
        new Date().toISOString(),
    };

    const directFields = [
      "customerId",
      "senderId",
      "receiverId",
      "origin",
      "destination",
      "serviceId",
      "serviceType",
      "shipmentDate",
      "description",
    ] as const;

    for (const field of directFields) {
      const value =
        body[field];

      if (
        typeof value ===
        "string"
      ) {
        updates[field] =
          value.trim();
      }
    }

    if (body.gstin !== undefined) {
      const gstin =
        body.gstin.trim();

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

      updates[
        "gstDetails.gstin"
      ] = gstin || null;
    }

    if (body.charges) {
      const oldCharges =
        current.charges ?? {};

      const freight =
        body.charges.freight !==
        undefined
          ? positiveNumber(
              body.charges.freight,
              "freight",
            )
          : Number(
              oldCharges.freight ?? 0,
            );

      const fuelSurcharge =
        body.charges
          .fuelSurcharge !==
        undefined
          ? positiveNumber(
              body.charges
                .fuelSurcharge,
              "fuelSurcharge",
            )
          : Number(
              oldCharges.fuelSurcharge ??
                0,
            );

      const handlingCharges =
        body.charges
          .handlingCharges !==
        undefined
          ? positiveNumber(
              body.charges
                .handlingCharges,
              "handlingCharges",
            )
          : Number(
              oldCharges
                .handlingCharges ??
                0,
            );

      const pickupCharges =
        body.charges
          .pickupCharges !==
        undefined
          ? positiveNumber(
              body.charges
                .pickupCharges,
              "pickupCharges",
            )
          : Number(
              oldCharges.pickupCharges ??
                0,
            );

      const deliveryCharges =
        body.charges
          .deliveryCharges !==
        undefined
          ? positiveNumber(
              body.charges
                .deliveryCharges,
              "deliveryCharges",
            )
          : Number(
              oldCharges
                .deliveryCharges ??
                0,
            );

      const otherCharges =
        body.charges
          .otherCharges !==
        undefined
          ? positiveNumber(
              body.charges
                .otherCharges,
              "otherCharges",
            )
          : Number(
              oldCharges
                .otherCharges ??
                0,
            );

      const discount =
        body.charges.discount !==
        undefined
          ? positiveNumber(
              body.charges.discount,
              "discount",
            )
          : Number(
              oldCharges.discount ??
                0,
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
        Number(
          current.gstRate ?? 18,
        );

      const gst =
        taxableAmount *
        (gstRate / 100);

      updates.charges = {
        freight,
        fuelSurcharge,
        handlingCharges,
        pickupCharges,
        deliveryCharges,
        otherCharges,
        discount,
        taxableAmount,
        gst,
        total:
          taxableAmount + gst,
      };

      updates[
        "gstDetails.taxableAmount"
      ] = taxableAmount;

      updates[
        "gstDetails.cgst"
      ] = gst / 2;

      updates[
        "gstDetails.sgst"
      ] = gst / 2;

      updates[
        "gstDetails.totalTax"
      ] = gst;
    }

    await doc.ref.update(
      updates,
    );

    await writeAuditLog({
      userId:
        user.userId,
      action:
        "AWB_UPDATED",
      resourceType:
        "AWB",
      resourceId:
        awb,
      metadata: {
        fields:
          Object.keys(
            updates,
          ),
      },
    });

    const updated =
      await doc.ref.get();

    return successResponse(
      {
        awb:
          updated.data(),
      },
      200,
      "AWB updated successfully.",
    );
  } catch (error) {
    console.error(
      "PATCH /api/logistics/awb/update:",
      error,
    );

    return errorResponse(
      "AWB_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to update AWB.",
      500,
    );
  }
}