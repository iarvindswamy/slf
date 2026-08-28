// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type CenterRow = {
//   center: string;
//   expected: number;
//   completed: number;
//   pending: number;
// };

// type DayEndSummary = {
//   totalAWBs: number;
//   delivered: number;
//   inTransit: number;
//   exceptions: number;
//   cancelled: number;
//   revenue: number;
// };

// type ApiAwbsResponse =
//   | {
//       success: true;
//       data:
//         | Record<string, unknown>[]
//         | {
//             results?: Record<string, unknown>[];
//             data?: Record<string, unknown>[];
//           };
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// type ApiDayEndResponse =
//   | {
//       success: true;
//       data?: {
//         dayEnd?: {
//           date?: string;
//           summary?: DayEndSummary;
//         };
//       };
//       message?: string;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// function todayISODate(): string {
//   return new Date().toISOString().slice(0, 10);
// }

// function formatCurrency(amount: number): string {
//   if (!Number.isFinite(amount)) {
//     return "₹0";
//   }

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// function isCompletedStatus(status: string): boolean {
//   return status === "DELIVERED" || status === "CANCELLED";
// }

// function buildCenterRows(
//   awbs: Record<string, unknown>[],
// ): CenterRow[] {
//   const map = new Map<
//     string,
//     {
//       expected: number;
//       completed: number;
//     }
//   >();

//   awbs.forEach((awb) => {
//     const center = String(
//       awb.origin ||
//         awb.originName ||
//         awb.serviceCenter ||
//         "Unknown Center",
//     ).trim();

//     const status = String(
//       awb.currentStatus || awb.status || "",
//     );

//     const current = map.get(center) || {
//       expected: 0,
//       completed: 0,
//     };

//     current.expected += 1;

//     if (isCompletedStatus(status)) {
//       current.completed += 1;
//     }

//     map.set(center, current);
//   });

//   return Array.from(map.entries())
//     .map(([center, stats]) => ({
//       center,
//       expected: stats.expected,
//       completed: stats.completed,
//       pending: Math.max(0, stats.expected - stats.completed),
//     }))
//     .sort((a, b) => a.center.localeCompare(b.center));
// }

// function buildSummary(
//   awbs: Record<string, unknown>[],
// ): DayEndSummary {
//   let delivered = 0;
//   let inTransit = 0;
//   let exceptions = 0;
//   let cancelled = 0;
//   let revenue = 0;

//   awbs.forEach((awb) => {
//     const status = String(
//       awb.currentStatus || awb.status || "",
//     );

//     if (status === "DELIVERED") {
//       delivered += 1;
//     } else if (status === "IN_TRANSIT") {
//       inTransit += 1;
//     } else if (status === "EXCEPTION" || status === "ON_HOLD") {
//       exceptions += 1;
//     } else if (status === "CANCELLED") {
//       cancelled += 1;
//     }

//     const charges =
//       (awb.charges as Record<string, unknown> | undefined) ||
//       undefined;

//     revenue += Number(charges?.total || awb.total || 0);
//   });

//   return {
//     totalAWBs: awbs.length,
//     delivered,
//     inTransit,
//     exceptions,
//     cancelled,
//     revenue,
//   };
// }

// export default function DayEndPage() {
//   const { user, loading: authLoading } = useAuth();

