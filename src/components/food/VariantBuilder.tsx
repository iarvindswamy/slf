"use client";

import {
  Plus,
  Trash2,
} from "lucide-react";

import WeightSelector, {
  WeightOption,
} from "./WeightSelector";

export type ProductVariantData = {
  variantId: string;
  weightLabel: string;
  weightGrams: number;
  price: number;
  mrp?: number;
  sku?: string;
  stock?: number;
  active: boolean;
};

type VariantBuilderProps = {
  variants: ProductVariantData[];
  onChange: (
    variants: ProductVariantData[],
  ) => void;
  weightOptions?: WeightOption[];
  disabled?: boolean;
};

export default function VariantBuilder({
  variants,
  onChange,
  weightOptions,
  disabled = false,
}: VariantBuilderProps) {
  const addVariant = () => {
    const first =
      weightOptions?.[0] ?? {
        id: "250G",
        label: "250g",
        grams: 250,
      };

    onChange([
      ...variants,
      {
        variantId:
          crypto.randomUUID(),
        weightLabel:
          first.label,
        weightGrams:
          first.grams,
        price: 0,
        active: true,
      },
    ]);
  };

  const updateVariant = (
    id: string,
    patch: Partial<ProductVariantData>,
  ) => {
    onChange(
      variants.map(
        (variant) =>
          variant.variantId ===
          id
            ? {
                ...variant,
                ...patch,
              }
            : variant,
      ),
    );
  };

  const removeVariant = (
    id: string,
  ) => {
    onChange(
      variants.filter(
        (variant) =>
          variant.variantId !==
          id,
      ),
    );
  };

  return (
    <section className="rounded-xl border bg-white">
      <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">
            Product Variants
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Configure weight-based product variants and pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Variant
        </button>
      </div>

      <div className="space-y-4 p-5">
        {variants.length ===
        0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">
              No product variants configured.
            </p>

            <button
              type="button"
              onClick={addVariant}
              className="mt-3 text-sm font-semibold hover:underline"
            >
              Add a variant
            </button>
          </div>
        ) : (
          variants.map(
            (
              variant,
              index,
            ) => (
              <div
                key={
                  variant.variantId
                }
                className="rounded-xl border bg-gray-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Variant{" "}
                    {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      removeVariant(
                        variant.variantId,
                      )
                    }
                    disabled={
                      disabled
                    }
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <WeightSelector
                  options={
                    weightOptions
                  }
                  value={
                    weightOptions?.find(
                      (
                        option,
                      ) =>
                        option.grams ===
                        variant.weightGrams,
                    )?.id
                  }
                  onChange={(
                    option,
                  ) =>
                    updateVariant(
                      variant.variantId,
                      {
                        weightLabel:
                          option.label,
                        weightGrams:
                          option.grams,
                      },
                    )
                  }
                  disabled={
                    disabled
                  }
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field
                    label="Price"
                    type="number"
                    value={variant.price}
                    onChange={(value) =>
                      updateVariant(
                        variant.variantId,
                        {
                          price:
                            Number(
                              value,
                            ),
                        },
                      )
                    }
                    disabled={
                      disabled
                    }
                  />

                  <Field
                    label="MRP"
                    type="number"
                    value={
                      variant.mrp ??
                      ""
                    }
                    onChange={(value) =>
                      updateVariant(
                        variant.variantId,
                        {
                          mrp:
                            value ===
                            ""
                              ? undefined
                              : Number(
                                  value,
                                ),
                        },
                      )
                    }
                    disabled={
                      disabled
                    }
                  />

                  <Field
                    label="SKU"
                    value={
                      variant.sku ??
                      ""
                    }
                    onChange={(value) =>
                      updateVariant(
                        variant.variantId,
                        {
                          sku: value,
                        },
                      )
                    }
                    disabled={
                      disabled
                    }
                  />

                  <Field
                    label="Stock"
                    type="number"
                    value={
                      variant.stock ??
                      ""
                    }
                    onChange={(value) =>
                      updateVariant(
                        variant.variantId,
                        {
                          stock:
                            value ===
                            ""
                              ? undefined
                              : Number(
                                  value,
                                ),
                        },
                      )
                    }
                    disabled={
                      disabled
                    }
                  />
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      variant.active
                    }
                    onChange={(e) =>
                      updateVariant(
                        variant.variantId,
                        {
                          active:
                            e.target
                              .checked,
                        },
                      )
                    }
                    disabled={
                      disabled
                    }
                  />

                  Active
                </label>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string | number;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        disabled={disabled}
        className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-slate-500 disabled:bg-gray-100"
      />
    </div>
  );
}