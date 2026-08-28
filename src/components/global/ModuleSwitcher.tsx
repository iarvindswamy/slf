"use client";

import Link from "next/link";

import {
  Truck,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

import {
  useState,
} from "react";

type Module =
  | "LOGISTICS"
  | "FOOD";

type ModuleSwitcherProps = {
  current?: Module;
};

export default function ModuleSwitcher({
  current = "LOGISTICS",
}: ModuleSwitcherProps) {
  const [open, setOpen] =
    useState(false);

  const isLogistics =
    current ===
    "LOGISTICS";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
      >
        {isLogistics ? (
          <Truck className="h-4 w-4" />
        ) : (
          <ShoppingBag className="h-4 w-4" />
        )}

        <span className="hidden sm:inline">
          {isLogistics
            ? "Logistics"
            : "Food"}
        </span>

        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border bg-white p-2 shadow-xl">

          <Link
            href="/admin/dashboard"
            onClick={() =>
              setOpen(false)
            }
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
              isLogistics
                ? "bg-gray-100 font-medium"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            <Truck className="h-4 w-4" />

            <div>
              <p>
                Logistics
              </p>

              <p className="text-xs text-gray-400">
                Shipments & operations
              </p>
            </div>
          </Link>

          <Link
            href="/admin/food/dashboard"
            onClick={() =>
              setOpen(false)
            }
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
              !isLogistics
                ? "bg-gray-100 font-medium"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            <ShoppingBag className="h-4 w-4" />

            <div>
              <p>Food</p>

              <p className="text-xs text-gray-400">
                Products & orders
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}