"use client";

import {
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  MapPin,
  Circle,
} from "lucide-react";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderTrackingEvent = {
  status: OrderStatus;
  title: string;
  description?: string;
  timestamp?: string;
  completed: boolean;
};

type FoodOrderTrackingProps = {
  orderId: string;
  currentStatus: OrderStatus;
  events: OrderTrackingEvent[];
};

const statusLabels: Record<
  OrderStatus,
  string
> = {
  PLACED: "Order Placed",
  CONFIRMED: "Order Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusIcons: Record<
  OrderStatus,
  React.ComponentType<{
    className?: string;
  }>
> = {
  PLACED: Clock3,
  CONFIRMED: CheckCircle2,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: MapPin,
  CANCELLED: Circle,
};

export default function FoodOrderTracking({
  orderId,
  currentStatus,
  events,
}: FoodOrderTrackingProps) {
  const CurrentIcon =
    statusIcons[
      currentStatus
    ];

  return (
    <section className="bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">

        {/* Header */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Order
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                #{orderId}
              </h1>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <CurrentIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Current Status
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {
                    statusLabels[
                      currentStatus
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Order Timeline
          </h2>

          <div className="mt-8">
            {events.map(
              (
                event,
                index,
              ) => {
                const Icon =
                  statusIcons[
                    event.status
                  ];

                const last =
                  index ===
                  events.length -
                    1;

                return (
                  <div
                    key={`${event.status}-${index}`}
                    className="relative flex gap-4"
                  >
                    {!last && (
                      <div
                        className={[
                          "absolute left-5 top-10 h-full w-px",
                          event.completed
                            ? "bg-slate-900"
                            : "bg-gray-200",
                        ].join(" ")}
                      />
                    )}

                    <div
                      className={[
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        event.completed
                          ? "bg-slate-900 text-white"
                          : "bg-gray-100 text-gray-400",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="pb-9">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3
                          className={[
                            "font-semibold",
                            event.completed
                              ? "text-slate-900"
                              : "text-gray-400",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            event.title
                          }
                        </h3>

                        {event.timestamp && (
                          <span className="text-xs text-gray-400">
                            {
                              event.timestamp
                            }
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                          {
                            event.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

      </div>
    </section>
  );
}