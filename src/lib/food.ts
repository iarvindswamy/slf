import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";
import type { OrderItem, Product } from "@/types/food";

export type ProductForOrder = {
  productId: string;
  name: string;
  active: boolean;
  variants: Array<{
    variantId: string;
    label: string;
    price: number;
    active: boolean;
  }>;
};

export async function getProduct(
  productId: string,
): Promise<ProductForOrder | null> {
  const direct = await adminDb
    .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
    .doc(productId)
    .get();

  let data = direct.exists ? direct.data() : null;
  let resolvedId = productId;

  // Fallback: find by productId field
  if (!data) {
    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .where("productId", "==", productId)
      .limit(1)
      .get();

    if (snap.empty) return null;

    data = snap.docs[0]?.data() || null;
    resolvedId = snap.docs[0]?.id || productId;
  }

  if (!data) return null;

  const status = String(data.status || "ACTIVE");
  const active = status === "ACTIVE";

  const variantsRaw = Array.isArray(data.variants)
    ? data.variants
    : [];

  const variants = variantsRaw.map(
    (v: Record<string, unknown>, index: number) => {
      const enabled =
        v.enabled === undefined ? true : Boolean(v.enabled);

      return {
        variantId: String(
          v.variantId || v.id || `${resolvedId}-v${index}`,
        ),
        label: String(v.name || v.label || `Option ${index + 1}`),
        price: Number(v.price || 0),
        active: enabled,
      };
    },
  );

  return {
    productId: String(data.productId || resolvedId),
    name: String(data.name || "Product"),
    active,
    variants,
  };
}

export function calculateOrderTotals(
  items: OrderItem[],
  deliveryFee = 0,
  taxRate = 0,
  discount = 0,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const safeDiscount = Math.max(0, Number(discount || 0));
  const safeDelivery = Math.max(0, Number(deliveryFee || 0));
  const taxable = Math.max(0, subtotal - safeDiscount);
  const tax =
    Math.round(
      (taxable * Math.max(0, Number(taxRate || 0))) / 100 * 100,
    ) / 100;

  const total =
    Math.round(
      (taxable + safeDelivery + tax) * 100,
    ) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: safeDiscount,
    deliveryFee: safeDelivery,
    tax,
    total,
  };
}