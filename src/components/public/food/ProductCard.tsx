"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";

import {
  useState,
} from "react";

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  stock?: number;
};

export type FoodProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  variants: ProductVariant[];
};

type ProductCardProps = {
  product: FoodProduct;

  onAddToCart?: (
    product: FoodProduct,
    variant: ProductVariant,
    quantity: number,
  ) => void;
};

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(
    product.variants[0]?.id,
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const selectedVariant =
    product.variants.find(
      (variant) =>
        variant.id ===
        selectedVariantId,
    ) ??
    product.variants[0];

  if (!selectedVariant) {
    return null;
  }

  const image =
    product.image ||
    "/images/default-product-placeholder.png";

  const outOfStock =
    selectedVariant.stock !==
      undefined &&
    selectedVariant.stock <=
      0;

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white">
      <Link
        href={`/food/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-5">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {product.category}
          </p>
        )}

        <Link
          href={`/food/products/${product.slug}`}
          className="mt-1 block text-lg font-semibold text-slate-900 hover:underline"
        >
          {product.name}
        </Link>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
            {product.description}
          </p>
        )}

        {product.variants.length >
          1 && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Select variant
            </label>

            <select
              value={
                selectedVariantId
              }
              onChange={(event) =>
                setSelectedVariantId(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-slate-500"
            >
              {product.variants.map(
                (variant) => (
                  <option
                    key={variant.id}
                    value={
                      variant.id
                    }
                    disabled={
                      variant.stock !==
                        undefined &&
                      variant.stock <=
                        0
                    }
                  >
                    {variant.name} - ₹
                    {variant.price.toFixed(
                      2,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-slate-900">
              ₹
              {selectedVariant.price.toFixed(
                2,
              )}
            </p>

            {selectedVariant.mrp &&
              selectedVariant.mrp >
                selectedVariant.price && (
                <p className="text-xs text-gray-400 line-through">
                  ₹
                  {selectedVariant.mrp.toFixed(
                    2,
                  )}
                </p>
              )}
          </div>

          <div className="flex items-center rounded-lg border">
            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (value) =>
                    Math.max(
                      1,
                      value - 1,
                    ),
                )
              }
              className="p-2 text-gray-500 hover:bg-gray-50"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="min-w-8 text-center text-sm font-medium">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (value) =>
                    value + 1,
                )
              }
              className="p-2 text-gray-500 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() =>
            onAddToCart?.(
              product,
              selectedVariant,
              quantity,
            )
          }
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </article>
  );
}