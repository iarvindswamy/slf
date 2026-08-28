"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get("orderId") || "SFO-DEMO";

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
            Continue Shopping
          </Link>
        </div>
      </header>

      <main
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: "80px 20px",
          background: "#fffaf5",
        }}
      >
        <div
          style={{
            width: "min(650px, 100%)",
            textAlign: "center",
            border: "1px solid #f0e5d6",
            borderRadius: 18,
            background: "#fff",
            padding: 45,
            boxShadow: "0 20px 60px rgba(120,70,20,.08)",
          }}
        >
          <div
            style={{
              width: 75,
              height: 75,
              margin: "0 auto 25px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#15803d",
              fontSize: 35,
            }}
          >
            ✓
          </div>

          <span
            className="section-label"
            style={{
              color: "#b45309",
              justifyContent: "center",
            }}
          >
            Order Confirmed
          </span>

          <h1
            style={{
              margin: 0,
              color: "#451a03",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            }}
          >
            Thank You for Your Order!
          </h1>

          <p
            style={{
              color: "#78716c",
              marginTop: 18,
            }}
          >
            Your Sreshta Foods order has been created successfully.
          </p>

          <div
            style={{
              marginTop: 25,
              borderRadius: 10,
              background: "#fff7ed",
              padding: 18,
            }}
          >
            <span
              style={{
                display: "block",
                color: "#78716c",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Order ID
            </span>

            <strong
              style={{
                display: "block",
                marginTop: 5,
                color: "#92400e",
                fontSize: 22,
              }}
            >
              {orderId}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Link
              href={`/food/track/${encodeURIComponent(orderId)}`}
              className="btn-primary"
              style={{ background: "#d97706" }}
            >
              Track Order
            </Link>

            <Link
              href="/food/products"
              className="btn-secondary"
            >
              Continue Shopping
            </Link>
          </div>

          <p
            style={{
              marginTop: 25,
              color: "#a8a29e",
              fontSize: 12,
            }}
          >
            Payment verification and order status will be connected to the
            Cashfree/server workflow during backend integration.
          </p>
        </div>
      </main>
    </>
  );
}