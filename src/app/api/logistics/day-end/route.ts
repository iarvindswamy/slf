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

type DayEndBody = {
  date?: string;
  remarks?: string;
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
        "LOGISTICS_DAY_END",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to perform day-end operations.",
        403,
      );
    }

    let body: DayEndBody;

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

    const date =
      body.date ??
      new Date()
        .toISOString()
        .slice(0, 10);

    const existing =
      await adminDb
        .collection(
          "dayEndRecords",
        )
        .where(
          "date",
          "==",
          date,
        )
        .limit(1)
        .get();

    if (
      !existing.empty
    ) {
      return errorResponse(
        "DAY_END_ALREADY_COMPLETED",
        `Day-end has already been completed for ${date}.`,
        409,
      );
    }

    const awbsSnapshot =
      await adminDb
        .collection("awbs")
        .get();

    const awbs =
      awbsSnapshot.docs.map(
        (doc) => doc.data(),
      );

    const dateAWBs =
      awbs.filter(
        (awb) => {
          const shipmentDate =
            String(
              awb.shipmentDate ??
                "",
            );

          return shipmentDate.startsWith(
            date,
          );
        },
      );

    const totalAWBs =
      dateAWBs.length;

    const delivered =
      dateAWBs.filter(
        (awb) =>
          awb.currentStatus ===
          "DELIVERED",
      ).length;

    const inTransit =
      dateAWBs.filter(
        (awb) =>
          awb.currentStatus ===
          "IN_TRANSIT",
      ).length;

    const exceptions =
      dateAWBs.filter(
        (awb) =>
          awb.currentStatus ===
            "EXCEPTION" ||
          awb.currentStatus ===
            "ON_HOLD",
      ).length;

    const cancelled =
      dateAWBs.filter(
        (awb) =>
          awb.currentStatus ===
          "CANCELLED",
      ).length;

    const revenue =
      dateAWBs.reduce(
        (
          total,
          awb,
        ) =>
          total +
          Number(
            awb.charges?.total ??
              0,
          ),
        0,
      );

    const dayEndRef =
      adminDb
        .collection(
          "dayEndRecords",
        )
        .doc();

    const record = {
      dayEndRecordId:
        dayEndRef.id,

      date,

      status:
        "COMPLETED",

      completedBy:
        user.userId,

      completedAt:
        new Date().toISOString(),

      remarks:
        body.remarks?.trim() ??
        null,

      summary: {
        totalAWBs,
        delivered,
        inTransit,
        exceptions,
        cancelled,
        revenue,
      },
    };

    await dayEndRef.set(
      record,
    );

    await writeAuditLog({
      userId:
        user.userId,
      action:
        "DAY_END_COMPLETED",
      resourceType:
        "DAY_END",
      resourceId:
        dayEndRef.id,
      metadata: {
        date,
        summary:
          record.summary,
      },
    });

    return successResponse(
      {
        dayEnd:
          record,
      },
      201,
      "Day-end completed successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/logistics/day-end:",
      error,
    );

    return errorResponse(
      "DAY_END_FAILED",
      "Unable to complete day-end operation.",
      500,
    );
  }
}