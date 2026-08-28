"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type CategoryStatus = "ACTIVE" | "INACTIVE";

type Category = {
  categoryId: string;
  name: string;
  slug: string;
  products: number;
  status: CategoryStatus;
  description?: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
};

type ApiProductsResponse =
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

type ApiCategoriesResponse =
  | {
      success: true;
      data:
        | Record<string, unknown>[]
        | {
            categories?: Record<string, unknown>[];
            data?: Record<string, unknown>[];
          };
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

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategory(
  raw: Record<string, unknown>,
  productCount = 0,
): Category | null {
  const name = String(raw.name || raw.categoryName || "").trim();

  if (!name) {
    return null;
  }

  const categoryId = String(
    raw.categoryId || raw.id || `CAT-${slugify(name)}`,
  ).trim();

  const slug = String(raw.slug || slugify(name)).trim();

  const enabled =
    raw.enabled === undefined
      ? String(raw.status || "ACTIVE").toUpperCase() !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    categoryId,
    name,
    slug,
    products:
      typeof raw.products === "number"
        ? raw.products
        : productCount,
    status: enabled ? "ACTIVE" : "INACTIVE",
    description: raw.description
      ? String(raw.description)
      : undefined,
  };
}

function buildCategoriesFromProducts(
  products: Record<string, unknown>[],
): Category[] {
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      categoryId: string;
      count: number;
    }
  >();

  products.forEach((product) => {
    const name = String(
      product.categoryName || product.category || "General",
    ).trim();

    if (!name) {
      return;
    }

    const slug = slugify(name);
    const existing = map.get(slug);

    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(slug, {
      name,
      slug,
      categoryId: String(
        product.categoryId || `CAT-${slug}`,
      ),
      count: 1,
    });
  });

  return Array.from(map.values())
    .map((item) => ({
      categoryId: item.categoryId,
      name: item.name,
      slug: item.slug,
      products: item.count,
      status: "ACTIVE" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        // Primary source today: aggregate from products (API exists)
        const productsRes = await fetch("/api/food/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const productsJson =
          (await productsRes.json()) as ApiProductsResponse;

        if (!productsRes.ok || !productsJson.success) {
          throw new Error(
            !productsJson.success
              ? productsJson.error.message
              : "Failed to load categories from products.",
          );
        }

        const products = Array.isArray(productsJson.data)
          ? productsJson.data
          : [];

        const fromProducts = buildCategoriesFromProducts(products);

        // Optional: merge official categories collection if API exists
        let fromApi: Category[] = [];

        try {
          const categoriesRes = await fetch("/api/food/categories", {
            method: "GET",
            headers,
            cache: "no-store",
          });

          if (categoriesRes.ok) {
            const categoriesJson =
              (await categoriesRes.json()) as ApiCategoriesResponse;

            if (categoriesJson.success) {
              const payload = categoriesJson.data;
              const list = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.categories)
                  ? payload.categories
                  : Array.isArray(payload.data)
                    ? payload.data
                    : [];

              fromApi = list
                .map((item) => normalizeCategory(item))
                .filter(Boolean) as Category[];
            }
          }
        } catch {
          // Categories API is optional for now
        }

        const merged = new Map<string, Category>();

        fromProducts.forEach((item) => {
          merged.set(item.slug, item);
        });

        fromApi.forEach((item) => {
          const existing = merged.get(item.slug);
          merged.set(item.slug, {
            ...item,
            products: existing?.products ?? item.products,
          });
        });

        const finalList = Array.from(merged.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        if (!cancelled) {
          setCategories(finalList);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load categories.",
          );
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const activeCount = useMemo(
    () =>
      categories.filter((category) => category.status === "ACTIVE")
        .length,
    [categories],
  );

  function updateForm<K extends keyof CategoryForm>(
    key: K,
    value: CategoryForm[K],
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "name") {
        next.slug = slugify(String(value || ""));
      }

      return next;
    });
  }

  async function createCategory() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const name = form.name.trim();
      const slug = form.slug.trim() || slugify(name);

      if (!name) {
        throw new Error("Category name is required.");
      }

      if (!slug) {
        throw new Error("Category slug is required.");
      }

      if (categories.some((item) => item.slug === slug)) {
        throw new Error("A category with this slug already exists.");
      }

      // Prefer API when available
      if (user) {
        const token = await user.getIdToken();

        const res = await fetch("/api/food/categories", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            slug,
            description: form.description.trim() || undefined,
            enabled: true,
          }),
        });

        if (res.ok) {
          const json = (await res.json()) as ApiMutationResponse;

          if (json.success) {
            setMessage("Category created successfully.");
            setForm(EMPTY_FORM);
            setShowForm(false);
            setReloadKey((value) => value + 1);
            return;
          }
        }
      }

      // Fallback: local row until categories API exists
      const localCategory: Category = {
        categoryId: `CAT-${slug}`,
        name,
        slug,
        products: 0,
        status: "ACTIVE",
        description: form.description.trim() || undefined,
      };

      setCategories((current) =>
        [...current, localCategory].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setMessage(
        "Category added locally. Connect /api/food/categories to persist.",
      );
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to create category.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: Category) {
    const nextStatus: CategoryStatus =
      category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setError(null);
      setMessage(null);

      if (user) {
        const token = await user.getIdToken();

        const res = await fetch("/api/food/categories", {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categoryId: category.categoryId,
            enabled: nextStatus === "ACTIVE",
          }),
        });

        if (res.ok) {
          const json = (await res.json()) as ApiMutationResponse;

          if (json.success) {
            setCategories((current) =>
              current.map((item) =>
                item.categoryId === category.categoryId
                  ? {
                      ...item,
                      status: nextStatus,
                    }
                  : item,
              ),
            );

            setMessage(
              `${category.name} marked as ${nextStatus}.`,
            );
            return;
          }
        }
      }

      // Local fallback
      setCategories((current) =>
        current.map((item) =>
          item.categoryId === category.categoryId
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      setMessage(
        `${category.name} marked as ${nextStatus} (local only).`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update category.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            Categories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage food product categories.
            {categories.length > 0
              ? ` ${activeCount} active of ${categories.length}.`
              : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            {showForm ? "Close Form" : "+ Add Category"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-[#3b2516]">
            New Category
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Category Name
              </label>
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Dry Fruits"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                placeholder="dry-fruits"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  updateForm("description", e.target.value)
                }
                placeholder="Optional description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={createCategory}
            disabled={saving}
            className="mt-4 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Category"}
          </button>
        </section>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading categories...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Building categories from product data.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">categoryId</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      No categories found. Add products or create a
                      category.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.categoryId}>
                      <td className="px-5 py-4 font-mono text-xs text-orange-600">
                        {category.categoryId}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {category.name}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4">
                        {category.products}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            category.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="text-xs font-bold text-orange-600"
                        >
                          {category.status === "ACTIVE"
                            ? "Disable →"
                            : "Enable →"}
                        </button>
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