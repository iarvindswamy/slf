# SRESHTA LOGISTICS + SRESHTA FOODS
## MASTER DEVELOPMENT SPECIFICATION (MDS)
### Version 1.0 — August 2026

> This document is the single source of truth for developers, designers, AI coding agents/LLMs, QA engineers, and future maintainers.
>
> **Rule:** Before changing code, read this document. Do not rename shared identifiers, routes, database concepts, roles, statuses, or environment variables without updating this document and all dependent code.

---

# 1. PROJECT PURPOSE

Build one production-ready web platform for two connected business modules:

1. **Sreshta Logistics** — domestic, international, cargo/freight, booking, AWB management, shipment tracking, day-end operations, rates, fuel surcharges, co-loaders, invoices, reports, masters and administration.
2. **Sreshta Foods** — public food storefront, product/catalog management, variants by weight, cart, checkout, Cashfree payments, order tracking, inventory, coupons and food administration.

The public logistics website should follow the **information architecture and professional presentation direction** of the supplied GiantWings reference, while using original Sreshta branding/design.

The logistics admin experience should use the supplied **Xpression** reference as an operational UX reference, while remaining an original implementation.

Reference websites supplied by the client:
- GiantWings: https://giantwings.in/
- Xpression admin reference: https://xpresion.sssxpress.in/

Do not copy protected branding, source code, text, imagery, or exact visual design. Use the references only to understand information architecture, workflow and UX expectations.

---

# 2. BUSINESS / BRAND REQUIREMENTS

## 2.1 Logistics Brand

Asset:
`public/images/sreshta-logistics-logo.png`

Brand direction:
- Navy blue
- Teal
- Professional logistics/cargo appearance
- Corporate, trustworthy, modern

Hero asset:
`public/images/logistics-hero-bg.jpg`

Placeholder:
`public/images/default-product-placeholder.png`

## 2.2 Food Brand

Asset:
`public/images/sreshta-food-logo.png`

Brand direction:
- Warm orange
- Gold
- Food/e-commerce appearance
- Premium but approachable

## 2.3 Client Contacts

Managing Director:
- Tummala Santosh Kumar
- Role: Managing Director
- Phone: 9493924742

Partner:
- Yaragalla Kalyan
- Role: Partner
- Phone: 8712164677

Phone numbers should be centralized in `src/utils/constants.ts`; do not duplicate them throughout components.

---

# 3. PRIMARY TECHNICAL DIRECTION

Frontend:
- Next.js 14
- App Router
- TypeScript
- Tailwind CSS
- React
- Reusable components
- Responsive desktop/tablet/mobile UI

Backend:
- Next.js Route Handlers
- Firebase Authentication
- Firebase/Firestore
- Firebase Admin SDK for trusted server operations

Integrations planned:
- Cashfree Payments
- WhatsApp Cloud API
- PDF invoice/document generation
- Excel import

Important:
Frontend is implemented first. Backend/API integration is added after the frontend contracts are stable.

---

# 4. ARCHITECTURE RULES

## 4.1 Route Groups

`(public)` and `(auth)` are route groups. Their names do not appear in URLs.

Examples:

`src/app/(public)/logistics/page.tsx`
=> `/logistics`

`src/app/(auth)/login/page.tsx`
=> `/login`

## 4.2 Admin URLs

All admin screens are under:

`/admin`

Do not create separate admin URL systems for logistics and food.

## 4.3 API URLs

All server APIs are under:

`/api`

Example:

`src/app/api/logistics/awb/create/route.ts`
=> `/api/logistics/awb/create`

---

# 5. MASTER ROUTE MAP

## Public Logistics

| Route | File | Purpose |
|---|---|---|
| `/logistics` | `src/app/(public)/logistics/page.tsx` | Logistics homepage |
| `/logistics/services` | `.../services/page.tsx` | Service overview |
| `/logistics/international` | `.../international/page.tsx` | International logistics |
| `/logistics/domestic` | `.../domestic/page.tsx` | Domestic logistics |
| `/logistics/cargo-freight` | `.../cargo-freight/page.tsx` | Cargo/freight |
| `/logistics/partnership` | `.../partnership/page.tsx` | Partnership information |
| `/logistics/book-freight` | `.../book-freight/page.tsx` | Public freight booking |
| `/logistics/pickup-request` | `.../pickup-request/page.tsx` | Pickup request |
| `/logistics/about` | `.../about/page.tsx` | About company |
| `/logistics/contact` | `.../contact/page.tsx` | Contact |
| `/logistics/track` | `.../track/page.tsx` | AWB search |
| `/logistics/track/[awb]` | `.../track/[awb]/page.tsx` | AWB timeline |

## Public Food

| Route | Purpose |
|---|---|
| `/food` | Food storefront |
| `/food/products` | Product listing |
| `/food/products/[slug]` | Product details |
| `/food/categories/[slug]` | Category listing |
| `/food/cart` | Cart |
| `/food/checkout` | Checkout |
| `/food/order-success` | Successful order |
| `/food/track/[orderId]` | Food order tracking |

## Authentication

`/login`

Admin login must eventually support role-aware access.

---

# 6. ADMIN ROUTE MAP

## Core

- `/admin`
- `/admin/dashboard`

