"use client";

import Link from "next/link";
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

type OrderRow = {
  orderId: string;
  customerName: string;
  total: number;
  status: FoodOrderStatus | string;
  paymentStatus?: string;
  createdAt?: string;
};

type ApiResponse =
  | {
      success: true;
      data: {
        orders?: Record<string, unknown>[];
        data?: Record<string, unknown>[] | Record<string, unknown>;
        count?: number;
      };
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

function normalizeOrder(
  raw: Record<string, unknown>,
): OrderRow | null {
  const orderId = String(raw.orderId || raw.id || "").trim();

  if (!orderId) {
    return null;
  }

  const customer =
    (raw.customer as Record<string, unknown> | undefined) ||
    undefined;

  const customerName = String(
    raw.customerName ||
      customer?.name ||
      "Customer",
  ).trim();

  const total = Number(raw.total || 0);

  const status = String(
    raw.status || raw.currentStatus || "PENDING_PAYMENT",
  );

  return {
    orderId,
    customerName: customerName || "Customer",
    total: Number.isFinite(total) ? total : 0,
    status,
    paymentStatus: raw.paymentStatus
      ? String(raw.paymentStatus)
      : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error(
            "Authentication is required to view orders.",
          );
        }

        const token = await user.getIdToken();

        const query =
          status !== "ALL"
            ? `?status=${encodeURIComponent(status)}`
            : "";

        const res = await fetch(`/api/food/orders${query}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load orders.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload.orders)
          ? payload.orders
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        const normalized = list
          .map((item) => normalizeOrder(item))
          .filter(Boolean) as OrderRow[];

        if (!cancelled) {
          setOrders(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load orders.",
          );
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, status, reloadKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.orderId,
        order.customerName,
        order.status,
        order.paymentStatus || "",
        formatCurrency(order.total),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [orders, search]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Food
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
          Orders
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Process and manage customer food orders.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order or customer..."
          disabled={loading || authLoading}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading || authLoading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        >
          <option value="ALL">All Statuses</option>

          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading orders...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching the latest food orders.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load orders
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">orderId</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {orders.length === 0
                        ? "No orders found."
                        : "No orders match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/food/orders/${order.orderId}`}
                          className="font-mono text-xs font-bold text-orange-600"
                        >
                          {order.orderId}
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {order.customerName}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="px-5 py-4">
                        <Status value={order.status} />
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/food/orders/${order.orderId}`}
                          className="text-xs font-bold text-orange-600"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Status({ value }: { value: string }) {
  const colors: Record<string, string> = {
    PAID: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-cyan-100 text-cyan-700",
    PROCESSING: "bg-amber-100 text-amber-700",
    PACKED: "bg-violet-100 text-violet-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-slate-100 text-slate-600",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        colors[value] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}