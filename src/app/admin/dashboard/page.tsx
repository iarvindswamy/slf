
// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { useModule, type Module } from "@/context/ModuleContext";
// import XpressionCharts, { type ChartPoint } from "@/components/logistics/XpressionCharts";

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// type AdminOrder = {
//   id: string;
//   orderId: string;
//   customerName: string;
//   total: number;
//   status: string;
// };

// type AdminProduct = {
//   id: string;
//   status: string;
// };

// type AdminAwb = {
//   id: string;
//   awb: string;
//   currentStatus: string;
//   origin?: string;
//   destination?: string;
//   shipmentDate?: string;
//   createdAt?: string;
//   total?: number;
//   charges?: { total?: number };
// };

// /* ------------------------------------------------------------------ */
// /*  Helpers                                                            */
// /* ------------------------------------------------------------------ */

// function formatINR(amount: number) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount || 0);
// }

// function monthKey(value?: string): string | null {
//   if (!value) return null;
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return null;
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
// }

// function monthLabel(key: string): string {
//   const [y, m] = key.split("-");
//   const d = new Date(Number(y), Number(m) - 1, 1);
//   return d.toLocaleString("en-IN", { month: "short" });
// }

// function Status({ value }: { value: string }) {
//   const cls =
//     value === "DELIVERED" || value === "PAID"
//       ? "bg-emerald-50 text-emerald-700"
//       : value === "CANCELLED" || value === "REFUNDED" || value === "EXCEPTION"
//         ? "bg-red-50 text-red-700"
//         : value === "PENDING_PAYMENT" || value === "ON_HOLD"
//           ? "bg-amber-50 text-amber-700"
//           : "bg-sky-50 text-sky-700";

//   return (
//     <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
//       {value}
//     </span>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Normalizers                                                        */
// /* ------------------------------------------------------------------ */

// function normalizeOrders(raw: unknown): AdminOrder[] {
//   const list = Array.isArray(raw)
//     ? raw
//     : (raw as any)?.orders || (raw as any)?.data || [];

//   return list
//     .map((row: any) => {
//       const orderId = String(row.orderId || row.id || "").trim();
//       if (!orderId) return null;
//       return {
//         id: String(row.id || orderId),
//         orderId,
//         customerName: String(row.customerName || row.customer?.name || "Customer"),
//         total: Number(row.total || 0),
//         status: String(row.status || "PENDING_PAYMENT"),
//       };
//     })
//     .filter(Boolean) as AdminOrder[];
// }

// function normalizeProducts(raw: unknown): AdminProduct[] {
//   const list = Array.isArray(raw) ? raw : [];
//   return list.map((row: any, index: number) => ({
//     id: String(row.id || row.productId || index),
//     status: String(row.status || "ACTIVE").toUpperCase(),
//   }));
// }

// function normalizeAwbs(raw: unknown): AdminAwb[] {
//   const list = Array.isArray(raw)
//     ? raw
//     : (raw as any)?.results || (raw as any)?.data || [];

//   return list
//     .map((row: any) => {
//       const awb = String(row.awb || row.id || "").trim();
//       if (!awb) return null;
//       return {
//         id: String(row.id || awb),
//         awb,
//         currentStatus: String(row.currentStatus || row.status || "BOOKED").toUpperCase(),
//         origin: row.origin ? String(row.origin) : undefined,
//         destination: row.destination ? String(row.destination) : undefined,
//         shipmentDate: row.shipmentDate ? String(row.shipmentDate) : undefined,
//         createdAt: row.createdAt ? String(row.createdAt) : undefined,
//         total: Number(row.charges?.total ?? row.total ?? 0),
//         charges: row.charges ? { total: Number(row.charges.total || 0) } : undefined,
//       };
//     })
//     .filter(Boolean) as AdminAwb[];
// }

// function buildChartSeries(awbs: AdminAwb[]) {
//   const now = new Date();
//   const keys: string[] = [];

//   for (let i = 5; i >= 0; i--) {
//     const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
//   }

