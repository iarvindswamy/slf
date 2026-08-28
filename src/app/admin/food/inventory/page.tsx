"use client";

import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  inventoryId: string;
  productId: string;
  product: string;
  variantId: string;
  variant: string;
  stock: number;
  threshold: number;
};

type ApiResponse =
  | {
      success: true;
      data: Record<string, unknown>[];
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildInventoryFromProducts(
  products: Record<string, unknown>[],
): InventoryItem[] {
  const rows: InventoryItem[] = [];

  products.forEach((product) => {
    const productId = String(product.productId || product.id || "").trim();
    const productName = String(product.name || "Product").trim();

    if (!productId) {
      return;
    }

    const variants = Array.isArray(product.variants)
      ? (product.variants as Record<string, unknown>[])
      : [];

    variants.forEach((variant, index) => {
      const variantId = String(
        variant.variantId ||
          variant.id ||
          `${productId}-v${index + 1}`,
      ).trim();

      if (!variantId) {
        return;
      }

      const variantLabel = String(
        variant.name ||
          variant.label ||
          (variant.weight !== undefined
            ? `${variant.weight}${
                String(variant.weightUnit || "").toUpperCase() === "KG"
                  ? "kg"
                  : "g"
              }`
            : `Option ${index + 1}`),
      );

      const stock = toNumber(
        variant.stock ??
          variant.quantity ??
          variant.availableQuantity,
        0,
      );

      const threshold = toNumber(
        variant.lowStockThreshold ??
          variant.threshold ??
          10,
        10,
      );

      const inventoryId = String(
        variant.inventoryId ||
          `INV-${productId}-${variantId}`,
      );

      rows.push({
        inventoryId,
        productId,
        product: productName,
        variantId,
        variant: variantLabel,
        stock: Math.max(0, Math.floor(stock)),
        threshold: Math.max(0, Math.floor(threshold)),
      });
    });
  });

  return rows.sort((a, b) => {
    if (a.product === b.product) {
      return a.variant.localeCompare(b.variant);
    }
    return a.product.localeCompare(b.product);
  });
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      try {
        setLoading(true);
        setError(null);
        setMessage(null);

        const res = await fetch("/api/food/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load inventory.",
          );
        }

        const list = Array.isArray(json.data) ? json.data : [];
        const inventory = buildInventoryFromProducts(list);

        if (!cancelled) {
          setItems(inventory);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load inventory.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const low = items.filter(
      (item) => item.stock > 0 && item.stock <= item.threshold,
    ).length;
    const empty = items.filter((item) => item.stock === 0).length;

    return {
      total,
      low,
      empty,
    };
  }, [items]);

  function startAdjust(item: InventoryItem) {
    setAdjustingId(item.inventoryId);
    setAdjustValue(String(item.stock));
    setMessage(null);
  }

  function cancelAdjust() {
    setAdjustingId(null);
    setAdjustValue("");
  }

  function applyAdjust(inventoryId: string) {
    const nextStock = Math.max(0, Math.floor(Number(adjustValue)));

    if (!Number.isFinite(nextStock)) {
      setMessage("Enter a valid stock quantity.");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.inventoryId === inventoryId
          ? {
              ...item,
              stock: nextStock,
            }
          : item,
      ),
    );

    setMessage(
      `Stock updated locally for ${inventoryId}. Connect inventory API to persist.`,
    );
    setAdjustingId(null);
    setAdjustValue("");
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Food
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
          Inventory
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Monitor stock levels and inventory alerts.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card
          label="Inventory Items"
          value={String(stats.total)}
        />
        <Card
          label="Low Stock"
          value={String(stats.low)}
        />
        <Card
          label="Out of Stock"
          value={String(stats.empty)}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product, variant or inventoryId..."
          disabled={loading}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />

        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading inventory...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Building stock rows from product variants.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load inventory
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">inventoryId</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">variantId</th>
                  <th className="px-5 py-3">Weight</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {items.length === 0
                        ? "No inventory rows found. Add product variants first."
                        : "No inventory rows match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const low =
                      item.stock > 0 &&
                      item.stock <= item.threshold;
                    const empty = item.stock === 0;
                    const isAdjusting =
                      adjustingId === item.inventoryId;

                    return (
                      <tr key={item.inventoryId}>
                        <td className="px-5 py-4 font-mono text-xs text-orange-600">
                          {item.inventoryId}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold">
                            {item.product}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            {item.productId}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          {item.variantId}
                        </td>

                        <td className="px-5 py-4">
                          {item.variant}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {isAdjusting ? (
                            <input
                              value={adjustValue}
                              onChange={(e) =>
                                setAdjustValue(e.target.value)
                              }
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          ) : (
                            item.stock
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              empty
                                ? "bg-red-100 text-red-700"
                                : low
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {empty
                              ? "OUT OF STOCK"
                              : low
                                ? "LOW STOCK"
                                : "HEALTHY"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {isAdjusting ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  applyAdjust(item.inventoryId)
                                }
                                className="text-xs font-bold text-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelAdjust}
                                className="text-xs font-bold text-slate-500"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startAdjust(item)}
                              className="text-xs font-bold text-orange-600"
                            >
                              Adjust →
                            </button>
                          )}
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
    </div>
  );
}

function Card({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#3b2516]">
        {value}
      </p>
    </div>
  );
}