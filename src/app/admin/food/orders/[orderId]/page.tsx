"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type FoodOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type OrderItem = {
  productName: string;
  variantName: string;
  quantity: number;
  amount: number;
  price?: number;
};

type PaymentReference = {
  paymentReferenceId?: string;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  status?: string;
  paymentStatus?: string;
  provider?: string;
};

type OrderDetail = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  orderDate: string;
  status: FoodOrderStatus | string;
  paymentStatus: string;
  paymentProvider: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: OrderItem[];
  paymentReference?: PaymentReference;
};

type ApiGetResponse =
  | {
      success: true;
      data: {
        order?: Record<string, unknown>;
        data?: Record<string, unknown>;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

type ApiPatchResponse =
  | {
      success: true;
      data?: {
        orderId?: string;
        status?: string;
        previousStatus?: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const STATUSES: FoodOrderStatus[] = [
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

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAddress(
  customer?: Record<string, unknown> | null,
): string {
  if (!customer) {
    return "—";
  }

  return [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.state,
    customer.postalCode,
    customer.country,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ") || "—";
}

function normalizeItems(
  rawItems: unknown,
): OrderItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    const quantity = Number(row.quantity || 0);
    const price = Number(row.price || 0);
    const amount = Number(
      row.amount !== undefined
        ? row.amount
        : price * quantity,
    );

    return {
      productName: String(
        row.productName || row.name || "Product",
      ),
      variantName: String(
        row.variantName || row.variantLabel || row.label || "—",
      ),
      quantity: Number.isFinite(quantity) ? quantity : 0,
      amount: Number.isFinite(amount) ? amount : 0,
      price: Number.isFinite(price) ? price : undefined,
    };
  });
}

function normalizeOrder(
  raw: Record<string, unknown>,
): OrderDetail {
  const customer =
    (raw.customer as Record<string, unknown> | undefined) ||
    undefined;

  const paymentReference =
    (raw.paymentReference as PaymentReference | undefined) ||
    undefined;

  const orderId = String(raw.orderId || raw.id || "").trim();

  return {
    orderId,
    customerName: String(
      raw.customerName || customer?.name || "Customer",
    ),
    customerPhone: String(
      raw.customerPhone || customer?.phone || "—",
    ),
    customerEmail: String(
      raw.customerEmail || customer?.email || "—",
    ),
    shippingAddress: formatAddress(customer),
    orderDate: formatDate(
      raw.createdAt ? String(raw.createdAt) : undefined,
    ),
    status: String(
      raw.status || raw.currentStatus || "PENDING_PAYMENT",
    ),
    paymentStatus: String(
      raw.paymentStatus ||
        paymentReference?.paymentStatus ||
        paymentReference?.status ||
        "PENDING",
    ),
    paymentProvider: String(
      paymentReference?.provider || "CASHFREE",
    ),
    subtotal: Number(raw.subtotal || 0),
    deliveryFee: Number(raw.deliveryFee || 0),
    discount: Number(raw.discount || 0),
    total: Number(raw.total || 0),
    items: normalizeItems(raw.items),
    paymentReference,
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();

  let orderId = String(params.orderId || "").trim();

  try {
    orderId = decodeURIComponent(orderId);
  } catch {
    // keep original
  }

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<string>("PROCESSING");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orderId) {
      setLoading(false);
      setError("Order ID is required.");
      setOrder(null);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        setMessage("");

        if (!user) {
          throw new Error(
            "Authentication is required to view this order.",
          );
        }

        const token = await user.getIdToken();

        const res = await fetch(
          `/api/food/orders?orderId=${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const json = (await res.json()) as ApiGetResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load order.",
          );
        }

        const raw =
          (json.data.order as Record<string, unknown> | undefined) ||
          (json.data.data as Record<string, unknown> | undefined);

        if (!raw) {
          throw new Error("Order was not found.");
        }

        const normalized = normalizeOrder(raw);

        if (!cancelled) {
          setOrder(normalized);
          setStatus(normalized.status);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load order.",
          );
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, orderId, reloadKey]);

  const statusOptions = useMemo(() => {
    if (order?.status && !STATUSES.includes(order.status as FoodOrderStatus)) {
      return [order.status, ...STATUSES];
    }

    return STATUSES;
  }, [order?.status]);

  async function updateStatus() {
    try {
      setSaving(true);
      setMessage("");
      setError(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      if (!orderId) {
        throw new Error("Order ID is required.");
      }

      const token = await user.getIdToken();

      const res = await fetch("/api/food/orders", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const json = (await res.json()) as ApiPatchResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to update order status.",
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current,
      );

      setMessage(
        json.message ||
          `Order ${orderId} status updated to ${status}.`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update order status.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading order...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching order details from Firestore.
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load order
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
            <Link
              href="/admin/food/orders"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food / Orders
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            Order Details
          </h2>

          <p className="mt-1 font-mono text-xs text-slate-400">
            orderId: {order.orderId}
          </p>
        </div>

        <Link
          href="/admin/food/orders"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          ← Back to Orders
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#3b2516]">
                Customer Information
              </h3>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Info label="Customer" value={order.customerName} />
              <Info label="Phone" value={order.customerPhone} />
              <Info label="Email" value={order.customerEmail} />
              <Info label="Order Date" value={order.orderDate} />
              <Info
                label="Shipping Address"
                value={order.shippingAddress}
              />
              <Info
                label="Payment"
                value={order.paymentProvider}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#3b2516]">
                Order Items
              </h3>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Variant</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {order.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No items found on this order.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item, index) => (
                    <tr key={`${item.productName}-${index}`}>
                      <td className="px-5 py-4 font-semibold">
                        {item.productName}
                      </td>
                      <td className="px-5 py-4">
                        {item.variantName}
                      </td>
                      <td className="px-5 py-4">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-3 text-sm">
              <Row
                label="Subtotal"
                value={formatCurrency(order.subtotal)}
              />
              <Row
                label="Shipping"
                value={formatCurrency(order.deliveryFee)}
              />
              <Row
                label="Discount"
                value={formatCurrency(order.discount)}
              />
              <div className="border-t border-slate-200 pt-3">
                <Row
                  label="Total"
                  value={formatCurrency(order.total)}
                  strong
                />
              </div>
            </div>
          </section>
        </div>

        <aside>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-[#3b2516]">
              Order Pipeline
            </h3>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Order Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={updateStatus}
                disabled={saving || status === order.status}
                className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Order Status"}
              </button>

              {message && (
                <div className="mt-4 rounded-lg bg-orange-50 p-3 text-xs text-orange-800">
                  {message}
                </div>
              )}
            </div>
          </section>

          <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-[#3b2516]">
              Payment Reference
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <Info label="orderId" value={order.orderId} />
              <Info
                label="paymentReferenceId"
                value={
                  order.paymentReference?.paymentReferenceId ||
                  "—"
                }
              />
              <Info
                label="cashfreeOrderId"
                value={
                  order.paymentReference?.cashfreeOrderId || "—"
                }
              />
              <Info
                label="paymentStatus"
                value={order.paymentStatus || "—"}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={strong ? "font-bold text-[#3b2516]" : ""}>
        {value}
      </span>
    </div>
  );
}