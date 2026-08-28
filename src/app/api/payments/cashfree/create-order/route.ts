import { NextRequest } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import { createCashfreeOrder } from "@/lib/cashfree";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

type Body = {
  orderId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const orderId = body.orderId?.trim();

    if (!orderId) {
      return errorResponse(
        "ORDER_ID_REQUIRED",
        "orderId is required.",
        400,
      );
    }

    const orderRef = adminDb.collection("foodOrders").doc(orderId);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      return errorResponse(
        "ORDER_NOT_FOUND",
        "Food order was not found.",
        404,
      );
    }

    const order = orderSnapshot.data() || {};

    const paymentStatus = String(
      order.paymentStatus ?? "",
    ).toUpperCase();
    const orderStatus = String(
      order.status ?? order.currentStatus ?? "",
    ).toUpperCase();

    if (paymentStatus === "PAID" || orderStatus === "PAID") {
      return errorResponse(
        "ALREADY_PAID",
        "This order has already been paid.",
        409,
      );
    }

    if (
      orderStatus === "CANCELLED" ||
      orderStatus === "REFUNDED"
    ) {
      return errorResponse(
        "ORDER_NOT_PAYABLE",
        "This order cannot accept payment.",
        409,
      );
    }

    const amount = Number(order.total ?? 0);

    if (!Number.isFinite(amount) || amount < 1) {
      return errorResponse(
        "INVALID_AMOUNT",
        "Order amount is invalid.",
        400,
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      return errorResponse(
        "APP_URL_NOT_CONFIGURED",
        "NEXT_PUBLIC_APP_URL is not configured.",
        500,
      );
    }

    const customer = order.customer || {};

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      customerId: String(
        customer.customerId ||
          customer.phone ||
          orderId,
      ),
      customerName: String(customer.name || "Customer"),
      customerEmail: String(
        customer.email || "customer@example.com",
      ),
      customerPhone: String(customer.phone || "9999999999"),
      returnUrl: `${baseUrl}/food/order-success?orderId=${encodeURIComponent(orderId)}`,
      notifyUrl: `${baseUrl}/api/payments/cashfree/webhook`,
    });

    const paymentReferenceRef = adminDb
      .collection("paymentReferences")
      .doc();

    const now = new Date().toISOString();

    await paymentReferenceRef.set({
      paymentReferenceId: paymentReferenceRef.id,
      provider: "CASHFREE",
      orderId,
      cashfreeOrderId: cashfreeOrder.orderId,
      cfOrderId: cashfreeOrder.cfOrderId ?? null,
      paymentSessionId: cashfreeOrder.paymentSessionId ?? null,
      status: cashfreeOrder.orderStatus ?? "ACTIVE",
      paymentStatus: "PENDING",
      amount,
      currency: "INR",
      createdAt: now,
      updatedAt: now,
    });

    await orderRef.update({
      status: order.status || "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      cashfreeOrderId: cashfreeOrder.orderId,
      paymentSessionId: cashfreeOrder.paymentSessionId ?? null,
      paymentReferenceId: paymentReferenceRef.id,
      updatedAt: now,
    });

    return successResponse(
      {
        orderId,
        paymentReferenceId: paymentReferenceRef.id,
        cashfreeOrderId: cashfreeOrder.orderId,
        paymentSessionId: cashfreeOrder.paymentSessionId ?? null,
      },
      201,
      "Cashfree payment order created.",
    );
  } catch (error) {
    console.error(
      "POST /api/payments/cashfree/create-order",
      error,
    );

    return errorResponse(
      "CASHFREE_ORDER_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to create Cashfree order.",
      500,
    );
  }
}