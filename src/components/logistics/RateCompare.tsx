"use client";

import {
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export type RateOption = {
  id: string;
  carrierName: string;
  serviceName: string;
  estimatedDays?: string;
  freight: number;
  fuelSurcharge?: number;
  additionalCharges?: number;
  total: number;
  recommended?: boolean;
};

type RateCompareProps = {
  rates: RateOption[];
  selectedRateId?: string;
  onSelect?: (
    rate: RateOption,
  ) => void;
  loading?: boolean;
};

export default function RateCompare({
  rates,
  selectedRateId,
  onSelect,
  loading = false,
}: RateCompareProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-xl border bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-10 text-center">
        <p className="text-sm text-gray-500">
          No rate options available for the selected shipment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rates.map((rate) => {
        const selected =
          selectedRateId ===
          rate.id;

        return (
          <button
            key={rate.id}
            type="button"
            onClick={() =>
              onSelect?.(rate)
            }
            className={[
              "relative text-left rounded-xl border bg-white p-5 transition",
              selected
                ? "border-slate-900 ring-2 ring-slate-100"
                : "hover:border-gray-300 hover:shadow-sm",
            ].join(" ")}
          >
            {rate.recommended && (
              <span className="absolute right-4 top-4 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Recommended
              </span>
            )}

            <div className="pr-24">
              <p className="text-xs text-gray-400">
                Carrier
              </p>

              <h3 className="mt-1 font-semibold text-gray-900">
                {rate.carrierName}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {rate.serviceName}
              </p>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    ₹{rate.total.toFixed(2)}
                  </p>
                </div>

                {selected && (
                  <CheckCircle2 className="h-5 w-5 text-slate-900" />
                )}
              </div>

              {rate.estimatedDays && (
                <p className="mt-3 text-xs text-gray-500">
                  Estimated delivery:{" "}
                  <span className="font-medium">
                    {
                      rate.estimatedDays
                    }
                  </span>
                </p>
              )}

              <div className="mt-4 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>
                    Freight
                  </span>
                  <span>
                    ₹
                    {rate.freight.toFixed(
                      2,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Fuel
                  </span>
                  <span>
                    ₹
                    {(
                      rate.fuelSurcharge ??
                      0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Additional
                  </span>
                  <span>
                    ₹
                    {(
                      rate.additionalCharges ??
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                Select rate
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}