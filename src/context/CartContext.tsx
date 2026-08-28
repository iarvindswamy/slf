"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type AddCartItemInput =
  Omit<CartItem, "quantity"> & {
    quantity?: number;
  };

type CartContextValue = {
  items: CartItem[];

  itemCount: number;
  subtotal: number;

  addItem: (
    item: AddCartItemInput,
  ) => void;

  removeItem: (
    productId: string,
    variantId: string,
  ) => void;

  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  getItem: (
    productId: string,
    variantId: string,
  ) => CartItem | undefined;
};

const CartContext =
  createContext<
    CartContextValue | undefined
  >(undefined);

const STORAGE_KEY =
  "sreshta-food-cart";

function safeNumber(
  value: number,
) {
  return Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          Array.isArray(parsed)
        ) {
          setItems(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(
        STORAGE_KEY,
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => {
      const itemCount =
        items.reduce(
          (sum, item) =>
            sum +
            item.quantity,
          0,
        );

      const subtotal =
        items.reduce(
          (sum, item) =>
            sum +
            safeNumber(
              item.price,
            ) *
              item.quantity,
          0,
        );

      return {
        items,

        itemCount,

        subtotal,

        addItem(item) {
          const quantity =
            Math.max(
              1,
              Math.floor(
                item.quantity ??
                  1,
              ),
            );

          setItems(
            (current) => {
              const existing =
                current.find(
                  (entry) =>
                    entry.productId ===
                      item.productId &&
                    entry.variantId ===
                      item.variantId,
                );

              if (!existing) {
                return [
                  ...current,
                  {
                    ...item,
                    price:
                      safeNumber(
                        item.price,
                      ),
                    quantity,
                  },
                ];
              }

              return current.map(
                (entry) =>
                  entry ===
                  existing
                    ? {
                        ...entry,
                        quantity:
                          entry.quantity +
                          quantity,
                      }
                    : entry,
              );
            },
          );
        },

        removeItem(
          productId,
          variantId,
        ) {
          setItems(
            (current) =>
              current.filter(
                (item) =>
                  !(
                    item.productId ===
                      productId &&
                    item.variantId ===
                      variantId
                  ),
              ),
          );
        },

        updateQuantity(
          productId,
          variantId,
          quantity,
        ) {
          const next =
            Math.floor(
              Number(
                quantity,
              ),
            );

          if (next <= 0) {
            setItems(
              (current) =>
                current.filter(
                  (item) =>
                    !(
                      item.productId ===
                        productId &&
                      item.variantId ===
                        variantId
                    ),
                ),
            );

            return;
          }

          setItems(
            (current) =>
              current.map(
                (item) =>
                  item.productId ===
                    productId &&
                  item.variantId ===
                    variantId
                    ? {
                        ...item,
                        quantity:
                          next,
                      }
                    : item,
              ),
          );
        },

        clearCart() {
          setItems([]);
        },

        getItem(
          productId,
          variantId,
        ) {
          return items.find(
            (item) =>
              item.productId ===
                productId &&
              item.variantId ===
                variantId,
          );
        },
      };
    },
    [items],
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider.",
    );
  }

  return context;
}