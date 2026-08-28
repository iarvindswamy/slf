"use client";

export type ShipmentDetailsData = {
  originId?: string;
  destinationId?: string;
  serviceId?: string;
  shipmentDate: string;
  shipmentType: "DOCUMENT" | "PARCEL" | "CARGO" | "OTHER";
  description: string;
  referenceNumber?: string;
  specialInstructions?: string;
  // Xpression / routing extras
  preCarriageBy?: string;
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  content?: string;
};

type ShipmentDetailsProps = {
  value: ShipmentDetailsData;
  onChange: (value: ShipmentDetailsData) => void;
  origins?: Array<{ id: string; name: string }>;
  destinations?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  disabled?: boolean;
};

export default function ShipmentDetails({
  value,
  onChange,
  origins = [],
  destinations = [],
  services = [],
  disabled = false,
}: ShipmentDetailsProps) {
  const update = <K extends keyof ShipmentDetailsData>(
    field: K,
    fieldValue: ShipmentDetailsData[K],
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
      <div className="border-b bg-slate-50 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Shipment / Routing Details
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Define the shipment route, service and purpose.
        </p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Origin */}
        <div>
          <label className={label}>Origin *</label>
          <select
            value={value.originId ?? ""}
            onChange={(e) => update("originId", e.target.value)}
            className={input}
            disabled={disabled}
            required
          >
            <option value="">Select origin</option>
            {origins.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className={label}>Destination *</label>
          <select
            value={value.destinationId ?? ""}
            onChange={(e) => update("destinationId", e.target.value)}
            className={input}
            disabled={disabled}
            required
          >
            <option value="">Select destination</option>
            {destinations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className={label}>Service *</label>
          <select
            value={value.serviceId ?? ""}
            onChange={(e) => update("serviceId", e.target.value)}
            className={input}
            disabled={disabled}
            required
          >
            <option value="">Select service</option>
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className={label}>Shipment Date *</label>
          <input
            type="date"
            value={value.shipmentDate}
            onChange={(e) => update("shipmentDate", e.target.value)}
            className={input}
            disabled={disabled}
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className={label}>Shipment Type *</label>
          <select
            value={value.shipmentType}
            onChange={(e) =>
              update(
                "shipmentType",
                e.target.value as ShipmentDetailsData["shipmentType"],
              )
            }
            className={input}
            disabled={disabled}
          >
            <option value="DOCUMENT">Document</option>
            <option value="PARCEL">Parcel</option>
            <option value="CARGO">Cargo</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Reference */}
        <div>
          <label className={label}>Reference Number</label>
          <input
            value={value.referenceNumber ?? ""}
            onChange={(e) => update("referenceNumber", e.target.value)}
            className={input}
            placeholder="Customer reference"
            disabled={disabled}
          />
        </div>

        {/* Pre-Carriage */}
        <div>
          <label className={label}>Pre-Carriage By</label>
          <input
            value={value.preCarriageBy ?? ""}
            onChange={(e) => update("preCarriageBy", e.target.value)}
            placeholder="FDX / DHL / SELF"
            className={input}
            disabled={disabled}
          />
        </div>

        {/* Place of Loading */}
        <div>
          <label className={label}>Place of Loading</label>
          <input
            value={value.placeOfLoading ?? ""}
            onChange={(e) => update("placeOfLoading", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>

        {/* Port of Discharge */}
        <div>
          <label className={label}>Port of Discharge</label>
          <input
            value={value.portOfDischarge ?? ""}
            onChange={(e) => update("portOfDischarge", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>

        {/* Final Destination */}
        <div>
          <label className={label}>Final Destination</label>
          <input
            value={value.finalDestination ?? ""}
            onChange={(e) => update("finalDestination", e.target.value)}
            className={input}
            disabled={disabled}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={label}>Shipment Description / Content *</label>
          <textarea
            value={value.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className="w-full rounded border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-slate-600 disabled:bg-gray-50"
            placeholder="Describe the contents"
            disabled={disabled}
            required
          />
        </div>

        {/* Special Instructions */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={label}>Special Instructions</label>
          <textarea
            value={value.specialInstructions ?? ""}
            onChange={(e) =>
              update("specialInstructions", e.target.value)
            }
            rows={2}
            className="w-full rounded border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-slate-600 disabled:bg-gray-50"
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}