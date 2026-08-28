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
  | "CANCELLED"
  | string; // allow custom stages created by Super Admin

export const DEFAULT_TRACKING_STATUSES: readonly TrackingStatus[] = [
  "BOOKED",
  "PICKUP_REQUESTED",
  "PICKED_UP",
  "AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "ON_HOLD",
  "EXCEPTION",
  "CANCELLED",
] as const;

/** Kept for backward compatibility */
export const TRACKING_STATUSES = DEFAULT_TRACKING_STATUSES;

export type TrackingModule = "LOGISTICS" | "FOOD";

export type TrackingEvent = {
  id: string;
  trackingEventId?: string;
  awb: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
  timestamp: string;
  updatedBy?: string;
  module?: TrackingModule;
};

/**
 * Dynamic stage that Super Admin can create / edit / reorder / disable.
 * These stages are used in the checkbox matrix and public timeline.
 */
export type TrackingStageConfig = {
  id: string;
  trackingStageId?: string;
  code: string;           // unique key, e.g. "BOOKING_CONFIRMED"
  label: string;          // display name, e.g. "BOOKING CONFIRMED"
  module: TrackingModule; // LOGISTICS or FOOD
  enabled: boolean;
  sortOrder: number;
  isSystem?: boolean;     // true = cannot be deleted (core statuses)
  createdAt?: string;
  updatedAt?: string;
};

export type TrackingUpdateInput = {
  awb: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
  updatedBy?: string;
  module?: TrackingModule;
};

export type PublicTracking = {
  awb: string;
  currentStatus: TrackingStatus;
  origin: string;
  destination: string;
  shipmentDate: string;
  latestLocation?: string;
  events: TrackingEvent[];
  stages?: TrackingStageConfig[]; // ordered stages for timeline UI
};

/** Used by the checkbox matrix page */
export type TrackingMatrixRow = {
  awb: string;
  currentStatus: TrackingStatus;
  stages: {
    code: string;
    label: string;
    checked: boolean;
    timestamp?: string;
  }[];
};