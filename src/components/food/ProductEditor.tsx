"use client";

import {
  useState,
} from "react";

import {
  ImagePlus,
  Loader2,
  Save,
} from "lucide-react";

import VariantBuilder, {
  ProductVariantData,
} from "./VariantBuilder";

export type ProductEditorData = {
  productId?: string;
  name: string;
  slug: string;
  description: string;
  categoryId?: string;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  variants: ProductVariantData[];
};

type ProductEditorProps = {
  initialValue?: Partial<ProductEditorData>;
  categories?: Array<{
    categoryId: string;
    name: string;
  }>;
  onSubmit?: (
    value: ProductEditorData,
  ) => Promise<void>;
  loading?: boolean;
};

const defaults: ProductEditorData = {
  name: "",
  slug: "",
  description: "",
  active: true,
  featured: false,
  variants: [],
};

export default function ProductEditor({
  initialValue,
  categories = [],
  onSubmit,
  loading = false,
}: ProductEditorProps) {
  const [form, setForm] =
    useState<ProductEditorData>({
      ...defaults,
      ...initialValue,
      variants:
        initialValue?.variants ??
        [],
    });

  const [
    error,
    setError,
  ] = useState("");

  const update = (
    field: keyof ProductEditorData,
    value: string | boolean,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  const generateSlug = (
    value: string,
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );
  };

  const handleNameChange = (
    value: string,
  ) => {
    setForm(
      (current) => ({
        ...current,
        name: value,
        slug:
          current.slug ||
          generateSlug(
            value,
          ),
      }),
    );
  };

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Product name is required.",
      );
      return;
    }

    if (!form.slug.trim()) {
      setError(
        "Product slug is required.",
      );
      return;
    }

    if (
      form.variants.length ===
      0
    ) {
      setError(
        "Add at least one product variant.",
      );
      return;
    }

    try {
      await onSubmit?.(
        form,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product.",
      );
    }
  };

  const input =
    "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      <section className="rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Product Information
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Create or update the product catalog information.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              Product Name *
            </label>

            <input
              value={
                form.name
              }
              onChange={(e) =>
                handleNameChange(
                  e.target.value,
                )
              }
              className={input}
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Slug *
            </label>

            <input
              value={
                form.slug
              }
              onChange={(e) =>
                update(
                  "slug",
                  generateSlug(
                    e.target.value,
                  ),
                )
              }
              className={
                input +
                " font-mono"
              }
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Category
            </label>

            <select
              value={
                form.categoryId ??
                ""
              }
              onChange={(e) =>
                update(
                  "categoryId",
                  e.target.value,
                )
              }
              className={
                input
              }
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.categoryId
                    }
                    value={
                      category.categoryId
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={
                form.description
              }
              onChange={(e) =>
                update(
                  "description",
                  e.target.value,
                )
              }
              rows={5}
              className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder="Product description"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Image URL
            </label>

            <div className="relative">
              <ImagePlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={
                  form.imageUrl ??
                  ""
                }
                onChange={(e) =>
                  update(
                    "imageUrl",
                    e.target.value,
                  )
                }
                className={
                  input +
                  " pl-10"
                }
                placeholder="/images/product.jpg"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  form.active
                }
                onChange={(e) =>
                  update(
                    "active",
                    e.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              Product Active
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(e) =>
                  update(
                    "featured",
                    e.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              Featured Product
            </label>
          </div>
        </div>
      </section>

      <VariantBuilder
        variants={
          form.variants
        }
        onChange={(
          variants,
        ) =>
          setForm(
            (current) => ({
              ...current,
              variants,
            }),
          )
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {loading
            ? "Saving..."
            : "Save Product"}
        </button>
      </div>
    </form>
  );
}