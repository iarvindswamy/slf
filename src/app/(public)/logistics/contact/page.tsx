"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
            <Link href="/logistics/track" className="btn-secondary">
              Track
            </Link>
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
              Contact Sreshta
            </span>

            <h1>Let&apos;s Talk About Your Logistics Requirement</h1>

            <p>
              Reach out to our team for shipment, freight, pickup or business
              partnership requirements.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Get in Touch</span>

                <h2 className="section-title">
                  We&apos;re Here to Help With Your Shipment
                </h2>

                <p className="section-description">
                  Contact the Sreshta team using the details below or submit
                  the enquiry form.
                </p>

                <div style={{ display: "grid", gap: 18, marginTop: 30 }}>
                  <div className="service-card">
                    <div className="service-icon">☎</div>
                    <h3>Managing Director</h3>
                    <p>Tummala Santosh Kumar</p>
                    <p style={{ marginTop: 5 }}>
                      <a href="tel:+919493924742">+91 94939 24742</a>
                    </p>
                  </div>

                  <div className="service-card">
                    <div className="service-icon">☎</div>
                    <h3>Partner</h3>
                    <p>Yaragalla Kalyan</p>
                    <p style={{ marginTop: 5 }}>
                      <a href="tel:+918712164677">+91 87121 64677</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-shell">
                <span className="section-label">Send a Message</span>

                <h2 className="section-title" style={{ fontSize: "2rem" }}>
                  Contact Form
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="form-grid" style={{ marginTop: 28 }}>
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input
                        className="input"
                        name="name"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input
                        className="input"
                        name="phone"
                        type="tel"
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label">Email *</label>
                      <input
                        className="input"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label">Subject</label>
                      <input
                        className="input"
                        name="subject"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label">Message *</label>
                      <textarea
                        className="textarea"
                        name="message"
                        placeholder="Write your message"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-primary" type="submit">
                      Send Message →
                    </button>
                  </div>
                </form>

                {submitted && (
                  <div className="notice">
                    Your message has been captured in the frontend
                    demonstration. Real message submission will be connected
                    through the backend/API phase.
                  </div>
                )}
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
            <p>
              Professional domestic, international and freight logistics.
            </p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href="/logistics/services">All Services</Link>
              <Link href="/logistics/domestic">Domestic</Link>
              <Link href="/logistics/international">International</Link>
            </div>
          </div>

          <div>
            <h3>Track</h3>
            <div className="footer-links">
              <Link href="/logistics/track">Track Shipment</Link>
              <Link href="/logistics/book-freight">Book Freight</Link>
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