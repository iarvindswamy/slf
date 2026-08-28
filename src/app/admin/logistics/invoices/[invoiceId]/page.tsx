"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  MessageCircle,
  Printer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { InvoiceItem, InvoiceStatus } from "@/types/invoice";
import WhatsAppSideDrawer, {
  WhatsAppDrawerPayload,
} from "@/components/admin/WhatsAppSideDrawer";

type InvoiceDetail = {
  invoiceId: string;
  invoiceNumber: string;
  sellerName: string;
  sellerLogo?: "LOGISTICS" | "FOOD";
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  awb: string;
  accountCode?: string;
  route: string;
  issueDate: string;
  status: InvoiceStatus | string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxTotal: number;
  total: number;
  amountInWords?: string;
  pdfUrl?: string;
  // extra for PDF generation
  shipperName?: string;
  shipperAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  consigneeCity?: string;
  consigneeState?: string;
  consigneePincode?: string;
  consigneeCountry?: string;
  csbType?: string;
  exportReason?: string;
  pieces?: number;
  actualWeight?: number;
  chargeableWeight?: number;
  declaredValue?: number;
};

type ApiResponse =
  | {
      success: true;
      data: {
        invoice?: Record<string, unknown>;
        data?: Record<string, unknown>;
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
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function normalizeItems(raw: unknown): InvoiceItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => {
    const row = asRecord(item) || {};
    const quantity = Number(row.quantity || 1);
    const rate = Number(row.rate || row.unitRate || row.amount || 0);
    const amount = Number(
      row.amount !== undefined ? row.amount : rate * quantity,
    );

    return {
      id: String(row.id || `item-${index + 1}`),
      description: String(row.description || "Charge"),
      quantity: Number.isFinite(quantity) ? quantity : 1,
      rate: Number.isFinite(rate) ? rate : 0,
      taxableAmount: Number(
        row.taxableAmount !== undefined ? row.taxableAmount : amount,
      ),
      taxRate: row.taxRate !== undefined ? Number(row.taxRate) : undefined,
      taxAmount:
        row.taxAmount !== undefined ? Number(row.taxAmount) : undefined,
      amount: Number.isFinite(amount) ? amount : 0,
      hsCode: row.hsCode ? String(row.hsCode) : undefined,
      shopName: row.shopName ? String(row.shopName) : undefined,
      shopAddress: row.shopAddress ? String(row.shopAddress) : undefined,
    };
  });
}

function normalizeInvoice(
  raw: Record<string, unknown>,
  fallbackId: string,
): InvoiceDetail {
  const tax = asRecord(raw.tax) || {};
  const origin = String(raw.origin || "");
  const destination = String(raw.destination || "");
  const route =
    origin && destination
      ? `${origin} → ${destination}`
      : String(raw.route || "—");

  const shipper = asRecord(raw.shipper) || {};
  const consignee = asRecord(raw.consignee) || {};

  return {
    invoiceId: String(raw.invoiceId || raw.id || fallbackId),
    invoiceNumber: String(raw.invoiceNumber || raw.invoiceId || fallbackId),
    sellerName: String(raw.sellerName || "SRESHTA LOGISTICS"),
    sellerLogo: raw.sellerLogo === "FOOD" ? "FOOD" : "LOGISTICS",
    customerName: String(raw.customerName || "Customer"),
    customerAddress: String(raw.customerAddress || "—"),
    customerPhone: raw.customerPhone
      ? String(raw.customerPhone)
      : consignee.phone
        ? String(consignee.phone)
        : undefined,
    awb: String(raw.awb || raw.orderId || "—"),
    accountCode: raw.accountCode ? String(raw.accountCode) : undefined,
    route,
    issueDate: formatDate(raw.issueDate ? String(raw.issueDate) : undefined),
    status: String(raw.status || "ISSUED"),
    items: normalizeItems(raw.items),
    subtotal: Number(raw.subtotal || 0),
    discount: Number(raw.discount || 0),
    taxTotal: Number(tax.total || raw.taxTotal || 0),
    total: Number(raw.total || 0),
    amountInWords: raw.amountInWords
      ? String(raw.amountInWords)
      : undefined,
    pdfUrl: raw.pdfUrl ? String(raw.pdfUrl) : undefined,
    shipperName: String(
      shipper.name || shipper.companyName || raw.sellerName || "",
    ),
    shipperAddress: String(
      [
        shipper.addressLine1,
        shipper.city,
        shipper.state,
        shipper.pincode,
      ]
        .filter(Boolean)
        .join(", ") || raw.sellerAddress || "",
    ),
    consigneeName: String(
      consignee.name || consignee.companyName || raw.customerName || "",
    ),
    consigneeAddress: String(
      [consignee.addressLine1, consignee.addressLine2]
        .filter(Boolean)
        .join(", ") || raw.customerAddress || "",
    ),
    consigneeCity: consignee.city ? String(consignee.city) : undefined,
    consigneeState: consignee.state ? String(consignee.state) : undefined,
    consigneePincode: consignee.pincode
      ? String(consignee.pincode)
      : undefined,
    consigneeCountry: consignee.country
      ? String(consignee.country)
      : undefined,
    csbType: raw.csbType ? String(raw.csbType) : undefined,
    exportReason: raw.exportReason ? String(raw.exportReason) : undefined,
    pieces: raw.totalPieces ? Number(raw.totalPieces) : undefined,
    actualWeight: raw.actualWeight ? Number(raw.actualWeight) : undefined,
    chargeableWeight: raw.chargeableWeight
      ? Number(raw.chargeableWeight)
      : undefined,
    declaredValue: raw.declaredValue ? Number(raw.declaredValue) : undefined,
  };
}