## Logistics

- `/admin/logistics/booking`
- `/admin/logistics/awb`
- `/admin/logistics/awb/[awb]`
- `/admin/logistics/excel-import`
- `/admin/logistics/tracking`
- `/admin/logistics/tracking/matrix`
- `/admin/logistics/day-end`
- `/admin/logistics/rate-compare`
- `/admin/logistics/fuel-surcharges`
- `/admin/logistics/co-loaders`
- `/admin/logistics/invoices`
- `/admin/logistics/invoices/[invoiceId]`
- `/admin/logistics/reports`
- `/admin/logistics/settings`

## Masters

- `/admin/masters/senders`
- `/admin/masters/receivers`
- `/admin/masters/customers`
- `/admin/masters/service-centers`
- `/admin/masters/destinations`
- `/admin/masters/vendors`
- `/admin/masters/services`

## Food Admin

- `/admin/food/dashboard`
- `/admin/food/products`
- `/admin/food/products/[id]`
- `/admin/food/categories`
- `/admin/food/orders`
- `/admin/food/orders/[orderId]`
- `/admin/food/inventory`
- `/admin/food/coupons`
- `/admin/food/settings`

## Platform Administration

- `/admin/users`
- `/admin/roles`
- `/admin/audit-logs`

---

# 7. COMPLETE SOURCE TREE