//   const shipmentMap = Object.fromEntries(keys.map((k) => [k, 0]));
//   const revenueMap = Object.fromEntries(keys.map((k) => [k, 0]));

//   awbs.forEach((awb) => {
//     const key = monthKey(awb.shipmentDate || awb.createdAt);
//     if (!key || shipmentMap[key] === undefined) return;
//     shipmentMap[key] += 1;
//     revenueMap[key] += Number(awb.total || awb.charges?.total || 0);
//   });

//   return {
//     shipmentData: keys.map((key) => ({
//       label: monthLabel(key),
//       value: shipmentMap[key] || 0,
//       key,
//     })),
//     revenueData: keys.map((key) => ({
//       label: monthLabel(key),
//       value: Math.round(revenueMap[key] || 0),
//       key,
//     })),
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  Page                                                               */
// /* ------------------------------------------------------------------ */

// export default function AdminDashboardPage() {
//   const { user, loading: authLoading } = useAuth();
//   const { module, setModule, isLogistics, isFood } = useModule();

//   const [orders, setOrders] = useState<AdminOrder[]>([]);
//   const [products, setProducts] = useState<AdminProduct[]>([]);
//   const [awbs, setAwbs] = useState<AdminAwb[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [reloadKey, setReloadKey] = useState(0);
//   const [activeMonth, setActiveMonth] = useState<string | null>(null);

//   useEffect(() => {
//     if (authLoading) return;
//     let cancelled = false;

//     async function load() {
//       try {
//         setLoading(true);
//         setError(null);

//         const headers: HeadersInit = { Accept: "application/json" };
//         if (user) {
//           const token = await user.getIdToken();
//           headers.Authorization = `Bearer ${token}`;
//         }

//         if (module === "FOOD") {
//           const [ordersRes, productsRes] = await Promise.all([
//             fetch("/api/food/orders", { cache: "no-store", headers }),
//             fetch("/api/food/products", { cache: "no-store", headers }),
//           ]);

//           const ordersJson = await ordersRes.json();
//           const productsJson = await productsRes.json();

//           if (!ordersJson.success) throw new Error(ordersJson?.error?.message || "Failed to load orders");
//           if (!productsJson.success) throw new Error(productsJson?.error?.message || "Failed to load products");

//           if (!cancelled) {
//             setOrders(normalizeOrders(ordersJson.data));
//             setProducts(normalizeProducts(productsJson.data));
//             setAwbs([]);
//           }
//         } else {
//           const awbRes = await fetch("/api/logistics/awb/search?limit=150", {
//             cache: "no-store",
//             headers,
//           });
//           const awbJson = await awbRes.json();

//           if (!awbJson.success) throw new Error(awbJson?.error?.message || "Failed to load AWBs");

//           if (!cancelled) {
//             setAwbs(normalizeAwbs(awbJson.data));
//             setOrders([]);
//             setProducts([]);
//           }
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(e instanceof Error ? e.message : "Failed to load dashboard");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, user, module, reloadKey]);

//   /* -------------------- Filtered data by month -------------------- */
//   const filteredAwbs = useMemo(() => {
//     if (!activeMonth) return awbs;
//     return awbs.filter((a) => {
//       const key = monthKey(a.shipmentDate || a.createdAt);
//       return key === activeMonth;
//     });
//   }, [awbs, activeMonth]);

//   /* -------------------- Stats -------------------- */
//   const foodStats = useMemo(() => {
//     const totalOrders = orders.length;
//     const paid = orders.filter((o) =>
//       ["PAID", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(o.status),
//     ).length;
//     const processing = orders.filter((o) =>
//       ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status),
//     ).length;
//     const delivered = orders.filter((o) => o.status === "DELIVERED").length;
//     const sales = orders
//       .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
//       .reduce((sum, o) => sum + (o.total || 0), 0);
//     const activeProducts = products.filter((p) => p.status === "ACTIVE").length;

