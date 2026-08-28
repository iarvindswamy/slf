import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;

  description?: string;

  icon?: React.ReactNode;

  trend?: {
    value: number;
    label?: string;
  };

  loading?: boolean;

  className?: string;
};

export default function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
  className = "",
}: StatsCardProps) {
  if (loading) {
    return (
      <div
        className={`rounded-xl border bg-white p-5 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded bg-gray-100" />

          <div className="h-8 w-24 rounded bg-gray-100" />

          <div className="h-3 w-36 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const trendPositive =
    trend &&
    trend.value > 0;

  const trendNegative =
    trend &&
    trend.value < 0;

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition hover:shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            {icon}
          </div>
        )}
      </div>

      {(description ||
        trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span
              className={[
                "inline-flex items-center gap-1 text-xs font-semibold",
                trendPositive
                  ? "text-emerald-600"
                  : trendNegative
                    ? "text-red-600"
                    : "text-gray-500",
              ].join(" ")}
            >
              {trendPositive ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : trendNegative ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}

              {Math.abs(
                trend.value,
              ).toFixed(1)}
              %
            </span>
          )}

          {trend?.label && (
            <span className="text-xs text-gray-400">
              {trend.label}
            </span>
          )}

          {!trend &&
            description && (
              <span className="text-xs text-gray-500">
                {description}
              </span>
            )}
        </div>
      )}
    </div>
  );
}