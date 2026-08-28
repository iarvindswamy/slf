// import type {
//   UserModule,
//   UserRole,
// } from "@/types/user";

// import type {
//   ServiceType,
// } from "@/types/logistics";

// import {
//   TRACKING_STATUSES,
//   type TrackingStatus,
// } from "@/types/tracking";

// import {
//   FOOD_ORDER_STATUSES,
//   type FoodOrderStatus,
// } from "@/types/food";

// export const APP_NAME =
//   "Sreshta Logistics + Sreshta Foods";

// export const BRAND = {
//   LOGISTICS: {
//     name: "Sreshta Logistics",
//     primary: "#0B1F3A",
//     secondary: "#0F9D9A",
//     surface: "#F5F8FA",
//   },

//   FOOD: {
//     name: "Sreshta Foods",
//     primary: "#E86A17",
//     secondary: "#D9A441",
//     surface: "#FFF8EE",
//   },
// } as const;

// export const CONTACTS = {
//   MANAGING_DIRECTOR: {
//     name: "Tummala Santosh Kumar",
//     role: "Managing Director",
//     phone: "9493924742",
//   },

//   PARTNER: {
//     name: "Yaragalla Kalyan",
//     role: "Partner",
//     phone: "8712164677",
//   },
// } as const;

// export const MODULES = {
//   LOGISTICS: "LOGISTICS",
//   FOOD: "FOOD",
// } as const satisfies Record<
//   string,
//   Exclude<UserModule, "BOTH">
// >;

// export const USER_ROLES = {
//   SUPER_ADMIN: "SUPER_ADMIN",
//   ADMIN: "ADMIN",
//   LOGISTICS_MANAGER:
//     "LOGISTICS_MANAGER",
//   LOGISTICS_OPERATOR:
//     "LOGISTICS_OPERATOR",
//   FOOD_MANAGER: "FOOD_MANAGER",
//   FOOD_OPERATOR: "FOOD_OPERATOR",
//   ACCOUNTANT: "ACCOUNTANT",
//   VIEWER: "VIEWER",
// } as const satisfies Record<
//   string,
//   UserRole
// >;

// export {
//   TRACKING_STATUSES,
//   FOOD_ORDER_STATUSES,
// };

// export const TRACKING_STATUS_LABELS: Record<
//   TrackingStatus,
//   string
// > = {
//   BOOKED: "Booked",
//   PICKUP_REQUESTED:
//     "Pickup Requested",
//   PICKED_UP: "Picked Up",
//   AT_ORIGIN: "At Origin",
//   IN_TRANSIT: "In Transit",
//   ARRIVED_DESTINATION:
//     "Arrived at Destination",
//   OUT_FOR_DELIVERY:
//     "Out for Delivery",
//   DELIVERED: "Delivered",
//   ON_HOLD: "On Hold",
//   EXCEPTION: "Exception",
//   CANCELLED: "Cancelled",
// };

// export const FOOD_ORDER_STATUS_LABELS: Record<
//   FoodOrderStatus,
//   string
// > = {
//   PENDING_PAYMENT:
//     "Pending Payment",
//   PAID: "Paid",
//   CONFIRMED: "Confirmed",
//   PROCESSING: "Processing",
//   PACKED: "Packed",
//   SHIPPED: "Shipped",
//   OUT_FOR_DELIVERY:
//     "Out for Delivery",
//   DELIVERED: "Delivered",
//   CANCELLED: "Cancelled",
//   REFUNDED: "Refunded",
// };

// export const SERVICE_TYPES: readonly ServiceType[] =
//   [
//     "DOMESTIC",
//     "INTERNATIONAL",
//     "CARGO",
//     "FREIGHT",
//     "EXPRESS",
//     "SURFACE",
//     "AIR",
//   ] as const;

// export const WEIGHT_OPTIONS = [
//   {
//     value: 0.5,
//     label: "500 g",
//   },
//   {
//     value: 1,
//     label: "1 kg",
//   },
//   {
//     value: 2,
//     label: "2 kg",
//   },
//   {
//     value: 5,
//     label: "5 kg",
//   },
//   {
//     value: 10,
//     label: "10 kg",
//   },
//   {
//     value: 20,
//     label: "20 kg",
//   },
// ] as const;