```text
sreshta-logistics-food/
├── public/
│   ├── images/
│   │   ├── sreshta-logistics-logo.png
│   │   ├── sreshta-food-logo.png
│   │   ├── logistics-hero-bg.jpg
│   │   └── default-product-placeholder.png
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │
│   │   ├── (public)/
│   │   │   ├── logistics/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── services/page.tsx
│   │   │   │   ├── international/page.tsx
│   │   │   │   ├── domestic/page.tsx
│   │   │   │   ├── cargo-freight/page.tsx
│   │   │   │   ├── partnership/page.tsx
│   │   │   │   ├── book-freight/page.tsx
│   │   │   │   ├── pickup-request/page.tsx
│   │   │   │   ├── about/page.tsx
│   │   │   │   ├── contact/page.tsx
│   │   │   │   └── track/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [awb]/page.tsx
│   │   │   │
│   │   │   └── food/
│   │   │       ├── page.tsx
│   │   │       ├── products/page.tsx
│   │   │       ├── products/[slug]/page.tsx
│   │   │       ├── categories/[slug]/page.tsx
│   │   │       ├── cart/page.tsx
│   │   │       ├── checkout/page.tsx
│   │   │       ├── order-success/page.tsx
│   │   │       └── track/[orderId]/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── logistics/
│   │   │   │   ├── booking/page.tsx
│   │   │   │   ├── awb/page.tsx
│   │   │   │   ├── awb/[awb]/page.tsx
│   │   │   │   ├── excel-import/page.tsx
│   │   │   │   ├── tracking/page.tsx
│   │   │   │   ├── tracking/matrix/page.tsx
│   │   │   │   ├── day-end/page.tsx
│   │   │   │   ├── rate-compare/page.tsx
│   │   │   │   ├── fuel-surcharges/page.tsx
│   │   │   │   ├── co-loaders/page.tsx
│   │   │   │   ├── invoices/page.tsx
│   │   │   │   ├── invoices/[invoiceId]/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── masters/
│   │   │   │   ├── senders/page.tsx
│   │   │   │   ├── receivers/page.tsx
│   │   │   │   ├── customers/page.tsx
│   │   │   │   ├── service-centers/page.tsx
│   │   │   │   ├── destinations/page.tsx
│   │   │   │   ├── vendors/page.tsx
│   │   │   │   └── services/page.tsx
│   │   │   ├── food/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── products/[id]/page.tsx
│   │   │   │   ├── categories/page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── orders/[orderId]/page.tsx
│   │   │   │   ├── inventory/page.tsx
│   │   │   │   ├── coupons/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── roles/page.tsx
│   │   │   └── audit-logs/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── otp/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── reset-password/route.ts
│   │       ├── logistics/
│   │       │   ├── awb/create/route.ts
│   │       │   ├── awb/update/route.ts
│   │       │   ├── awb/search/route.ts
│   │       │   ├── tracking/update/route.ts
│   │       │   ├── tracking/[awb]/route.ts
│   │       │   ├── excel-import/route.ts
│   │       │   ├── rate/route.ts
│   │       │   └── day-end/route.ts
│   │       ├── food/
│   │       │   ├── products/route.ts
│   │       │   ├── orders/route.ts
│   │       │   └── tracking/route.ts
│   │       ├── payments/cashfree/
│   │       │   ├── create-order/route.ts
│   │       │   └── webhook/route.ts
│   │       ├── whatsapp/send/route.ts
│   │       ├── invoices/generate/route.ts
│   │       └── uploads/route.ts
│   │
│   ├── components/
│   │   ├── global/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ModuleSwitcher.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── Loading.tsx
│   │   ├── public/
│   │   │   ├── logistics/
│   │   │   │   ├── LogisticsHero.tsx
│   │   │   │   ├── ServiceCards.tsx
│   │   │   │   ├── ShippingModes.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── Testimonials.tsx
│   │   │   │   ├── TrackShipment.tsx
│   │   │   │   └── PickupForm.tsx
│   │   │   └── food/
│   │   │       ├── FoodHero.tsx
│   │   │       ├── ProductGrid.tsx
│   │   │       ├── ProductCard.tsx
│   │   │       ├── CategorySection.tsx
│   │   │       ├── CartDrawer.tsx
│   │   │       └── FoodOrderTracking.tsx
│   │   ├── logistics/
│   │   │   ├── AWBBookingForm.tsx
│   │   │   ├── ShipperForm.tsx
│   │   │   ├── ConsigneeForm.tsx
│   │   │   ├── ShipmentDetails.tsx
│   │   │   ├── PieceDetails.tsx
│   │   │   ├── GSTDetails.tsx
│   │   │   ├── ChargeDetails.tsx
│   │   │   ├── TrackingMatrixTable.tsx
│   │   │   ├── TrackingTimeline.tsx
│   │   │   ├── RateCompare.tsx
│   │   │   ├── XpressionCharts.tsx
│   │   │   └── InvoiceGenerator.tsx
│   │   └── food/
│   │       ├── VariantBuilder.tsx
│   │       ├── WeightSelector.tsx
│   │       ├── OrderPipeline.tsx
│   │       ├── InventoryTable.tsx
│   │       └── ProductEditor.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ModuleContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── firebase-admin.ts
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   ├── tracking.ts
│   │   ├── pricing.ts
│   │   ├── cashfree.ts
│   │   ├── whatsapp.ts
│   │   └── pdfGenerator.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── logistics.ts
│   │   ├── tracking.ts
│   │   ├── customer.ts
│   │   ├── invoice.ts
│   │   └── food.ts
│   │
│   └── utils/
│       ├── constants.ts
│       ├── formatters.ts
│       ├── validators.ts
│       └── calculations.ts
│
├── .env.local
├── firestore.rules
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

# 8. FILE RESPONSIBILITY CONTRACTS

## App files

### `src/app/layout.tsx`
Root HTML layout, global providers, metadata and application-wide context.

Must not contain business-specific page logic.

### `src/app/page.tsx`
Root route.

Current intended behavior:
`/` => redirect to `/logistics`.

### `src/app/globals.css`
Global Tailwind styles, CSS variables, reusable global utility classes and brand theme.

Do not put component-specific application logic here.

---

# 9. PUBLIC COMPONENT CONTRACTS

## Logistics

### `LogisticsHero.tsx`
Hero section, primary CTA and tracking entry point.

### `ServiceCards.tsx`
Reusable logistics service cards.

### `ShippingModes.tsx`
Air, surface/domestic and international transportation modes.

### `HowItWorks.tsx`
Shipment workflow presentation.

### `Testimonials.tsx`
Customer/business testimonials.

### `TrackShipment.tsx`
Reusable public AWB tracking form.

Shared identifier:
`awb`

### `PickupForm.tsx`
Customer pickup request form.

---

# 10. FOOD PUBLIC COMPONENTS

### `FoodHero.tsx`
Food storefront hero.

### `ProductGrid.tsx`
Responsive product listing.

### `ProductCard.tsx`
Single product display.

### `CategorySection.tsx`
Food category presentation.

### `CartDrawer.tsx`
Client-side cart preview.

### `FoodOrderTracking.tsx`
Order status/timeline UI.

Shared identifier:
`orderId`

---

# 11. LOGISTICS ADMIN COMPONENTS

### `AWBBookingForm.tsx`
Main AWB creation form.

### `ShipperForm.tsx`
Sender/shipper details.

### `ConsigneeForm.tsx`
Receiver/consignee details.

### `ShipmentDetails.tsx`
Shipment metadata.

### `PieceDetails.tsx`
Package/piece/weight information.

### `GSTDetails.tsx`
GST/tax information.

### `ChargeDetails.tsx`
Freight and additional charges.

### `TrackingMatrixTable.tsx`
Admin configuration for tracking stages.

### `TrackingTimeline.tsx`
Shipment status history.

### `RateCompare.tsx`
Compare available service/carrier rates.

### `XpressionCharts.tsx`
Dashboard charts inspired by the supplied operational reference.

### `InvoiceGenerator.tsx`
Invoice preview/generation UI.

---

# 12. FOOD ADMIN COMPONENTS

### `VariantBuilder.tsx`
Creates product weight/price variants.

### `WeightSelector.tsx`
Customer/admin weight selector.

Typical values:
- 250g
- 500g
- 1kg
- 2kg

These are defaults, not hard-coded business restrictions.

### `OrderPipeline.tsx`
Food order processing stages.

### `InventoryTable.tsx`
Stock/inventory management.

### `ProductEditor.tsx`
Create/update food product.

---

# 13. GLOBAL COMPONENT CONTRACTS

### `Header.tsx`
Public header.

Must support:
- Logistics branding
- Food branding
- Module-aware navigation

### `Footer.tsx`
Public footer and contact information.

### `Sidebar.tsx`
Admin navigation.

Must be role-aware.

### `ModuleSwitcher.tsx`
Switch:
`LOGISTICS`
`FOOD`

Canonical module identifiers:

```ts
export type Module = "LOGISTICS" | "FOOD";
```

### `SearchBar.tsx`
Reusable search interface.

### `Modal.tsx`
Generic modal.

### `ConfirmDialog.tsx`
Destructive/action confirmation.

### `DataTable.tsx`
Reusable admin data table.

### `StatsCard.tsx`
Dashboard statistics.

### `Loading.tsx`
Standard loading state.

---

# 14. MASTER TYPES

These should live in `src/types`.

Never invent a second incompatible type definition in a page/component.

---

## 14.1 User

`src/types/user.ts`

Canonical roles:

```ts
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LOGISTICS_MANAGER"
  | "LOGISTICS_OPERATOR"
  | "FOOD_MANAGER"
  | "FOOD_OPERATOR"
  | "ACCOUNTANT"
  | "VIEWER";
