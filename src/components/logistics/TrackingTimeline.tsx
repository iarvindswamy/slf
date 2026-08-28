"use client";

import {
  CheckCircle2,
  Circle,
  MapPin,
  Clock3,
} from "lucide-react";

export type TrackingStatus =
  | "BOOKED"
  | "PICKUP_REQUESTED"
  | "PICKED_UP"
  | "AT_ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVED_DESTINATION"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "ON_HOLD"
  | "EXCEPTION"
  | "CANCELLED";

export type TrackingEvent = {
  id: string;
  awb: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
  timestamp: string;
  updatedBy?: string;
};

type TrackingTimelineProps = {
  events: TrackingEvent[];
  currentStatus?: TrackingStatus;
  compact?: boolean;
};

const labels: Record<
  TrackingStatus,
  string
> = {
  BOOKED: "Booked",
  PICKUP_REQUESTED:
    "Pickup Requested",
  PICKED_UP: "Picked Up",
  AT_ORIGIN: "At Origin",
  IN_TRANSIT: "In Transit",
  ARRIVED_DESTINATION:
    "Arrived at Destination",
  OUT_FOR_DELIVERY:
    "Out for Delivery",
  DELIVERED: "Delivered",
  ON_HOLD: "On Hold",
  EXCEPTION: "Exception",
  CANCELLED: "Cancelled",
};

export default function TrackingTimeline({
  events,
  currentStatus,
  compact = false,
}: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <Clock3 className="mx-auto h-8 w-8 text-gray-300" />

        <p className="mt-3 text-sm text-gray-500">
          No tracking events available.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">
          Tracking Timeline
        </h2>
      </div>

      <div className="p-5">
        <div className="space-y-0">
          {events.map(
            (event, index) => {
              const isCurrent =
                currentStatus ===
                event.status;

              const last =
                index ===
                events.length - 1;

              return (
                <div
                  key={event.id}
                  className="relative flex gap-4"
                >
                  {!last && (
                    <div className="absolute left-4 top-9 h-[calc(100%-18px)] w-px bg-gray-200" />
                  )}

                  <div
                    className={[
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isCurrent
                        ? "bg-slate-900 text-white"
                        : "bg-gray-100 text-gray-400",
                    ].join(" ")}
                  >
                    {isCurrent ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>

                  <div
                    className={[
                      "min-w-0 flex-1",
                      compact
                        ? "pb-5"
                        : "pb-8",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={[
                          "text-sm font-semibold",
                          isCurrent
                            ? "text-slate-900"
                            : "text-gray-700",
                        ].join(" ")}
                      >
                        {
                          labels[
                            event.status
                          ]
                        }
                      </h3>

                      <time className="text-xs text-gray-400">
                        {event.timestamp}
                      </time>
                    </div>

                    {event.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </div>
                    )}

                    {event.description && (
                      <p className="mt-2 text-sm leading-6 text-gray-500">
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
    </section>
  );
}