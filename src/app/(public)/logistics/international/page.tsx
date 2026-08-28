import Link from "next/link";

function Header() {
  return (
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
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container-site footer-main">
        <div>
          <img
            src="/images/sreshta-logistics-logo.png"
            alt="Sreshta Logistics"
            className="footer-logo"
          />
          <p>Professional logistics solutions for movement across borders.</p>
        </div>

        <div>
          <h3>Services</h3>
          <div className="footer-links">
            <Link href="/logistics/international">International</Link>
            <Link href="/logistics/domestic">Domestic</Link>
            <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
          </div>
        </div>

        <div>
          <h3>Quick Links</h3>
          <div className="footer-links">
            <Link href="/logistics/track">Track Shipment</Link>
            <Link href="/logistics/book-freight">Book Freight</Link>
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
  );
}

export default function InternationalPage() {
  return (
    <>
      <Header />

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              International Logistics
            </span>

            <h1>Connect Your Shipments to Global Destinations</h1>

            <p>
              International logistics solutions designed for documents,
              parcels and commercial shipments requiring professional
              cross-border coordination.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">International Shipping</span>

                <h2 className="section-title">
                  Move Beyond Borders With Confidence
                </h2>

                <p className="section-description">
                  Sreshta International Logistics is designed to simplify
                  cross-border shipping through clear coordination, shipment
                  visibility and flexible service options.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>International document and parcel movement.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Commercial shipment coordination.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Shipment status visibility using AWB tracking.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Flexible shipping support for business requirements.</span>
                  </li>
                </ul>

                <div style={{ marginTop: 28 }}>
                  <Link href="/logistics/book-freight" className="btn-primary">
                    Discuss Your Shipment →
                  </Link>
                </div>
              </div>

              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="International logistics"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <span className="section-label">What We Focus On</span>

            <h2 className="section-title">
              A Professional International Shipping Experience
            </h2>

            <div className="card-grid" style={{ marginTop: 40 }}>
              {[
                ["01", "Secure Movement", "Shipment handling focused on safe movement."],
                ["02", "Visibility", "Track shipment progress using your AWB."],
                ["03", "Coordination", "Structured support for cross-border requirements."],
                ["04", "Business Support", "Solutions designed for recurring commercial shipments."],
              ].map(([number, title, text]) => (
                <div className="service-card" key={number}>
                  <span className="section-label">{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <h2 className="section-title">
              Need to Send a Shipment Internationally?
            </h2>

            <p className="section-description">
              Share your shipment requirement with our team.
            </p>

            <div style={{ marginTop: 28 }}>
              <Link href="/logistics/pickup-request" className="btn-primary">
                Request a Pickup →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}