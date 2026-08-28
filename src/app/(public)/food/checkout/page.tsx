// "use client";

// import Link from "next/link";
// import { FormEvent, useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// type CartItem = {
//   productId: string;
//   variantId: string;
//   productName: string;
//   variantLabel: string;
//   price: number;
//   quantity: number;
//   image: string;
// };

// export default function CheckoutPage() {
//   const router = useRouter();

//   const [items, setItems] = useState<CartItem[]>([]);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     const raw = localStorage.getItem("sreshta-food-cart");

//     if (!raw) return;

//     try {
//       setItems(JSON.parse(raw));
//     } catch {
//       setItems([]);
//     }
//   }, []);

//   const subtotal = useMemo(
//     () =>
//       items.reduce(
//         (total, item) =>
//           total + item.price * item.quantity,
//         0,
//       ),
//     [items],
//   );

//   const deliveryFee =
//     subtotal > 999 || subtotal === 0 ? 0 : 60;

//   const discount = 0;
//   const total = subtotal - discount + deliveryFee;

//   function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (items.length === 0) {
//       return;
//     }

//     setSubmitting(true);

//     const form = new FormData(event.currentTarget);

//     const orderId = `SFO-${Date.now()
//       .toString()
//       .slice(-8)}`;

//     const order = {
//       orderId,
//       status: "PENDING_PAYMENT",
//       paymentStatus: "PENDING",
//       customer: {
//         name: String(form.get("name") || ""),
//         phone: String(form.get("phone") || ""),
//         email: String(form.get("email") || ""),
//       },
//       shipping: {
//         address: String(form.get("address") || ""),
//         city: String(form.get("city") || ""),
//         state: String(form.get("state") || ""),
//         pinCode: String(form.get("pinCode") || ""),
//       },
//       items,
//       subtotal,
//       discount,
//       deliveryFee,
//       total,
//       createdAt: new Date().toISOString(),
//     };

//     localStorage.setItem(
//       "sreshta-food-last-order",
//       JSON.stringify(order),
//     );

//     /*
//      * FRONTEND-ONLY MOCK
//      *
//      * Real implementation will:
//      *
//      * POST /api/food/orders
//      *       ↓
//      * Create local order
//      *       ↓
//      * POST /api/payments/cashfree/create-order
//      *       ↓
//      * Cashfree payment
//      *       ↓
//      * Server-side webhook verification
//      *       ↓
//      * Mark order PAID
//      */

//     setTimeout(() => {
//       localStorage.removeItem("sreshta-food-cart");

//       router.push(
//         `/food/order-success?orderId=${encodeURIComponent(
//           orderId,
//         )}`,
//       );
//     }, 700);
//   }

//   if (items.length === 0) {
//     return (
//       <>
//         <header className="site-header">
//           <div className="container-site header-inner">
//             <Link href="/food">
//               <img
//                 src="/images/sreshta-food-logo.png"
//                 alt="Sreshta Foods"
//                 className="header-logo"
//               />
//             </Link>

//             <Link
//               href="/food/products"
//               className="btn-primary"
//               style={{ background: "#d97706" }}
//             >
//               Shop Products
//             </Link>
//           </div>
//         </header>

//         <main className="section">
//           <div
//             className="container-site"
//             style={{
//               textAlign: "center",
//               paddingTop: 80,
//               paddingBottom: 80,
//             }}
//           >
//             <h1 style={{ color: "#451a03" }}>
//               Your cart is empty
//             </h1>

//             <p>
//               Add products before continuing to checkout.
//             </p>

//             <Link
//               href="/food/products"
//               className="btn-primary"
//               style={{
//                 marginTop: 20,
//                 background: "#d97706",
//               }}
//             >
//               Browse Products
//             </Link>
//           </div>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/food">
//             <img
//               src="/images/sreshta-food-logo.png"
//               alt="Sreshta Foods"
//               className="header-logo"
//             />
//           </Link>

