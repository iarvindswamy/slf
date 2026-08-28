"use client";

import {
  Check,
  Clock,
  Package,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";

export type FoodOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type OrderPipelineProps = {
  status: FoodOrderStatus;
  onStatusChange?: (
    status: FoodOrderStatus,
  ) => void;
  disabled?: boolean;
};

const stages: Array<{
  status: FoodOrderStatus;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}> = [
  {
    status: "PENDING_PAYMENT",
    label: "Payment Pending",
    icon: Clock,
  },
  {
    status: "PAID",
    label: "Paid",
    icon: Check,
  },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    icon: Check,
  },
  {
    status: "PROCESSING",
    label: "Processing",
    icon: Package,
  },
  {
    status: "PACKED",
    label: "Packed",
    icon: Package,
  },
  {
    status: "SHIPPED",
    label: "Shipped",
    icon: Truck,
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: Check,
  },
];

export default function OrderPipeline({
  status,
  onStatusChange,
  disabled = false,
}: OrderPipelineProps) {
  const terminal =
    status ===
      "CANCELLED" ||
    status ===
      "REFUNDED";

  const currentIndex =
    stages.findIndex(
      (stage) =>
        stage.status ===
        status,
    );

  return (
    <section className="rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">
          Order Pipeline
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Update the order through its operational stages.
        </p>
      </div>

      <div className="overflow-x-auto p-5">
        {terminal ? (
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            {status ===
            "CANCELLED" ? (
              <XCircle className="h-6 w-6 text-red-600" />
            ) : (
              <RotateCcw className="h-6 w-6 text-amber-600" />
            )}

            <div>
              <p className="font-semibold">
                {status ===
                "CANCELLED"
                  ? "Order Cancelled"
                  : "Order Refunded"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                This order is in a terminal state.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-[850px]">
            <div className="flex items-start">
              {stages.map(
                (
                  stage,
                  index,
                ) => {
                  const Icon =
                    stage.icon;

                  const completed =
                    index <=
                    currentIndex;

                  const active =
                    index ===
                    currentIndex;

                  return (
                    <div
                      key={
                        stage.status
                      }
                      className="flex flex-1 items-start"
                    >
                      <button
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          onStatusChange?.(
                            stage.status,
                          )
                        }
                        className="group flex flex-col items-center text-center"
                      >
                        <span
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                            completed
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-gray-200 bg-white text-gray-400",
                            active
                              ? "ring-4 ring-slate-100"
                              : "",
                          ].join(
                            " ",
                          )}
                        >
                          {completed ? (
                            <Icon className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">
                              {index +
                                1}
                            </span>
                          )}
                        </span>

                        <span
                          className={[
                            "mt-3 text-xs font-medium",
                            active
                              ? "text-slate-900"
                              : "text-gray-500",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            stage.label
                          }
                        </span>
                      </button>

                      {index <
                        stages.length -
                          1 && (
                        <div
                          className={[
                            "mt-5 h-0.5 flex-1",
                            index <
                            currentIndex
                              ? "bg-slate-900"
                              : "bg-gray-200",
                          ].join(
                            " ",
                          )}
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}