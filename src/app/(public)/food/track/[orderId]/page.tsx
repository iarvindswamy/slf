"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

type TrackingData = {
  orderId: string;
  status: FoodOrderStatus;
  createdAt?: string;
  updatedAt?: string;
  city?: string;
  state?: string;
};

type TimelineStage = {
  code: FoodOrderStatus;
  title: string;
  description: string;
  state: "completed" | "current" | "pending" | "cancelled";
};

type ApiSuccess = {
  success: true;
  data: {
    tracking: {
      orderId: string;
      status: string;
      createdAt?: string;
      updatedAt?: string;
      shippingAddress?: {
        city?: string;
        state?: string;
      };
    };
  };
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

const STATUS_LABELS: Record<FoodOrderStatus, string> = {
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

const STATUS_DESCRIPTIONS: Record<FoodOrderStatus, string> = {
  PENDING_PAYMENT: "Your order is waiting for payment confirmation.",
  PAID: "Payment has been verified successfully.",
  CONFIRMED: "Your order has been confirmed by the store.",
  PROCESSING: "Your products are being prepared for dispatch.",
  PACKED: "Your order has been packed and is ready to ship.",
  SHIPPED: "Your order has been handed over for delivery.",
  OUT_FOR_DELIVERY: "Your order is on its way to your delivery address.",
  DELIVERED: "Your order has been successfully delivered.",
  CANCELLED: "This order has been cancelled.",
  REFUNDED: "Payment for this order has been refunded.",
};

/** Progressive journey shown for active orders */
const JOURNEY: FoodOrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function isFoodOrderStatus(value: string): value is FoodOrderStatus {
  return value in STATUS_LABELS;
}

function buildTimeline(status: FoodOrderStatus): TimelineStage[] {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return [
      {
        code: "PENDING_PAYMENT",
        title: STATUS_LABELS.PENDING_PAYMENT,
        description: STATUS_DESCRIPTIONS.PENDING_PAYMENT,
        state: "completed",
      },
      {
        code: status,
        title: STATUS_LABELS[status],
        description: STATUS_DESCRIPTIONS[status],
        state: "cancelled",
      },
    ];
  }

  const currentIndex = JOURNEY.indexOf(status);

  return JOURNEY.map((code, index) => {
    let state: TimelineStage["state"] = "pending";

    if (currentIndex === -1) {
      state = "pending";
    } else if (index < currentIndex) {
      state = "completed";
    } else if (index === currentIndex) {
      state = "current";
    }

    return {
      code,
      title: STATUS_LABELS[code],
      description: STATUS_DESCRIPTIONS[code],
      state,
    };
  });
}

function paymentLabel(status: FoodOrderStatus): {
  text: string;
  color: string;
} {
  if (
    status === "PENDING_PAYMENT"
  ) {
    return { text: "Pending", color: "#b45309" };
  }

  if (status === "CANCELLED") {
    return { text: "Cancelled", color: "#b91c1c" };
  }

  if (status === "REFUNDED") {
    return { text: "Refunded", color: "#b45309" };
  }

  return { text: "Paid", color: "#15803d" };
}

export default function FoodOrderTrackingPage() {
  const params = useParams<{ orderId: string }>();

  let orderId = String(params.orderId || "").trim();

  try {
    orderId = decodeURIComponent(orderId);
  } catch {
    // keep original
  }

  const [tracking, setTracking] = useState<TrackingData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Order ID is required.");
      setTracking(null);
      return;
    }

    let cancelled = false;

    async function loadTracking() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/food/tracking?orderId=${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const json = (await res.json()) as ApiSuccess | ApiError;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load order tracking.",
          );
        }

        const statusRaw = String(json.data.tracking.status || "");

        if (!isFoodOrderStatus(statusRaw)) {
          throw new Error("Order has an invalid status.");
        }

        if (!cancelled) {
          setTracking({
            orderId: String(
              json.data.tracking.orderId || orderId,
            ),
            status: statusRaw,
            createdAt: json.data.tracking.createdAt
              ? String(json.data.tracking.createdAt)
              : undefined,
            updatedAt: json.data.tracking.updatedAt
              ? String(json.data.tracking.updatedAt)
              : undefined,
            city: json.data.tracking.shippingAddress?.city
              ? String(json.data.tracking.shippingAddress.city)
              : undefined,
            state: json.data.tracking.shippingAddress?.state
              ? String(json.data.tracking.shippingAddress.state)
              : undefined,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load order tracking.",
          );
          setTracking(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTracking();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const stages = useMemo(() => {
    if (!tracking) {
      return [];
    }

    return buildTimeline(tracking.status);
  }, [tracking]);

  const payment = tracking
    ? paymentLabel(tracking.status)
    : null;

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

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <Link
              href="/food/products"
              className="btn-secondary"
            >
              Shop
            </Link>

            <Link
              href="/food/cart"
              className="btn-primary"
              style={{ background: "#d97706" }}
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section
          style={{
            background:
              "linear-gradient(115deg, #fff7ed, #ffedd5)",
            padding: "70px 0",
          }}
        >
          <div className="container-site">
            <span
              className="section-label"
              style={{ color: "#b45309" }}
            >
              Order Tracking
            </span>

            <h1
              className="section-title"
              style={{ color: "#451a03" }}
            >
              Track Your Order
            </h1>

            <p className="section-description">
              Order ID:{" "}
              <strong style={{ color: "#92400e" }}>
                {orderId || "—"}
              </strong>
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <h2 style={{ color: "#451a03", marginBottom: 8 }}>
                  Loading tracking...
                </h2>
                <p style={{ color: "#78716c", margin: 0 }}>
                  Please wait while we fetch your order status.
                </p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #fecaca",
                  borderRadius: 14,
                  background: "#fef2f2",
                  maxWidth: 850,
                  margin: "0 auto",
                }}
              >
                <h2 style={{ color: "#991b1b", marginBottom: 8 }}>
                  Tracking unavailable
                </h2>
                <p style={{ color: "#7f1d1d", margin: 0 }}>
                  {error}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ background: "#d97706" }}
                    onClick={() => window.location.reload()}
                  >
                    Try again
                  </button>
                  <Link
                    href="/food/products"
                    className="btn-secondary"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : tracking ? (
              <>
                <div
                  className="tracking-summary"
                  style={{
                    gridTemplateColumns: "repeat(3, 1fr)",
                  }}
                >
                  <div className="summary-box">
                    <span>Order ID</span>
                    <strong>{tracking.orderId}</strong>
                  </div>

                  <div className="summary-box">
                    <span>Current Status</span>
                    <strong style={{ color: "#d97706" }}>
                      {STATUS_LABELS[tracking.status]}
                    </strong>
                  </div>

                  <div className="summary-box">
                    <span>Payment</span>
                    <strong
                      style={{
                        color: payment?.color,
                      }}
                    >
                      {payment?.text}
                    </strong>
                  </div>
                </div>

                {(tracking.city || tracking.state) && (
                  <div
                    className="notice"
                    style={{
                      maxWidth: 850,
                      margin: "0 auto 25px",
                    }}
                  >
                    Delivery area:{" "}
                    <strong>
                      {[tracking.city, tracking.state]
                        .filter(Boolean)
                        .join(", ")}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    maxWidth: 850,
                    margin: "0 auto",
                  }}
                >
                  <h2
                    style={{
                      color: "#451a03",
                      fontSize: 28,
                      marginBottom: 30,
                    }}
                  >
                    Order Journey
                  </h2>

                  <div className="timeline">
                    {stages.map((stage) => (
                      <div
                        className={`timeline-item ${
                          stage.state !== "pending"
                            ? "active"
                            : ""
                        }`}
                        key={stage.code}
                      >
                        <span
                          className="timeline-dot"
                          style={{
                            background:
                              stage.state === "completed"
                                ? "#16a34a"
                                : stage.state === "current"
                                  ? "#d97706"
                                  : stage.state ===
                                      "cancelled"
                                    ? "#dc2626"
                                    : "#d2dee8",
                            boxShadow:
                              stage.state === "completed"
                                ? "0 0 0 1px #16a34a"
                                : stage.state === "current"
                                  ? "0 0 0 1px #d97706"
                                  : stage.state ===
                                      "cancelled"
                                    ? "0 0 0 1px #dc2626"
                                    : undefined,
                          }}
                        />

                        <div className="timeline-content">
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: 20,
                              flexWrap: "wrap",
                            }}
                          >
                            <h3>{stage.title}</h3>

                            <span
                              style={{
                                color:
                                  stage.state ===
                                  "completed"
                                    ? "#15803d"
                                    : stage.state ===
                                        "current"
                                      ? "#b45309"
                                      : stage.state ===
                                          "cancelled"
                                        ? "#b91c1c"
                                        : "#94a3b8",
                                fontWeight: 800,
                                fontSize: 11,
                                textTransform: "uppercase",
                              }}
                            >
                              {stage.state}
                            </span>
                          </div>

                          <p>{stage.description}</p>

                          {stage.code === "PENDING_PAYMENT" && (
                            <p style={{ marginTop: 8 }}>
                              Order reference:{" "}
                              <strong>
                                {tracking.orderId}
                              </strong>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section
          className="section"
          style={{
            background: "#fffaf5",
          }}
        >
          <div
            className="container-site"
            style={{
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#451a03" }}>
              Need Something Else?
            </h2>

            <p style={{ color: "#78716c" }}>
              Continue shopping or return to your order
              details.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <Link
                href="/food/products"
                className="btn-primary"
                style={{ background: "#d97706" }}
              >
                Continue Shopping
              </Link>

              {orderId && (
                <Link
                  href={`/food/order-success?orderId=${encodeURIComponent(
                    orderId,
                  )}`}
                  className="btn-secondary"
                >
                  Order Details
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}