//           <Link
//             href="/food/cart"
//             className="btn-secondary"
//           >
//             ← Back to Cart
//           </Link>
//         </div>
//       </header>

//       <main>
//         <section
//           style={{
//             background: "#fff7ed",
//             padding: "65px 0",
//           }}
//         >
//           <div className="container-site">
//             <span
//               className="section-label"
//               style={{ color: "#b45309" }}
//             >
//               Checkout
//             </span>

//             <h1
//               className="section-title"
//               style={{ color: "#451a03" }}
//             >
//               Complete Your Order
//             </h1>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1.4fr .8fr",
//                 gap: 30,
//                 alignItems: "start",
//               }}
//             >
//               <div className="form-shell">
//                 <span
//                   className="section-label"
//                   style={{ color: "#b45309" }}
//                 >
//                   Customer Details
//                 </span>

//                 <h2
//                   className="section-title"
//                   style={{
//                     color: "#451a03",
//                     fontSize: "2rem",
//                   }}
//                 >
//                   Delivery Information
//                 </h2>

//                 <form onSubmit={handleSubmit}>
//                   <div
//                     className="form-grid"
//                     style={{ marginTop: 28 }}
//                   >
//                     <div className="form-group">
//                       <label
//                         className="form-label"
//                         htmlFor="name"
//                       >
//                         Full Name *
//                       </label>

//                       <input
//                         id="name"
//                         name="name"
//                         className="input"
//                         placeholder="Your full name"
//                         required
//                       />
//                     </div>

//                     <div className="form-group">
//                       <label
//                         className="form-label"
//                         htmlFor="phone"
//                       >
//                         Phone *
//                       </label>

//                       <input
//                         id="phone"
//                         name="phone"
//                         className="input"
//                         type="tel"
//                         placeholder="10-digit phone number"
//                         required
//                       />
//                     </div>

//                     <div className="form-group full">
//                       <label
//                         className="form-label"
//                         htmlFor="email"
//                       >
//                         Email *
//                       </label>

//                       <input
//                         id="email"
//                         name="email"
//                         className="input"
//                         type="email"
//                         placeholder="you@example.com"
//                         required
//                       />
//                     </div>

//                     <div className="form-group full">
//                       <label
//                         className="form-label"
//                         htmlFor="address"
//                       >
//                         Delivery Address *
//                       </label>

//                       <textarea
//                         id="address"
//                         name="address"
//                         className="textarea"
//                         placeholder="House / flat, street, locality"
//                         required
//                       />
//                     </div>

//                     <div className="form-group">
//                       <label
//                         className="form-label"
//                         htmlFor="city"
//                       >
//                         City *
//                       </label>

//                       <input
//                         id="city"
//                         name="city"
//                         className="input"
//                         placeholder="City"
//                         required
//                       />
//                     </div>

//                     <div className="form-group">
//                       <label
//                         className="form-label"
//                         htmlFor="state"
//                       >
//                         State *
//                       </label>

//                       <input
//                         id="state"
//                         name="state"
//                         className="input"
//                         placeholder="State"
//                         required
//                       />
//                     </div>

//                     <div className="form-group">
//                       <label
//                         className="form-label"
//                         htmlFor="pinCode"
//                       >
//                         PIN Code *
//                       </label>

//                       <input
//                         id="pinCode"
//                         name="pinCode"
//                         className="input"
//                         placeholder="PIN code"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       marginTop: 28,
//                       border: "1px solid #f0e5d6",
//                       borderRadius: 10,
//                       background: "#fffaf5",
//                       padding: 16,
//                     }}
//                   >
//                     <strong style={{ color: "#451a03" }}>
//                       Payment
//                     </strong>

//                     <p
//                       style={{
//                         margin: "7px 0 0",
//                         color: "#78716c",
//                         fontSize: 13,
//                       }}
//                     >
//                       Online payment will be processed through Cashfree after
//                       backend integration.
//                     </p>
//                   </div>

