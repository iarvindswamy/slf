"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

type Variant = {
  variantId: string;
  name: string;
  weight: string;
  price: string;
  stock: string;
  enabled: boolean;
};

type ProductForm = {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  category: string;
  description: string;
  imageUrl: string;
  status: ProductStatus;
  featured: boolean;
  variants: Variant[];
};

type ApiListResponse =
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

type ApiMutationResponse =
  | {
      success: true;
      data?: unknown;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createEmptyVariant(index: number): Variant {
  return {
    variantId: `VAR-${String(index).padStart(3, "0")}`,
    name: "",
    weight: "",
    price: "",
    stock: "0",
    enabled: true,
  };
}

function createEmptyForm(productId: string): ProductForm {
  return {
    productId: productId === "new" ? "" : productId,
    name: "",
    slug: "",
    categoryId: "",
    category: "",
    description: "",
    imageUrl: "/images/default-product-placeholder.png",
    status: "ACTIVE",
    featured: false,
    variants: [
      createEmptyVariant(1),
      createEmptyVariant(2),
      createEmptyVariant(3),
    ],
  };
}

function normalizeVariant(
  raw: Record<string, unknown>,
  productId: string,
  index: number,
): Variant {
  const enabled =
    raw.enabled === undefined ? true : Boolean(raw.enabled);

  const weightValue =
    raw.weight !== undefined && raw.weight !== null
      ? String(raw.weight)
      : "";

  const weightUnit = String(raw.weightUnit || "").toUpperCase();
  const weightLabel =
    weightValue && weightUnit
      ? `${weightValue}${weightUnit === "GRAM" ? "g" : weightUnit === "KG" ? "kg" : ""}`
      : String(raw.name || raw.label || weightValue || "");

  return {
    variantId: String(
      raw.variantId || raw.id || `${productId}-v${index + 1}`,
    ),
    name: String(raw.name || raw.label || weightLabel || ""),
    weight: weightLabel,
    price:
      raw.price === undefined || raw.price === null
        ? ""
        : String(raw.price),
    stock:
      raw.stock === undefined || raw.stock === null
        ? "0"
        : String(raw.stock),
    enabled,
  };
}

function normalizeProduct(
  raw: Record<string, unknown>,
): ProductForm | null {
  const productId = String(raw.productId || raw.id || "").trim();
  const name = String(raw.name || "").trim();

  if (!productId || !name) {
    return null;
  }

  const variantsRaw = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
    : [];

  const variants =
    variantsRaw.length > 0
      ? variantsRaw.map((variant, index) =>
          normalizeVariant(variant, productId, index),
        )
      : [createEmptyVariant(1)];

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();
  const status: ProductStatus =
    statusRaw === "INACTIVE"
      ? "INACTIVE"
      : statusRaw === "DRAFT"
        ? "DRAFT"
        : "ACTIVE";

  return {
    productId,
    name,
    slug: String(raw.slug || slugify(name) || productId),
    categoryId: String(raw.categoryId || ""),
    category: String(raw.categoryName || raw.category || ""),
    description: String(raw.description || ""),
    imageUrl: String(
      raw.imageUrl ||
        raw.image ||
        "/images/default-product-placeholder.png",
    ),
    status,
    featured: Boolean(raw.featured),
    variants,
  };
}

function parseWeight(input: string): {
  weight: number;
  weightUnit: "GRAM" | "KG";
  label: string;
} {
  const cleaned = input.trim().toLowerCase();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(kg|g|gram|grams)?$/);

  if (!match) {
    return {
      weight: 0,
      weightUnit: "GRAM",
      label: input.trim() || "Variant",
    };
  }

  const value = Number(match[1]);
  const unit = match[2] || "g";

  if (unit === "kg") {
    return {
      weight: value,
      weightUnit: "KG",
      label: `${value} kg`,
    };
  }

  return {
    weight: value,
    weightUnit: "GRAM",
    label: `${value} g`,
  };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const routeId = String(params.id || "").trim();
  const isNew = routeId === "new";

  const [form, setForm] = useState<ProductForm>(() =>
    createEmptyForm(routeId || "new"),
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const res = await fetch("/api/food/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiListResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load product.",
          );
        }

        const list = Array.isArray(json.data) ? json.data : [];

        const categoryNames = Array.from(
          new Set(
            list
              .map((item) =>
                String(
                  item.categoryName || item.category || "",
                ).trim(),
              )
              .filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        if (!cancelled) {
          setCategories(categoryNames);
        }

        if (isNew) {
          if (!cancelled) {
            setForm(createEmptyForm("new"));
          }
          return;
        }

        const match =
          list.find(
            (item) =>
              String(item.productId || "") === routeId ||
              String(item.id || "") === routeId,
          ) || null;

        if (!match) {
          throw new Error("Product not found.");
        }

        const normalized = normalizeProduct(match);

        if (!normalized) {
          throw new Error("Product data is invalid.");
        }

        if (!cancelled) {
          setForm(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load product.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isNew, routeId]);

  const categoryOptions = useMemo(() => {
    const set = new Set(categories);

    if (form.category.trim()) {
      set.add(form.category.trim());
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categories, form.category]);

  function updateField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "name" && isNew) {
        const name = String(value || "");
        next.slug = slugify(name);
      }

      return next;
    });

    setSuccess(null);
  }

  function updateVariant(
    index: number,
    key: keyof Variant,
    value: string | boolean,
  ) {
    setForm((current) => {
      const variants = current.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant,
      );

      return {
        ...current,
        variants,
      };
    });

    setSuccess(null);
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        createEmptyVariant(current.variants.length + 1),
      ],
    }));
    setSuccess(null);
  }

  function removeVariant(index: number) {
    setForm((current) => {
      if (current.variants.length <= 1) {
        return current;
      }

      return {
        ...current,
        variants: current.variants.filter((_, i) => i !== index),
      };
    });
    setSuccess(null);
  }

  async function saveProduct() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!form.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (!form.slug.trim()) {
        throw new Error("Product slug is required.");
      }

      const preparedVariants = form.variants
        .map((variant, index) => {
          const price = Number(variant.price);
          const stock = Number(variant.stock || 0);
          const parsed = parseWeight(variant.weight || variant.name);

          if (!Number.isFinite(price) || price < 0) {
            return null;
          }

          return {
            variantId:
              variant.variantId ||
              `VAR-${String(index + 1).padStart(3, "0")}`,
            name:
              variant.name.trim() ||
              parsed.label ||
              `Option ${index + 1}`,
            label:
              variant.name.trim() ||
              parsed.label ||
              `Option ${index + 1}`,
            weight: parsed.weight,
            weightUnit: parsed.weightUnit,
            price,
            stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
            enabled: variant.enabled,
          };
        })
        .filter(Boolean);

      if (preparedVariants.length === 0) {
        throw new Error(
          "At least one valid variant with price is required.",
        );
      }

      const payload = {
        productId: form.productId || undefined,
        name: form.name.trim(),
        slug: form.slug.trim(),
        categoryId: form.categoryId || undefined,
        category: form.category.trim() || "General",
        categoryName: form.category.trim() || "General",
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        status: form.status,
        featured: form.featured,
        variants: preparedVariants,
      };

      const res = await fetch("/api/food/products", {
        method: isNew ? "POST" : "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiMutationResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to save product.",
        );
      }

      const savedId =
        typeof json.data === "object" &&
        json.data &&
        "productId" in (json.data as Record<string, unknown>)
          ? String(
              (json.data as Record<string, unknown>).productId ||
                form.productId,
            )
          : form.productId;

      setSuccess("Product saved successfully.");

      if (isNew && savedId) {
        router.replace(`/admin/food/products/${savedId}`);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading product...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching product details from Firestore.
          </p>
        </div>
      </div>
    );
  }

  if (error && !isNew && !form.name) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load product
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Link
            href="/admin/food/products"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food / Products
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            {isNew ? "Add Product" : "Product Editor"}
          </h2>

          <p className="mt-1 font-mono text-xs text-slate-400">
            productId: {form.productId || (isNew ? "(new)" : routeId)}
          </p>
        </div>

        <Link
          href="/admin/food/products"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          ← Back to list
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-[#3b2516]">
              Product Information
            </h3>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Product Name
              </label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Premium Cashews"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="premium-cashews"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Category
              </label>
              <input
                list="food-category-options"
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                placeholder="Dry Fruits"
              />
              <datalist id="food-category-options">
                {categoryOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value as ProductStatus,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Image URL
              </label>
              <input
                value={form.imageUrl}
                onChange={(e) =>
                  updateField("imageUrl", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="/images/default-product-placeholder.png"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Product description"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  updateField("featured", e.target.checked)
                }
                className="h-4 w-4 accent-orange-600"
              />
              Featured product
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-bold text-[#3b2516]">
                Weight / Price Variants
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Variant identifier: variantId
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white"
            >
              + Add Variant
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">variantId</th>
                  <th className="px-5 py-3">Weight</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Enabled</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {form.variants.map((variant, index) => (
                  <tr key={`${variant.variantId}-${index}`}>
                    <td className="px-5 py-4 font-mono text-xs text-orange-600">
                      {variant.variantId}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        value={variant.weight}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "weight",
                            e.target.value,
                          )
                        }
                        placeholder="500g"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            e.target.value,
                          )
                        }
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="0"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock",
                            e.target.value,
                          )
                        }
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="0"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={variant.enabled}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "enabled",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-orange-600"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={form.variants.length <= 1}
                        className="text-xs font-bold text-red-600 disabled:text-slate-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/food/products"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={saveProduct}
            disabled={saving}
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}