//     return [
//       { label: "Total Orders", value: String(totalOrders), change: "All time" },
//       { label: "Paid / Active", value: String(paid), change: totalOrders ? `${Math.round((paid / totalOrders) * 100)}%` : "0%" },
//       { label: "Processing", value: String(processing), change: "Active" },
//       { label: "Delivered", value: String(delivered), change: "Completed" },
//       { label: "Active Products", value: String(activeProducts), change: "Catalog" },
//       { label: "Sales", value: formatINR(sales), change: "From orders" },
//     ];
//   }, [orders, products]);

//   const logisticsStats = useMemo(() => {
//     const list = filteredAwbs;
//     const total = list.length;
//     const booked = list.filter((a) => ["BOOKED", "PICKUP_REQUESTED"].includes(a.currentStatus)).length;
//     const inTransit = list.filter((a) =>
//       ["PICKED_UP", "AT_ORIGIN", "IN_TRANSIT", "ARRIVED_DESTINATION", "OUT_FOR_DELIVERY"].includes(a.currentStatus),
//     ).length;
//     const delivered = list.filter((a) => a.currentStatus === "DELIVERED").length;
//     const exceptions = list.filter((a) => ["EXCEPTION", "ON_HOLD"].includes(a.currentStatus)).length;
//     const revenue = list.reduce((sum, a) => sum + Number(a.total || a.charges?.total || 0), 0);

//     return [
//       { label: "Total AWBs", value: String(total), change: activeMonth ? "Filtered" : "Loaded" },
//       { label: "Booked / Pickup", value: String(booked), change: "Open" },
//       { label: "In Transit", value: String(inTransit), change: "Moving" },
//       { label: "Delivered", value: String(delivered), change: "Completed" },
//       { label: "Exceptions / Hold", value: String(exceptions), change: "Attention" },
//       { label: "Revenue", value: formatINR(revenue), change: activeMonth ? "Filtered" : "From AWBs" },
//     ];
//   }, [filteredAwbs, activeMonth]);

//   const chartSeries = useMemo(() => buildChartSeries(awbs), [awbs]);
//   const recentOrders = orders.slice(0, 6);
//   const recentAwbs = filteredAwbs.slice(0, 6);
//   const stats = isFood ? foodStats : logisticsStats;

