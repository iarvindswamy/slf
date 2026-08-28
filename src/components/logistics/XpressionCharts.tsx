"use client";

import { BarChart3, TrendingUp } from "lucide-react";

export type ChartPoint = {
  label: string;
  value: number;
  key?: string; // e.g. "2026-03"
};

type XpressionChartsProps = {
  shipmentData?: ChartPoint[];
  revenueData?: ChartPoint[];
  loading?: boolean;
  /** Currently selected month key (for highlighting) */
  activeMonth?: string | null;
  /** Called when user clicks a bar */
  onBarClick?: (point: ChartPoint) => void;
};

function SimpleBarChart({
  data,
  formatter = (value) => value.toString(),
  activeKey,
  onBarClick,
  colorClass = "bg-slate-900",
  activeColorClass = "bg-[#087f87]",
}: {
  data: ChartPoint[];
  formatter?: (value: number) => string;
  activeKey?: string | null;
  onBarClick?: (point: ChartPoint) => void;
  colorClass?: string;
  activeColorClass?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-400">
        No chart data available.
      </div>
    );
  }

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-56 items-end gap-3 overflow-x-auto pt-8">
      {data.map((item) => {
        const height = Math.max((item.value / max) * 100, 4);
        const isActive = activeKey && (item.key === activeKey || item.label === activeKey);

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onBarClick?.(item)}
            className="group flex min-w-12 flex-1 flex-col items-center justify-end gap-2 focus:outline-none"
          >
            <span className="text-[10px] text-gray-400 group-hover:text-slate-700">
              {formatter(item.value)}
            </span>

            <div className="flex h-36 w-full items-end">
              <div
                className={`w-full rounded-t-md transition-all ${
                  isActive ? activeColorClass : colorClass
                } group-hover:opacity-90`}
                style={{ height: `${height}%` }}
                title={`${item.label}: ${formatter(item.value)}`}
              />
            </div>

            <span
              className={`max-w-16 truncate text-[10px] ${
                isActive ? "font-bold text-[#087f87]" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function XpressionCharts({
  shipmentData = [],
  revenueData = [],
  loading = false,
  activeMonth = null,
  onBarClick,
}: XpressionChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Shipment Activity */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Operations
            </p>
            <h2 className="mt-1 font-semibold text-[#06284c]">
              Shipment Activity
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Click a month to filter
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50">
            <BarChart3 className="h-4 w-4 text-[#087f87]" />
          </div>
        </div>

        <SimpleBarChart
          data={shipmentData}
          activeKey={activeMonth}
          onBarClick={onBarClick}
          colorClass="bg-slate-800"
          activeColorClass="bg-[#087f87]"
        />
      </section>

      {/* Revenue */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Finance
            </p>
            <h2 className="mt-1 font-semibold text-[#06284c]">Revenue</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Click a month to filter
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </div>

        <SimpleBarChart
          data={revenueData}
          formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          activeKey={activeMonth}
          onBarClick={onBarClick}
          colorClass="bg-emerald-700"
          activeColorClass="bg-emerald-500"
        />
      </section>
    </div>
  );
}