```

Canonical modules:

```ts
export type UserModule = "LOGISTICS" | "FOOD" | "BOTH";
```

User ID:
`userId`

---

# 15. LOGISTICS MASTER IDENTIFIERS

## AWB

Canonical identifier:

`awb`

Use `awb` everywhere for an Air Waybill/tracking identifier.

Do not create alternatives such as:
- `awbNo`
- `awbNumber`
- `trackingCode`

unless an external API specifically requires one.

At UI boundaries, normalize to `awb`.

## Customer

Canonical identifier:
`customerId`

## Sender

Canonical identifier:
`senderId`

## Receiver

Canonical identifier:
`receiverId`

## Service Center

Canonical identifier:
`serviceCenterId`

## Destination

Canonical identifier:
`destinationId`

## Vendor

Canonical identifier:
`vendorId`

## Co-loader

Canonical identifier:
`coLoaderId`

## Invoice

Canonical identifier:
`invoiceId`

---

# 16. TRACKING SYSTEM CONTRACT

Tracking is one of the most important shared systems.

The public tracking page, admin tracking page, tracking matrix, AWB details page and APIs must use the same tracking model.

Canonical status structure:

```ts
type TrackingEvent = {
  id: string;
  awb: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
  timestamp: string;
  updatedBy?: string;
};
```

Canonical status enum:

```ts
type TrackingStatus =
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
```

Do not create another spelling for these statuses.

---

# 17. TRACKING MATRIX

`/admin/logistics/tracking/matrix`

The matrix controls which stages are available/active.

Concept:

```ts
type TrackingStageConfig = {
  id: string;
  code: TrackingStatus;
  label: string;
  enabled: boolean;
  sortOrder: number;
};
```

Canonical stage ID:
`trackingStageId`

The public timeline must consume the same status codes configured by the admin.

---

# 18. FOOD MASTER IDENTIFIERS

Product:
`productId`

Product slug:
`slug`

Category:
`categoryId`

Order:
`orderId`

Order item:
`orderItemId`

Variant:
`variantId`

Coupon:
`couponId`

Inventory item:
`inventoryId`

---

# 19. FOOD ORDER STATUSES

Canonical statuses:

```ts
type FoodOrderStatus =
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
```

All order pages, tracking, APIs and admin pipeline must use these values.

---

# 20. PAYMENT IDENTIFIERS

Cashfree integration must preserve:

- `orderId`
- `paymentSessionId`
- `cashfreeOrderId`
- `paymentStatus`

Do not use `orderId` to mean both a local food order ID and a Cashfree ID unless the implementation explicitly defines them as the same identifier.

Recommended model:

```ts
type PaymentReference = {
  provider: "CASHFREE";
  cashfreeOrderId: string;
  paymentSessionId?: string;
  status: string;
};
```

---

# 21. API CONTRACT

Frontend must not directly access privileged Firebase Admin operations.

Use API route handlers.

Example:

Frontend:
`POST /api/logistics/awb/create`

Server:
- authenticate user
- authorize role
- validate payload
- create Firestore record
- write audit log
- return normalized response

Recommended response format:

```ts
type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
```

Use this consistently.

---

# 22. API ROUTE RESPONSIBILITIES

## Authentication

`/api/auth/login`
- authenticate user
- establish application session

`/api/auth/otp`
- OTP workflow

`/api/auth/logout`
- terminate session

`/api/auth/reset-password`
- password recovery

---

## Logistics

`/api/logistics/awb/create`
Create AWB.

`/api/logistics/awb/update`
Update AWB.

`/api/logistics/awb/search`
Search AWBs.

`/api/logistics/tracking/update`
Add/update shipment tracking event.

`/api/logistics/tracking/[awb]`
Return public/admin tracking information for one AWB.

`/api/logistics/excel-import`
Import approved spreadsheet data.

`/api/logistics/rate`
Rate calculation/comparison.

`/api/logistics/day-end`
Day-end operations.

---

## Food

`/api/food/products`
Product CRUD/API access.

`/api/food/orders`
Food order creation and management.

`/api/food/tracking`
Food order tracking.

---

## Payments

`/api/payments/cashfree/create-order`
Create payment order.

`/api/payments/cashfree/webhook`
Verify/process Cashfree webhook events.

Never trust browser payment-success state without server-side verification.

---

## WhatsApp

`/api/whatsapp/send`

Used for approved transactional documents/messages.

---

## Invoice

`/api/invoices/generate`

Generates invoice/document output.

---

## Uploads

`/api/uploads`

Central upload endpoint.

Validate:
- file type
- size
- authorization
- ownership/context

---

# 23. CONTEXT CONTRACTS

## `AuthContext.tsx`

Owns current authenticated user and authentication state.

Canonical values:
- `user`
- `userId`
- `role`
- `module`
- `isAuthenticated`
- `loading`

Do not create another global authentication context.

---

## `ModuleContext.tsx`

Canonical active module:

```ts
"LOGISTICS" | "FOOD"
```

Used by:
- header
- sidebar
- module switcher
- dashboard
- navigation

---

## `CartContext.tsx`

Owns food cart state.

Canonical fields:

```ts
items
subtotal
discount
deliveryFee
total
```

Cart item must include:
- `productId`
- `variantId`
- `quantity`
- price snapshot

---

# 24. FIREBASE CONTRACT

`src/lib/firebase.ts`

Client Firebase initialization.

`src/lib/firebase-admin.ts`

Server-only Firebase Admin initialization.

Never import `firebase-admin.ts` into a client component.

---

# 25. AUTHORIZATION

`src/lib/auth.ts`
Authentication/session helpers.

`src/lib/permissions.ts`
Role and permission checks.

Permission checks should be centralized.

Example:

```ts
can(user, "LOGISTICS_AWB_CREATE")
can(user, "LOGISTICS_AWB_UPDATE")
can(user, "LOGISTICS_INVOICE_VIEW")
can(user, "FOOD_PRODUCT_EDIT")
can(user, "FOOD_ORDER_UPDATE")
```

Canonical permission naming convention:

`MODULE_RESOURCE_ACTION`

Examples:
- `LOGISTICS_AWB_CREATE`
- `LOGISTICS_TRACKING_UPDATE`
- `LOGISTICS_INVOICE_CREATE`
- `FOOD_PRODUCT_CREATE`
- `FOOD_PRODUCT_UPDATE`
- `FOOD_ORDER_UPDATE`
- `ADMIN_USER_MANAGE`

---

# 26. PRICING

`src/lib/pricing.ts`

Central pricing calculations.

`src/utils/calculations.ts`

Pure calculation helpers.

Do not duplicate freight/fuel/GST calculations inside UI components.

---

# 27. FORMATTERS

`src/utils/formatters.ts`

Central formatting:
- INR
- dates
- timestamps
- weight
- phone numbers
- AWB display
- invoice numbers

Example canonical helpers:

```ts
formatCurrency()
formatWeight()
formatDate()
formatDateTime()
formatPhone()
```

---

# 28. VALIDATION

`src/utils/validators.ts`

Central validation.

At minimum:
- phone
- email
- AWB
- GSTIN where applicable
- postal/PIN code
- required form fields
- product variant values

Validation must exist server-side even if frontend validation exists.

---

# 29. CONSTANTS

`src/utils/constants.ts`

This is the master location for stable shared constants.

Examples:

```ts
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
};
```

Also centralize:
- modules
- roles
- tracking statuses
- food order statuses
- navigation
- service types
- default weight options
- branding constants

---

# 30. NAVIGATION IDENTIFIERS

Use stable route constants where practical.

Example:

```ts
ROUTES.LOGISTICS
ROUTES.LOGISTICS_TRACK
ROUTES.LOGISTICS_BOOK
ROUTES.FOOD
ROUTES.FOOD_CART
ROUTES.FOOD_CHECKOUT
ROUTES.ADMIN
ROUTES.ADMIN_DASHBOARD
```

Do not scatter hard-coded route strings throughout complex navigation logic.

---

# 31. ADMIN SIDEBAR STRUCTURE

Admin sidebar must logically contain:

## Overview
- Dashboard

## Logistics
- Booking
- AWBs
- Excel Import
- Tracking
- Tracking Matrix
- Day End
- Rate Compare
- Fuel Surcharges
- Co-loaders
- Invoices
- Reports
- Settings

## Masters
- Senders
- Receivers
- Customers
- Service Centers
- Destinations
- Vendors
- Services

## Food
- Dashboard
- Products
- Categories
- Orders
- Inventory
- Coupons
- Settings

## Administration
- Users
- Roles
- Audit Logs

Sidebar visibility must be permission-aware.

---

# 32. ADMIN DASHBOARD

The dashboard should eventually expose operational information such as:

Logistics:
- total AWBs
- booked
- in transit
- delivered
- exceptions
- pending day-end
- revenue
- outstanding invoices

Food:
- orders
- paid orders
- processing orders
- delivered orders
- inventory alerts
- sales

Charts must use real API/database data once backend is implemented.

During frontend-only development, mock data must be clearly isolated and typed.

---

# 33. AWB BOOKING WORKFLOW

Canonical flow:

1. Select customer
2. Sender/shipper
3. Receiver/consignee
4. Origin
5. Destination
6. Service
7. Shipment details
8. Piece details
9. Weight
10. Dimensions
11. GST details
12. Charges
13. Fuel surcharge
14. Review
15. Create AWB
16. Generate invoice/receipt if applicable
17. Tracking begins

The frontend should represent this as a clear multi-section form.

---

# 34. PUBLIC TRACKING WORKFLOW

User visits:

`/logistics/track`

Enters:

`awb`

System navigates to:

`/logistics/track/[awb]`

The details page displays:
- AWB
- current status
- origin
- destination
- shipment date
- latest location
- timeline
- shipment events

Do not expose sensitive internal customer/admin information.

---

# 35. FOOD PURCHASE WORKFLOW

1. Browse products
2. Open product
3. Select variant
4. Add to cart
5. Review cart
6. Checkout
7. Enter customer/shipping information
8. Create local order
9. Create Cashfree order
10. Payment
11. Server verifies payment
12. Mark order paid
13. Show order success
14. Track using `orderId`

---

# 36. AUDIT LOGGING

All sensitive admin mutations should eventually generate audit entries.

Canonical model:

```ts
type AuditLog = {
  id: string;
  userId: string;
  action: string;
  module: "LOGISTICS" | "FOOD" | "SYSTEM";
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};
```

Examples:
- AWB created
- AWB updated
- tracking status changed
- invoice generated
- product edited
- order status changed
- user role changed

---

# 37. ENVIRONMENT VARIABLES

`.env.local` must contain secrets and environment configuration.

Expected conceptual variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENVIRONMENT=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
```

