import { NextRequest } from "next/server";
import type {
  Query,
  DocumentData,
} from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import {
  getProduct,
  calculateOrderTotals,
} from "@/lib/food";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

import type {
  FoodOrder,
  FoodOrderStatus,
  OrderItem,
} from "@/types/food";

const FOOD_ORDER_STATUSES: FoodOrderStatus[] = [
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

type CreateOrderBody = {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  items?: Array<{
    productId?: string;
    variantId?: string;
    quantity?: number;
  }>;
  couponId?: string;
  deliveryFee?: number;
  taxRate?: number;
};

function normalizeOrder(id: string, data: DocumentData) {
  const customer =
    (data.customer as Record<string, unknown> | undefined) ||
    {};

  const status = String(
    data.status || data.currentStatus || "PENDING_PAYMENT",
  );

  return {
    id,
    orderId: String(data.orderId || id),
    customerName: String(customer.name || "Customer"),
    customerPhone: String(customer.phone || ""),
    total: Number(data.total || 0),
    subtotal: Number(data.subtotal || 0),
    discount: Number(data.discount || 0),
    deliveryFee: Number(data.deliveryFee || 0),
    currency: String(data.currency || "INR"),
    status,
    paymentStatus: String(data.paymentStatus || "PENDING"),
    itemsCount: Array.isArray(data.items) ? data.items.length : 0,
    items: data.items || [],
    customer: data.customer || null,
    couponId: data.couponId || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    if (!body.items || body.items.length === 0) {
      return errorResponse(
        "ITEMS_REQUIRED",
        "At least one item is required.",
        400,
      );
    }

    const customer = body.customer;

    if (
      !customer?.name ||
      !customer.phone ||
      !customer.addressLine1 ||
      !customer.city ||
      !customer.state ||
      !customer.postalCode
    ) {
      return errorResponse(
        "CUSTOMER_REQUIRED",
        "Customer name, phone and full address are required.",
        400,
      );
    }

    const items: OrderItem[] = [];

    for (const requestedItem of body.items) {
      const productId = String(requestedItem.productId ?? "").trim();
      const variantId = String(requestedItem.variantId ?? "").trim();
      const quantity = Number(requestedItem.quantity);

      if (
        !productId ||
        !variantId ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return errorResponse(
          "INVALID_ITEM",
          "Each item requires productId, variantId and a positive quantity.",
          400,
        );
      }

      const product = await getProduct(productId);

      if (!product || !product.active) {
        return errorResponse(
          "PRODUCT_UNAVAILABLE",
          `Product ${productId} is unavailable.`,
          400,
        );
      }

      const variant = product.variants.find(
        (entry: {
          variantId: string;
          label: string;
          price: number;
          active: boolean;
        }) => entry.variantId === variantId,
      );

      if (!variant || !variant.active) {
        return errorResponse(
          "VARIANT_UNAVAILABLE",
          `Variant ${variantId} is unavailable.`,
          400,
        );
      }

      const price = Number(variant.price);
      const amount = price * quantity;
      const orderItemId = `item_${crypto.randomUUID()}`;

      items.push({
        id: orderItemId,
        orderItemId,
        productId,
        variantId,
        productName: product.name,
        variantName: variant.label,
        quantity,
        price,
        amount,
      });
    }

    const deliveryFee = Math.max(0, Number(body.deliveryFee ?? 0));
    const taxRate = Math.max(0, Number(body.taxRate ?? 0));
    const discount = 0;

    const totals = calculateOrderTotals(
      items,
      deliveryFee,
      taxRate,
      discount,
    );

    if (totals.total < 1) {
      return errorResponse(
        "INVALID_ORDER_TOTAL",
        "Order total must be at least ₹1.",
        400,
      );
    }

    const orderRef = adminDb
      .collection(FIRESTORE_COLLECTIONS.FOOD_ORDERS)
      .doc();

    const now = new Date().toISOString();

    const order: FoodOrder = {
      id: orderRef.id,
      orderId: orderRef.id,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim(),
        addressLine1: customer.addressLine1.trim(),
        addressLine2: customer.addressLine2?.trim(),
        city: customer.city.trim(),
        state: customer.state.trim(),
        postalCode: customer.postalCode.trim(),
        country: (customer.country || "India").trim(),
      },
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      currency: "INR",
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      couponId: body.couponId,
      createdAt: now,
      updatedAt: now,
    };

    await orderRef.set(order);

    await writeAuditLog({
      userId: "PUBLIC_CUSTOMER",
      action: "FOOD_ORDER_CREATED",
      resourceType: "FOOD_ORDER",
      resourceId: orderRef.id,
      module: "FOOD",
      metadata: {
        total: order.total,
        itemCount: items.length,
      },
    });

    return successResponse(
      {
        orderId: order.orderId,
        order,
      },
      201,
      "Food order created successfully.",
    );
  } catch (error) {
    console.error("POST /api/food/orders", error);

    return errorResponse(
      "ORDER_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to create food order.",
      500,
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "FOOD_ORDER_VIEW")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view food orders.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    if (orderId) {
      const ref = adminDb
        .collection(FIRESTORE_COLLECTIONS.FOOD_ORDERS)
        .doc(orderId);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        return errorResponse(
          "ORDER_NOT_FOUND",
          "Order was not found.",
          404,
        );
      }

      const order = normalizeOrder(
        snapshot.id,
        snapshot.data() || {},
      );

      return successResponse({
        order,
        data: order,
      });
    }

    let query: Query = adminDb.collection(
      FIRESTORE_COLLECTIONS.FOOD_ORDERS,
    );

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.limit(100).get();

    const orders = snapshot.docs.map((doc) =>
      normalizeOrder(doc.id, doc.data() || {}),
    );

    orders.sort((a, b) =>
      String(b.createdAt || "").localeCompare(
        String(a.createdAt || ""),
      ),
    );

    return successResponse({
      orders,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("GET /api/food/orders", error);

    return errorResponse(
      "ORDER_FETCH_FAILED",
      "Unable to fetch orders.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "FOOD_ORDER_UPDATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update food orders.",
        403,
      );
    }

    const body = await request.json();
    const orderId = String(body.orderId ?? "").trim();
    const status = String(body.status ?? "").trim();

    if (!orderId) {
      return errorResponse(
        "ORDER_ID_REQUIRED",
        "orderId is required.",
        400,
      );
    }

    if (
      !FOOD_ORDER_STATUSES.includes(status as FoodOrderStatus)
    ) {
      return errorResponse(
        "INVALID_STATUS",
        "Invalid food order status.",
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.FOOD_ORDERS)
      .doc(orderId);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return errorResponse(
        "ORDER_NOT_FOUND",
        "Order was not found.",
        404,
      );
    }

    const previous = snapshot.data() || {};
    const previousStatus =
      previous.status || previous.currentStatus || null;

    await ref.update({
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    });

    await writeAuditLog({
      userId: user.userId,
      action: "FOOD_ORDER_STATUS_CHANGED",
      resourceType: "FOOD_ORDER",
      resourceId: orderId,
      module: "FOOD",
      metadata: {
        previousStatus,
        newStatus: status,
      },
    });

    return successResponse(
      {
        orderId,
        previousStatus,
        status,
      },
      200,
      "Order status updated successfully.",
    );
  } catch (error) {
    console.error("PATCH /api/food/orders", error);

    return errorResponse(
      "ORDER_UPDATE_FAILED",
      "Unable to update food order.",
      500,
    );
  }
}