//   const [date, setDate] = useState(todayISODate);
//   const [remarks, setRemarks] = useState("");
//   const [awbs, setAwbs] = useState<Record<string, unknown>[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [lastSummary, setLastSummary] =
//     useState<DayEndSummary | null>(null);
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     if (authLoading) {
//       return;
//     }

//     let cancelled = false;

//     async function loadAwbs() {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!user) {
//           throw new Error(
//             "Authentication is required for day-end operations.",
//           );
//         }

//         const token = await user.getIdToken();

//         const res = await fetch(
//           "/api/logistics/awb/search?limit=100",
//           {
//             method: "GET",
//             headers: {
//               Accept: "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             cache: "no-store",
//           },
//         );

//         const json = (await res.json()) as ApiAwbsResponse;

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error.message
//               : "Failed to load operational AWB data.",
//           );
//         }

//         const payload = json.data;
//         const list = Array.isArray(payload)
//           ? payload
//           : Array.isArray(payload.results)
//             ? payload.results
//             : Array.isArray(payload.data)
//               ? payload.data
//               : [];

//         // Prefer shipments matching selected date when shipmentDate exists
//         const filtered = list.filter((awb) => {
//           const shipmentDate = String(awb.shipmentDate || "");
//           if (!shipmentDate) {
//             return true;
//           }
//           return shipmentDate.startsWith(date);
//         });

//         if (!cancelled) {
//           setAwbs(filtered);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error
//               ? e.message
//               : "Failed to load day-end data.",
//           );
//           setAwbs([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadAwbs();

//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, user, date, reloadKey]);

//   const centers = useMemo(() => buildCenterRows(awbs), [awbs]);
//   const previewSummary = useMemo(
//     () => buildSummary(awbs),
//     [awbs],
//   );

//   const allReady = useMemo(
//     () =>
//       centers.length > 0 &&
//       centers.every((center) => center.pending === 0),
//     [centers],
//   );

//   async function completeDayEnd() {
//     try {
//       setSubmitting(true);
//       setError(null);
//       setMessage(null);

//       if (!user) {
//         throw new Error("Authentication is required.");
//       }

//       const token = await user.getIdToken();

//       const res = await fetch("/api/logistics/day-end", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           date,
//           remarks: remarks.trim() || undefined,
//         }),
//       });

//       const json = (await res.json()) as ApiDayEndResponse;

//       if (!res.ok || !json.success) {
//         throw new Error(
//           !json.success
//             ? json.error.message
//             : "Failed to complete day-end.",
//         );
//       }

//       const summary = json.data?.dayEnd?.summary || previewSummary;
//       setLastSummary(summary);

//       setMessage(
//         json.message ||
//           `Day-end completed successfully for ${date}.`,
//       );
//     } catch (e) {
//       setError(
//         e instanceof Error
//           ? e.message
//           : "Failed to complete day-end.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1300px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>

//           <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Day End Operations
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Review center-level operational completion before
//             closing the day.
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
//           />

//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
//           {message}
//           {lastSummary && (
//             <div className="mt-2 text-xs">
//               AWBs: {lastSummary.totalAWBs} · Delivered:{" "}
//               {lastSummary.delivered} · In transit:{" "}
//               {lastSummary.inTransit} · Exceptions:{" "}
//               {lastSummary.exceptions} · Revenue:{" "}
//               {formatCurrency(lastSummary.revenue)}
//             </div>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <SummaryCard
//           label="Total AWBs"
//           value={String(previewSummary.totalAWBs)}
//         />
//         <SummaryCard
//           label="Delivered"
//           value={String(previewSummary.delivered)}
//         />
//         <SummaryCard
//           label="Pending-like"
//           value={String(
//             previewSummary.totalAWBs -
//               previewSummary.delivered -
//               previewSummary.cancelled,
//           )}
//         />
//         <SummaryCard
//           label="Revenue"
//           value={formatCurrency(previewSummary.revenue)}
//         />
//       </div>

//       {loading || authLoading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#06284c]">
//             Loading day-end summary...
//           </h3>
//           <p className="mt-2 text-sm text-slate-500">
//             Aggregating AWB activity by origin center.
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-5 py-4">
//             <h3 className="font-bold text-[#06284c]">
//               Center Summary
//             </h3>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Center</th>
//                   <th className="px-5 py-3">Expected</th>
//                   <th className="px-5 py-3">Completed</th>
//                   <th className="px-5 py-3">Pending</th>
//                   <th className="px-5 py-3">Status</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {centers.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-5 py-16 text-center text-slate-500"
//                     >
//                       No AWB activity found for {date}.
//                     </td>
//                   </tr>
//                 ) : (
//                   centers.map((center) => (
//                     <tr key={center.center}>
//                       <td className="px-5 py-4 font-semibold">
//                         {center.center}
//                       </td>
//                       <td className="px-5 py-4">
//                         {center.expected}
//                       </td>
//                       <td className="px-5 py-4">
//                         {center.completed}
//                       </td>
//                       <td className="px-5 py-4">
//                         {center.pending}
//                       </td>
//                       <td className="px-5 py-4">
//                         {center.pending === 0 ? (
//                           <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
//                             Ready
//                           </span>
//                         ) : (
//                           <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
//                             Pending
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <label className="mb-1.5 block text-xs font-bold text-slate-600">
//           Remarks (optional)
//         </label>
//         <textarea
//           value={remarks}
//           onChange={(e) => setRemarks(e.target.value)}
//           className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//           placeholder="Day-end notes..."
//         />
//       </div>

//       <div className="mt-5 flex justify-end">
//         <button
//           type="button"
//           onClick={completeDayEnd}
//           disabled={submitting || loading || authLoading}
//           className="rounded-lg bg-[#087f87] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
//         >
//           {submitting
//             ? "Completing..."
//             : allReady
//               ? "Complete Day End"
//               : "Complete Day End (with pending)"}
//         </button>
//       </div>

//       <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
//         Day-end posts to{" "}
//         <code className="font-mono">POST /api/logistics/day-end</code>{" "}
//         and records a summary in Firestore. Center rows are derived
//         from AWB origin data for the selected date. Exact closure
//         rules can be tightened once the MDS defines mandatory
//         pending checks.
//       </div>
//     </div>
//   );
// }

// function SummaryCard({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//       <p className="text-xs text-slate-400">{label}</p>
//       <p className="mt-2 text-2xl font-bold text-[#06284c]">
//         {value}
//       </p>
//     </div>
//   );
// }





"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Download,
  FileText,
  Package,
  RefreshCw,
  Truck,
  ClipboardList,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FilterType = "ALL" | "WAREHOUSE_PENDING" | "DELIVERY_PENDING" | "BOOKING_PENDING";

type AwbRow = {
  awb: string;
  accountCode?: string;
  customerName?: string;
  origin?: string;
  destination?: string;
  currentStatus: string;
  bookDate?: string;
  chargeableWeight?: number;
  total?: number;
};

type DayEndSummary = {
  totalAWBs: number;
  warehousePending: number;
  deliveryPending: number;
  bookingPending: number;
  delivered: number;
  revenue: number;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function isWarehousePending(status: string) {
  return ["BOOKED", "PICKUP_REQUESTED", "PICKED_UP", "AT_ORIGIN", "HANDLING_IN_PROGRESS"].includes(
    status,
  );
}

function isDeliveryPending(status: string) {
  return ["IN_TRANSIT", "ARRIVED_DESTINATION", "OUT_FOR_DELIVERY"].includes(status);
}

function isBookingPending(status: string) {
  return ["BOOKED", "PICKUP_REQUESTED"].includes(status);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DayEndPage() {
  const { user, loading: authLoading } = useAuth();

  const [date, setDate] = useState(todayISODate());
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [rows, setRows] = useState<AwbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* -------------------- Load Data -------------------- */
  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const token = await user.getIdToken();

        const res = await fetch(
          `/api/logistics/awb/search?fromDate=${date}&toDate=${date}&limit=300`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load AWBs");
        }

        const list = Array.isArray(json.data)
          ? json.data
          : json.data?.results || json.data?.data || [];

        const mapped: AwbRow[] = list.map((item: any) => ({
          awb: item.awb,
          accountCode: item.accountCode,
          customerName: item.customerName || item.consigneeName,
          origin: item.origin,
          destination: item.destination,
          currentStatus: item.currentStatus || item.status || "BOOKED",
          bookDate: item.bookDate || item.shipmentDate,
          chargeableWeight: Number(item.chargeableWeight || 0),
          total: Number(item.charges?.total || item.total || 0),
        }));

        if (!cancelled) setRows(mapped);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load data");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, date, reloadKey]);

  /* -------------------- Summary & Filtered -------------------- */
  const summary: DayEndSummary = useMemo(() => {
    let warehousePending = 0;
    let deliveryPending = 0;
    let bookingPending = 0;
    let delivered = 0;
    let revenue = 0;

    rows.forEach((r) => {
      if (isWarehousePending(r.currentStatus)) warehousePending++;
      if (isDeliveryPending(r.currentStatus)) deliveryPending++;
      if (isBookingPending(r.currentStatus)) bookingPending++;
      if (r.currentStatus === "DELIVERED") delivered++;
      revenue += r.total || 0;
    });

    return {
      totalAWBs: rows.length,
      warehousePending,
      deliveryPending,
      bookingPending,
      delivered,
      revenue,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "WAREHOUSE_PENDING") {
      return rows.filter((r) => isWarehousePending(r.currentStatus));
    }
    if (filter === "DELIVERY_PENDING") {
      return rows.filter((r) => isDeliveryPending(r.currentStatus));
    }
    if (filter === "BOOKING_PENDING") {
      return rows.filter((r) => isBookingPending(r.currentStatus));
    }
    return rows;
  }, [rows, filter]);

  /* -------------------- Actions -------------------- */
  async function completeDayEnd() {
    if (!user) return;

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const token = await user.getIdToken();

      const res = await fetch("/api/logistics/day-end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          remarks: remarks.trim() || undefined,
          summary,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to complete day-end");
      }

      setMessage(json.message || `Day-end completed successfully for ${date}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete day-end");
    } finally {
      setSubmitting(false);
    }
  }

  function exportCsv() {
    const header = [
      "AWB",
      "Account",
      "Customer",
      "Origin",
      "Destination",
      "Status",
      "Weight",
      "Amount",
    ];

    const lines = [
      header.join(","),
      ...filteredRows.map((r) =>
        [
          r.awb,
          r.accountCode || "",
          r.customerName || "",
          r.origin || "",
          r.destination || "",
          r.currentStatus,
          r.chargeableWeight || "",
          r.total || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-end-${date}-${filter.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* -------------------- Render -------------------- */
  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Day End Operations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter by status, review pending work, export reports and close the day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Three Action Buttons (as requested) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter("WAREHOUSE_PENDING")}
          className={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${
            filter === "WAREHOUSE_PENDING"
              ? "border-[#087f87] bg-cyan-50 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="rounded-lg bg-amber-100 p-3">
            <Package className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Warehouse Pending</p>
            <p className="mt-1 text-2xl font-bold text-[#06284c]">
              {summary.warehousePending}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilter("DELIVERY_PENDING")}
          className={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${
            filter === "DELIVERY_PENDING"
              ? "border-[#087f87] bg-cyan-50 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="rounded-lg bg-blue-100 p-3">
            <Truck className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Delivery Pending (In Transit)
            </p>
            <p className="mt-1 text-2xl font-bold text-[#06284c]">
              {summary.deliveryPending}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilter("BOOKING_PENDING")}
          className={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${
            filter === "BOOKING_PENDING"
              ? "border-[#087f87] bg-cyan-50 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="rounded-lg bg-purple-100 p-3">
            <ClipboardList className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Booking Pending</p>
            <p className="mt-1 text-2xl font-bold text-[#06284c]">
              {summary.bookingPending}
            </p>
          </div>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total AWBs" value={String(summary.totalAWBs)} />
        <SummaryCard label="Delivered" value={String(summary.delivered)} />
        <SummaryCard
          label="Still Pending"
          value={String(
            summary.warehousePending + summary.deliveryPending,
          )}
        />
        <SummaryCard label="Revenue" value={formatCurrency(summary.revenue)} />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === "ALL"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white"
            }`}
          >
            Show All
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading || authLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading day-end data…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">AWB</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Origin → Destination</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Weight</th>
                  <th className="px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                      No records found for the selected filter / date.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.awb} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-[#087f87]">
                        {row.awb}
                      </td>
                      <td className="px-5 py-3 text-xs">{row.accountCode || "—"}</td>
                      <td className="px-5 py-3">{row.customerName || "—"}</td>
                      <td className="px-5 py-3 text-xs">
                        {row.origin || "—"} → {row.destination || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold">
                          {row.currentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {row.chargeableWeight
                          ? `${row.chargeableWeight.toFixed(2)} kg`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatCurrency(row.total || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remarks + Complete */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1.5 block text-xs font-bold text-slate-600">
          Day-End Remarks (optional)
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="Any notes for today..."
        />

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={completeDayEnd}
            disabled={submitting || loading}
            className="rounded-lg bg-[#087f87] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Completing…" : "Complete Day End"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#06284c]">{value}</p>
    </div>
  );
}