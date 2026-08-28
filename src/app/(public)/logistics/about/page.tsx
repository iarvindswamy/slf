import Link from "next/link";

export default function AboutPage() {
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
              About Sreshta
            </span>

            <h1>Moving Shipments With Trust, Visibility and Purpose</h1>

            <p>
              Sreshta Logistics is built around a simple idea: logistics should
              be professional, understandable and easy to track.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Our Approach</span>

                <h2 className="section-title">
                  Logistics That Works Around the Customer
                </h2>

                <p className="section-description">
                  We aim to combine dependable logistics operations with a
                  digital experience that makes booking, tracking and
                  communication easier.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>Professional service experience.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Clear shipment visibility.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Flexible logistics solutions.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Customer-focused communication.</span>
                  </li>
                </ul>
              </div>

              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Sreshta Logistics operations"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <span className="section-label">Our Focus</span>

            <h2 className="section-title">
              What We Want Customers to Experience
            </h2>

            <div className="stats-grid" style={{ marginTop: 40 }}>
              <div className="stat">
                <strong>Trust</strong>
                <span>Professional service</span>
              </div>

              <div className="stat">
                <strong>Speed</strong>
                <span>Efficient movement</span>
              </div>

              <div className="stat">
                <strong>Visibility</strong>
                <span>Shipment tracking</span>
              </div>

              <div className="stat">
                <strong>Support</strong>
                <span>Customer communication</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <h2 className="section-title">
              Let&apos;s Move Your Next Shipment
            </h2>

            <p className="section-description">
              Explore our services or contact the Sreshta team.
            </p>

            <div className="hero-actions" style={{ marginTop: 28 }}>
              <Link href="/logistics/services" className="btn-primary">
                Explore Services
              </Link>

              <Link href="/logistics/contact" className="btn-secondary">
                Contact Us
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
            <p>Professional logistics built around customer confidence.</p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href="/logistics/services">Services</Link>
              <Link href="/logistics/international">International</Link>
              <Link href="/logistics/domestic">Domestic</Link>
            </div>
          </div>

          <div>
            <h3>Company</h3>
            <div className="footer-links">
              <Link href="/logistics/about">About</Link>
              <Link href="/logistics/partnership">Partnership</Link>
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