function downloadBase64Pdf(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = filename;
  link.click();
}

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>();
  const { user, loading: authLoading } = useAuth();

  let invoiceId = String(params.invoiceId || "").trim();
  try {
    invoiceId = decodeURIComponent(invoiceId);
  } catch {
    // keep original
  }

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappPayload, setWhatsappPayload] =
    useState<WhatsAppDrawerPayload | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!invoiceId) {
      setLoading(false);
      setError("Invoice ID is required.");
      setInvoice(null);
      return;
    }

    let cancelled = false;

    async function loadInvoice() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = { Accept: "application/json" };
        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          `/api/invoices?invoiceId=${encodeURIComponent(invoiceId)}`,
          { method: "GET", headers, cache: "no-store" },
        );

        if (res.status === 404) {
          throw new Error(
            "Invoice detail API is not available yet. Add GET /api/invoices?invoiceId=...",
          );
        }

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success ? json.error.message : "Failed to load invoice.",
          );
        }

        const raw =
          asRecord(json.data.invoice) || asRecord(json.data.data);

        if (!raw) throw new Error("Invoice was not found.");

        if (!cancelled) {
          setInvoice(normalizeInvoice(raw, invoiceId));
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load invoice.",
          );
          setInvoice(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInvoice();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, invoiceId, reloadKey]);

  async function generateProformaPdf() {
    if (!invoice) return;

    try {
      setGenerating(true);
      setMessage(null);
      setError(null);

      // Prefer the dedicated logistics PDF generator (on-the-fly, no storage)
      const res = await fetch("/api/admin/logistics/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "proforma",
          awb: invoice.awb !== "—" ? invoice.awb : invoice.invoiceNumber,
          accountCode: invoice.accountCode,
          invoiceNo: invoice.invoiceNumber,
          invoiceDate: invoice.issueDate,
          shipperName: invoice.shipperName || invoice.sellerName,
          shipperAddress: invoice.shipperAddress || "",
          consigneeName: invoice.consigneeName || invoice.customerName,
          consigneeAddress: invoice.consigneeAddress || invoice.customerAddress,
          consigneeCity: invoice.consigneeCity,
          consigneeState: invoice.consigneeState,
          consigneePincode: invoice.consigneePincode,
          consigneeCountry: invoice.consigneeCountry,
          consigneePhone: invoice.customerPhone,
          csbType: invoice.csbType,
          exportReason: invoice.exportReason,
          items: invoice.items.map((i) => ({
            description: i.description,
            shopName: i.shopName,
            shopAddress: i.shopAddress,
            hsCode: i.hsCode || "",
            quantity: i.quantity,
            unitRate: i.rate,
            amount: i.amount,
          })),
          totalAmount: invoice.total,
          pieces: invoice.pieces,
          actualWeight: invoice.actualWeight,
          chargeableWeight: invoice.chargeableWeight,
          declaredValue: invoice.declaredValue,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate Proforma PDF.");
      }

      if (json.proforma) {
        downloadBase64Pdf(
          json.proforma,
          `Proforma_${invoice.invoiceNumber}.pdf`,
        );
        setMessage("Proforma PDF downloaded.");
      } else {
        setMessage("PDF generated but no content returned.");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to generate PDF.",
      );
    } finally {
      setGenerating(false);
    }
  }

  function openWhatsApp() {
    if (!invoice) return;
    setWhatsappPayload({
      customerName: invoice.customerName,
      phone: invoice.customerPhone || "",
      reference: invoice.invoiceNumber,
      amount: invoice.total,
      module: invoice.sellerLogo === "FOOD" ? "FOOD" : "LOGISTICS",
    });
    setWhatsappOpen(true);
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-[1000px]">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading invoice...
          </h3>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-[1000px]">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
          <h3 className="text-lg font-bold text-amber-900">
            Could not load invoice
          </h3>
          <p className="mt-2 text-sm text-amber-800">
            {error || "Invoice not found."}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((v) => v + 1)}
              className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
            <Link
              href="/admin/logistics/invoices"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* Header actions */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/logistics/invoices"
            className="text-xs font-bold text-[#087f87]"
          >
            ← Back to Invoices
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-[#06284c]">
            {invoice.invoiceNumber}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Status: {invoice.status}
            {invoice.accountCode && ` · Account: ${invoice.accountCode}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>

          <button
            type="button"
            onClick={generateProformaPdf}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#087f87] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            {generating ? "Generating…" : "Download Proforma PDF"}
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>

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

      {/* Invoice card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 p-7 md:flex-row">
          <div>
            <div className="text-2xl font-bold text-[#06284c]">
              {invoice.sellerName}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {invoice.sellerLogo === "FOOD"
                ? "Food Invoice"
                : "Logistics / Proforma Invoice"}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-400">Invoice Number</p>
            <p className="font-bold">{invoice.invoiceNumber}</p>
            <p className="mt-2 text-xs text-slate-400">Date</p>
            <p className="font-semibold">{invoice.issueDate}</p>
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 p-7 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Bill To
            </p>
            <p className="mt-2 font-bold">{invoice.customerName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {invoice.customerAddress}
            </p>
            {invoice.customerPhone && (
              <p className="text-sm text-slate-500">
                Ph: {invoice.customerPhone}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Shipment
            </p>
            <p className="mt-2 font-bold">{invoice.awb}</p>
            <p className="mt-1 text-sm text-slate-500">{invoice.route}</p>
          </div>
        </div>

        <div className="overflow-x-auto p-7">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3">Description</th>
                <th className="py-3">HS Code</th>
                <th className="py-3">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    No line items found.
                  </td>
                </tr>
              ) : (
                invoice.items.map((item) => (
                  <tr key={item.id || item.description}>
                    <td className="py-4">
                      <div>{item.description}</div>
                      {item.shopName && (
                        <div className="text-xs text-slate-400">
                          {item.shopName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-mono text-xs">
                      {item.hsCode || "—"}
                    </td>
                    <td className="py-4">{item.quantity}</td>
                    <td className="py-4 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-4 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="ml-auto mt-6 max-w-sm space-y-3 text-sm">
            <Row label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <Row label="Discount" value={formatCurrency(invoice.discount)} />
            <Row label="GST" value={formatCurrency(invoice.taxTotal)} />
            <div className="border-t border-slate-200 pt-3">
              <Row
                label="Total"
                value={formatCurrency(invoice.total)}
                strong
              />
            </div>
            {invoice.amountInWords && (
              <p className="pt-2 text-xs text-slate-500">
                {invoice.amountInWords}
              </p>
            )}
          </div>
        </div>
      </section>

      <WhatsAppSideDrawer
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        payload={whatsappPayload}
      />
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
    <div className="flex justify-between gap-5">
      <span>{label}</span>
      <span className={strong ? "font-bold text-[#06284c]" : ""}>
        {value}
      </span>
    </div>
  );
}