//                   <button
//                     className="btn-primary"
//                     type="submit"
//                     disabled={submitting}
//                     style={{
//                       marginTop: 25,
//                       width: "100%",
//                       background: "#d97706",
//                       minHeight: 54,
//                     }}
//                   >
//                     {submitting
//                       ? "Creating Order..."
//                       : `Continue to Payment · ₹${total}`}
//                   </button>
//                 </form>
//               </div>

//               <aside
//                 style={{
//                   border: "1px solid #f0e5d6",
//                   borderRadius: 14,
//                   background: "#fffaf5",
//                   padding: 25,
//                   position: "sticky",
//                   top: 100,
//                 }}
//               >
//                 <h2
//                   style={{
//                     color: "#451a03",
//                     marginTop: 0,
//                   }}
//                 >
//                   Order Summary
//                 </h2>

//                 <div
//                   style={{
//                     display: "grid",
//                     gap: 14,
//                   }}
//                 >
//                   {items.map((item) => (
//                     <div
//                       key={`${item.productId}-${item.variantId}`}
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         gap: 15,
//                       }}
//                     >
//                       <div>
//                         <strong
//                           style={{
//                             color: "#451a03",
//                             fontSize: 13,
//                           }}
//                         >
//                           {item.productName}
//                         </strong>

//                         <div
//                           style={{
//                             color: "#78716c",
//                             fontSize: 12,
//                           }}
//                         >
//                           {item.variantLabel} ×{" "}
//                           {item.quantity}
//                         </div>
//                       </div>

//                       <strong>
//                         ₹{item.price * item.quantity}
//                       </strong>
//                     </div>
//                   ))}

//                   <div
//                     style={{
//                       borderTop: "1px solid #eadbca",
//                       paddingTop: 15,
//                       display: "grid",
//                       gap: 10,
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span>Subtotal</span>
//                       <strong>₹{subtotal}</strong>
//                     </div>

//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span>Delivery</span>
//                       <strong>
//                         {deliveryFee === 0
//                           ? "FREE"
//                           : `₹${deliveryFee}`}
//                       </strong>
//                     </div>

//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         fontSize: 19,
//                         color: "#451a03",
//                       }}
//                     >
//                       <strong>Total</strong>
//                       <strong>₹{total}</strong>
//                     </div>
//                   </div>
//                 </div>
//               </aside>
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }











"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image?: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

type CreateOrderData = {
  orderId: string;
  order?: {
    orderId: string;
    total: number;
    status: string;
    paymentStatus: string;
  };
};

type CashfreeCreateData = {
  orderId: string;
  paymentReferenceId?: string;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  orderStatus?: string;
};

const CART_STORAGE_KEY = "sreshta-food-cart";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank";
      }) => Promise<unknown>;
    };
  }
}

function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cashfree can only load in the browser."));
      return;
    }

    if (window.Cashfree) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-cashfree="sdk"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Cashfree SDK.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfree = "sdk";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Cashfree SDK."));
    document.body.appendChild(script);
  });
}

