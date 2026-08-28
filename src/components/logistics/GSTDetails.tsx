"use client";

export type GSTDetailsData = {
  applicable: boolean;
  gstin?: string;
  taxType: "IGST" | "CGST_SGST";
  gstRate: number;
  placeOfSupply?: string;

  // Xpression / Proforma fields
  csbType: string;
  termOfInvoice: string;
  exportReason: string;
  gstInvoice: boolean;
  invoiceNo: string;
  invoiceDate: string;
  departmentNo: string;
  format: string;
  invoiceType: "TAX_INVOICE" | "BILL_OF_SUPPLY" | "OTHER";
};

type GSTDetailsProps = {
  value: GSTDetailsData;
  onChange: (value: GSTDetailsData) => void;
  disabled?: boolean;
};

const CSB_TYPES = ["CSB 1", "CSB 2", "CSB 3", "CSB 4", "CSB 5"];

const TERM_OF_INVOICE = [
  "Select",
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAF",
  "DES",
  "DEQ",
  "DDU",
  "DDP",
  "DAP",
  "DAT",
];

const EXPORT_REASONS = [
  "SALE",
  "SAMPLE",
  "GIFT",
  "BONAFIDE GIFT",
  "PERSONAL NOT FOR RESALE",
  "REPAIR",
  "REPLACEMENT",
  "RETURN",
  "FREE SAMPLE OF NO COMMERCIAL VALUE",
  "SAMPLES NOT FOR SALE",
  "UNSOLICITED GIFT - NOT FOR SALE",
  "BUYER (IF OTHER THAN CONSIGNEE)",
];

const PROFORMA_FORMATS = [
  "Select",
  "performainv1",
  "performainv2",
  "performainvcom",
  "performainvGSTBill",
];

export default function GSTDetails({
  value,
  onChange,
  disabled = false,
}: GSTDetailsProps) {
  const update = <K extends keyof GSTDetailsData>(
    field: K,
    fieldValue: GSTDetailsData[K],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const input =
    "h-9 w-full rounded border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-200 disabled:bg-gray-50";
  const label = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b bg-slate-50 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Manifest GST / Performa Details
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          CSB type, terms of invoice, export reason and tax information.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* Row 1 – CSB + Term + GST Invoice + Invoice No */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>CSB Type</label>
            <select
              value={value.csbType}
              onChange={(e) => update("csbType", e.target.value)}
              className={input}
              disabled={disabled}
            >
              {CSB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Term Of Invoice</label>
            <select
              value={value.termOfInvoice}
              onChange={(e) => update("termOfInvoice", e.target.value)}
              className={input}
              disabled={disabled}
            >
              {TERM_OF_INVOICE.map((t) => (
                <option key={t} value={t === "Select" ? "" : t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>GST Invoice</label>
            <div className="flex h-9 items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="gstInvoice"
                  checked={value.gstInvoice === true}
                  onChange={() => update("gstInvoice", true)}
                  disabled={disabled}
                />
                Yes
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="gstInvoice"
                  checked={value.gstInvoice === false}
                  onChange={() => update("gstInvoice", false)}
                  disabled={disabled}
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className={label}>Invoice No</label>
            <input
              value={value.invoiceNo}
              onChange={(e) => update("invoiceNo", e.target.value)}
              className={input}
              placeholder="Invoice number"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Row 2 – Invoice Date + Department + Export Reason + Format */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>Invoice Date</label>
            <input
              type="date"
              value={value.invoiceDate}
              onChange={(e) => update("invoiceDate", e.target.value)}
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>Department No</label>
            <input
              value={value.departmentNo}
              onChange={(e) => update("departmentNo", e.target.value)}
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>Export Reason</label>
            <select
              value={value.exportReason}
              onChange={(e) => update("exportReason", e.target.value)}
              className={input}
              disabled={disabled}
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
              value={value.format}
              onChange={(e) => update("format", e.target.value)}
              className={input}
              disabled={disabled}
            >
              {PROFORMA_FORMATS.map((f) => (
                <option key={f} value={f === "Select" ? "" : f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tax Details
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <input
                type="checkbox"
                checked={value.applicable}
                onChange={(e) => update("applicable", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">GST Applicable</span>
            </label>

            <div>
              <label className={label}>Invoice Type</label>
              <select
                value={value.invoiceType}
                onChange={(e) =>
                  update(
                    "invoiceType",
                    e.target.value as GSTDetailsData["invoiceType"],
                  )
                }
                className={input}
                disabled={disabled}
              >
                <option value="TAX_INVOICE">Tax Invoice</option>
                <option value="BILL_OF_SUPPLY">Bill of Supply</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className={label}>GSTIN</label>
              <input
                value={value.gstin ?? ""}
                onChange={(e) =>
                  update("gstin", e.target.value.toUpperCase())
                }
                className={input}
                placeholder="GSTIN"
                disabled={disabled || !value.applicable}
              />
            </div>

            <div>
              <label className={label}>Tax Type</label>
              <select
                value={value.taxType}
                onChange={(e) =>
                  update(
                    "taxType",
                    e.target.value as GSTDetailsData["taxType"],
                  )
                }
                className={input}
                disabled={disabled || !value.applicable}
              >
                <option value="IGST">IGST</option>
                <option value="CGST_SGST">CGST + SGST</option>
              </select>
            </div>

            <div>
              <label className={label}>GST Rate %</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={value.gstRate}
                onChange={(e) =>
                  update("gstRate", Number(e.target.value))
                }
                className={input}
                disabled={disabled || !value.applicable}
              />
            </div>

            <div>
              <label className={label}>Place of Supply</label>
              <input
                value={value.placeOfSupply ?? ""}
                onChange={(e) =>
                  update("placeOfSupply", e.target.value)
                }
                className={input}
                disabled={disabled || !value.applicable}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}