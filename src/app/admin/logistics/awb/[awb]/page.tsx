"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  MessageCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import WhatsAppSideDrawer, {
  WhatsAppDrawerPayload,
} from "@/components/admin/WhatsAppSideDrawer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TrackingEvent = {
  status: string;
  location: string;
  description?: string;
  timestamp: string;
};

type AwbDetail = {
  awb: string;
  accountCode?: string;
  customerName: string;
  service: string;
  origin: string;
  destination: string;
  pieces: string;
  actualWeight: string;
  chargeableWeight: string;
  declaredValue: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderCity?: string;
  senderState?: string;
  senderPincode?: string;
  senderCountry?: string;
  senderTaxId?: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  receiverCity?: string;
  receiverState?: string;
  receiverPincode?: string;
  receiverCountry?: string;
  freight: string;
  fuelSurcharge: string;
  otherCharges: string;
  tax: string;
  total: string;
  totalRaw: number;
  currentStatus: string;
  lastUpdated: string;
  events: TrackingEvent[];
  // raw numbers for PDF
  piecesCount: number;
  actualWeightKg: number;
  chargeableWeightKg: number;
  declaredValueNum: number;
  content?: string;
  csbType?: string;
  exportReason?: string;
  vendor?: string;
  bookDate?: string;
  items?: Array<{
    description: string;
    shopName?: string;
    shopAddress?: string;
    hsCode: string;
    quantity: number;
    weight?: number;
    unitRate: number;
    amount: number;
  }>;
};

