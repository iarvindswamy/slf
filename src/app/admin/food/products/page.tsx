"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductStatus = "ACTIVE" | "INACTIVE";

type Product = {
  productId: string;
  slug: string;
  name: string;
  categoryId: string;
  category: string;
  variants: number;
  status: ProductStatus;
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

function normalizeStatus(value: unknown): ProductStatus {
  return String(value || "ACTIVE").toUpperCase() === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE";
}

function normalizeProduct(
  raw: Record<string, unknown>,
): Product | null {
  const productId = String(raw.productId || raw.id || "").trim();
  const name = String(raw.name || "").trim();

  if (!productId || !name) {
    return null;
  }

  const slug = String(raw.slug || productId).trim();
  const categoryId = String(raw.categoryId || "").trim();
  const category =
    String(raw.categoryName || raw.category || "General").trim() ||
    "General";

  const variantsRaw = Array.isArray(raw.variants)
    ? raw.variants
    : [];

  const variantsCount =
    typeof raw.variantsCount === "number"
      ? raw.variantsCount
      : variantsRaw.length;

  return {
    productId,
    slug,
    name,
    categoryId,
    category,
    variants: variantsCount,
    status: normalizeStatus(raw.status),
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

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
              : "Failed to load products.",
          );
        }

        const list = Array.isArray(json.data) ? json.data : [];
        const normalized = list
          .map((item) => normalizeProduct(item))
          .filter(Boolean) as Product[];

        if (!cancelled) {
          setProducts(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load products.",
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category)),
    ).sort((a, b) => a.localeCompare(b));

    return ["All Categories", ...unique];
  }, [products]);

  useEffect(() => {
    if (
      category !== "All Categories" &&
      !categories.includes(category)
    ) {
      setCategory("All Categories");
    }
  }, [categories, category]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.productId,
          product.name,
          product.slug,
          product.category,
          product.categoryId,
          product.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesStatus =
        status === "All Statuses" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            Products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage food products, variants and availability.
          </p>
        </div>

        <Link
          href="/admin/food/products/new"
          className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          + Add Product
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          disabled={loading}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm sm:block"
        >
          <option value="All Statuses">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading products...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching the latest catalog from Firestore.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load products
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
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">productId</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Variants</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {products.length === 0
                        ? "No products found. Add your first product."
                        : "No products match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
                        {product.productId}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          /{product.slug}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {product.category}
                      </td>

                      <td className="px-5 py-4">
                        {product.variants}
                      </td>

                      <td className="px-5 py-4">
                        <Status value={product.status} />
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/food/products/${product.productId}`}
                          className="text-xs font-bold text-orange-600"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        value === "ACTIVE"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}