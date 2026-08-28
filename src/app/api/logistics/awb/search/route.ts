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
  successResponse,
  errorResponse,
} from "@/lib/api-response";

import {
  isValidAWB,
} from "@/utils/validators";

export async function GET(
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
        "LOGISTICS_AWB_VIEW",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view AWBs.",
        403,
      );
    }

    const { searchParams } =
      new URL(
        request.url,
      );

    const awb =
      searchParams
        .get("awb")
        ?.trim();

    const customerId =
      searchParams
        .get("customerId")
        ?.trim();

    const status =
      searchParams
        .get("status")
        ?.trim();

    const origin =
      searchParams
        .get("origin")
        ?.trim();

    const destination =
      searchParams
        .get("destination")
        ?.trim();

    const limitParam =
      Number(
        searchParams.get(
          "limit",
        ) ?? 50,
      );

    const limit = Math.min(
      Math.max(
        limitParam || 50,
        1,
      ),
      100,
    );

    let query:
      FirebaseFirestore.Query =
      adminDb.collection(
        "awbs",
      );

    if (awb) {
      if (!isValidAWB(awb)) {
        return errorResponse(
          "INVALID_AWB",
          "Invalid AWB format.",
          400,
        );
      }

      query = query.where(
        "awb",
        "==",
        awb,
      );
    } else if (
      customerId
    ) {
      query = query.where(
        "customerId",
        "==",
        customerId,
      );
    } else if (
      status
    ) {
      query = query.where(
        "currentStatus",
        "==",
        status,
      );
    } else if (
      origin
    ) {
      query = query.where(
        "origin",
        "==",
        origin,
      );
    } else if (
      destination
    ) {
      query = query.where(
        "destination",
        "==",
        destination,
      );
    }

    const snapshot =
      await query
        .limit(limit)
        .get();

    let results =
      snapshot.docs.map(
        (doc) => ({
          ...doc.data(),
          documentId:
            doc.id,
        }),
      );

    /*
     * Optional filters that are applied
     * after the Firestore query to avoid
     * forcing many composite indexes.
     */
    if (
      customerId &&
      !awb
    ) {
      results =
        results.filter(
          (item) =>
            item.customerId ===
            customerId,
        );
    }

    if (
      status &&
      !awb
    ) {
      results =
        results.filter(
          (item) =>
            item.currentStatus ===
            status,
        );
    }

    if (
      origin &&
      !awb
    ) {
      results =
        results.filter(
          (item) =>
            item.origin ===
            origin,
        );
    }

    if (
      destination &&
      !awb
    ) {
      results =
        results.filter(
          (item) =>
            item.destination ===
            destination,
        );
    }

    return successResponse(
      {
        results,
        count:
          results.length,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/logistics/awb/search:",
      error,
    );

    return errorResponse(
      "AWB_SEARCH_FAILED",
      "Unable to search AWBs.",
      500,
    );
  }
}