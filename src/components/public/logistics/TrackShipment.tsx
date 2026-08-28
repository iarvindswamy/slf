"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowRight,
  Search,
  Package,
} from "lucide-react";

import { useRouter } from "next/navigation";

type TrackShipmentProps = {
  title?: string;
  compact?: boolean;
};

export default function TrackShipment({
  title = "Track your shipment",
  compact = false,
}: TrackShipmentProps) {
  const router =
    useRouter();

  const [awb, setAwb] =
    useState("");

  const [
    error,
    setError,
  ] = useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const value =
      awb.trim();

    if (!value) {
      setError(
        "Please enter an AWB number.",
      );

      return;
    }

    setError("");

    router.push(
      `/logistics/track/${encodeURIComponent(value)}`,
    );
  };

  return (
    <section
      className={
        compact
          ? "py-8"
          : "bg-slate-900 py-20"
      }
    >
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div
          className={
            compact
              ? "rounded-xl border bg-white p-5"
              : "rounded-3xl border border-white/10 bg-white/10 p-8 text-white backdrop-blur sm:p-10"
          }
        >
          <div className="mx-auto max-w-2xl text-center">
            <div
              className={[
                "mx-auto flex h-12 w-12 items-center justify-center rounded-xl",
                compact
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-900",
              ].join(" ")}
            >
              <Package className="h-6 w-6" />
            </div>

            <h2
              className={[
                "mt-5 text-3xl font-bold",
                compact
                  ? "text-slate-900"
                  : "text-white",
              ].join(" ")}
            >
              {title}
            </h2>

            <p
              className={[
                "mt-3 text-sm leading-6",
                compact
                  ? "text-gray-500"
                  : "text-slate-300",
              ].join(" ")}
            >
              Enter your Air Waybill number to view the
              latest shipment status.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className={[
                      "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
                      compact
                        ? "text-gray-400"
                        : "text-slate-400",
                    ].join(" ")}
                  />

                  <input
                    value={awb}
                    onChange={(event) =>
                      setAwb(
                        event.target.value,
                      )
                    }
                    placeholder="Enter AWB number"
                    className="h-12 w-full rounded-lg border bg-white pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Track Shipment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <p className="mt-3 text-left text-sm text-red-500">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}