// import {
//   NextRequest,
// } from "next/server";

// import crypto from "crypto";

// import {
//   adminDb,
// } from "@/lib/firebase-admin";

// import {
//   writeAuditLog,
// } from "@/lib/audit";

// import {
//   successResponse,
//   errorResponse,
// } from "@/lib/api-response";

// function verifySignature(
//   timestamp: string,
//   rawBody: string,
//   signature: string,
//   secret: string,
// ) {
//   const signedPayload =
//     timestamp +
//     rawBody;

//   const expected =
//     crypto
//       .createHmac(
//         "sha256",
//         secret,
//       )
//       .update(
//         signedPayload,
//       )
//       .digest("base64");

//   try {
//     return crypto.timingSafeEqual(
//       Buffer.from(
//         expected,
//       ),
//       Buffer.from(
//         signature,
//       ),
//     );
//   } catch {
//     return false;
//   }
// }

// function getPaymentData(
//   payload: any,
// ) {
//   return (
//     payload?.data
//       ?.payment ??
//     payload?.data ??
//     {}
//   );
// }

// export async function POST(
//   request: NextRequest,
// ) {
//   try {
//     const secret =
//       process.env.CASHFREE_SECRET_KEY;

//     if (!secret) {
//       return errorResponse(
//         "CASHFREE_SECRET_MISSING",
//         "Cashfree secret key is not configured.",
//         500,
//       );
//     }

//     /*
//      * IMPORTANT:
//      * Read raw text before parsing JSON.
//      */
//     const rawBody =
//       await request.text();

//     const timestamp =
//       request.headers.get(
//         "x-webhook-timestamp",
//       );

//     const signature =
//       request.headers.get(
//         "x-webhook-signature",
//       );

//     const idempotencyKey =
//       request.headers.get(
//         "x-idempotency-key",
//       );

//     if (
//       !timestamp ||
//       !signature
//     ) {
//       return errorResponse(
//         "INVALID_WEBHOOK",
//         "Missing Cashfree webhook signature.",
//         401,
//       );
//     }

//     const valid =
//       verifySignature(
//         timestamp,
//         rawBody,
//         signature,
//         secret,
//       );

//     if (!valid) {
//       return errorResponse(
//         "INVALID_SIGNATURE",
//         "Invalid Cashfree webhook signature.",
//         401,
//       );
//     }

//     let payload: any;

//     try {
//       payload =
//         JSON.parse(
//           rawBody,
//         );
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid webhook JSON.",
//         400,
//       );
//     }

//     const webhookType =
//       String(
//         payload?.type ??
//           "",
//       ).toUpperCase();

//     const payment =
//       getPaymentData(
//         payload,
//       );

//     const orderId =
//       payment?.order_id ??
//       payload?.data
//         ?.order
//         ?.order_id;

//     if (!orderId) {
//       /*
//        * Signature is valid, but this event
//        * isn't relevant to our order flow.
//        */
//       return successResponse(
//         {
//           processed: false,
//           reason:
//             "No order ID in webhook.",
//         },
//       );
//     }

//     /*
//      * Idempotency:
//      * Cashfree may deliver a webhook more
//      * than once.
//      */
//     if (idempotencyKey) {
//       const duplicateRef =
//         adminDb
//           .collection(
//             "paymentReferences",
//           )
//           .where(
//             "webhookIdempotencyKey",
//             "==",
//             idempotencyKey,
//           )
//           .limit(1);

//       const duplicate =
//         await duplicateRef.get();

//       if (!duplicate.empty) {
//         return successResponse({
//           processed: true,
//           duplicate: true,
//         });
//       }
//     }

//     const orderRef =
//       adminDb
//         .collection(
//           "foodOrders",
//         )
//         .doc(orderId);

//     const orderSnapshot =
//       await orderRef.get();

//     if (!orderSnapshot.exists) {
//       return errorResponse(
//         "ORDER_NOT_FOUND",
//         "Food order does not exist.",
//         404,
//       );
//     }

//     const order =
//       orderSnapshot.data();

//     const paymentStatus =
//       String(
//         payment?.payment_status ??
//           "",
//       ).toUpperCase();

//     const paymentAmount =
//       Number(
//         payment?.payment_amount ??
//           payment?.order_amount ??
//           0,
//       );

//     const expectedAmount =
//       Number(
//         order?.total ?? 0,
//       );

//     /*
//      * Do not mark an order paid if the
//      * amount does not match our server-side
//      * order total.
//      */
//     const amountMatches =
//       Math.abs(
//         paymentAmount -
//           expectedAmount,
//       ) < 0.01;

//     const isSuccess =
//       paymentStatus ===
//         "SUCCESS" ||
//       webhookType.includes(
//         "SUCCESS",
//       );