Never commit secrets.

Never expose:
- Firebase Admin credentials
- Cashfree secret key
- WhatsApp access token

to client-side JavaScript.

---

# 38. DATABASE CONCEPTUAL COLLECTIONS

Recommended Firestore collections:

```text
users
roles
auditLogs

customers
senders
receivers
serviceCenters
destinations
vendors
coLoaders
services

awbs
trackingEvents
trackingStageConfigs
rates
fuelSurcharges
dayEndRecords

invoices

products
categories
productVariants
inventory
foodOrders
coupons

paymentReferences
pickupRequests
uploads
```

Collection names must remain stable unless this document is updated.

---

# 39. DATABASE ID RULE

Every document must have a stable internal document ID.

Business identifiers must be explicit.

Examples:

```text
Firestore document ID != necessarily AWB
```

An AWB record contains:

```ts
{
  id: string;
  awb: string;
}
```

Same principle applies to:
- invoices
- orders
- products
- customers

---

# 40. FRONTEND/BACKEND BOUNDARY

Frontend:
- presentation
- forms
- client interaction
- optimistic UI where safe
- API calls
- local cart state

Backend:
- authorization
- secrets
- payment verification
- Firestore mutations
- pricing authority
- invoice generation
- WhatsApp sending
- audit logs

Never rely on frontend values for:
- payment verification
- admin authorization
- final price
- role
- invoice amount
- tracking ownership

