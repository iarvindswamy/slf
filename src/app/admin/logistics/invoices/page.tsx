"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { InvoiceStatus } from "@/types/invoice";
import WhatsAppSideDrawer, {
  WhatsAppDrawerPayload,
} from "@/components/admin/WhatsAppSideDrawer";

type InvoiceRow = {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  awb: string;
  accountCode?: string;
  total: number;
  status: InvoiceStatus | string;
  issueDate?: string;
  dueDate?: string;
  type?: "LOGISTICS" | "FOOD";
};

type ApiResponse =
  | {
      success: true;
      data:
        | Record<string, unknown>[]
        | {
            invoices?: Record<string, unknown>[];
            data?: Record<string, unknown>[];
            results?: Record<string, unknown>[];
          };
    }
  | {
      success: false;
      error: { code: string; message: string };
    };

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function isOverdue(row: InvoiceRow): boolean {
  if (row.status === "PAID" || row.status === "CANCELLED") return false;
  if (!row.dueDate) return false;
  const due = new Date(row.dueDate).getTime();
  return !Number.isNaN(due) && due < Date.now();
}

function displayStatus(row: InvoiceRow): string {
  if (isOverdue(row) && row.status !== "PAID") return "OVERDUE";
  return String(row.status || "ISSUED");
}

function normalizeInvoice(raw: Record<string, unknown>): InvoiceRow | null {
  const invoiceId = String(
    raw.invoiceId || raw.invoiceNumber || raw.id || "",
  ).trim();
  if (!invoiceId) return null;

  return {
    invoiceId,
    invoiceNumber: String(raw.invoiceNumber || raw.invoiceId || invoiceId),
    customerName: String(raw.customerName || raw.customer || "Customer"),
    customerPhone: raw.customerPhone ? String(raw.customerPhone) : undefined,
    awb: String(raw.awb || raw.orderId || "—"),
    accountCode: raw.accountCode ? String(raw.accountCode) : undefined,
    total: Number(raw.total || 0),
    status: String(raw.status || "ISSUED"),
    issueDate: raw.issueDate ? String(raw.issueDate) : undefined,
    dueDate: raw.dueDate ? String(raw.dueDate) : undefined,
    type: raw.type === "FOOD" ? "FOOD" : "LOGISTICS",
  };
}

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappPayload, setWhatsappPayload] =
    useState<WhatsAppDrawerPayload | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadInvoices() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = { Accept: "application/json" };
        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch("/api/invoices", {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (res.status === 404) {
          if (!cancelled) {
            setInvoices([]);
            setError(
              "Invoice list API is not available yet. Add GET /api/invoices.",
            );
          }
          return;
        }

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success ? json.error.message : "Failed to load invoices.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.invoices)
            ? payload.invoices
            : Array.isArray(payload.results)
              ? payload.results
              : Array.isArray(payload.data)
                ? payload.data
                : [];

        const normalized = list
          .map((item) => normalizeInvoice(item))
          .filter(Boolean) as InvoiceRow[];

        if (!cancelled) setInvoices(normalized);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load invoices.",
          );
          setInvoices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInvoices();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = displayStatus(invoice);

      const matchesSearch =
        !query ||
        [
          invoice.invoiceNumber,
          invoice.invoiceId,
          invoice.customerName,
          invoice.awb,
          invoice.accountCode,
          status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      let matchesDate = true;
      if (fromDate && invoice.issueDate) {
        matchesDate =
          matchesDate &&
          new Date(invoice.issueDate) >= new Date(fromDate);
      }
      if (toDate && invoice.issueDate) {
        matchesDate =
          matchesDate &&
          new Date(invoice.issueDate) <= new Date(toDate + "T23:59:59");
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, search, statusFilter, fromDate, toDate]);

  function exportCsv() {
    const header = [
      "Invoice",
      "Customer",
      "AWB",
      "Account",
      "Amount",
      "Status",
      "Issue Date",
    ];

    const lines = [
      header.join(","),
      ...filtered.map((row) =>
        [
          row.invoiceNumber,
          row.customerName,
          row.awb,
          row.accountCode || "",
          String(row.total),
          displayStatus(row),
          row.issueDate || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openWhatsApp(row: InvoiceRow) {
    setWhatsappPayload({
      customerName: row.customerName,
      phone: row.customerPhone || "",
      reference: row.invoiceNumber,
      amount: row.total,
      module: row.type === "FOOD" ? "FOOD" : "LOGISTICS",
    });
    setWhatsappOpen(true);
  }

  return (
    <div className="mx-auto max-w-[1300px]">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Invoices
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search by AWB / Invoice ID, filter by date, download or share via WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((v) => v + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer, AWB, account..."
            disabled={loading || authLoading}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#087f87]"
          />
        </div>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          title="From date"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          title="To date"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading || authLoading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ISSUED">ISSUED</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>

        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading invoices...
          </h3>
        </div>
      ) : error && invoices.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
          <h3 className="text-lg font-bold text-amber-900">
            Invoices not fully connected
          </h3>
          <p className="mt-2 text-sm text-amber-800">{error}</p>
          <p className="mt-3 text-xs text-amber-700">
            Generation exists at{" "}
            <code className="font-mono">POST /api/invoices/generate</code> and{" "}
            <code className="font-mono">/api/admin/logistics/generate-pdf</code>.
            Add <code className="font-mono">GET /api/invoices</code> to list the
            collection.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">AWB</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {invoices.length === 0
                        ? "No invoices found."
                        : "No invoices match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const status = displayStatus(row);
                    return (
                      <tr key={row.invoiceId} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/logistics/invoices/${encodeURIComponent(row.invoiceId)}`}
                            className="font-bold text-[#087f87]"
                          >
                            {row.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-4">{row.customerName}</td>
                        <td className="px-5 py-4 font-mono text-xs">
                          {row.awb}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {row.accountCode || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {formatDate(row.issueDate)}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {formatCurrency(row.total)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              status === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : status === "OVERDUE"
                                  ? "bg-red-100 text-red-700"
                                  : status === "ISSUED"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/logistics/invoices/${encodeURIComponent(row.invoiceId)}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#087f87]"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => openWhatsApp(row)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WhatsAppSideDrawer
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        payload={whatsappPayload}
      />
    </div>
  );
}