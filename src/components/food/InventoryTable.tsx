"use client";

import {
  AlertTriangle,
  PackageCheck,
} from "lucide-react";

export type InventoryRow = {
  inventoryId: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku?: string;
  quantity: number;
  lowStockThreshold: number;
  updatedAt?: string;
};

type InventoryTableProps = {
  items: InventoryRow[];
  loading?: boolean;
  onQuantityChange?: (
    item: InventoryRow,
    quantity: number,
  ) => void;
};

export default function InventoryTable({
  items,
  loading = false,
  onQuantityChange,
}: InventoryTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="space-y-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length ===
    0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-10 text-center">
        <PackageCheck className="mx-auto h-8 w-8 text-gray-300" />

        <p className="mt-3 text-sm text-gray-500">
          No inventory records found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">
          Inventory
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Manage available stock for product variants.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Variant
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                SKU
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Stock
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Threshold
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map(
              (item) => {
                const low =
                  item.quantity <=
                  item.lowStockThreshold;

                return (
                  <tr
                    key={
                      item.inventoryId
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {
                          item.productName
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {
                          item.productId
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {
                        item.variantName
                      }
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      {item.sku ??
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        value={
                          item.quantity
                        }
                        onChange={(e) =>
                          onQuantityChange?.(
                            item,
                            Math.max(
                              0,
                              Number(
                                e.target
                                  .value,
                              ),
                            ),
                          )
                        }
                        className="h-9 w-24 rounded-lg border px-2 text-sm outline-none focus:border-slate-500"
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {
                        item.lowStockThreshold
                      }
                    </td>

                    <td className="px-5 py-4">
                      {low ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <PackageCheck className="h-3.5 w-3.5" />
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-400">
                      {item.updatedAt ??
                        "—"}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}