---

# 41. MOCK DATA RULE

While frontend is being developed:

Create typed mock data close to the feature or in a dedicated mock location if necessary.

Example:

```ts
const mockTrackingEvents: TrackingEvent[] = [...]
```

Do not mix mock data with real API calls.

When backend is connected, replace the data source without changing the UI contract.

---

# 42. COMPONENT DEVELOPMENT RULE

Every reusable component must:

1. Have a single responsibility.
2. Have typed props.
3. Avoid direct Firebase access unless specifically designed as a data component.
4. Avoid hard-coded business identifiers.
5. Reuse shared types.
6. Reuse shared formatters.
7. Be responsive.
8. Handle loading/empty/error states where applicable.
9. Avoid duplicating business calculations.

---

# 43. PAGE DEVELOPMENT RULE

Each page should be responsible for:
- page layout
- page-level data orchestration
- composing components
- route params/search params
- SEO metadata where appropriate

Large forms/tables/sections belong in components.

---

# 44. RESPONSIVE DESIGN REQUIREMENT

All public and admin pages must support:

- Mobile
- Tablet
- Desktop

Do not build desktop-only layouts.

Admin tables should support:
- horizontal scroll
- responsive columns
- mobile-friendly row/card fallback where needed

---

# 45. ACCESSIBILITY

Required:
- semantic HTML
- labels for inputs
- keyboard navigation
- visible focus states
- accessible buttons
- meaningful alt text
- sufficient contrast
- error messages associated with fields

Do not use icons alone for critical actions.

---

# 46. SECURITY RULES

Never:
- put secrets in frontend components
- trust client-side roles
- trust client-side prices
- trust client-side payment completion
- expose private customer information through public tracking
- allow arbitrary Firestore writes from public users
- bypass server authorization

All privileged operations must be authorized server-side.

---

# 47. LOGISTICS TRACKING DATA FLOW

```text
Admin
  |
  | update tracking
  v
POST /api/logistics/tracking/update
  |
  v
Authorization
  |
  v
Validation
  |
  v
Firestore
  |
  +----> trackingEvents
  |
  +----> AWB current status
  |
  +----> auditLogs
  |
  v
Public tracking
  |
  v
/logistics/track/[awb]
```

The public page should read a sanitized representation.

---

# 48. FOOD ORDER DATA FLOW

```text
Customer
  |
  v
Food Product
  |
  v
Cart
  |
  v
Checkout
  |
  v
POST /api/food/orders
  |
  v
Create local order
  |
  v
POST /api/payments/cashfree/create-order
  |
  v
Cashfree
  |
  v
Webhook
  |
  v
Verify payment
  |
  v
Update foodOrder
  |
  v
Order Success / Tracking
```

