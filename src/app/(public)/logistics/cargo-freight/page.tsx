import Link from "next/link";

export default function CargoFreightPage() {
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
              Book a Freight
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Cargo & Freight
            </span>

            <h1>Move Larger Shipments With a Structured Logistics Approach</h1>

            <p>
              Freight solutions for commercial goods, larger consignments and
              shipments requiring coordinated movement.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Cargo Solutions</span>

                <h2 className="section-title">
                  Flexible Freight Support for Business
                </h2>

                <p className="section-description">
                  Sreshta Cargo & Freight services are designed for businesses
                  that need more than a standard parcel delivery.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>Commercial cargo coordination.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Freight shipment planning and documentation support.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Domestic and international freight requirements.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Shipment visibility using the Sreshta tracking flow.</span>
                  </li>
                </ul>

                <div style={{ marginTop: 28 }}>
                  <Link href="/logistics/book-freight" className="btn-primary">
                    Request Freight Booking →
                  </Link>
                </div>
              </div>

              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Cargo and freight logistics"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <span className="section-label">Freight Categories</span>

            <h2 className="section-title">
              Solutions for Different Cargo Requirements
            </h2>

            <div className="card-grid" style={{ marginTop: 40 }}>
              <div className="service-card">
                <div className="service-icon">⚓</div>
                <h3>Commercial Cargo</h3>
                <p>
                  Structured logistics support for commercial goods and
                  recurring business shipments.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">✈</div>
                <h3>Air Freight</h3>
                <p>
                  Air-oriented freight solutions for shipments where speed is
                  an important consideration.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">▣</div>
                <h3>Domestic Freight</h3>
                <p>
                  Freight movement across India for larger consignments and
                  commercial requirements.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">◎</div>
                <h3>International Freight</h3>
                <p>
                  Cross-border freight coordination for business and
                  commercial requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <h2 className="section-title">
              Have a Cargo or Freight Requirement?
            </h2>

            <p className="section-description">
              Tell us about your shipment and our team can coordinate the next
              step.
            </p>

            <div style={{ marginTop: 28 }}>
              <Link href="/logistics/pickup-request" className="btn-primary">
                Submit a Request →
              </Link>
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
              Professional logistics solutions for domestic, international
              and freight requirements.
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
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link href="/logistics/track">Track</Link>
              <Link href="/logistics/book-freight">Book</Link>
              <Link href="/logistics/contact">Contact</Link>
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