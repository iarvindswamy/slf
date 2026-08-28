import Link from "next/link";

export default function DomesticPage() {
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
              Domestic Logistics
            </span>

            <h1>Reliable Shipping Across India</h1>

            <p>
              Domestic logistics solutions for individuals, businesses and
              commercial shipments requiring dependable movement within India.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Domestic logistics"
                />
              </div>

              <div>
                <span className="section-label">Domestic Shipping</span>

                <h2 className="section-title">
                  From Pickup to Delivery, Stay Connected
                </h2>

                <p className="section-description">
                  Our domestic logistics experience is designed around
                  dependable movement and convenient shipment visibility.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>Domestic parcel and document movement.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Business and commercial shipping support.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Shipment tracking using the AWB.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Pickup coordination based on shipment requirements.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <span className="section-label">Built for Different Requirements</span>

            <h2 className="section-title">
              Domestic Shipping That Fits Your Business
            </h2>

            <div className="card-grid" style={{ marginTop: 40 }}>
              <div className="service-card">
                <div className="service-icon">⚡</div>
                <h3>Express Shipments</h3>
                <p>
                  For time-sensitive documents, parcels and business
                  requirements.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">▣</div>
                <h3>Regular Shipments</h3>
                <p>
                  Flexible domestic movement for routine personal and business
                  shipments.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">⚓</div>
                <h3>Commercial Cargo</h3>
                <p>
                  Larger shipments requiring structured logistics coordination.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">⌖</div>
                <h3>Pickup Support</h3>
                <p>
                  Convenient pickup requests from your preferred location.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <h2 className="section-title">
              Send Your Next Domestic Shipment With Sreshta
            </h2>

            <p className="section-description">
              Start a booking or request a pickup from your location.
            </p>

            <div className="hero-actions" style={{ marginTop: 28 }}>
              <Link href="/logistics/book-freight" className="btn-primary">
                Book Freight
              </Link>

              <Link href="/logistics/pickup-request" className="btn-secondary">
                Request Pickup
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
              Reliable domestic, international and freight logistics
              solutions.
            </p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href="/logistics/international">International</Link>
              <Link href="/logistics/domestic">Domestic</Link>
              <Link href="/logistics/cargo-freight">Cargo</Link>
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