//     const isFailed =
//       paymentStatus ===
//         "FAILED" ||
//       webhookType.includes(
//         "FAILED",
//       );

//     const batch =
//       adminDb.batch();

//     const paymentReferenceRef =
//       adminDb
//         .collection(
//           "paymentReferences",
//         )
//         .doc();

//     let newOrderStatus =
//       order?.currentStatus;

//     let newPaymentStatus =
//       order?.paymentStatus;

//     if (
//       isSuccess &&
//       amountMatches
//     ) {
//       newPaymentStatus =
//         "PAID";

//       newOrderStatus =
//         "PAID";

//       batch.update(
//         orderRef,
//         {
//           paymentStatus:
//             "PAID",

//           currentStatus:
//             "PAID",

//           paymentVerifiedAt:
//             new Date().toISOString(),

//           paymentProvider:
//             "CASHFREE",

//           updatedAt:
//             new Date().toISOString(),
//         },
//       );
//     } else if (
//       isFailed
//     ) {
//       newPaymentStatus =
//         "FAILED";

//       newOrderStatus =
//         "PENDING_PAYMENT";

//       batch.update(
//         orderRef,
//         {
//           paymentStatus:
//             "FAILED",

//           currentStatus:
//             "PENDING_PAYMENT",

//           updatedAt:
//             new Date().toISOString(),
//         },
//       );
//     }

//     batch.set(
//       paymentReferenceRef,
//       {
//         paymentReferenceId:
//           paymentReferenceRef.id,

//         provider:
//           "CASHFREE",

//         orderId,

//         cashfreeOrderId:
//           payment?.cf_order_id ??
//           payment?.order_id ??
//           order?.cashfreeOrderId ??
//           null,

//         paymentSessionId:
//           order?.paymentSessionId ??
//           null,

//         status:
//           paymentStatus,

//         paymentAmount,

//         expectedAmount,

//         amountMatches,

//         webhookType,

//         webhookIdempotencyKey:
//           idempotencyKey ??
//           null,

//         receivedAt:
//           new Date().toISOString(),
//       },
//     );

//     await batch.commit();

//     await writeAuditLog({
//       userId:
//         "CASHFREE_WEBHOOK",
//       action:
//         "PAYMENT_WEBHOOK_PROCESSED",
//       resourceType:
//         "FOOD_ORDER",
//       resourceId:
//         orderId,
//       metadata: {
//         webhookType,
//         paymentStatus,
//         paymentAmount,
//         expectedAmount,
//         amountMatches,
//         newPaymentStatus,
//         newOrderStatus,
//       },
//     });

//     return successResponse({
//       processed: true,
//       orderId,
//       paymentStatus:
//         newPaymentStatus,
//       orderStatus:
//         newOrderStatus,
//     });
//   } catch (error) {
//     console.error(
//       "POST /api/payments/cashfree/webhook",
//       error,
//     );

//     return errorResponse(
//       "WEBHOOK_FAILED",
//       "Unable to process Cashfree webhook.",
//       500,
//     );
//   }
// }






import { NextRequest } from "next/server";
import crypto from "crypto";

import { adminDb } from "@/lib/firebase-admin";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

