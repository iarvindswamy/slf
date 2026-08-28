import Link from "next/link";

export default function PartnershipPage() {
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
            <Link href="/logistics/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Partnership
            </span>

            <h1>Build Better Logistics Relationships With Sreshta</h1>

            <p>
              We work toward long-term logistics relationships with businesses
              and partners who value reliability, communication and operational
              visibility.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Business Partnerships</span>

                <h2 className="section-title">
                  Logistics Support That Grows With Your Requirements
                </h2>

                <p className="section-description">
                  Sreshta is designed to support businesses with recurring
                  domestic, international and freight requirements.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>Business-focused logistics coordination.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Support for recurring shipment requirements.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Shipment visibility and tracking.</span>
                  </li>

                  <li>
                    <span className="check">✓</span>
                    <span>Dedicated communication around logistics needs.</span>
                  </li>
                </ul>
              </div>

              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Sreshta logistics partnership"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <span className="section-label">Who We Work With</span>

            <h2 className="section-title">
              Partnership Opportunities Across Logistics
            </h2>

            <div className="card-grid" style={{ marginTop: 40 }}>
              {[
                ["Business Shippers", "Businesses with regular shipment requirements."],
                ["Commercial Customers", "Customers moving goods and commercial consignments."],
                ["Logistics Partners", "Partners supporting coordinated shipment movement."],
                ["Growing Businesses", "Businesses looking for dependable logistics support as they scale."],
              ].map(([title, text]) => (
                <div className="service-card" key={title}>
                  <div className="service-icon">↗</div>
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
              Interested in Working With Sreshta?
            </h2>

            <p className="section-description">
              Contact our team and tell us about your business requirement.
            </p>

            <div style={{ marginTop: 28 }}>
              <Link href="/logistics/contact" className="btn-primary">
                Start a Conversation →
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
            <p>Professional logistics for businesses and individuals.</p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href="/logistics/services">Services</Link>
              <Link href="/logistics/cargo-freight">Cargo</Link>
              <Link href="/logistics/international">International</Link>
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