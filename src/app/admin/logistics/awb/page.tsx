"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type TrackingStatus =
  | "BOOKED"
  | "PICKUP_REQUESTED"
  | "PICKED_UP"
  | "AT_ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVED_DESTINATION"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "ON_HOLD"
  | "EXCEPTION"
  | "CANCELLED";

type AwbRow = {
  awb: string;
  customerName: string;
  destination: string;
  status: string;
  bookedAt: string;
};

type ApiResponse =
  | {
      success: true;
      data:
        | Record<string, unknown>[]
        | {
            results?: Record<string, unknown>[];
            items?: Record<string, unknown>[];
            data?: Record<string, unknown>[];
          };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const STATUSES: Array<TrackingStatus | "ALL"> = [
  "ALL",
  "BOOKED",
  "PICKUP_REQUESTED",
  "PICKED_UP",
  "AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "ON_HOLD",
  "EXCEPTION",
  "CANCELLED",
];

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

function normalizeAwb(
  raw: Record<string, unknown>,
): AwbRow | null {
  const awb = String(raw.awb || raw.documentId || "").trim();

  if (!awb) {
    return null;
  }

  const customerName = String(
    raw.customerName ||
      raw.customer ||
      raw.customerId ||
      "Customer",
  );

  const destination = String(
    raw.destination ||
      raw.destinationName ||
      "—",
  );

  const status = String(
    raw.currentStatus || raw.status || "BOOKED",
  );

  const bookedAt = formatDate(
    raw.shipmentDate
      ? String(raw.shipmentDate)
      : raw.createdAt
        ? String(raw.createdAt)
        : undefined,
  );

  return {
    awb,
    customerName,
    destination,
    status,
    bookedAt,
  };
}

export default function AWBPage() {
  const { user, loading: authLoading } = useAuth();

  const [rows, setRows] = useState<AwbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadAwbs() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error(
            "Authentication is required to view AWBs.",
          );
        }

        const token = await user.getIdToken();

        const params = new URLSearchParams();
        params.set("limit", "100");

        if (status !== "ALL") {
          params.set("status", status);
        }

        const res = await fetch(
          `/api/logistics/awb/search?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load AWBs.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.results)
            ? payload.results
            : Array.isArray(payload.items)
              ? payload.items
              : Array.isArray(payload.data)
                ? payload.data
                : [];

        const normalized = list
          .map((item) => normalizeAwb(item))
          .filter(Boolean) as AwbRow[];

        if (!cancelled) {
          setRows(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load AWBs.",
          );
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAwbs();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, status, reloadKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.awb, row.customerName, row.destination, row.status, row.bookedAt]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [rows, search]);

  function exportCsv() {
    const header = [
      "AWB",
      "Customer",
      "Destination",
      "Status",
      "Booked",
    ];

    const lines = [
      header.join(","),
      ...filtered.map((row) =>
        [
          row.awb,
          row.customerName,
          row.destination,
          row.status,
          row.bookedAt,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `awbs-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="AWB Management"
        description="Search, review and manage airway bills."
        action="/admin/logistics/booking"
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm md:max-w-md"
          placeholder="Search AWB, customer, destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading || authLoading}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading || authLoading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item === "ALL" ? "All Statuses" : item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
        >
          Refresh
        </button>

        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Export
        </button>
      </div>

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading AWBs...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching airway bills from Firestore.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load AWBs
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
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
                  <th className="px-5 py-3">AWB</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Booked</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.awb} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/logistics/awb/${encodeURIComponent(row.awb)}`}
                        className="font-bold text-[#087f87]"
                      >
                        {row.awb}
                      </Link>
                    </td>

                    <td className="px-5 py-4">{row.customerName}</td>
                    <td className="px-5 py-4">{row.destination}</td>

                    <td className="px-5 py-4">
                      <Status value={row.status} />
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {row.bookedAt}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/logistics/awb/${encodeURIComponent(row.awb)}`}
                        className="text-xs font-bold text-[#087f87]"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              {rows.length === 0
                ? "No AWBs found."
                : "No AWBs match your search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
          Logistics
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <Link
        href={action}
        className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
      >
        + New Booking
      </Link>
    </div>
  );
}

function Status({ value }: { value: string }) {
  const styles: Record<string, string> = {
    DELIVERED: "bg-emerald-100 text-emerald-700",
    EXCEPTION: "bg-red-100 text-red-700",
    IN_TRANSIT: "bg-blue-100 text-blue-700",
    BOOKED: "bg-cyan-100 text-cyan-700",
    AT_ORIGIN: "bg-amber-100 text-amber-700",
    OUT_FOR_DELIVERY: "bg-violet-100 text-violet-700",
    PICKED_UP: "bg-indigo-100 text-indigo-700",
    PICKUP_REQUESTED: "bg-sky-100 text-sky-700",
    ARRIVED_DESTINATION: "bg-teal-100 text-teal-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[value] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}