function getCashfreeMode(): "sandbox" | "production" {
  const env =
    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT ||
    process.env.NEXT_PUBLIC_CASHFREE_MODE;

  return env === "production" ? "production" : "sandbox";
}

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);

      if (!raw) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) {
        setItems([]);
        return;
      }

      const normalized = parsed
        .map((row) => {
          const item = row as Record<string, unknown>;
          const productId = String(item.productId || "").trim();
          const variantId = String(item.variantId || "").trim();

          if (!productId || !variantId) return null;

          return {
            productId,
            variantId,
            productName: String(
              item.productName || item.name || "Product",
            ),
            variantLabel: String(
              item.variantLabel ||
                item.variantName ||
                item.label ||
                "Variant",
            ),
            price: Number(item.price || 0),
            quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
            image: item.image
              ? String(item.image)
              : item.imageUrl
                ? String(item.imageUrl)
                : undefined,
          } satisfies CartItem;
        })
        .filter(Boolean) as CartItem[];

      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const deliveryFee =
    subtotal > 999 || subtotal === 0 ? 0 : 60;

  const discount = 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0 || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(event.currentTarget);

      const name = String(form.get("name") || "").trim();
      const phone = String(form.get("phone") || "").trim();
      const email = String(form.get("email") || "").trim();
      const addressLine1 = String(form.get("address") || "").trim();
      const city = String(form.get("city") || "").trim();
      const state = String(form.get("state") || "").trim();
      const postalCode = String(form.get("pinCode") || "").trim();

      if (!name || !phone || !email || !addressLine1 || !city || !state || !postalCode) {
        throw new Error("Please fill in all required delivery fields.");
      }

      // 1) Create local food order (server is price authority)
      const orderRes = await fetch("/api/food/orders", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name,
            phone,
            email,
            addressLine1,
            city,
            state,
            postalCode,
            country: "India",
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          deliveryFee,
        }),
      });

      const orderJson =
        (await orderRes.json()) as ApiResponse<CreateOrderData>;

      if (!orderJson.success) {
        throw new Error(
          orderJson.error?.message || "Failed to create order.",
        );
      }

      const orderId = String(orderJson.data.orderId || "").trim();

      if (!orderId) {
        throw new Error("Order was created without an orderId.");
      }

      // Keep a lightweight client reference for success/track pages
      localStorage.setItem(
        "sreshta-food-last-order",
        JSON.stringify({
          orderId,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          total: orderJson.data.order?.total ?? total,
          createdAt: new Date().toISOString(),
        }),
      );

      // 2) Create Cashfree payment session
      const paymentRes = await fetch(
        "/api/payments/cashfree/create-order",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        },
      );

      const paymentJson =
        (await paymentRes.json()) as ApiResponse<CashfreeCreateData>;

      if (!paymentJson.success) {
        // Order exists; send user to success/track with pending payment
        throw new Error(
          paymentJson.error?.message ||
            "Order created, but payment session failed. You can retry payment from order tracking.",
        );
      }

      const paymentSessionId =
        paymentJson.data.paymentSessionId?.trim() || "";

      // Clear cart only after order + payment session succeed
      localStorage.removeItem(CART_STORAGE_KEY);
      setItems([]);

      // 3) Launch Cashfree Checkout when session is available
      if (paymentSessionId) {
        try {
          await loadCashfreeScript();

          if (!window.Cashfree) {
            throw new Error("Cashfree SDK is unavailable.");
          }

          const cashfree = window.Cashfree({
            mode: getCashfreeMode(),
          });

          await cashfree.checkout({
            paymentSessionId,
            redirectTarget: "_self",
          });

          // Cashfree redirects to return_url on completion.
          return;
        } catch (sdkError) {
          // Fallback: still land on success page with orderId
          console.error("Cashfree checkout launch failed", sdkError);
        }
      }

      // Fallback / no session: go to success (webhook still owns paid status)
      router.push(
        `/food/order-success?orderId=${encodeURIComponent(orderId)}`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to complete checkout. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="section">
        <div
          className="container-site"
          style={{ textAlign: "center", padding: "80px 0" }}
        >
          <h1 style={{ color: "#451a03" }}>Loading checkout…</h1>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <header className="site-header">
          <div className="container-site header-inner">
            <Link href="/food">
              <img
                src="/images/sreshta-food-logo.png"
                alt="Sreshta Foods"
                className="header-logo"
              />
            </Link>

            <Link
              href="/food/products"
              className="btn-primary"
              style={{ background: "#d97706" }}
            >
              Shop Products
            </Link>
          </div>
        </header>

        <main className="section">
          <div
            className="container-site"
            style={{
              textAlign: "center",
              paddingTop: 80,
              paddingBottom: 80,
            }}
          >
            <h1 style={{ color: "#451a03" }}>Your cart is empty</h1>
            <p>Add products before continuing to checkout.</p>
            <Link
              href="/food/products"
              className="btn-primary"
              style={{ marginTop: 20, background: "#d97706" }}
            >
              Browse Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="site-header">
        <div className="container-site header-inner">
          <Link href="/food">
            <img
              src="/images/sreshta-food-logo.png"
              alt="Sreshta Foods"
              className="header-logo"
            />
          </Link>

          <Link href="/food/cart" className="btn-secondary">
            ← Back to Cart
          </Link>
        </div>
      </header>

      <main>
        <section style={{ background: "#fff7ed", padding: "65px 0" }}>
          <div className="container-site">
            <span className="section-label" style={{ color: "#b45309" }}>
              Checkout
            </span>
            <h1 className="section-title" style={{ color: "#451a03" }}>
              Complete Your Order
            </h1>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr .8fr",
                gap: 30,
                alignItems: "start",
              }}
            >
              <div className="form-shell">
                <span className="section-label" style={{ color: "#b45309" }}>
                  Customer Details
                </span>

                <h2
                  className="section-title"
                  style={{ color: "#451a03", fontSize: "2rem" }}
                >
                  Delivery Information
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="form-grid" style={{ marginTop: 28 }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        className="input"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Phone *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        className="input"
                        type="tel"
                        placeholder="10-digit phone number"
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        className="input"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label" htmlFor="address">
                        Delivery Address *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        className="textarea"
                        placeholder="House / flat, street, locality"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="city">
                        City *
                      </label>
                      <input
                        id="city"
                        name="city"
                        className="input"
                        placeholder="City"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="state">
                        State *
                      </label>
                      <input
                        id="state"
                        name="state"
                        className="input"
                        placeholder="State"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pinCode">
                        PIN Code *
                      </label>
                      <input
                        id="pinCode"
                        name="pinCode"
                        className="input"
                        placeholder="PIN code"
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 28,
                      border: "1px solid #f0e5d6",
                      borderRadius: 10,
                      background: "#fffaf5",
                      padding: 16,
                    }}
                  >
                    <strong style={{ color: "#451a03" }}>Payment</strong>
                    <p
                      style={{
                        margin: "7px 0 0",
                        color: "#78716c",
                        fontSize: 13,
                      }}
                    >
                      You will be redirected to Cashfree to complete secure
                      online payment. Order status is confirmed only after
                      server-side payment verification.
                    </p>
                  </div>

                  {error && (
                    <div
                      style={{
                        marginTop: 16,
                        borderRadius: 10,
                        background: "#fef2f2",
                        color: "#b91c1c",
                        padding: "12px 14px",
                        fontSize: 14,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 25,
                      width: "100%",
                      background: "#d97706",
                      minHeight: 54,
                    }}
                  >
                    {submitting
                      ? "Creating order & opening payment…"
                      : `Continue to Payment · ₹${total}`}
                  </button>
                </form>
              </div>

              <aside
                style={{
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fffaf5",
                  padding: 25,
                  position: "sticky",
                  top: 100,
                }}
              >
                <h2 style={{ color: "#451a03", marginTop: 0 }}>
                  Order Summary
                </h2>

                <div style={{ display: "grid", gap: 14 }}>
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 15,
                      }}
                    >
                      <div>
                        <strong
                          style={{ color: "#451a03", fontSize: 13 }}
                        >
                          {item.productName}
                        </strong>
                        <div style={{ color: "#78716c", fontSize: 12 }}>
                          {item.variantLabel} × {item.quantity}
                        </div>
                      </div>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}

                  <div
                    style={{
                      borderTop: "1px solid #eadbca",
                      paddingTop: 15,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Subtotal</span>
                      <strong>₹{subtotal}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Delivery</span>
                      <strong>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 19,
                        color: "#451a03",
                      }}
                    >
                      <strong>Total</strong>
                      <strong>₹{total}</strong>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}