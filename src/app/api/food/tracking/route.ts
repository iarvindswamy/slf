import { NextRequest } from "next/server";

import {
  adminDb,
} from "@/lib/firebase-admin";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

const PUBLIC_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function GET(
  request: NextRequest,
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url,
    );

    const orderId =
      searchParams.get(
        "orderId",
      )?.trim();

    if (!orderId) {
      return errorResponse(
        "ORDER_ID_REQUIRED",
        "orderId is required.",
        400,
      );
    }

    const ref =
      adminDb
        .collection(
          "foodOrders",
        )
        .doc(orderId);

    const snapshot =
      await ref.get();

    if (!snapshot.exists) {
      return errorResponse(
        "ORDER_NOT_FOUND",
        "Order was not found.",
        404,
      );
    }

    const order =
      snapshot.data();

    const currentStatus =
      order?.currentStatus;

    if (
      !PUBLIC_STATUSES.includes(
        currentStatus,
      )
    ) {
      return errorResponse(
        "INVALID_ORDER_STATUS",
        "Order has an invalid status.",
        500,
      );
    }

    return successResponse({
      tracking: {
        orderId,

        status:
          currentStatus,

        createdAt:
          order?.createdAt,

        updatedAt:
          order?.updatedAt,

        shippingAddress: {
          city:
            order?.shippingAddress
              ?.city,

          state:
            order?.shippingAddress
              ?.state,
        },
      },
    });
  } catch (error) {
    console.error(
      "GET /api/food/tracking",
      error,
    );

    return errorResponse(
      "TRACKING_FAILED",
      "Unable to retrieve order tracking.",
      500,
    );
  }
}