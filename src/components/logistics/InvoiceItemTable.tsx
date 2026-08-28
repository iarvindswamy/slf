"use client";

import { Plus, Trash2 } from "lucide-react";
import HsCodeSelect from "./HsCodeSelect";

export type InvoiceLineItemForm = {
  id: string;
  boxNo?: number;
  packages?: number;
  description: string;
  shopName?: string;
  shopAddress?: string;
  hsCode: string;
  quantity: number;
  weight?: number;
  unit: "PCS" | "KG" | "SET" | "BOX";
  unitRate: number;
  amount: number;
  igstPercent?: number;
  igstAmount?: number;
};

type InvoiceItemTableProps = {
  items: InvoiceLineItemForm[];
  onChange: (items: InvoiceLineItemForm[]) => void;
  disabled?: boolean;
};

export default function InvoiceItemTable({
  items,
  onChange,
  disabled = false,
}: InvoiceItemTableProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        boxNo: items.length + 1,
        packages: 1,
        description: "",
        shopName: "",
        shopAddress: "",
        hsCode: "",
        quantity: 1,
        weight: 0,
        unit: "PCS",
        unitRate: 0,
        amount: 0,
        igstPercent: 0,
        igstAmount: 0,
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceLineItemForm,
    value: string | number,
  ) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;

        const next = { ...item, [field]: value };

        // Auto-calculate amount
        if (field === "quantity" || field === "unitRate") {
          const qty =
            field === "quantity" ? Number(value) : Number(next.quantity);
          const rate =
            field === "unitRate" ? Number(value) : Number(next.unitRate);
          next.amount = Number((qty * rate).toFixed(2));
        }

        // Auto-calculate IGST amount
        if (
          field === "igstPercent" ||
          field === "quantity" ||
          field === "unitRate"
        ) {
          const percent = Number(next.igstPercent || 0);
          next.igstAmount = Number(
            ((next.amount * percent) / 100).toFixed(2),
          );
        }

        return next;
      }),
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const totals = items.reduce(
    (acc, item) => {
      acc.quantity += Number(item.quantity || 0);
      acc.weight += Number(item.weight || 0);
      acc.amount += Number(item.amount || 0);
      acc.igst += Number(item.igstAmount || 0);
      return acc;
    },
    { quantity: 0, weight: 0, amount: 0, igst: 0 },
  );

  const input =
    "h-9 w-full rounded border px-2 text-sm outline-none focus:border-slate-500 disabled:bg-gray-50";

  return (
    <section className="rounded-xl border bg-white">
      <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-gray-900">
            Performa / Invoice Items
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Add item description, shop details, HS code, quantity and rate.
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto p-5">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">No invoice items added.</p>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-sm font-semibold text-slate-900 hover:underline"
            >
              Add the first item
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-3 py-2.5">Box</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5">Shop Name</th>
                <th className="px-3 py-2.5">Shop Address</th>
                <th className="px-3 py-2.5">HS Code</th>
                <th className="px-3 py-2.5">Qty</th>
                <th className="px-3 py-2.5">Weight</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Rate</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">IGST %</th>
                <th className="px-3 py-2.5">IGST Amt</th>
                <th className="px-3 py-2.5 w-12" />
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 odd:bg-gray-50/60"
                >
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      value={item.boxNo ?? index + 1}
                      onChange={(e) =>
                        updateItem(item.id, "boxNo", Number(e.target.value))
                      }
                      className={input + " w-16"}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2 min-w-[180px]">
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className={input}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2 min-w-[140px]">
                    <input
                      value={item.shopName ?? ""}
                      onChange={(e) =>
                        updateItem(item.id, "shopName", e.target.value)
                      }
                      placeholder="Shop name"
                      className={input}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2 min-w-[180px]">
                    <input
                      value={item.shopAddress ?? ""}
                      onChange={(e) =>
                        updateItem(item.id, "shopAddress", e.target.value)
                      }
                      placeholder="Shop address"
                      className={input}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2 min-w-[130px]">
                    <HsCodeSelect
                      value={item.hsCode}
                      onChange={(code) =>
                        updateItem(item.id, "hsCode", code)
                      }
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value))
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      value={item.weight ?? ""}
                      onChange={(e) =>
                        updateItem(item.id, "weight", Number(e.target.value))
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unit",
                          e.target.value as InvoiceLineItemForm["unit"],
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    >
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="SET">SET</option>
                      <option value="BOX">BOX</option>
                    </select>
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitRate}
                      onChange={(e) =>
                        updateItem(item.id, "unitRate", Number(e.target.value))
                      }
                      className={input + " w-24"}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                      className={input + " w-24 bg-gray-50"}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.igstPercent ?? 0}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "igstPercent",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.igstAmount ?? 0}
                      readOnly
                      className={input + " w-24 bg-gray-50"}
                    />
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={disabled}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-slate-100 font-semibold">
                <td colSpan={5} className="px-3 py-2.5 text-right">
                  Totals
                </td>
                <td className="px-3 py-2.5">{totals.quantity}</td>
                <td className="px-3 py-2.5">
                  {totals.weight.toFixed(3)}
                </td>
                <td />
                <td />
                <td className="px-3 py-2.5">
                  ₹{totals.amount.toFixed(2)}
                </td>
                <td />
                <td className="px-3 py-2.5">
                  ₹{totals.igst.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </section>
  );
}