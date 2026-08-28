"use client";

import ProductCard, {
  FoodProduct,
} from "./ProductCard";

type ProductGridProps = {
  products: FoodProduct[];

  loading?: boolean;

  onAddToCart?: (
    product: FoodProduct,
    variant: FoodProduct["variants"][number],
    quantity: number,
  ) => void;

  emptyMessage?: string;
};

export default function ProductGrid({
  products,
  loading = false,
  onAddToCart,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border bg-white"
          >
            <div className="aspect-square animate-pulse bg-gray-100" />

            <div className="space-y-3 p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-36 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-white">
        <p className="text-sm text-gray-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}