function verifySignature(
  timestamp: string,
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const signedPayload = timestamp + rawBody;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

function getPaymentData(payload: Record<string, unknown>) {
  const data = payload?.data as Record<string, unknown> | undefined;
  if (data?.payment && typeof data.payment === "object") {
    return data.payment as Record<string, unknown>;
  }
  return (data ?? {}) as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CASHFREE_SECRET_KEY;

    if (!secret) {
      return errorResponse(
        "CASHFREE_SECRET_MISSING",
        "Cashfree secret key is not configured.",
        500,
      );
    }

    // Raw body required for signature verification
    const rawBody = await request.text();

    const timestamp = request.headers.get("x-webhook-timestamp");
    const signature = request.headers.get("x-webhook-signature");
    const idempotencyKey = request.headers.get("x-idempotency-key");

    if (!timestamp || !signature) {
      return errorResponse(
        "INVALID_WEBHOOK",
        "Missing Cashfree webhook signature.",
        401,
      );
    }

    const valid = verifySignature(
      timestamp,
      rawBody,
      signature,
      secret,
    );

    if (!valid) {
      return errorResponse(
        "INVALID_SIGNATURE",
        "Invalid Cashfree webhook signature.",
        401,
      );
    }

    let payload: Record<string, unknown>;

    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid webhook JSON.",
        400,
      );
    }

    const webhookType = String(payload?.type ?? "").toUpperCase();
    const payment = getPaymentData(payload);

    const data = payload?.data as Record<string, unknown> | undefined;
    const orderObj = data?.order as Record<string, unknown> | undefined;

    const orderId = String(
      payment?.order_id ??
        orderObj?.order_id ??
        "",
    ).trim();

    if (!orderId) {
      return successResponse(
        {
          processed: false,
          reason: "No order ID in webhook.",
        },
        200,
      );
    }

    // Idempotency — Cashfree may retry
    if (idempotencyKey) {
      const duplicate = await adminDb
        .collection("paymentReferences")
        .where("webhookIdempotencyKey", "==", idempotencyKey)
        .limit(1)
        .get();

      if (!duplicate.empty) {
        return successResponse(
          {
            processed: true,
            duplicate: true,
          },
          200,
        );
      }
    }

    const orderRef = adminDb.collection("foodOrders").doc(orderId);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      return errorResponse(
        "ORDER_NOT_FOUND",
        "Food order does not exist.",
        404,
      );
    }

    const order = orderSnapshot.data() || {};

    // Already paid — acknowledge without double-updating
    if (
      String(order.paymentStatus ?? "").toUpperCase() === "PAID" ||
      String(order.status ?? "").toUpperCase() === "PAID"
    ) {
      return successResponse(
        {
          processed: true,
          alreadyPaid: true,
          orderId,
        },
        200,
      );
    }

    const paymentStatus = String(
      payment?.payment_status ?? "",
    ).toUpperCase();

    const paymentAmount = Number(
      payment?.payment_amount ??
        payment?.order_amount ??
        0,
    );

    const expectedAmount = Number(order.total ?? 0);

    const amountMatches =
      Number.isFinite(paymentAmount) &&
      Number.isFinite(expectedAmount) &&
      Math.abs(paymentAmount - expectedAmount) < 0.01;

    const isSuccess =
      paymentStatus === "SUCCESS" ||
      webhookType.includes("SUCCESS") ||
      webhookType.includes("PAYMENT_SUCCESS");

    const isFailed =
      paymentStatus === "FAILED" ||
      webhookType.includes("FAILED") ||
      webhookType.includes("PAYMENT_FAILED");

    const batch = adminDb.batch();
    const paymentReferenceRef = adminDb
      .collection("paymentReferences")
      .doc();

    const now = new Date().toISOString();

    let newOrderStatus = String(
      order.status ?? order.currentStatus ?? "PENDING_PAYMENT",
    );
    let newPaymentStatus = String(
      order.paymentStatus ?? "PENDING",
    );

    if (isSuccess && amountMatches) {
      newPaymentStatus = "PAID";
      newOrderStatus = "PAID";

      batch.update(orderRef, {
        paymentStatus: "PAID",
        status: "PAID",
        paymentVerifiedAt: now,
        paymentProvider: "CASHFREE",
        updatedAt: now,
      });
    } else if (isSuccess && !amountMatches) {
      // Signature ok but amount mismatch — do not mark paid
      newPaymentStatus = "FAILED";
      newOrderStatus = "PENDING_PAYMENT";

      batch.update(orderRef, {
        paymentStatus: "FAILED",
        status: "PENDING_PAYMENT",
        paymentMismatch: true,
        updatedAt: now,
      });
    } else if (isFailed) {
      newPaymentStatus = "FAILED";
      newOrderStatus = "PENDING_PAYMENT";

      batch.update(orderRef, {
        paymentStatus: "FAILED",
        status: "PENDING_PAYMENT",
        updatedAt: now,
      });
    }

    batch.set(paymentReferenceRef, {
      paymentReferenceId: paymentReferenceRef.id,
      provider: "CASHFREE",
      orderId,
      cashfreeOrderId:
        payment?.cf_order_id ??
        payment?.order_id ??
        order.cashfreeOrderId ??
        null,
      paymentSessionId: order.paymentSessionId ?? null,
      status: paymentStatus || webhookType || "UNKNOWN",
      paymentStatus: newPaymentStatus,
      paymentAmount,
      expectedAmount,
      amountMatches,
      webhookType,
      webhookIdempotencyKey: idempotencyKey ?? null,
      receivedAt: now,
    });

    await batch.commit();

    await writeAuditLog({
      userId: "CASHFREE_WEBHOOK",
      action: "PAYMENT_WEBHOOK_PROCESSED",
      resourceType: "FOOD_ORDER",
      resourceId: orderId,
      metadata: {
        webhookType,
        paymentStatus,
        paymentAmount,
        expectedAmount,
        amountMatches,
        newPaymentStatus,
        newOrderStatus,
      },
    });

    return successResponse(
      {
        processed: true,
        orderId,
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
      },
      200,
    );
  } catch (error) {
    console.error(
      "POST /api/payments/cashfree/webhook",
      error,
    );

    return errorResponse(
      "WEBHOOK_FAILED",
      "Unable to process Cashfree webhook.",
      500,
    );
  }
}