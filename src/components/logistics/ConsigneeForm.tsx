"use client";

export type ConsigneeFormData = {
  receiverId?: string;
  name: string;
  company?: string;
  contactName?: string;
  phone: string;
  mobile?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  pincode: string;
  country: string;
  // Extra
  gstin?: string;
  iecNo?: string;
  documentType?: string;
  documentNo?: string;
  destinationCode?: string;
};

type ConsigneeFormProps = {
  value: ConsigneeFormData;
  onChange: (value: ConsigneeFormData) => void;
  disabled?: boolean;
};

const DOCUMENT_TYPES = [
  "Select",
  "GSTIN (Normal)",
  "AADHAAR",
  "PAN",
  "PASSPORT",
  "IEC",
  "OTHER",
];

export default function ConsigneeForm({
  value,
  onChange,
  disabled = false,
}: ConsigneeFormProps) {
  const update = <K extends keyof ConsigneeFormData>(
    field: K,
    fieldValue: ConsigneeFormData[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const input =
    "h-9 w-full rounded border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-slate-600 disabled:bg-gray-50";
  const label = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <div className="space-y-3">
      <div>
        <label className={label}>Company Name *</label>
        <input
          value={value.company ?? ""}
          onChange={(e) => update("company", e.target.value)}
          className={input}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Contact Name</label>
          <input
            value={value.contactName ?? ""}
            onChange={(e) => update("contactName", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={label}>Name *</label>
          <input
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
            className={input}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div>
        <label className={label}>Address 1 *</label>
        <input
          value={value.addressLine1}
          onChange={(e) => update("addressLine1", e.target.value)}
          className={input}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <label className={label}>Address 2</label>
        <input
          value={value.addressLine2 ?? ""}
          onChange={(e) => update("addressLine2", e.target.value)}
          className={input}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Pincode *</label>
          <input
            value={value.pincode}
            onChange={(e) => update("pincode", e.target.value)}
            className={input}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className={label}>City *</label>
          <input
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
            className={input}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>State *</label>
          <input
            value={value.state ?? ""}
            onChange={(e) => update("state", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={label}>Telephone *</label>
          <input
            value={value.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={input}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Mobile No.</label>
          <input
            value={value.mobile ?? ""}
            onChange={(e) => update("mobile", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={label}>E-Mail</label>
          <input
            type="email"
            value={value.email ?? ""}
            onChange={(e) => update("email", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Country</label>
          <input
            value={value.country}
            onChange={(e) => update("country", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={label}>IEC No.</label>
          <input
            value={value.iecNo ?? ""}
            onChange={(e) => update("iecNo", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Document Type</label>
          <select
            value={value.documentType ?? ""}
            onChange={(e) => update("documentType", e.target.value)}
            className={input}
            disabled={disabled}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t === "Select" ? "" : t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Document No.</label>
          <input
            value={value.documentNo ?? ""}
            onChange={(e) => update("documentNo", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}