// export const ROUTES = {
//   LOGISTICS: "/logistics",
//   LOGISTICS_SERVICES:
//     "/logistics/services",
//   LOGISTICS_INTERNATIONAL:
//     "/logistics/international",
//   LOGISTICS_DOMESTIC:
//     "/logistics/domestic",
//   LOGISTICS_CARGO:
//     "/logistics/cargo-freight",
//   LOGISTICS_PARTNERSHIP:
//     "/logistics/partnership",
//   LOGISTICS_BOOK:
//     "/logistics/book-freight",
//   LOGISTICS_PICKUP:
//     "/logistics/pickup-request",
//   LOGISTICS_ABOUT:
//     "/logistics/about",
//   LOGISTICS_CONTACT:
//     "/logistics/contact",
//   LOGISTICS_TRACK:
//     "/logistics/track",

//   FOOD: "/food",
//   FOOD_PRODUCTS:
//     "/food/products",
//   FOOD_CART:
//     "/food/cart",
//   FOOD_CHECKOUT:
//     "/food/checkout",
//   FOOD_SUCCESS:
//     "/food/order-success",

//   LOGIN: "/login",

//   ADMIN: "/admin",
//   ADMIN_DASHBOARD:
//     "/admin/dashboard",

//   ADMIN_LOGISTICS_BOOKING:
//     "/admin/logistics/booking",
//   ADMIN_LOGISTICS_AWB:
//     "/admin/logistics/awb",
//   ADMIN_LOGISTICS_TRACKING:
//     "/admin/logistics/tracking",
//   ADMIN_LOGISTICS_TRACKING_MATRIX:
//     "/admin/logistics/tracking/matrix",
//   ADMIN_LOGISTICS_INVOICES:
//     "/admin/logistics/invoices",

//   ADMIN_FOOD_PRODUCTS:
//     "/admin/food/products",
//   ADMIN_FOOD_ORDERS:
//     "/admin/food/orders",
//   ADMIN_FOOD_INVENTORY:
//     "/admin/food/inventory",

//   ADMIN_USERS:
//     "/admin/users",
//   ADMIN_ROLES:
//     "/admin/roles",
//   ADMIN_AUDIT_LOGS:
//     "/admin/audit-logs",
// } as const;

// export const API_ROUTES = {
//   AUTH_LOGIN: "/api/auth/login",
//   AUTH_LOGOUT: "/api/auth/logout",
//   AUTH_OTP: "/api/auth/otp",
//   AUTH_RESET_PASSWORD:
//     "/api/auth/reset-password",

//   AWB_CREATE:
//     "/api/logistics/awb/create",
//   AWB_UPDATE:
//     "/api/logistics/awb/update",
//   AWB_SEARCH:
//     "/api/logistics/awb/search",

//   TRACKING_UPDATE:
//     "/api/logistics/tracking/update",

//   TRACKING:
//     "/api/logistics/tracking",

//   EXCEL_IMPORT:
//     "/api/logistics/excel-import",

//   RATE:
//     "/api/logistics/rate",

//   DAY_END:
//     "/api/logistics/day-end",

//   PRODUCTS:
//     "/api/food/products",

//   FOOD_ORDERS:
//     "/api/food/orders",

//   FOOD_TRACKING:
//     "/api/food/tracking",

//   CASHFREE_CREATE_ORDER:
//     "/api/payments/cashfree/create-order",

//   CASHFREE_WEBHOOK:
//     "/api/payments/cashfree/webhook",

//   WHATSAPP_SEND:
//     "/api/whatsapp/send",
// } as const;

// export const FIRESTORE_COLLECTIONS = {
//   USERS: "users",
//   ROLES: "roles",
//   AUDIT_LOGS: "auditLogs",

//   CUSTOMERS: "customers",
//   SENDERS: "senders",
//   RECEIVERS: "receivers",
//   SERVICE_CENTERS:
//     "serviceCenters",
//   DESTINATIONS: "destinations",
//   VENDORS: "vendors",
//   CO_LOADERS: "coLoaders",
//   SERVICES: "services",

//   AWBS: "awbs",
//   TRACKING_EVENTS:
//     "trackingEvents",
//   TRACKING_STAGE_CONFIGS:
//     "trackingStageConfigs",

//   RATES: "rates",
//   FUEL_SURCHARGES:
//     "fuelSurcharges",
//   DAY_END_RECORDS:
//     "dayEndRecords",

//   INVOICES: "invoices",

//   PRODUCTS: "products",
//   CATEGORIES: "categories",
//   PRODUCT_VARIANTS:
//     "productVariants",
//   INVENTORY: "inventory",
//   FOOD_ORDERS: "foodOrders",
//   COUPONS: "coupons",

//   PAYMENT_REFERENCES:
//     "paymentReferences",

//   PICKUP_REQUESTS:
//     "pickupRequests",

//   UPLOADS: "uploads",

