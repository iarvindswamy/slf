"use client";

import Link from "next/link";

import {
  X,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from "lucide-react";

import { useEffect } from "react";

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;

  items: CartItem[];

  onIncrease?: (
    itemId: string,
  ) => void;

  onDecrease?: (
    itemId: string,
  ) => void;

  onRemove?: (
    itemId: string,
  ) => void;
};

export default function CartDrawer({
  open,
  onClose,
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: CartDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.price *
          item.quantity,
      0,
    );

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-slate-900" />

            <div>
              <h2 className="font-semibold text-slate-900">
                Your Cart
              </h2>

              <p className="text-xs text-gray-500">
                {items.length} item
                {items.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length ===
        0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Your cart is empty
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add products to your cart to continue.
            </p>

            <Link
              href="/food/products"
              onClick={onClose}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                {items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="flex gap-4"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.productName
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {
                            item.productName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            item.variantName
                          }
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(
                            2,
                          )}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border">
                            <button
                              type="button"
                              onClick={() =>
                                onDecrease?.(
                                  item.id,
                                )
                              }
                              className="p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="min-w-7 text-center text-xs font-medium">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                onIncrease?.(
                                  item.id,
                                )
                              }
                              className="p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onRemove?.(
                                item.id,
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="border-t bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Subtotal
                </span>

                <span className="text-lg font-bold text-slate-900">
                  ₹
                  {subtotal.toFixed(
                    2,
                  )}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Shipping and applicable charges are
                calculated at checkout.
              </p>

              <Link
                href="/food/checkout"
                onClick={onClose}
                className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}