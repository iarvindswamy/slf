"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Save,
  RotateCcw,
  Search,
} from "lucide-react";

import ShipperForm, {
  ShipperFormData,
} from "./ShipperForm";

import ConsigneeForm, {
  ConsigneeFormData,
} from "./ConsigneeForm";

import PieceDetails, {
  ShipmentPiece,
} from "./PieceDetails";

import InvoiceItemTable, {
  InvoiceLineItemForm,
} from "./InvoiceItemTable";

import ChargeDetails, {
  ChargeDetailsData,
} from "./ChargeDetails";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AWBBookingData = {
  // Account
  bookDate: string;
  accountCode: string;
  customerId: string;
  customerName: string;
  customerCode: string;

  // Parties
  shipper: ShipperFormData;
  consignee: ConsigneeFormData;

  // Service / routing
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  product: string;
  vendor: string;
  service: string;
  shipmentValue: number;
  currency: "INR" | "USD";
  totalPieces: number;
  packageType: string;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  commercial: boolean;
  oda: boolean;
  medicalCharges: boolean;

  // Pieces
  pieces: ShipmentPiece[];

  // Performa / GST
  csbType: string;
  termOfInvoice: string;
  exportReason: string;
  gstInvoice: boolean;
  invoiceNo: string;
  invoiceDate: string;
  departmentNo: string;
  format: string;
  items: InvoiceLineItemForm[];

  // Charges
  charges: ChargeDetailsData;

  // Extra
  paymentType: string;
  referenceNo: string;
  content: string;
  instruction: string;
};