type ApiResponse =
  | {
      success: true;
      data: {
        shipment?: Record<string, unknown>;
        events?: Record<string, unknown>[];
      };
    }
  | {
      success: false;
      error: { code: string; message: string };
    };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatWeight(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} kg`;
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function text(value: unknown, fallback = "—"): string {
  const str = String(value ?? "").trim();
  return str || fallback;
}

function normalizeEvents(rawEvents: unknown): TrackingEvent[] {
  if (!Array.isArray(rawEvents)) return [];

  return rawEvents
    .map((item) => {
      const event = asRecord(item) || {};
      return {
        status: text(event.status || event.currentStatus, "EVENT"),
        location: text(event.location || event.place || event.hub, "—"),
        description: event.description
          ? String(event.description)
          : undefined,
        timestamp: formatDateTime(
          String(
            event.timestamp ||
              event.eventTime ||
              event.createdAt ||
              "",
          ),
        ),
        sortKey: String(
          event.timestamp || event.eventTime || event.createdAt || "",
        ),
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.sortKey).getTime();
      const bTime = new Date(b.sortKey).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return bTime - aTime;
    })
    .map(({ sortKey: _s, ...event }) => event);
}

function normalizeShipment(
  shipment: Record<string, unknown>,
  events: TrackingEvent[],
  fallbackAwb: string,
): AwbDetail {
  const sender = asRecord(shipment.shipper) || asRecord(shipment.sender) || {};
  const receiver =
    asRecord(shipment.consignee) || asRecord(shipment.receiver) || {};
  const charges = asRecord(shipment.charges) || {};
  const gst = asRecord(shipment.gst) || {};

  const piecesCount = Array.isArray(shipment.pieces)
    ? shipment.pieces.length
    : Number(shipment.totalPieces || 0);

  const actualWeightKg = Number(shipment.actualWeight || 0);
  const chargeableWeightKg = Number(
    shipment.chargeableWeight || actualWeightKg || 0,
  );

  const freight = Number(charges.freight || 0);
  const fuelSurcharge = Number(charges.fuelSurcharge || 0);
  const otherCharges = Number(
    charges.otherCharges || charges.additionalCharges || 0,
  );
  const tax = Number(charges.tax || gst.totalTax || 0);
  const total = Number(
    charges.total || freight + fuelSurcharge + otherCharges + tax,
  );

  const declaredValueNum = Number(shipment.declaredValue || 0);

  const items = Array.isArray(shipment.items)
    ? (shipment.items as Record<string, unknown>[]).map((i) => ({
        description: String(i.description || ""),
        shopName: i.shopName ? String(i.shopName) : undefined,
        shopAddress: i.shopAddress ? String(i.shopAddress) : undefined,
        hsCode: String(i.hsCode || ""),
        quantity: Number(i.quantity || 0),
        weight: i.weight ? Number(i.weight) : undefined,
        unitRate: Number(i.unitRate || i.rate || 0),
        amount: Number(i.amount || 0),
      }))
    : [];

  return {
    awb: text(shipment.awb, fallbackAwb),
    accountCode: text(shipment.accountCode, ""),
    customerName: text(
      shipment.customerName || shipment.customerId,
      "Customer",
    ),
    service: text(
      shipment.serviceType || shipment.serviceName || shipment.serviceId,
      "—",
    ),
    origin: text(shipment.origin),
    destination: text(shipment.destination),
    pieces: piecesCount > 0 ? String(piecesCount) : "—",
    actualWeight: formatWeight(actualWeightKg),
    chargeableWeight: formatWeight(chargeableWeightKg),
    declaredValue:
      declaredValueNum > 0 ? formatCurrency(declaredValueNum) : "—",
    senderName: text(
      sender.name || sender.companyName || shipment.senderName,
      "—",
    ),
    senderAddress: text(
      [
        sender.addressLine1,
        sender.addressLine2,
        sender.city,
        sender.state,
        sender.pincode || sender.postalCode,
      ]
        .filter(Boolean)
        .join(", ") || shipment.senderAddress,
    ),
    senderPhone: text(sender.phone || shipment.senderPhone),
    senderCity: text(sender.city, ""),
    senderState: text(sender.state, ""),
    senderPincode: text(sender.pincode || sender.postalCode, ""),
    senderCountry: text(sender.country, "INDIA"),
    senderTaxId: text(sender.gstin || sender.documentNo, ""),
    receiverName: text(
      receiver.name || receiver.companyName || shipment.receiverName,
      "—",
    ),
    receiverAddress: text(
      [
        receiver.addressLine1,
        receiver.addressLine2,
      ]
        .filter(Boolean)
        .join(", ") || shipment.receiverAddress,
    ),
    receiverPhone: text(receiver.phone || shipment.receiverPhone),
    receiverCity: text(receiver.city, ""),
    receiverState: text(receiver.state, ""),
    receiverPincode: text(receiver.pincode || receiver.postalCode, ""),
    receiverCountry: text(receiver.country, ""),
    freight: freight > 0 ? formatCurrency(freight) : "—",
    fuelSurcharge: fuelSurcharge > 0 ? formatCurrency(fuelSurcharge) : "—",
    otherCharges: otherCharges > 0 ? formatCurrency(otherCharges) : "—",
    tax: tax > 0 ? formatCurrency(tax) : "—",
    total: total > 0 ? formatCurrency(total) : "—",
    totalRaw: total,
    currentStatus: text(
      shipment.currentStatus || shipment.status,
      events[0]?.status || "BOOKED",
    ),
    lastUpdated: formatDateTime(
      String(
        shipment.updatedAt ||
          events[0]?.timestamp ||
          shipment.createdAt ||
          "",
      ),
    ),
    events,
    piecesCount,
    actualWeightKg,
    chargeableWeightKg,
    declaredValueNum,
    content: text(shipment.content || shipment.exportReason, ""),
    csbType: text(shipment.csbType, ""),
    exportReason: text(shipment.exportReason, ""),
    vendor: text(shipment.vendor || shipment.preCarriageBy, ""),
    bookDate: text(shipment.bookDate || shipment.shipmentDate, ""),
    items,
  };
}

function downloadBase64Pdf(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = filename;
  link.click();
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AWBDetailPage() {
  const params = useParams<{ awb: string }>();
  const { user, loading: authLoading } = useAuth();

  let awbParam = String(params.awb || "").trim();
  try {
    awbParam = decodeURIComponent(awbParam);
  } catch {
    // keep original
  }

  const [detail, setDetail] = useState<AwbDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pdfLoading, setPdfLoading] = useState<"label" | "proforma" | null>(
    null,
  );
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappPayload, setWhatsappPayload] =
    useState<WhatsAppDrawerPayload | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!awbParam) {
      setLoading(false);
      setError("AWB is required.");
      setDetail(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = { Accept: "application/json" };
        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          `/api/logistics/tracking/${encodeURIComponent(awbParam)}`,
          { method: "GET", headers, cache: "no-store" },
        );

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load AWB details.",
          );
        }

        const shipment = asRecord(json.data.shipment) || {};
        const events = normalizeEvents(json.data.events);
        const normalized = normalizeShipment(shipment, events, awbParam);

        if (!cancelled) setDetail(normalized);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load AWB details.",
          );
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, awbParam, reloadKey]);

  const trackingHref = useMemo(
    () =>
      detail
        ? `/admin/logistics/tracking?awb=${encodeURIComponent(detail.awb)}`
        : "/admin/logistics/tracking",
    [detail],
  );

  async function generatePdf(type: "awb-label" | "proforma") {
    if (!detail) return;

    try {
      setPdfLoading(type === "awb-label" ? "label" : "proforma");

      const res = await fetch("/api/admin/logistics/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          awb: detail.awb,
          accountCode: detail.accountCode,
          bookDate: detail.bookDate,
          shipperName: detail.senderName,
          shipperAddress: detail.senderAddress,
          shipperCity: detail.senderCity,
          shipperState: detail.senderState,
          shipperPincode: detail.senderPincode,
          shipperPhone: detail.senderPhone,
          shipperCountry: detail.senderCountry,
          shipperTaxId: detail.senderTaxId,
          consigneeName: detail.receiverName,
          consigneeAddress: detail.receiverAddress,
          consigneeCity: detail.receiverCity,
          consigneeState: detail.receiverState,
          consigneePincode: detail.receiverPincode,
          consigneePhone: detail.receiverPhone,
          consigneeCountry: detail.receiverCountry,
          serviceType: detail.service,
          vendor: detail.vendor,
          pieces: detail.piecesCount,
          actualWeight: detail.actualWeightKg,
          chargeableWeight: detail.chargeableWeightKg,
          declaredValue: detail.declaredValueNum,
          content: detail.content,
          csbType: detail.csbType,
          exportReason: detail.exportReason,
          items: detail.items,
          totalAmount: detail.totalRaw,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "PDF generation failed");
      }

      if (type === "awb-label" && json.awbLabel) {
        downloadBase64Pdf(json.awbLabel, `AWB_Label_${detail.awb}.pdf`);
      }
      if (type === "proforma" && json.proforma) {
        downloadBase64Pdf(json.proforma, `Proforma_${detail.awb}.pdf`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate PDF");
    } finally {
      setPdfLoading(null);
    }
  }

  function openWhatsApp() {
    if (!detail) return;
    setWhatsappPayload({
      customerName: detail.receiverName,
      phone: detail.receiverPhone,
      reference: detail.awb,
      amount: detail.totalRaw,
      module: "LOGISTICS",
      trackingUrl: `${window.location.origin}/logistics/track/${detail.awb}`,
    });
    setWhatsappOpen(true);
  }

  /* ---------- Loading / Error states ---------- */

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">Loading AWB...</h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching shipment and tracking details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load AWB
          </h3>
          <p className="mt-2 text-sm text-red-700">
            {error || "AWB not found."}
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
              href="/admin/logistics/awb"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Back to AWBs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Main render ---------- */

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/admin/logistics/awb"
            className="text-xs font-bold text-[#087f87]"
          >
            ← Back to AWBs
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-[#06284c]">
            {detail.awb}
          </h2>
          {detail.accountCode && (
            <p className="text-sm text-slate-500">
              Account: {detail.accountCode}
            </p>
          )}
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
            onClick={() => generatePdf("awb-label")}
            disabled={pdfLoading === "label"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {pdfLoading === "label" ? "Generating…" : "AWB Label"}
          </button>

          <button
            type="button"
            onClick={() => generatePdf("proforma")}
            disabled={pdfLoading === "proforma"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            {pdfLoading === "proforma" ? "Generating…" : "Proforma PDF"}
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>

          <Link
            href={`/admin/logistics/booking?awb=${encodeURIComponent(detail.awb)}`}
            className="rounded-lg bg-[#087f87] px-4 py-2 text-sm font-bold text-white"
          >
            Update AWB
          </Link>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
        {/* Left column */}
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#06284c]">Shipment Information</h3>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="AWB" value={detail.awb} />
              <Info label="Customer" value={detail.customerName} />
              <Info label="Service" value={detail.service} />
              <Info label="Origin" value={detail.origin} />
              <Info label="Destination" value={detail.destination} />
              <Info label="Pieces" value={detail.pieces} />
              <Info label="Actual Weight" value={detail.actualWeight} />
              <Info label="Chargeable Weight" value={detail.chargeableWeight} />
              <Info label="Declared Value" value={detail.declaredValue} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#06284c]">Sender & Receiver</h3>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Sender
                </p>
                <p className="mt-2 font-bold">{detail.senderName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {detail.senderAddress}
                </p>
                <p className="text-sm text-slate-500">{detail.senderPhone}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Receiver
                </p>
                <p className="mt-2 font-bold">{detail.receiverName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {detail.receiverAddress}
                </p>
                <p className="text-sm text-slate-500">{detail.receiverPhone}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-[#06284c]">Charges</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3 text-sm">
                <Row label="Freight" value={detail.freight} />
                <Row label="Fuel Surcharge" value={detail.fuelSurcharge} />
                <Row label="Other Charges" value={detail.otherCharges} />
                <Row label="GST" value={detail.tax} />
                <div className="border-t border-slate-200 pt-3">
                  <Row label="Total" value={detail.total} strong />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Status
            </p>
            <div className="mt-3 rounded-lg bg-blue-50 p-4 text-blue-700">
              <p className="text-lg font-bold">{detail.currentStatus}</p>
              <p className="mt-1 text-xs">
                Last updated: {detail.lastUpdated}
              </p>
            </div>
            <Link
              href={trackingHref}
              className="mt-4 block rounded-lg bg-[#087f87] px-4 py-3 text-center text-sm font-bold text-white"
            >
              Update Tracking
            </Link>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-[#06284c]">Recent Events</h3>
            <div className="mt-5 space-y-5">
              {detail.events.length === 0 ? (
                <p className="text-sm text-slate-500">No tracking events yet.</p>
              ) : (
                detail.events.map((event, index) => (
                  <div
                    key={`${event.status}-${event.timestamp}-${index}`}
                    className="relative pl-6"
                  >
                    <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-[#087f87]" />
                    <p className="text-sm font-bold">{event.status}</p>
                    <p className="text-xs text-slate-500">{event.location}</p>
                    {event.description && (
                      <p className="text-xs text-slate-500">
                        {event.description}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {event.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* WhatsApp drawer */}
      <WhatsAppSideDrawer
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        payload={whatsappPayload}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
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
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <strong className={strong ? "text-[#06284c]" : ""}>{value}</strong>
    </div>
  );
}