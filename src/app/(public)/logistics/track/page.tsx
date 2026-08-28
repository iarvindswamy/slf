"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function TrackPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const awb = String(formData.get("awb") || "").trim();

    if (!awb) return;

    router.push(`/logistics/track/${encodeURIComponent(awb)}`);
  }

  return (
    <>
      <header className="site-header">
        <div className="container-site header-inner">
          <Link href="/logistics">
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta Logistics"
              className="header-logo"
            />
          </Link>

          <nav className="desktop-nav">
            <Link href="/logistics">Home</Link>
            <Link href="/logistics/services">Services</Link>
            <Link href="/logistics/international">International</Link>
            <Link href="/logistics/domestic">Domestic</Link>
            <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
            <Link href="/logistics/about">About</Link>
            <Link href="/logistics/contact">Contact</Link>
          </nav>

          <div className="header-actions">
            <Link href="/logistics/book-freight" className="btn-primary">
              Book Freight
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Shipment Tracking
            </span>

            <h1>Track Your Shipment</h1>

            <p>
              Enter your AWB number to view the latest shipment information.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="form-shell" style={{ maxWidth: 760 }}>
              <div style={{ textAlign: "center" }}>
                <span className="section-label">AWB Tracking</span>

                <h2 className="section-title" style={{ fontSize: "2.3rem" }}>
                  Where Is Your Shipment?
                </h2>

                <p className="section-description" style={{ marginInline: "auto" }}>
                  Enter your Air Waybill / tracking identifier below.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ marginTop: 32 }}
              >
                <label className="form-label" htmlFor="awb">
                  AWB Number
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  <input
                    id="awb"
                    name="awb"
                    className="input"
                    placeholder="Example: SRE123456789"
                    required
                  />

                  <button className="btn-primary" type="submit">
                    Track Now
                  </button>
                </div>
              </form>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginTop: 35,
                }}
              >
                <div className="summary-box">
                  <span>Track</span>
                  <strong>AWB</strong>
                </div>

                <div className="summary-box">
                  <span>View</span>
                  <strong>Status</strong>
                </div>

                <div className="summary-box">
                  <span>Follow</span>
                  <strong>Timeline</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Tracking Visibility</span>

                <h2 className="section-title">
                  Follow the Journey From Booking to Delivery
                </h2>

                <p className="section-description">
                  The tracking experience is designed around the shared
                  shipment status model used by the Sreshta logistics
                  platform.
                </p>
              </div>

              <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="service-card">
                  <div className="service-icon">✓</div>
                  <h3>Current Status</h3>
                  <p>See the latest shipment state.</p>
                </div>

                <div className="service-card">
                  <div className="service-icon">⌖</div>
                  <h3>Location</h3>
                  <p>View the latest available location.</p>
                </div>

                <div className="service-card">
                  <div className="service-icon">◷</div>
                  <h3>Timeline</h3>
                  <p>Follow shipment events in order.</p>
                </div>

                <div className="service-card">
                  <div className="service-icon">▣</div>
                  <h3>Shipment Details</h3>
                  <p>See relevant public shipment information.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-site footer-main">
          <div>
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta Logistics"
              className="footer-logo"
            />
            <p>Track your Sreshta shipment using your AWB number.</p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href="/logistics/services">Services</Link>
              <Link href="/logistics/domestic">Domestic</Link>
              <Link href="/logistics/international">International</Link>
            </div>
          </div>

          <div>
            <h3>Booking</h3>
            <div className="footer-links">
              <Link href="/logistics/book-freight">Book Freight</Link>
              <Link href="/logistics/pickup-request">Pickup</Link>
            </div>
          </div>

          <div>
            <h3>Contact</h3>
            <div className="footer-links">
              <a href="tel:+919493924742">+91 94939 24742</a>
              <a href="tel:+918712164677">+91 87121 64677</a>
            </div>
          </div>
        </div>

        <div className="container-site footer-bottom">
          © {new Date().getFullYear()} Sreshta Logistics.
        </div>
      </footer>
    </>
  );
}