//   function handleBarClick(point: ChartPoint) {
//     if (point.key === activeMonth) {
//       setActiveMonth(null); // toggle off
//     } else {
//       setActiveMonth(point.key || null);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1500px]">
//       {/* Header */}
//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//         <div>
//           <p className={`text-xs font-bold uppercase tracking-widest ${isFood ? "text-orange-600" : "text-[#087f87]"}`}>
//             {isFood ? "Food" : "Logistics"}
//           </p>
//           <h2 className={`mt-1 text-2xl font-bold ${isFood ? "text-[#3b2516]" : "text-[#06284c]"}`}>
//             {isFood ? "Food Dashboard" : "Logistics Dashboard"}
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             {activeMonth
//               ? `Filtered by ${monthLabel(activeMonth)} — click chart again to clear`
//               : "Click any chart bar to filter KPIs and recent list"}
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
//             <button
//               type="button"
//               onClick={() => setModule("LOGISTICS")}
//               className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
//                 isLogistics ? "bg-[#06284c] text-white" : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               Logistics
//             </button>
//             <button
//               type="button"
//               onClick={() => setModule("FOOD")}
//               className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
//                 isFood ? "bg-orange-600 text-white" : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               Food
//             </button>
//           </div>

//           {activeMonth && (
//             <button
//               type="button"
//               onClick={() => setActiveMonth(null)}
//               className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
//             >
//               Clear Filter
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={() => setReloadKey((v) => v + 1)}
//             className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//           >
//             Refresh
//           </button>

//           {isFood ? (
//             <Link href="/admin/food/products" className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white">
//               + Add Product
//             </Link>
//           ) : (
//             <Link href="/admin/logistics/booking" className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white">
//               + New Booking
//             </Link>
//           )}
//         </div>
//       </div>

//       {(loading || authLoading) && (
//         <p className="mb-4 text-sm text-slate-500">Loading {isFood ? "food" : "logistics"} dashboard…</p>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* KPI Cards */}
//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//         {stats.map((stat) => (
//           <div
//             key={stat.label}
//             className={`rounded-xl border bg-white p-5 shadow-sm ${
//               isFood ? "border-orange-100" : "border-cyan-100"
//             }`}
//           >
//             <div className="flex items-start justify-between">
//               <p className="text-sm font-medium text-slate-500">{stat.label}</p>
//               <span
//                 className={`rounded-full px-2 py-1 text-[10px] font-bold ${
//                   isFood ? "bg-orange-50 text-orange-700" : "bg-cyan-50 text-cyan-800"
//                 }`}
//               >
//                 {stat.change}
//               </span>
//             </div>
//             <p className={`mt-4 text-2xl font-bold ${isFood ? "text-[#3b2516]" : "text-[#06284c]"}`}>
//               {stat.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Charts (Logistics only) */}
//       {isLogistics && (
//         <div className="mt-6">
//           <XpressionCharts
//             shipmentData={chartSeries.shipmentData}
//             revenueData={chartSeries.revenueData}
//             loading={loading}
//             activeMonth={activeMonth}
//             onBarClick={handleBarClick}
//           />
//         </div>
//       )}

//       {/* Recent + Quick Actions */}
//       <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
//         <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-5 py-4">
//             <div className="flex items-center justify-between">
//               <h3 className={`font-bold ${isFood ? "text-[#3b2516]" : "text-[#06284c]"}`}>
//                 {isFood ? "Recent Orders" : "Recent AWBs"}
//                 {activeMonth && (
//                   <span className="ml-2 text-xs font-normal text-[#087f87]">
//                     ({monthLabel(activeMonth)})
//                   </span>
//                 )}
//               </h3>
//               <Link
//                 href={isFood ? "/admin/food/orders" : "/admin/logistics/awb"}
//                 className={`text-xs font-bold ${isFood ? "text-orange-600" : "text-[#087f87]"}`}
//               >
//                 View All →
//               </Link>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             {isFood ? (
//               <table className="w-full min-w-[650px] text-left text-sm">
//                 <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                   <tr>
//                     <th className="px-5 py-3">Order</th>
//                     <th className="px-5 py-3">Customer</th>
//                     <th className="px-5 py-3">Amount</th>
//                     <th className="px-5 py-3">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {recentOrders.length === 0 ? (
//                     <tr>
//                       <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
//                         No orders yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     recentOrders.map((order) => (
//                       <tr key={order.id}>
//                         <td className="px-5 py-4 font-bold text-orange-600">{order.orderId}</td>
//                         <td className="px-5 py-4">{order.customerName}</td>
//                         <td className="px-5 py-4 font-semibold">{formatINR(order.total)}</td>
//                         <td className="px-5 py-4">
//                           <Status value={order.status} />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             ) : (
//               <table className="w-full min-w-[700px] text-left text-sm">
//                 <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                   <tr>
//                     <th className="px-5 py-3">AWB</th>
//                     <th className="px-5 py-3">Route</th>
//                     <th className="px-5 py-3">Amount</th>
//                     <th className="px-5 py-3">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {recentAwbs.length === 0 ? (
//                     <tr>
//                       <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
//                         No AWBs found{activeMonth ? " for selected month" : ""}.
//                       </td>
//                     </tr>
//                   ) : (
//                     recentAwbs.map((row) => (
//                       <tr key={row.id}>
//                         <td className="px-5 py-4 font-bold text-[#087f87]">
//                           <Link href={`/admin/logistics/awb/${row.awb}`}>{row.awb}</Link>
//                         </td>
//                         <td className="px-5 py-4 text-slate-600">
//                           {[row.origin, row.destination].filter(Boolean).join(" → ") || "—"}
//                         </td>
//                         <td className="px-5 py-4 font-semibold">{formatINR(row.total || 0)}</td>
//                         <td className="px-5 py-4">
//                           <Status value={row.currentStatus} />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </section>

//         {/* Quick Actions */}
//         <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h3 className={`font-bold ${isFood ? "text-[#3b2516]" : "text-[#06284c]"}`}>
//             Quick Actions
//           </h3>
//           <div className="mt-4 space-y-3">
//             {(isFood
//               ? [
//                   ["Manage Products", "/admin/food/products"],
//                   ["View Orders", "/admin/food/orders"],
//                   ["Inventory", "/admin/food/inventory"],
//                   ["Coupons", "/admin/food/coupons"],
//                   ["Food Settings", "/admin/food/settings"],
//                 ]
//               : [
//                   ["New Booking", "/admin/logistics/booking"],
//                   ["AWB List", "/admin/logistics/awb"],
//                   ["Tracking Matrix", "/admin/logistics/tracking/matrix"],
//                   ["Day End", "/admin/logistics/day-end"],
//                   ["Fuel Surcharges", "/admin/logistics/fuel-surcharges"],
//                   ["Co-Loaders", "/admin/logistics/co-loaders"],
//                   ["Rate Compare", "/admin/logistics/rate-compare"],
//                 ]
//             ).map(([label, href]) => (
//               <Link
//                 key={href}
//                 href={href}
//                 className={`block rounded-lg border border-slate-200 p-3 text-sm font-semibold hover:bg-slate-50 ${
//                   isFood
//                     ? "hover:border-orange-400 hover:bg-orange-50"
//                     : "hover:border-cyan-400 hover:bg-cyan-50"
//                 }`}
//               >
//                 {label} →
//               </Link>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }













"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import XpressionCharts, {
  type ChartPoint,
} from "@/components/logistics/XpressionCharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AdminOrder = {
  id: string;
  orderId: string;
  customerName: string;
  total: number;
  status: string;
};