---

# 49. WHATSAPP DATA FLOW

```text
Admin
  |
  v
Invoice / Document
  |
  v
/api/whatsapp/send
  |
  v
Server authorization
  |
  v
Meta WhatsApp Cloud API
```

The browser must not hold the WhatsApp access token.

---

# 50. INVOICE DATA FLOW

```text
AWB / Food Order
       |
       v
Invoice data
       |
       v
/api/invoices/generate
       |
       v
PDF Generator
       |
       v
Invoice output
```

Invoice numbering must be centralized and collision-safe.

---

# 51. CODING CONVENTIONS

Use:
- TypeScript
- PascalCase for React components
- camelCase for variables/functions
- UPPER_SNAKE_CASE for constants
- kebab-case for routes
- singular TypeScript type names
- plural Firestore collection names

Examples:

```text
AWBBookingForm.tsx
trackingStageId
customerId
TRACKING_STATUSES
```

---

# 52. DO NOT CREATE THESE DUPLICATES

Avoid:
- `TrackingStatus.ts` + another unrelated tracking status enum
- `UserRole` defined in multiple places
- duplicate currency formatting
- duplicate phone constants
- duplicate AWB validation
- duplicate pricing calculation
- duplicate route constants
- separate incompatible cart models

When in doubt, extend the canonical type/helper.

---

# 53. CHANGE MANAGEMENT FOR LLMS

Every AI coding session must follow:

### Step 1
Read this MDS.

### Step 2
Identify the target file.

### Step 3
Identify dependencies.

### Step 4
Check canonical identifiers.

### Step 5
Do not silently rename existing contracts.

### Step 6
Implement only requested scope.

### Step 7
Check imports against the current tree.

### Step 8
Check TypeScript types.

### Step 9
Check routes.

### Step 10
Update this MDS if architecture/contracts changed.

---

# 54. REQUIRED AI CODING PROMPT

Any developer can give this instruction to another LLM:

```text
You are working on the Sreshta Logistics + Sreshta Foods project.

Read MASTER_DEVELOPMENT_SPECIFICATION.md before modifying code.

Treat it as the single source of truth.

Do not:
- rename canonical IDs
- invent duplicate types
- change routes without documenting the change
- move responsibilities between files without documenting it
- expose secrets
- bypass server authorization
- create a second tracking-status system
- create a second order-status system

Before coding:
1. identify the requested file;
2. inspect related types/components;
3. preserve existing contracts;
4. implement only the requested scope;
5. ensure imports match the current project tree;
6. keep TypeScript strict and reusable;
7. report any architecture conflict instead of silently changing the architecture.

After coding:
- list files changed;
- list new dependencies;
- list API contracts affected;
- list canonical IDs/statuses affected;
- state whether the MDS needs an update.
```

---

# 55. DEVELOPMENT ORDER

Recommended implementation order:

## Phase 1 — Foundation
1. `layout.tsx`
2. `globals.css`
3. `page.tsx`
4. constants
5. types
6. global components
7. public header/footer

## Phase 2 — Logistics public
1. logistics homepage
2. services
3. international
4. domestic
5. cargo/freight
6. partnership
7. book freight
8. pickup
9. about
10. contact
11. tracking
12. tracking detail

## Phase 3 — Food public
1. food homepage
2. products
3. product detail
4. categories
5. cart
6. checkout
7. order success
8. tracking

## Phase 4 — Admin UI
1. admin layout
2. sidebar
3. dashboard
4. logistics screens
5. masters
6. food admin
7. users
8. roles
9. audit logs

## Phase 5 — Backend
1. Firebase
2. authentication
3. permissions
4. Firestore models
5. AWB APIs
6. tracking APIs
7. food APIs
8. payments
9. WhatsApp
10. invoice generation
11. uploads
12. Excel import

## Phase 6 — Integration
1. Replace mocks with APIs.
2. Verify authentication.
3. Verify role permissions.
4. Verify payment webhooks.
5. Verify tracking.
6. Verify invoice generation.
7. Verify WhatsApp.
8. Verify audit logs.

## Phase 7 — QA
- mobile
- tablet
- desktop
- accessibility
- security
- validation
- error handling
- loading states
- empty states
- payment edge cases
- duplicate submissions
- authorization tests

---

# 56. CURRENT FRONTEND STATUS

The project is being built one file at a time.

Previously implemented in this conversation:

`src/app/page.tsx`

Current intended behavior:

```ts
redirect("/logistics");
```

The logistics homepage has also been drafted with:
- Sreshta branding
- navigation
- hero
- tracking form
- services
- shipping modes
- workflow
- tracking CTA
- business CTA
- contact/footer

Future implementation must preserve the architecture in this MDS.

---

# 57. DESIGN SYSTEM

## Logistics

Primary:
- Navy
- Teal
- White
- Slate neutrals

Suggested conceptual tokens:

```text
LOGISTICS_NAVY
LOGISTICS_TEAL
LOGISTICS_TEAL_LIGHT
LOGISTICS_SURFACE
```

## Food

