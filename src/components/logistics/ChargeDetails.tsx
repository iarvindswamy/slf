"use client";

import { Plus, Trash2, Fuel } from "lucide-react";

export type ChargeLine = {
  id: string;
  description: string;
  rate?: number;
  amount: number;
  fuelApply?: boolean;
  fuelAmt?: number;
  taxApply?: boolean;
  taxOnFuel?: number;
  igst?: number;
  sgst?: number;
  cgst?: number;
  total?: number;
};

/** Optional Super-Admin fuel vendor rows (DHL, FedEx, etc.) */
export type FuelVendorRow = {
  id: string;
  name: string;
  amount: number;
};

export type ChargeDetailsData = {
  freight: number;
  fuelSurcharge: number;
  contractCharges: number;
  otherCharges: number;
  additionalCharges: ChargeLine[];
  discount: number;
  surcharge: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** Super Admin managed vendor fuel rows (optional) */
  fuelVendors?: FuelVendorRow[];
};

type ChargeDetailsProps = {
  value: ChargeDetailsData;
  onChange: (value: ChargeDetailsData) => void;
  disabled?: boolean;
  /** Super Admin only — edit fuel surcharge & vendor rows */
  canManageFuel?: boolean;
};

export default function ChargeDetails({
  value,
  onChange,
  disabled = false,
  canManageFuel = false,
}: ChargeDetailsProps) {
  const fuelLocked = disabled || !canManageFuel;

  const update = <K extends keyof ChargeDetailsData>(
    field: K,
    fieldValue: ChargeDetailsData[K],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const addCharge = () => {
    update("additionalCharges", [
      ...value.additionalCharges,
      {
        id: crypto.randomUUID(),
        description: "",
        rate: 0,
        amount: 0,
        fuelApply: false,
        fuelAmt: 0,
        taxApply: false,
        taxOnFuel: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
        total: 0,
      },
    ]);
  };

  const updateCharge = (
    id: string,
    field: keyof ChargeLine,
    fieldValue: string | number | boolean,
  ) => {
    update(
      "additionalCharges",
      value.additionalCharges.map((charge) => {
        if (charge.id !== id) return charge;

        const next: ChargeLine = {
          ...charge,
          [field]: fieldValue,
        };

        const amount = Number(next.amount || 0);
        const fuel = next.fuelApply ? Number(next.fuelAmt || 0) : 0;
        const taxOnFuel = next.taxApply ? Number(next.taxOnFuel || 0) : 0;
        const igst = Number(next.igst || 0);
        const sgst = Number(next.sgst || 0);
        const cgst = Number(next.cgst || 0);

        next.total = Number(
          (amount + fuel + taxOnFuel + igst + sgst + cgst).toFixed(2),
        );

        return next;
      }),
    );
  };

  const removeCharge = (id: string) => {
    update(
      "additionalCharges",
      value.additionalCharges.filter((c) => c.id !== id),
    );
  };

  /* ---------- Super Admin fuel vendor rows ---------- */
  const fuelVendors = value.fuelVendors ?? [];

  const addFuelVendor = () => {
    if (!canManageFuel) return;
    const next = [
      ...fuelVendors,
      {
        id: crypto.randomUUID(),
        name: "",
        amount: 0,
      },
    ];
    const fuelTotal = next.reduce((s, r) => s + Number(r.amount || 0), 0);
    onChange({
      ...value,
      fuelVendors: next,
      fuelSurcharge: Number(fuelTotal.toFixed(2)),
    });
  };

  const updateFuelVendor = (
    id: string,
    field: "name" | "amount",
    fieldValue: string | number,
  ) => {
    if (!canManageFuel) return;
    const next = fuelVendors.map((row) =>
      row.id === id ? { ...row, [field]: fieldValue } : row,
    );
    const fuelTotal = next.reduce((s, r) => s + Number(r.amount || 0), 0);
    onChange({
      ...value,
      fuelVendors: next,
      fuelSurcharge: Number(fuelTotal.toFixed(2)),
    });
  };

  const removeFuelVendor = (id: string) => {
    if (!canManageFuel) return;
    const next = fuelVendors.filter((r) => r.id !== id);
    const fuelTotal = next.reduce((s, r) => s + Number(r.amount || 0), 0);
    onChange({
      ...value,
      fuelVendors: next,
      fuelSurcharge: Number(fuelTotal.toFixed(2)),
    });
  };

  // Totals
  const additionalTotal = value.additionalCharges.reduce(
    (sum, c) => sum + Number(c.total ?? c.amount ?? 0),
    0,
  );

  const taxTotal =
    Number(value.cgst || 0) +
    Number(value.sgst || 0) +
    Number(value.igst || 0);

  const grandTotal =
    Number(value.freight || 0) +
    Number(value.fuelSurcharge || 0) +
    Number(value.contractCharges || 0) +
    Number(value.otherCharges || 0) +
    Number(value.surcharge || 0) +
    additionalTotal +
    taxTotal -
    Number(value.discount || 0);

  const input =
    "h-9 w-full rounded border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-slate-600 disabled:bg-gray-50 disabled:text-gray-500";
  const label = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-slate-50 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Charge Details
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Freight, fuel surcharge, contract/other charges and tax split.
            </p>
          </div>
          {canManageFuel ? (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Fuel className="h-3 w-3" />
              Fuel editable
            </span>
          ) : (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Fuel view only
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Super Admin: dynamic fuel vendor rows */}
        {canManageFuel && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-900">
                Fuel Surcharge Vendors
              </h3>
              <button
                type="button"
                onClick={addFuelVendor}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Fuel Surcharge
              </button>
            </div>

            {fuelVendors.length === 0 ? (
              <p className="text-xs text-amber-800/80">
                No vendor rows yet. Click &quot;Add Fuel Surcharge&quot; to add
                DHL / FedEx / etc. Totals auto-fill Fuel Surcharge below.
              </p>
            ) : (
              <div className="space-y-2">
                {fuelVendors.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      value={row.name}
                      onChange={(e) =>
                        updateFuelVendor(row.id, "name", e.target.value)
                      }
                      placeholder="Vendor (e.g. DHL, FedEx)"
                      className={`${input} max-w-[220px]`}
                      disabled={disabled}
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.amount}
                      onChange={(e) =>
                        updateFuelVendor(
                          row.id,
                          "amount",
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Amount"
                      className={`${input} w-32`}
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      onClick={() => removeFuelVendor(row.id)}
                      disabled={disabled}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top summary row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <div>
            <label className={label}>Contract Charges</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.contractCharges}
              onChange={(e) =>
                update("contractCharges", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>Other Charges</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.otherCharges}
              onChange={(e) =>
                update("otherCharges", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>Freight</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.freight}
              onChange={(e) =>
                update("freight", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>
              Fuel Surcharge
              {fuelLocked && (
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  (locked)
                </span>
              )}
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.fuelSurcharge}
              onChange={(e) =>
                update("fuelSurcharge", Number(e.target.value) || 0)
              }
              className={input}
              disabled={fuelLocked}
              title={
                fuelLocked
                  ? "Only Super Admin can edit fuel surcharge"
                  : undefined
              }
            />
          </div>

          <div>
            <label className={label}>Surcharge</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.surcharge}
              onChange={(e) =>
                update("surcharge", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>IGST</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.igst}
              onChange={(e) =>
                update("igst", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>CGST</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.cgst}
              onChange={(e) =>
                update("cgst", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>

          <div>
            <label className={label}>SGST</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value.sgst}
              onChange={(e) =>
                update("sgst", Number(e.target.value) || 0)
              }
              className={input}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Discount */}
        <div className="max-w-xs">
          <label className={label}>Discount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={value.discount}
            onChange={(e) =>
              update("discount", Number(e.target.value) || 0)
            }
            className={input}
            disabled={disabled}
          />
        </div>

        {/* Additional charge lines */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Additional Charge Lines
            </h3>
            <button
              type="button"
              onClick={addCharge}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Line
            </button>
          </div>

          {value.additionalCharges.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-gray-500">
              No additional charge lines.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Fuel Apply</th>
                    <th className="px-3 py-2">Fuel Amt</th>
                    <th className="px-3 py-2">Tax Apply</th>
                    <th className="px-3 py-2">Tax on Fuel</th>
                    <th className="px-3 py-2">IGST</th>
                    <th className="px-3 py-2">SGST</th>
                    <th className="px-3 py-2">CGST</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {value.additionalCharges.map((charge) => (
                    <tr
                      key={charge.id}
                      className="border-b border-gray-100 odd:bg-gray-50/50"
                    >
                      <td className="px-2 py-1.5">
                        <input
                          value={charge.description}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Description"
                          className={input}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.amount}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "amount",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-24`}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!charge.fuelApply}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "fuelApply",
                              e.target.checked,
                            )
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.fuelAmt ?? 0}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "fuelAmt",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-20`}
                          disabled={disabled || !charge.fuelApply}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!charge.taxApply}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "taxApply",
                              e.target.checked,
                            )
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.taxOnFuel ?? 0}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "taxOnFuel",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-20`}
                          disabled={disabled || !charge.taxApply}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.igst ?? 0}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "igst",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-20`}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.sgst ?? 0}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "sgst",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-20`}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={charge.cgst ?? 0}
                          onChange={(e) =>
                            updateCharge(
                              charge.id,
                              "cgst",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`${input} w-20`}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={charge.total ?? 0}
                          readOnly
                          className={`${input} w-24 bg-gray-50 font-medium`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeCharge(charge.id)}
                          disabled={disabled}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grand total */}
        <div className="rounded-xl bg-slate-900 px-5 py-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">
              Freight + Fuel + Contract + Other + Surcharge + Lines + Tax −
              Discount
            </div>
            <div className="text-2xl font-bold">
              ₹{grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}