type AWBBookingFormProps = {
  initialValue?: Partial<AWBBookingData>;
  onSubmit?: (value: AWBBookingData) => Promise<void>;
  /** Optional masters for auto-fill */
  customers?: Array<{ id: string; name: string; code: string }>;
  /** Logged-in co-loader / account code (e.g. WF439) */
  defaultAccountCode?: string;
  /** Super Admin can manage fuel rows inside ChargeDetails */
  canManageFuelSurcharge?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const today = new Date().toISOString().split("T")[0];

const defaultShipper: ShipperFormData = {
  name: "",
  phone: "",
  addressLine1: "",
  city: "",
  pincode: "",
  country: "India",
};

const defaultConsignee: ConsigneeFormData = {
  name: "",
  phone: "",
  addressLine1: "",
  city: "",
  pincode: "",
  country: "USA",
};

const defaultCharges: ChargeDetailsData = {
  freight: 0,
  fuelSurcharge: 0,
  additionalCharges: [],
  discount: 0,
  contractCharges: 0,
  otherCharges: 0,
  surcharge: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
};

const defaultData: AWBBookingData = {
  bookDate: today,
  accountCode: "",
  customerId: "",
  customerName: "",
  customerCode: "",

  shipper: defaultShipper,
  consignee: defaultConsignee,

  origin: "",
  originCode: "",
  destination: "",
  destinationCode: "",
  product: "",
  vendor: "",
  service: "SELF",
  shipmentValue: 0,
  currency: "INR",
  totalPieces: 0,
  packageType: "PKT",
  actualWeight: 0,
  volumetricWeight: 0,
  chargeableWeight: 0,
  commercial: false,
  oda: false,
  medicalCharges: false,

  pieces: [],

  csbType: "CSB4",
  termOfInvoice: "CIF",
  exportReason: "UNSOLICITED GIFT - NOT FOR SALE",
  gstInvoice: false,
  invoiceNo: "",
  invoiceDate: today,
  departmentNo: "",
  format: "performainv1",
  items: [],

  charges: defaultCharges,

  paymentType: "Credit",
  referenceNo: "",
  content: "",
  instruction: "",
};

/* ------------------------------------------------------------------ */
/*  Dropdown options (aligned with MDS / constants)                    */
/* ------------------------------------------------------------------ */

const CSB_TYPES = [
  { value: "CSB4", label: "CSB4" },
  { value: "CSB5", label: "CSB5" },
  { value: "CSB1", label: "CSB1" },
  { value: "CSB2", label: "CSB2" },
  { value: "CSB3", label: "CSB3" },
];

const TERM_OF_INVOICE = [
  "CIF",
  "FOB",
  "CFR",
  "EXW",
  "DDP",
  "DAP",
  "FCA",
  "FAS",
  "CPT",
  "CIP",
  "DDU",
];

const EXPORT_REASONS = [
  "UNSOLICITED GIFT - NOT FOR SALE",
  "SAMPLE",
  "PERSONAL NOT FOR RESALE",
  "FREE SAMPLE OF NO COMMERCIAL VALUE",
  "SAMPLES NOT FOR SALE",
  "SALE",
  "GIFT",
  "BONAFIDE GIFT",
  "REPAIR",
  "REPLACEMENT",
  "RETURN",
  "BUYER (IF OTHER THAN CONSIGNEE)",
];

const PROFORMA_FORMATS = [
  { value: "performainv1", label: "Standard Proforma" },
  { value: "performainv2", label: "Proforma Format 2" },
  { value: "performainvcom", label: "Commercial Invoice" },
  { value: "performainvGSTBill", label: "GST Bill Format" },
];

const PACKAGE_TYPES = [
  { value: "PKT", label: "Packet (PKT)" },
  { value: "BOX", label: "Box" },
  { value: "CARTON", label: "Carton" },
  { value: "BAG", label: "Bag" },
  { value: "PALLET", label: "Pallet" },
  { value: "DOX", label: "Documents (DOX)" },
  { value: "NON-DOX", label: "Non-Documents" },
];

const PAYMENT_TYPES = ["Credit", "Prepaid", "To Pay", "COD"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AWBBookingForm({
  initialValue,
  onSubmit,
  defaultAccountCode = "",
  canManageFuelSurcharge = false,
}: AWBBookingFormProps) {
  const [data, setData] = useState<AWBBookingData>({
    ...defaultData,
    ...initialValue,
    accountCode:
      initialValue?.accountCode ||
      defaultAccountCode ||
      defaultData.accountCode,
    shipper: { ...defaultShipper, ...initialValue?.shipper },
    consignee: { ...defaultConsignee, ...initialValue?.consignee },
    charges: { ...defaultCharges, ...initialValue?.charges },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof AWBBookingData>(
    field: K,
    value: AWBBookingData[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Derived weights from pieces
  const derived = useMemo(() => {
    const totalPieces = data.pieces.reduce(
      (s, p) => s + Number(p.quantity || 0),
      0,
    );

    const actualWeight = data.pieces.reduce(
      (s, p) =>
        s + Number(p.weightKg || 0) * Number(p.quantity || 0),
      0,
    );

    let volumetricWeight = 0;
    data.pieces.forEach((p) => {
      const L = Number(p.lengthCm || 0);
      const W = Number(p.widthCm || 0);
      const H = Number(p.heightCm || 0);
      const qty = Number(p.quantity || 1);
      const division = Number(p.division || 5000);

      if (L > 0 && W > 0 && H > 0 && division > 0) {
        volumetricWeight += (L * W * H * qty) / division;
      }
    });

    const chargeableWeight = Math.max(actualWeight, volumetricWeight);

    return {
      totalPieces,
      actualWeight: Number(actualWeight.toFixed(3)),
      volumetricWeight: Number(volumetricWeight.toFixed(3)),
      chargeableWeight: Number(chargeableWeight.toFixed(3)),
    };
  }, [data.pieces]);

  // Keep derived weights in state (correct side-effect)
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      totalPieces: derived.totalPieces,
      actualWeight: derived.actualWeight,
      volumetricWeight: derived.volumetricWeight,
      chargeableWeight: derived.chargeableWeight,
    }));
  }, [derived]);

  // Sync origin from shipper when shipper origin fields change
  useEffect(() => {
    const origin =
      (data.shipper as ShipperFormData & { origin?: string }).origin ||
      data.shipper.city ||
      data.origin;
    const originCode =
      (data.shipper as ShipperFormData & { originCode?: string })
        .originCode || data.originCode;

    if (origin !== data.origin || originCode !== data.originCode) {
      setData((prev) => ({
        ...prev,
        origin: origin || prev.origin,
        originCode: originCode || prev.originCode,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.shipper]);

  const validate = (): string => {
    if (!data.customerName.trim() && !data.customerId.trim()) {
      return "Customer / Client Name is required.";
    }
    if (!data.shipper.name?.trim() || !data.shipper.phone?.trim()) {
      return "Shipper name and phone are required.";
    }
    if (!data.consignee.name?.trim() || !data.consignee.phone?.trim()) {
      return "Consignee name and phone are required.";
    }
    if (!data.destination.trim()) {
      return "Destination is required.";
    }
    if (data.pieces.length === 0) {
      return "Please add at least one piece.";
    }
    if (data.items.length === 0) {
      return "Please add at least one invoice item (proforma line).";
    }
    if (derived.chargeableWeight <= 0) {
      return "Chargeable weight must be greater than zero.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await onSubmit?.(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create AWB.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setData({
      ...defaultData,
      accountCode: defaultAccountCode || "",
    });
    setError("");
  };

  const input =
    "h-9 w-full rounded border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-200";
  const label = "mb-1 block text-xs font-medium text-gray-600";
  const card = "rounded-lg border border-gray-200 bg-white shadow-sm";

  return (
    <div className="space-y-4 pb-8">
      {/* Top bar – Account Details */}
      <div className={card}>
        <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-2">
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-white">
            AWB
          </span>
          <span className="text-sm font-semibold text-slate-800">
            Account Details
          </span>
          {canManageFuelSurcharge && (
            <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Super Admin
            </span>
          )}
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className={label}>Book Date *</label>
            <input
              type="date"
              value={data.bookDate}
              onChange={(e) => update("bookDate", e.target.value)}
              className={input}
            />
          </div>

          <div>
            <label className={label}>Account / Hub Code</label>
            <input
              value={data.accountCode}
              onChange={(e) => update("accountCode", e.target.value)}
              placeholder="e.g. WF439 / WH439 / S0047"
              className={input}
            />
          </div>

          <div>
            <label className={label}>Client Name *</label>
            <input
              value={data.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Customer / Client name"
              className={input}
            />
          </div>

          <div>
            <label className={label}>Customer Code</label>
            <input
              value={data.customerCode}
              onChange={(e) => update("customerCode", e.target.value)}
              placeholder="S0047"
              className={input}
            />
          </div>

          <div>
            <label className={label}>Customer ID</label>
            <input
              value={data.customerId}
              onChange={(e) => update("customerId", e.target.value)}
              placeholder="Internal ID"
              className={input}
            />
          </div>
        </div>
      </div>

      {/* Three-column: Shipper | Consignee | Services */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Shipper */}
        <div className={card}>
          <div className="border-b bg-slate-50 px-4 py-2">
            <span className="text-sm font-semibold text-slate-800">
              Shipper Details
            </span>
          </div>
          <div className="p-3">
            <ShipperForm
              value={data.shipper}
              onChange={(shipper) => update("shipper", shipper)}
            />
          </div>
        </div>

        {/* Consignee */}
        <div className={card}>
          <div className="border-b bg-slate-50 px-4 py-2">
            <span className="text-sm font-semibold text-slate-800">
              Consignee Details
            </span>
          </div>
          <div className="p-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className={label}>Destination *</label>
                <div className="relative">
                  <input
                    value={data.destination}
                    onChange={(e) =>
                      update("destination", e.target.value)
                    }
                    placeholder="Destination"
                    className={input}
                  />
                  <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={label}>Dest. Code</label>
                <input
                  value={data.destinationCode}
                  onChange={(e) =>
                    update("destinationCode", e.target.value)
                  }
                  className={input}
                />
              </div>
            </div>
            <ConsigneeForm
              value={data.consignee}
              onChange={(consignee) => update("consignee", consignee)}
            />
          </div>
        </div>

        {/* Services */}
        <div className={card}>
          <div className="border-b bg-slate-50 px-4 py-2">
            <span className="text-sm font-semibold text-slate-800">
              Services Details
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div>
              <label className={label}>Product *</label>
              <input
                value={data.product}
                onChange={(e) => update("product", e.target.value)}
                placeholder="e.g. INTERNATIONAL PRIORITY"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Vendor *</label>
              <input
                value={data.vendor}
                onChange={(e) => update("vendor", e.target.value)}
                placeholder="FEDEX / DHL / ARAMEX"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Service *</label>
              <input
                value={data.service}
                onChange={(e) => update("service", e.target.value)}
                placeholder="SELF"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Shipment Value</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.shipmentValue}
                  onChange={(e) =>
                    update("shipmentValue", Number(e.target.value) || 0)
                  }
                  className={input}
                />
                <select
                  value={data.currency}
                  onChange={(e) =>
                    update(
                      "currency",
                      e.target.value as "INR" | "USD",
                    )
                  }
                  className={`${input} w-20`}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Pieces</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={derived.totalPieces}
                  readOnly
                  className={`${input} bg-gray-50`}
                />
                <select
                  value={data.packageType}
                  onChange={(e) =>
                    update("packageType", e.target.value)
                  }
                  className={`${input} w-28`}
                >
                  {PACKAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Actual Weight (kg)</label>
              <input
                type="number"
                value={derived.actualWeight}
                readOnly
                className={`${input} bg-gray-50`}
              />
            </div>
            <div>
              <label className={label}>Volumetric Weight</label>
              <input
                type="number"
                value={derived.volumetricWeight}
                readOnly
                className={`${input} bg-gray-50`}
              />
            </div>
            <div>
              <label className={label}>Charge Weight *</label>
              <input
                type="number"
                value={derived.chargeableWeight}
                readOnly
                className={`${input} bg-gray-50 font-semibold`}
              />
            </div>

            <div className="col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.commercial}
                  onChange={(e) =>
                    update("commercial", e.target.checked)
                  }
                />
                Commercial
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.oda}
                  onChange={(e) => update("oda", e.target.checked)}
                />
                ODA
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.medicalCharges}
                  onChange={(e) =>
                    update("medicalCharges", e.target.checked)
                  }
                />
                Medical Charges
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pieces table */}
      <PieceDetails
        pieces={data.pieces}
        onChange={(pieces) => update("pieces", pieces)}
      />

      {/* Performa / GST */}
      <div className={card}>
        <div className="border-b bg-slate-50 px-4 py-2">
          <span className="text-sm font-semibold text-slate-800">
            Performa / GST Details
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>CSB Type</label>
            <select
              value={data.csbType}
              onChange={(e) => update("csbType", e.target.value)}
              className={input}
            >
              {CSB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Term Of Invoice</label>
            <select
              value={data.termOfInvoice}
              onChange={(e) =>
                update("termOfInvoice", e.target.value)
              }
              className={input}
            >
              <option value="">Select</option>
              {TERM_OF_INVOICE.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>GST Invoice</label>
            <div className="flex h-9 items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  checked={data.gstInvoice === true}
                  onChange={() => update("gstInvoice", true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  checked={data.gstInvoice === false}
                  onChange={() => update("gstInvoice", false)}
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className={label}>Invoice No</label>
            <input
              value={data.invoiceNo}
              onChange={(e) => update("invoiceNo", e.target.value)}
              className={input}
            />
          </div>

          <div>
            <label className={label}>Invoice Date</label>
            <input
              type="date"
              value={data.invoiceDate}
              onChange={(e) => update("invoiceDate", e.target.value)}
              className={input}
            />
          </div>

          <div>
            <label className={label}>Department No</label>
            <input
              value={data.departmentNo}
              onChange={(e) =>
                update("departmentNo", e.target.value)
              }
              className={input}
            />
          </div>

          <div>
            <label className={label}>Export Reason</label>
            <select
              value={data.exportReason}
              onChange={(e) =>
                update("exportReason", e.target.value)
              }
              className={input}
            >
              {EXPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Format</label>
            <select
              value={data.format}
              onChange={(e) => update("format", e.target.value)}
              className={input}
            >
              <option value="">Select</option>
              {PROFORMA_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <InvoiceItemTable
        items={data.items}
        onChange={(items) => update("items", items)}
      />

      {/* Charges (includes fuel surcharge) */}
      <ChargeDetails
        value={data.charges}
        onChange={(charges) => update("charges", charges)}
        canManageFuel={canManageFuelSurcharge}
      />

      {/* Shipment extra */}
      <div className={card}>
        <div className="border-b bg-slate-50 px-4 py-2">
          <span className="text-sm font-semibold text-slate-800">
            Shipment Details
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>Payment Type *</label>
            <select
              value={data.paymentType}
              onChange={(e) => update("paymentType", e.target.value)}
              className={input}
            >
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Reference No</label>
            <input
              value={data.referenceNo}
              onChange={(e) => update("referenceNo", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Content</label>
            <input
              value={data.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="e.g. USED CLOTHES / PICKLES"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Instruction</label>
            <input
              value={data.instruction}
              onChange={(e) => update("instruction", e.target.value)}
              className={input}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleReset}
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-8 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating AWB...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create & Generate AWB Invoice
            </>
          )}
        </button>
      </div>
    </div>
  );
}