Primary:
- Orange
- Gold
- Cream/neutral
- Dark text

Suggested conceptual tokens:

```text
FOOD_ORANGE
FOOD_GOLD
FOOD_SURFACE
FOOD_DARK
```

Avoid hard-coding brand colors across dozens of components. Centralize theme variables in CSS/Tailwind configuration.

---

# 58. PUBLIC WEBSITE UX PRINCIPLES

The logistics website should communicate:

- trust
- speed
- reliability
- visibility
- professional service
- easy tracking
- easy booking

The first screen should make the following obvious:

1. What Sreshta Logistics does.
2. Where/what it ships.
3. How to track.
4. How to book/contact.

---

# 59. FOOD WEBSITE UX PRINCIPLES

The food website should communicate:

- product quality
- product variety
- clear pricing
- weight selection
- simple cart
- easy checkout
- trustworthy payment
- order visibility

---

# 60. ADMIN UX PRINCIPLES

Admin is an operations product, not a marketing website.

Prioritize:
- information density
- fast navigation
- search
- filters
- tables
- bulk operations
- status visibility
- clear action buttons
- confirmations
- auditability

---

# 61. IMPORTANT CURRENT LIMITATIONS

The original user requirements supplied in conversation do not fully define:
- exact Firestore schemas
- exact pricing formulas
- exact fuel surcharge formula
- exact Cashfree configuration
- exact WhatsApp templates
- exact Excel column mapping
- exact admin role permission matrix
- exact invoice numbering rules
- exact tracking stage business rules
- exact service-center/carrier rate logic

These must **not be invented as business facts**.

Implement extensible typed interfaces and placeholders until the client supplies the final rules.

---

# 62. CLIENT-SUPPLIED REFERENCE PRINCIPLES

GiantWings reference:
Use to understand the desired public logistics website structure and professional logistics presentation.

Xpression reference:
Use to understand the desired operational/admin workflow and dashboard direction.

The implementation must remain an original Sreshta product.

---

# 63. MASTER CONNECTION MAP

```text
                    ┌─────────────────────┐
                    │   MODULE CONTEXT    │
                    │ LOGISTICS | FOOD    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
       ┌──────▼──────┐                   ┌──────▼──────┐
       │  LOGISTICS  │                   │    FOOD     │
       └──────┬──────┘                   └──────┬──────┘
              │                                 │
          awb │                             orderId
              │                                 │
       ┌──────▼──────┐                   ┌──────▼──────┐
       │  TRACKING   │                   │   ORDERS    │
       └──────┬──────┘                   └──────┬──────┘
              │                                 │
              └────────────┬────────────────────┘
                           │
                     ┌─────▼─────┐
                     │   AUTH    │
                     │   USER    │
                     │   ROLE    │
                     └─────┬─────┘
                           │
                     ┌─────▼─────┐
                     │ FIREBASE  │
                     │ FIRESTORE │
                     └─────┬─────┘
                           │
              ┌────────────┼─────────────┐
              │            │             │
          Cashfree      WhatsApp      Invoices
```

---

# 64. MASTER IDENTIFIER TABLE

| Domain | Canonical ID |
|---|---|
| User | `userId` |
| Customer | `customerId` |
| Sender | `senderId` |
| Receiver | `receiverId` |
| Service Center | `serviceCenterId` |
| Destination | `destinationId` |
| Vendor | `vendorId` |
| Co-loader | `coLoaderId` |
| AWB | `awb` |
| Tracking Event | `trackingEventId` |
| Tracking Stage | `trackingStageId` |
| Invoice | `invoiceId` |
| Product | `productId` |
| Product Slug | `slug` |
| Category | `categoryId` |
| Variant | `variantId` |
| Order | `orderId` |
| Order Item | `orderItemId` |
| Inventory | `inventoryId` |
| Coupon | `couponId` |
| Payment | `paymentReferenceId` |
| Audit Log | `auditLogId` |
| Upload | `uploadId` |

---

# 65. MASTER STATUS TABLE

## Logistics

```text
BOOKED
PICKUP_REQUESTED
PICKED_UP
AT_ORIGIN
IN_TRANSIT
ARRIVED_DESTINATION
OUT_FOR_DELIVERY
DELIVERED
ON_HOLD
EXCEPTION
CANCELLED
```

## Food

```text
PENDING_PAYMENT
PAID
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
REFUNDED
```

---

# 66. DEFINITION OF DONE

A feature is not considered complete merely because its page renders.

It must have:

- correct route
- responsive UI
- reusable components
- typed props
- loading state
- empty state where applicable
- error state where applicable
- validation
- correct canonical identifiers
- correct role/permission boundary
- API integration when backend phase begins
- audit logging when required
- no secret exposure
- no TypeScript errors
- no broken imports
- no duplicate domain types

---

# 67. FINAL MAINTENANCE RULE

This document is the project's **master contract**.

If any developer or LLM wants to change:

- route
- file responsibility
- database collection
- canonical ID
- status enum
- role
- permission
- API response
- environment variable
- shared context contract

they must update this document in the same change.

Never allow multiple developers or LLMs to independently redefine the same domain concept.

**One project. One source of truth. One canonical contract.**

---

# END OF MASTER DEVELOPMENT SPECIFICATION
