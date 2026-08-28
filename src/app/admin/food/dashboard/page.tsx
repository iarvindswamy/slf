"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type OrderRow = {
  orderId: string;
  customerName: string;
  total: number;
  status: string;
};

type DashboardStats = {
  orders: number;
  paidOrders: number;
  processing: number;
  delivered: number;
  inventoryAlerts: number;
  sales: number;
};

type ApiOrdersResponse =
  | {
      success: true;
      data: {
        orders?: Record<string, unknown>[];
        data?: Record<string, unknown>[] | Record<string, unknown>;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

type ApiProductsResponse =
  | {
      success: true;
      data: Record<string, unknown>[];
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: amount >= 100000 ? "compact" : "standard",
  }).format(amount);
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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

  return {
    orderId,
    customerName: String(
      raw.customerName || customer?.name || "Customer",
    ),
    total: toNumber(raw.total, 0),
    status: String(
      raw.status || raw.currentStatus || "PENDING_PAYMENT",
    ),
  };
}

function countInventoryAlerts(
  products: Record<string, unknown>[],
): number {
  let alerts = 0;

  products.forEach((product) => {
    const variants = Array.isArray(product.variants)
      ? (product.variants as Record<string, unknown>[])
      : [];

    variants.forEach((variant) => {
      const stock = toNumber(
        variant.stock ??
          variant.quantity ??
          variant.availableQuantity,
        0,
      );
      const threshold = toNumber(
        variant.lowStockThreshold ?? variant.threshold ?? 10,
        10,
      );

      if (stock <= threshold) {
        alerts += 1;
      }
    });
  });

  return alerts;
}

function buildStats(
  orders: OrderRow[],
  inventoryAlerts: number,
): DashboardStats {
  const paidStatuses = new Set([
    "PAID",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]);

  const processingStatuses = new Set([
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
  ]);

  const paidOrders = orders.filter((order) =>
    paidStatuses.has(order.status),
  );

  const processing = orders.filter((order) =>
    processingStatuses.has(order.status),
  ).length;

  const delivered = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const sales = paidOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  return {
    orders: orders.length,
    paidOrders: paidOrders.length,
    processing,
    delivered,
    inventoryAlerts,
    sales,
  };
}

export default function FoodDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/food/orders", {
            method: "GET",
            headers,
            cache: "no-store",
          }),
          fetch("/api/food/products", {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }),
        ]);

        const ordersJson =
          (await ordersRes.json()) as ApiOrdersResponse;
        const productsJson =
          (await productsRes.json()) as ApiProductsResponse;

        if (!ordersRes.ok || !ordersJson.success) {
          throw new Error(
            !ordersJson.success
              ? ordersJson.error.message
              : "Failed to load orders.",
          );
        }

        const orderPayload = ordersJson.data;
        const orderList = Array.isArray(orderPayload.orders)
          ? orderPayload.orders
          : Array.isArray(orderPayload.data)
            ? orderPayload.data
            : [];

        const normalizedOrders = orderList
          .map((item) => normalizeOrder(item))
          .filter(Boolean) as OrderRow[];

        let alerts = 0;

        if (productsRes.ok && productsJson.success) {
          const products = Array.isArray(productsJson.data)
            ? productsJson.data
            : [];
          alerts = countInventoryAlerts(products);
        }

        if (!cancelled) {
          setOrders(normalizedOrders);
          setInventoryAlerts(alerts);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load dashboard.",
          );
          setOrders([]);
          setInventoryAlerts(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const stats = useMemo(
    () => buildStats(orders, inventoryAlerts),
    [orders, inventoryAlerts],
  );

  const recentOrders = useMemo(
    () => orders.slice(0, 8),
    [orders],
  );

  const paidRate =
    stats.orders > 0
      ? `${((stats.paidOrders / stats.orders) * 100).toFixed(1)}%`
      : "0%";

  const statCards = [
    {
      label: "Orders",
      value: String(stats.orders),
      change: "All time loaded",
    },
    {
      label: "Paid Orders",
      value: String(stats.paidOrders),
      change: paidRate,
    },
    {
      label: "Processing",
      value: String(stats.processing),
      change: "Active pipeline",
    },
    {
      label: "Delivered",
      value: String(stats.delivered),
      change: "Completed",
    },
    {
      label: "Inventory Alerts",
      value: String(stats.inventoryAlerts),
      change:
        stats.inventoryAlerts > 0
          ? "Requires action"
          : "Healthy",
    },
    {
      label: "Sales",
      value: formatCurrency(stats.sales),
      change: "Paid orders total",
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            Food Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor food orders, sales and inventory.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh
          </button>

          <Link
            href="/admin/food/products/new"
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading dashboard...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching orders and inventory signals.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load dashboard
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700">
                    {stat.change}
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold text-[#3b2516]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#3b2516]">
                    Recent Orders
                  </h3>

                  <Link
                    href="/admin/food/orders"
                    className="text-xs font-bold text-orange-600"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          No orders found yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.orderId}>
                          <td className="px-5 py-4 font-bold text-orange-600">
                            <Link
                              href={`/admin/food/orders/${order.orderId}`}
                            >
                              {order.orderId}
                            </Link>
                          </td>

                          <td className="px-5 py-4">
                            {order.customerName}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {formatCurrency(order.total)}
                          </td>

                          <td className="px-5 py-4">
                            <Status value={order.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-[#3b2516]">
                Quick Actions
              </h3>

              <div className="mt-4 space-y-3">
                <QuickAction
                  href="/admin/food/products"
                  text="Manage Products"
                />
                <QuickAction
                  href="/admin/food/orders"
                  text="Process Orders"
                />
                <QuickAction
                  href="/admin/food/inventory"
                  text="Check Inventory"
                />
                <QuickAction
                  href="/admin/food/coupons"
                  text="Manage Coupons"
                />
                <QuickAction
                  href="/admin/food/categories"
                  text="Manage Categories"
                />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function QuickAction({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 p-3 text-sm font-semibold hover:border-orange-300 hover:bg-orange-50"
    >
      {text} →
    </Link>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
      {value}
    </span>
  );
}