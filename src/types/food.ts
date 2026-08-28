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

export const FOOD_ORDER_STATUSES: readonly FoodOrderStatus[] =
  [
    "PENDING_PAYMENT",
    "PAID",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ] as const;

export type ProductStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT";

export type Category = {
  id: string;

  categoryId: string;

  name: string;

  slug: string;

  description?: string;

  imageUrl?: string;

  enabled: boolean;

  sortOrder?: number;

  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;

  variantId: string;

  productId: string;

  name: string;

  weight: number;

  weightUnit: "GRAM" | "KG";

  price: number;

  compareAtPrice?: number;

  sku?: string;

  inventoryId?: string;

  enabled: boolean;

  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;

  productId: string;

  name: string;

  slug: string;

  description?: string;

  categoryId: string;

  categoryName?: string;

  imageUrl?: string;

  images?: string[];

  variants: ProductVariant[];

  status: ProductStatus;

  featured?: boolean;

  createdAt: string;
  updatedAt: string;
};

export type ProductCreateInput = {
  name: string;

  slug: string;

  description?: string;

  categoryId: string;

  imageUrl?: string;

  images?: string[];

  variants: Omit<
    ProductVariant,
    | "id"
    | "variantId"
    | "productId"
    | "createdAt"
    | "updatedAt"
  >[];

  status?: ProductStatus;

  featured?: boolean;
};

export type ProductUpdateInput =
  Partial<ProductCreateInput> & {
    productId: string;
  };

export type CartItem = {
  productId: string;

  variantId: string;

  quantity: number;

  price: number;

  productName?: string;

  variantName?: string;

  imageUrl?: string;
};

export type Cart = {
  items: CartItem[];

  subtotal: number;

  discount: number;

  deliveryFee: number;

  total: number;
};

export type FoodCustomerDetails = {
  name: string;

  phone: string;

  email?: string;

  addressLine1: string;

  addressLine2?: string;

  city: string;

  state: string;

  postalCode: string;

  country: string;
};

export type OrderItem = {
  id: string;

  orderItemId: string;

  productId: string;

  variantId: string;

  productName: string;

  variantName: string;

  quantity: number;

  price: number;

  amount: number;
};

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export type PaymentReference = {
  id?: string;

  paymentReferenceId?: string;

  provider: "CASHFREE";

  cashfreeOrderId: string;

  paymentSessionId?: string;

  status: string;

  paymentStatus?: PaymentStatus;

  amount?: number;

  currency?: "INR";

  createdAt?: string;

  updatedAt?: string;
};

export type FoodOrder = {
  id: string;

  orderId: string;

  customer: FoodCustomerDetails;

  items: OrderItem[];

  subtotal: number;

  discount: number;

  deliveryFee: number;

  total: number;

  currency: "INR";

  status: FoodOrderStatus;

  paymentStatus: PaymentStatus;

  paymentReference?: PaymentReference;

  couponId?: string;

  createdAt: string;

  updatedAt: string;
};

export type FoodOrderCreateInput = {
  items: CartItem[];

  customer: FoodCustomerDetails;

  couponId?: string;
};

export type InventoryItem = {
  id: string;

  inventoryId: string;

  productId: string;

  variantId: string;

  quantity: number;

  reservedQuantity: number;

  availableQuantity: number;

  lowStockThreshold: number;

  enabled: boolean;

  updatedAt: string;
};

export type CouponType =
  | "PERCENTAGE"
  | "FIXED";

export type Coupon = {
  id: string;

  couponId: string;

  code: string;

  type: CouponType;

  value: number;

  minimumOrderAmount?: number;

  maximumDiscount?: number;

  usageLimit?: number;

  usedCount: number;

  startsAt?: string;

  expiresAt?: string;

  enabled: boolean;

  createdAt: string;
  updatedAt: string;
};