//   SETTINGS: "settings",
// } as const;

// export const DEFAULT_CURRENCY =
//   "INR" as const;

// export const DEFAULT_COUNTRY =
//   "India";

// export const DEFAULT_PAGE_SIZE =
//   20;

// export const MAX_PAGE_SIZE =
//   100;









import type {
  UserModule,
  UserRole,
} from "@/types/user";

import type {
  ServiceType,
} from "@/types/logistics";

import {
  TRACKING_STATUSES,
  type TrackingStatus,
} from "@/types/tracking";

import {
  FOOD_ORDER_STATUSES,
  type FoodOrderStatus,
} from "@/types/food";

export const APP_NAME =
  "Sreshta Logistics + Sreshta Foods";

export const BRAND = {
  LOGISTICS: {
    name: "Sreshta Logistics",
    primary: "#0B1F3A",
    secondary: "#0F9D9A",
    surface: "#F5F8FA",
  },

  FOOD: {
    name: "Sreshta Foods",
    primary: "#E86A17",
    secondary: "#D9A441",
    surface: "#FFF8EE",
  },
} as const;

export const CONTACTS = {
  MANAGING_DIRECTOR: {
    name: "Tummala Santosh Kumar",
    role: "Managing Director",
    phone: "9493924742",
  },

  PARTNER: {
    name: "Yaragalla Kalyan",
    role: "Partner",
    phone: "8712164677",
  },
} as const;

export const MODULES = {
  LOGISTICS: "LOGISTICS",
  FOOD: "FOOD",
} as const satisfies Record<
  string,
  Exclude<UserModule, "BOTH">
>;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  LOGISTICS_MANAGER: "LOGISTICS_MANAGER",
  LOGISTICS_OPERATOR: "LOGISTICS_OPERATOR",
  FOOD_MANAGER: "FOOD_MANAGER",
  FOOD_OPERATOR: "FOOD_OPERATOR",
  ACCOUNTANT: "ACCOUNTANT",
  VIEWER: "VIEWER",
} as const satisfies Record<string, UserRole>;

export {
  TRACKING_STATUSES,
  FOOD_ORDER_STATUSES,
};

export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  BOOKED: "Booked",
  PICKUP_REQUESTED: "Pickup Requested",
  PICKED_UP: "Picked Up",
  AT_ORIGIN: "At Origin",
  IN_TRANSIT: "In Transit",
  ARRIVED_DESTINATION: "Arrived at Destination",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  ON_HOLD: "On Hold",
  EXCEPTION: "Exception",
  CANCELLED: "Cancelled",
};

export const FOOD_ORDER_STATUS_LABELS: Record<FoodOrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const SERVICE_TYPES: readonly ServiceType[] = [
  "DOMESTIC",
  "INTERNATIONAL",
  "CARGO",
  "FREIGHT",
  "EXPRESS",
  "SURFACE",
  "AIR",
] as const;

/* ------------------------------------------------------------------ */
/*  NEW – Booking / Proforma Option Arrays                            */
/* ------------------------------------------------------------------ */

export const CSB_TYPES = [
  { value: "CSB4", label: "CSB4" },
  { value: "CSB5", label: "CSB5" },
  { value: "OTHER", label: "Other" },
] as const;

export const EXPORT_REASONS = [
  { value: "UNSOLICITED_GIFT", label: "Unsolicited Gift - Not for Sale" },
  { value: "SAMPLE", label: "Sample" },
  { value: "PERSONAL_EFFECTS", label: "Personal Effects" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "RETURN", label: "Return" },
  { value: "REPAIR", label: "Repair / Warranty" },
  { value: "OTHER", label: "Other" },
] as const;

export const TERM_OF_INVOICE = [
  { value: "CIF", label: "CIF" },
  { value: "FOB", label: "FOB" },
  { value: "CFR", label: "CFR" },
  { value: "EXW", label: "EXW" },
  { value: "DDP", label: "DDP" },
  { value: "DAP", label: "DAP" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "AADHAAR", label: "Aadhaar" },
  { value: "PAN", label: "PAN" },
  { value: "GSTIN", label: "GSTIN" },
  { value: "IEC", label: "IEC" },
  { value: "OTHER", label: "Other" },
] as const;

export const PROFORMA_FORMATS = [
  { value: "STANDARD", label: "Standard Proforma" },
  { value: "CSB4", label: "CSB4 Format" },
  { value: "COMMERCIAL", label: "Commercial Invoice" },
] as const;

