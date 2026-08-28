"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("sreshta-food-cart");

    if (!raw) return;

    try {
      setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  function saveCart(nextItems: CartItem[]) {
    setItems(nextItems);

    localStorage.setItem(
      "sreshta-food-cart",
      JSON.stringify(nextItems),
    );
  }

  function increase(index: number) {
    const next = [...items];
    next[index].quantity += 1;
    saveCart(next);
  }

  function decrease(index: number) {
    const next = [...items];

    if (next[index].quantity <= 1) {
      next.splice(index, 1);
    } else {
      next[index].quantity -= 1;
    }

    saveCart(next);
  }

  function remove(index: number) {
    const next = [...items];
    next.splice(index, 1);
    saveCart(next);
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 60;
  const discount = 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid #f0e5d6",
        }}
      >
        <div
          className="container-site"
          style={{
            minHeight: 78,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/food">
            <img
              src="/images/sreshta-food-logo.png"
              alt="Sreshta Foods"
              style={{ width: 165 }}
            />
          </Link>

          <nav style={{ display: "flex", gap: 25 }}>
            <Link href="/food">Home</Link>
            <Link href="/food/products">Products</Link>
          </nav>

          <Link
            href="/food/products"
            className="btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <main>
        <section
          style={{
            background: "#fff7ed",
            padding: "65px 0",
          }}
        >
          <div className="container-site">
            <span
              className="section-label"
              style={{ color: "#b45309" }}
            >
              Your Cart
            </span>

            <h1
              className="section-title"
              style={{ color: "#451a03" }}
            >
              Review Your Order
            </h1>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            {items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 80,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fffaf5",
                }}
              >
                <div style={{ fontSize: 50 }}>🛒</div>

                <h2 style={{ color: "#451a03" }}>
                  Your cart is empty
                </h2>

                <p style={{ color: "#78716c" }}>
                  Add some delicious products to get started.
                </p>

                <Link
                  href="/food/products"
                  className="btn-primary"
                  style={{
                    marginTop: 18,
                    background: "#d97706",
                  }}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr .8fr",
                  gap: 30,
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 14,
                  }}
                >
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr auto",
                        gap: 20,
                        alignItems: "center",
                        border: "1px solid #f0e5d6",
                        borderRadius: 14,
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 10,
                          background: "#fff8ef",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div>
                        <Link
                          href={`/food/products/${item.productId}`}
                          style={{
                            color: "#451a03",
                            fontWeight: 800,
                            fontSize: 17,
                          }}
                        >
                          {item.productName}
                        </Link>

                        <p
                          style={{
                            margin: "5px 0",
                            color: "#78716c",
                            fontSize: 13,
                          }}
                        >
                          {item.variantLabel}
                        </p>

                        <strong style={{ color: "#92400e" }}>
                          ₹{item.price}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => decrease(index)}
                            style={{
                              width: 32,
                              height: 32,
                              border: "1px solid #e7d8c6",
                              borderRadius: 7,
                              background: "#fff",
                            }}
                          >
                            −
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            type="button"
                            onClick={() => increase(index)}
                            style={{
                              width: 32,
                              height: 32,
                              border: "1px solid #e7d8c6",
                              borderRadius: 7,
                              background: "#fff",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <strong
                          style={{
                            color: "#451a03",
                            fontSize: 18,
                          }}
                        >
                          ₹{item.price * item.quantity}
                        </strong>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          style={{
                            display: "block",
                            marginTop: 12,
                            border: 0,
                            background: "transparent",
                            color: "#b91c1c",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <aside
                  style={{
                    position: "sticky",
                    top: 100,
                    border: "1px solid #f0e5d6",
                    borderRadius: 14,
                    padding: 25,
                    background: "#fffaf5",
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      color: "#451a03",
                    }}
                  >
                    Order Summary
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gap: 14,
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
                      <span>Discount</span>
                      <strong>₹{discount}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Delivery</span>
                      <strong>
                        {deliveryFee === 0
                          ? "FREE"
                          : `₹${deliveryFee}`}
                      </strong>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #eadbca",
                        paddingTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#451a03",
                        fontSize: 19,
                      }}
                    >
                      <strong>Total</strong>
                      <strong>₹{total}</strong>
                    </div>
                  </div>

                  <Link
                    href="/food/checkout"
                    className="btn-primary"
                    style={{
                      width: "100%",
                      marginTop: 25,
                      background: "#d97706",
                    }}
                  >
                    Proceed to Checkout →
                  </Link>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}