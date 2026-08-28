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
  isValidAWB,
  requiredString,
} from "@/utils/validators";

import {
  TRACKING_STATUSES,
  type TrackingStatus,
} from "@/types/logistics";

type TrackingUpdateBody = {
  awb?: string;

  status?: TrackingStatus;

  trackingStageId?: string;

  location?: string;

  remarks?: string;

  eventTime?: string;
};

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
        "LOGISTICS_TRACKING_UPDATE",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update tracking.",
        403,
      );
    }

    let body: TrackingUpdateBody;

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
      requiredString(
        body.awb,
        "awb",
      );

    if (!isValidAWB(awb)) {
      return errorResponse(
        "INVALID_AWB",
        "Invalid AWB.",
        400,
      );
    }

    const status =
      body.status;

    if (
      !status ||
      !TRACKING_STATUSES.includes(
        status,
      )
    ) {
      return errorResponse(
        "INVALID_TRACKING_STATUS",
        "Invalid tracking status.",
        400,
      );
    }

    const awbQuery =
      await adminDb
        .collection("awbs")
        .where(
          "awb",
          "==",
          awb,
        )
        .limit(1)
        .get();

    if (awbQuery.empty) {
      return errorResponse(
        "AWB_NOT_FOUND",
        "AWB was not found.",
        404,
      );
    }

    const awbDoc =
      awbQuery.docs[0];

    const current =
      awbDoc.data();

    if (
      current.currentStatus ===
        "CANCELLED" &&
      status !== "CANCELLED"
    ) {
      return errorResponse(
        "CANCELLED_AWB",
        "A cancelled shipment cannot be moved to another status.",
        409,
      );
    }

    if (
      current.currentStatus ===
        "DELIVERED" &&
      status !== "DELIVERED"
    ) {
      return errorResponse(
        "DELIVERED_AWB",
        "A delivered shipment cannot be moved to another status.",
        409,
      );
    }

    const now =
      body.eventTime ??
      new Date().toISOString();

    const eventRef =
      adminDb
        .collection(
          "trackingEvents",
        )
        .doc();

    const trackingEvent = {
      trackingEventId:
        eventRef.id,

      awb,

      trackingStageId:
        body.trackingStageId ??
        status,

      status,

      location:
        body.location?.trim() ??
        null,

      remarks:
        body.remarks?.trim() ??
        null,

      eventTime: now,

      createdBy:
        user.userId,

      createdAt:
        new Date().toISOString(),
    };

    const batch =
      adminDb.batch();

    batch.set(
      eventRef,
      trackingEvent,
    );

    batch.update(
      awbDoc.ref,
      {
        currentStatus:
          status,

        latestLocation:
          body.location?.trim() ??
          current.latestLocation ??
          null,

        updatedBy:
          user.userId,

        updatedAt:
          new Date().toISOString(),
      },
    );

    await batch.commit();

    await writeAuditLog({
      userId:
        user.userId,
      action:
        "TRACKING_STATUS_CHANGED",
      resourceType:
        "AWB",
      resourceId:
        awb,
      metadata: {
        previousStatus:
          current.currentStatus,
        newStatus:
          status,
        location:
          body.location ??
          null,
        trackingEventId:
          eventRef.id,
      },
    });

    return successResponse(
      {
        trackingEventId:
          eventRef.id,

        awb,

        status,

        event:
          trackingEvent,
      },
      201,
      "Tracking updated successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/logistics/tracking/update:",
      error,
    );

    return errorResponse(
      "TRACKING_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to update tracking.",
      500,
    );
  }
}