export const PACKAGE_TYPES = [
  { value: "PKT", label: "Packet (PKT)" },
  { value: "BOX", label: "Box" },
  { value: "CARTON", label: "Carton" },
  { value: "BAG", label: "Bag" },
  { value: "PALLET", label: "Pallet" },
] as const;

/* ------------------------------------------------------------------ */

export const WEIGHT_OPTIONS = [
  { value: 0.5, label: "500 g" },
  { value: 1, label: "1 kg" },
  { value: 2, label: "2 kg" },
  { value: 5, label: "5 kg" },
  { value: 10, label: "10 kg" },
  { value: 20, label: "20 kg" },
] as const;

export const ROUTES = {
  LOGISTICS: "/logistics",
  LOGISTICS_SERVICES: "/logistics/services",
  LOGISTICS_INTERNATIONAL: "/logistics/international",
  LOGISTICS_DOMESTIC: "/logistics/domestic",
  LOGISTICS_CARGO: "/logistics/cargo-freight",
  LOGISTICS_PARTNERSHIP: "/logistics/partnership",
  LOGISTICS_BOOK: "/logistics/book-freight",
  LOGISTICS_PICKUP: "/logistics/pickup-request",
  LOGISTICS_ABOUT: "/logistics/about",
  LOGISTICS_CONTACT: "/logistics/contact",
  LOGISTICS_TRACK: "/logistics/track",

  FOOD: "/food",
  FOOD_PRODUCTS: "/food/products",
  FOOD_CART: "/food/cart",
  FOOD_CHECKOUT: "/food/checkout",
  FOOD_SUCCESS: "/food/order-success",

  LOGIN: "/login",

  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",

  ADMIN_LOGISTICS_BOOKING: "/admin/logistics/booking",
  ADMIN_LOGISTICS_AWB: "/admin/logistics/awb",
  ADMIN_LOGISTICS_TRACKING: "/admin/logistics/tracking",
  ADMIN_LOGISTICS_TRACKING_MATRIX: "/admin/logistics/tracking/matrix",
  ADMIN_LOGISTICS_INVOICES: "/admin/logistics/invoices",

  ADMIN_FOOD_PRODUCTS: "/admin/food/products",
  ADMIN_FOOD_ORDERS: "/admin/food/orders",
  ADMIN_FOOD_INVENTORY: "/admin/food/inventory",

  ADMIN_USERS: "/admin/users",
  ADMIN_ROLES: "/admin/roles",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_OTP: "/api/auth/otp",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",

  AWB_CREATE: "/api/logistics/awb/create",
  AWB_UPDATE: "/api/logistics/awb/update",
  AWB_SEARCH: "/api/logistics/awb/search",

  TRACKING_UPDATE: "/api/logistics/tracking/update",
  TRACKING: "/api/logistics/tracking",

  EXCEL_IMPORT: "/api/logistics/excel-import",
  RATE: "/api/logistics/rate",
  DAY_END: "/api/logistics/day-end",

  PRODUCTS: "/api/food/products",
  FOOD_ORDERS: "/api/food/orders",
  FOOD_TRACKING: "/api/food/tracking",

  CASHFREE_CREATE_ORDER: "/api/payments/cashfree/create-order",
  CASHFREE_WEBHOOK: "/api/payments/cashfree/webhook",

  WHATSAPP_SEND: "/api/whatsapp/send",
} as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  ROLES: "roles",
  AUDIT_LOGS: "auditLogs",

  CUSTOMERS: "customers",
  SENDERS: "senders",
  RECEIVERS: "receivers",
  SERVICE_CENTERS: "serviceCenters",
  DESTINATIONS: "destinations",
  VENDORS: "vendors",
  CO_LOADERS: "coLoaders",
  SERVICES: "services",

  AWBS: "awbs",
  TRACKING_EVENTS: "trackingEvents",
  TRACKING_STAGE_CONFIGS: "trackingStageConfigs",

  RATES: "rates",
  FUEL_SURCHARGES: "fuelSurcharges",
  DAY_END_RECORDS: "dayEndRecords",

  INVOICES: "invoices",

  PRODUCTS: "products",
  CATEGORIES: "categories",
  PRODUCT_VARIANTS: "productVariants",
  INVENTORY: "inventory",
  FOOD_ORDERS: "foodOrders",
  COUPONS: "coupons",

  PAYMENT_REFERENCES: "paymentReferences",
  PICKUP_REQUESTS: "pickupRequests",
  UPLOADS: "uploads",
  SETTINGS: "settings",
} as const;

export const DEFAULT_CURRENCY = "INR" as const;
export const DEFAULT_COUNTRY = "India";
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;