type AdminProduct = {
  id: string;
  status: string;
};

type AdminAwb = {
  id: string;
  awb: string;
  currentStatus: string;
  origin?: string;
  destination?: string;
  shipmentDate?: string;
  createdAt?: string;
  accountCode?: string;
  total?: number;
  charges?: { total?: number };
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function monthKey(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("en-IN", { month: "short" });
}

function Status({ value }: { value: string }) {
  const cls =
    value === "DELIVERED" || value === "PAID"
      ? "bg-emerald-50 text-emerald-700"
      : value === "CANCELLED" ||
          value === "REFUNDED" ||
          value === "EXCEPTION"
        ? "bg-red-50 text-red-700"
        : value === "PENDING_PAYMENT" || value === "ON_HOLD"
          ? "bg-amber-50 text-amber-700"
          : "bg-sky-50 text-sky-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}
    >
      {value}
    </span>
  );
}

async function buildAuthHeaders(
  user: { getIdToken?: () => Promise<string> } | null,
): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (user && typeof user.getIdToken === "function") {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      return headers;
    } catch {
      // fall through
    }
  }

  if (typeof window !== "undefined") {
    const demo = localStorage.getItem("sreshta-demo-auth");
    if (demo) headers["X-Demo-Auth"] = demo;
  }

  return headers;
}

/* ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

function normalizeOrders(raw: unknown): AdminOrder[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as { orders?: unknown[]; data?: unknown[] })?.orders ||
      (raw as { data?: unknown[] })?.data ||
      [];

  return (list as Array<Record<string, unknown>>)
    .map((row) => {
      const orderId = String(row.orderId || row.id || "").trim();
      if (!orderId) return null;
      const customer = row.customer as { name?: string } | undefined;
      return {
        id: String(row.id || orderId),
        orderId,
        customerName: String(
          row.customerName || customer?.name || "Customer",
        ),
        total: Number(row.total || 0),
        status: String(row.status || "PENDING_PAYMENT"),
      };
    })
    .filter(Boolean) as AdminOrder[];
}

function normalizeProducts(raw: unknown): AdminProduct[] {
  const list = Array.isArray(raw) ? raw : [];
  return (list as Array<Record<string, unknown>>).map((row, index) => ({
    id: String(row.id || row.productId || index),
    status: String(row.status || "ACTIVE").toUpperCase(),
  }));
}

function normalizeAwbs(raw: unknown): AdminAwb[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as { results?: unknown[]; data?: unknown[] })?.results ||
      (raw as { data?: unknown[] })?.data ||
      [];

  return (list as Array<Record<string, unknown>>)
    .map((row) => {
      const awb = String(row.awb || row.id || "").trim();
      if (!awb) return null;
      const charges = row.charges as { total?: number } | undefined;
      return {
        id: String(row.id || awb),
        awb,
        currentStatus: String(
          row.currentStatus || row.status || "BOOKED",
        ).toUpperCase(),
        origin: row.origin ? String(row.origin) : undefined,
        destination: row.destination
          ? String(row.destination)
          : undefined,
        shipmentDate: row.shipmentDate
          ? String(row.shipmentDate)
          : undefined,
        createdAt: row.createdAt ? String(row.createdAt) : undefined,
        accountCode: row.accountCode
          ? String(row.accountCode)
          : undefined,
        total: Number(charges?.total ?? row.total ?? 0),
        charges: charges
          ? { total: Number(charges.total || 0) }
          : undefined,
      };
    })
    .filter(Boolean) as AdminAwb[];
}

function buildChartSeries(awbs: AdminAwb[]) {
  const now = new Date();
  const keys: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  const shipmentMap = Object.fromEntries(keys.map((k) => [k, 0]));
  const revenueMap = Object.fromEntries(keys.map((k) => [k, 0]));

  awbs.forEach((awb) => {
    const key = monthKey(awb.shipmentDate || awb.createdAt);
    if (!key || shipmentMap[key] === undefined) return;
    shipmentMap[key] += 1;
    revenueMap[key] += Number(awb.total || awb.charges?.total || 0);
  });

  return {
    shipmentData: keys.map((key) => ({
      label: monthLabel(key),
      value: shipmentMap[key] || 0,
      key,
    })),
    revenueData: keys.map((key) => ({
      label: monthLabel(key),
      value: Math.round(revenueMap[key] || 0),
      key,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { module, setModule, isLogistics, isFood } = useModule();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [awbs, setAwbs] = useState<AdminAwb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const headers = await buildAuthHeaders(
          user as { getIdToken?: () => Promise<string> } | null,
        );

        if (module === "FOOD") {
          const [ordersRes, productsRes] = await Promise.all([
            fetch("/api/food/orders", { cache: "no-store", headers }),
            fetch("/api/food/products", {
              cache: "no-store",
              headers,
            }),
          ]);

          const ordersJson = await ordersRes.json();
          const productsJson = await productsRes.json();

          if (!ordersJson.success) {
            throw new Error(
              ordersJson?.error?.message || "Failed to load orders",
            );
          }
          if (!productsJson.success) {
            throw new Error(
              productsJson?.error?.message ||
                "Failed to load products",
            );
          }

          if (!cancelled) {
            setOrders(normalizeOrders(ordersJson.data));
            setProducts(normalizeProducts(productsJson.data));
            setAwbs([]);
          }
        } else {
          const awbRes = await fetch(
            "/api/logistics/awb/search?limit=150",
            { cache: "no-store", headers },
          );
          const awbJson = await awbRes.json();

          if (!awbJson.success) {
            throw new Error(
              awbJson?.error?.message || "Failed to load AWBs",
            );
          }

          if (!cancelled) {
            setAwbs(normalizeAwbs(awbJson.data));
            setOrders([]);
            setProducts([]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load dashboard",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, module, reloadKey]);

  const filteredAwbs = useMemo(() => {
    if (!activeMonth) return awbs;
    return awbs.filter((a) => {
      const key = monthKey(a.shipmentDate || a.createdAt);
      return key === activeMonth;
    });
  }, [awbs, activeMonth]);

  const foodStats = useMemo(() => {
    const totalOrders = orders.length;
    const paid = orders.filter((o) =>
      [
        "PAID",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ].includes(o.status),
    ).length;
    const processing = orders.filter((o) =>
      ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(
        o.status,
      ),
    ).length;
    const delivered = orders.filter((o) => o.status === "DELIVERED")
      .length;
    const sales = orders
      .filter(
        (o) => o.status !== "CANCELLED" && o.status !== "REFUNDED",
      )
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const activeProducts = products.filter(
      (p) => p.status === "ACTIVE",
    ).length;

    return [
      {
        label: "Total Orders",
        value: String(totalOrders),
        change: "All time",
      },
      {
        label: "Paid / Active",
        value: String(paid),
        change: totalOrders
          ? `${Math.round((paid / totalOrders) * 100)}%`
          : "0%",
      },
      {
        label: "Processing",
        value: String(processing),
        change: "Active",
      },
      {
        label: "Delivered",
        value: String(delivered),
        change: "Completed",
      },
      {
        label: "Active Products",
        value: String(activeProducts),
        change: "Catalog",
      },
      {
        label: "Sales",
        value: formatINR(sales),
        change: "From orders",
      },
    ];
  }, [orders, products]);

  const logisticsStats = useMemo(() => {
    const list = filteredAwbs;
    const total = list.length;

    // Support both MDS statuses and operational matrix stages
    const booked = list.filter((a) =>
      [
        "BOOKED",
        "PICKUP_REQUESTED",
        "BOOKING_CONFIRMED",
      ].includes(a.currentStatus),
    ).length;

    const inTransit = list.filter((a) =>
      [
        "PICKED_UP",
        "AT_ORIGIN",
        "IN_TRANSIT",
        "ARRIVED_DESTINATION",
        "OUT_FOR_DELIVERY",
        "SHIPMENT_RECEIVED",
        "HANDLING_IN_PROGRESS",
        "PROCESSED_AND_PACKED",
        "SHIPPING_LABEL_GENERATED",
        "FORWARDED_TO_AIRPORT",
      ].includes(a.currentStatus),
    ).length;

    const delivered = list.filter(
      (a) => a.currentStatus === "DELIVERED",
    ).length;

    const exceptions = list.filter((a) =>
      ["EXCEPTION", "ON_HOLD", "CANCELLED"].includes(
        a.currentStatus,
      ),
    ).length;

    const revenue = list.reduce(
      (sum, a) => sum + Number(a.total || a.charges?.total || 0),
      0,
    );

    return [
      {
        label: "Total AWBs",
        value: String(total),
        change: activeMonth ? "Filtered" : "Loaded",
      },
      {
        label: "Booked / Pickup",
        value: String(booked),
        change: "Open",
      },
      {
        label: "In Transit",
        value: String(inTransit),
        change: "Moving",
      },
      {
        label: "Delivered",
        value: String(delivered),
        change: "Completed",
      },
      {
        label: "Exceptions / Hold",
        value: String(exceptions),
        change: "Attention",
      },
      {
        label: "Revenue",
        value: formatINR(revenue),
        change: activeMonth ? "Filtered" : "From AWBs",
      },
    ];
  }, [filteredAwbs, activeMonth]);

  const chartSeries = useMemo(() => buildChartSeries(awbs), [awbs]);
  const recentOrders = orders.slice(0, 6);
  const recentAwbs = filteredAwbs.slice(0, 6);
  const stats = isFood ? foodStats : logisticsStats;

  function handleBarClick(point: ChartPoint) {
    if (point.key === activeMonth) {
      setActiveMonth(null);
    } else {
      setActiveMonth(point.key || null);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-widest ${
              isFood ? "text-orange-600" : "text-[#087f87]"
            }`}
          >
            {isFood ? "Food" : "Logistics"}
          </p>
          <h2
            className={`mt-1 text-2xl font-bold ${
              isFood ? "text-[#3b2516]" : "text-[#06284c]"
            }`}
          >
            {isFood ? "Food Dashboard" : "Logistics Dashboard"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeMonth
              ? `Filtered by ${monthLabel(activeMonth)} — click chart again to clear`
              : "Click any chart bar to filter KPIs and recent list"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setModule("LOGISTICS")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                isLogistics
                  ? "bg-[#06284c] text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Logistics
            </button>
            <button
              type="button"
              onClick={() => setModule("FOOD")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                isFood
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Food
            </button>
          </div>

          {activeMonth && (
            <button
              type="button"
              onClick={() => setActiveMonth(null)}
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
            >
              Clear Filter
            </button>
          )}

          <button
            type="button"
            onClick={() => setReloadKey((v) => v + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh
          </button>

          {isFood ? (
            <Link
              href="/admin/food/products"
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              + Add Product
            </Link>
          ) : (
            <Link
              href="/admin/logistics/booking"
              className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
            >
              + New Booking
            </Link>
          )}
        </div>
      </div>

      {(loading || authLoading) && (
        <p className="mb-4 text-sm text-slate-500">
          Loading {isFood ? "food" : "logistics"} dashboard…
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border bg-white p-5 shadow-sm ${
              isFood ? "border-orange-100" : "border-cyan-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                  isFood
                    ? "bg-orange-50 text-orange-700"
                    : "bg-cyan-50 text-cyan-800"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p
              className={`mt-4 text-2xl font-bold ${
                isFood ? "text-[#3b2516]" : "text-[#06284c]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {isLogistics && (
        <div className="mt-6">
          <XpressionCharts
            shipmentData={chartSeries.shipmentData}
            revenueData={chartSeries.revenueData}
            loading={loading}
            activeMonth={activeMonth}
            onBarClick={handleBarClick}
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3
                className={`font-bold ${
                  isFood ? "text-[#3b2516]" : "text-[#06284c]"
                }`}
              >
                {isFood ? "Recent Orders" : "Recent AWBs"}
                {activeMonth && (
                  <span className="ml-2 text-xs font-normal text-[#087f87]">
                    ({monthLabel(activeMonth)})
                  </span>
                )}
              </h3>
              <Link
                href={
                  isFood
                    ? "/admin/food/orders"
                    : "/admin/logistics/awb"
                }
                className={`text-xs font-bold ${
                  isFood ? "text-orange-600" : "text-[#087f87]"
                }`}
              >
                View All →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isFood ? (
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
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4 font-bold text-orange-600">
                          {order.orderId}
                        </td>
                        <td className="px-5 py-4">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatINR(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <Status value={order.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">AWB</th>
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAwbs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        No AWBs found
                        {activeMonth ? " for selected month" : ""}.
                      </td>
                    </tr>
                  ) : (
                    recentAwbs.map((row) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4 font-bold text-[#087f87]">
                          <Link
                            href={`/admin/logistics/awb/${row.awb}`}
                          >
                            {row.awb}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {[row.origin, row.destination]
                            .filter(Boolean)
                            .join(" → ") || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatINR(row.total || 0)}
                        </td>
                        <td className="px-5 py-4">
                          <Status value={row.currentStatus} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3
            className={`font-bold ${
              isFood ? "text-[#3b2516]" : "text-[#06284c]"
            }`}
          >
            Quick Actions
          </h3>
          <div className="mt-4 space-y-3">
            {(isFood
              ? [
                  ["Manage Products", "/admin/food/products"],
                  ["View Orders", "/admin/food/orders"],
                  ["Inventory", "/admin/food/inventory"],
                  ["Coupons", "/admin/food/coupons"],
                  ["Food Settings", "/admin/food/settings"],
                ]
              : [
                  ["New Booking", "/admin/logistics/booking"],
                  ["AWB List", "/admin/logistics/awb"],
                  [
                    "Tracking Matrix",
                    "/admin/logistics/tracking/matrix",
                  ],
                  ["Day End", "/admin/logistics/day-end"],
                  [
                    "Fuel Surcharges",
                    "/admin/logistics/fuel-surcharges",
                  ],
                  ["Co-Loaders", "/admin/logistics/co-loaders"],
                  ["Rate Compare", "/admin/logistics/rate-compare"],
                ]
            ).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg border border-slate-200 p-3 text-sm font-semibold hover:bg-slate-50 ${
                  isFood
                    ? "hover:border-orange-400 hover:bg-orange-50"
                    : "hover:border-cyan-400 hover:bg-cyan-50"
                }`}
              >
                {label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}