import { NextRequest } from "next/server";

import {
  adminDb,
} from "@/lib/firebase-admin";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

import {
  isValidAWB,
} from "@/utils/validators";

type RouteContext = {
  params: {
    awb: string;
  };
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: RouteContext,
) {
  try {
    const awb =
      params.awb.trim();

    if (!isValidAWB(awb)) {
      return errorResponse(
        "INVALID_AWB",
        "Invalid AWB.",
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
        "Shipment was not found.",
        404,
      );
    }

    const awbDoc =
      query.docs[0];

    const shipment =
      awbDoc.data();

    const eventsSnapshot =
      await adminDb
        .collection(
          "trackingEvents",
        )
        .where(
          "awb",
          "==",
          awb,
        )
        .get();

    const events =
      eventsSnapshot.docs
        .map(
          (doc) => doc.data(),
        )
        .sort(
          (a, b) =>
            new Date(
              String(
                a.eventTime,
              ),
            ).getTime() -
            new Date(
              String(
                b.eventTime,
              ),
            ).getTime(),
        );

    const currentUser =
      await getCurrentUser();

    const isAdmin =
      Boolean(currentUser);

    if (isAdmin) {
      return successResponse({
        shipment: {
          ...shipment,
          documentId:
            awbDoc.id,
        },
        events,
      });
    }

    /*
     * Public response.
     * Do NOT expose customer IDs, sender IDs,
     * receiver IDs, internal user IDs,
     * internal financial details, etc.
     */
    return successResponse({
      shipment: {
        awb:
          shipment.awb,

        currentStatus:
          shipment.currentStatus,

        origin:
          shipment.origin,

        destination:
          shipment.destination,

        shipmentDate:
          shipment.shipmentDate,

        latestLocation:
          shipment.latestLocation ??
          null,
      },

      events:
        events.map(
          (event) => ({
            trackingEventId:
              event.trackingEventId,

            status:
              event.status,

            trackingStageId:
              event.trackingStageId ??
              event.status,

            location:
              event.location ??
              null,

            remarks:
              event.remarks ??
              null,

            eventTime:
              event.eventTime,
          }),
        ),
    });
  } catch (error) {
    console.error(
      "GET /api/logistics/tracking/[awb]:",
      error,
    );

    return errorResponse(
      "TRACKING_FETCH_FAILED",
      "Unable to retrieve shipment tracking.",
      500,
    );
  }
}