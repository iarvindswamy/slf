// import Link from "next/link";

// const services = [
//   {
//     title: "International Logistics",
//     description:
//       "International shipment solutions for documents, parcels and commercial consignments with professional coordination.",
//     icon: "✈",
//     href: "/logistics/international",
//   },
//   {
//     title: "Domestic Logistics",
//     description:
//       "Reliable domestic movement across India for personal, business and commercial shipping requirements.",
//     icon: "▣",
//     href: "/logistics/domestic",
//   },
//   {
//     title: "Cargo & Freight",
//     description:
//       "Flexible solutions for larger shipments, commercial cargo and freight movement.",
//     icon: "⚓",
//     href: "/logistics/cargo-freight",
//   },
//   {
//     title: "Pickup Requests",
//     description:
//       "Request shipment pickup from your location and allow our team to coordinate the next steps.",
//     icon: "⌖",
//     href: "/logistics/pickup-request",
//   },
// ];

// function Header() {
//   return (
//     <header className="site-header">
//       <div className="container-site header-inner">
//         <Link href="/logistics">
//           <img
//             src="/images/sreshta-logistics-logo.png"
//             alt="Sreshta Logistics"
//             className="header-logo"
//           />
//         </Link>

//         <nav className="desktop-nav">
//           <Link href="/logistics">Home</Link>
//           <Link href="/logistics/services">Services</Link>
//           <Link href="/logistics/international">International</Link>
//           <Link href="/logistics/domestic">Domestic</Link>
//           <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//           <Link href="/logistics/about">About</Link>
//           <Link href="/logistics/contact">Contact</Link>
//         </nav>

//         <div className="header-actions">
//           <Link href="/logistics/track" className="btn-secondary">
//             Track
//           </Link>
//           <Link href="/logistics/book-freight" className="btn-primary">
//             Book a Freight
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

// function Footer() {
//   return (
//     <footer className="footer">
//       <div className="container-site footer-main">
//         <div>
//           <img
//             src="/images/sreshta-logistics-logo.png"
//             alt="Sreshta Logistics"
//             className="footer-logo"
//           />
//           <p>
//             Reliable domestic, international and freight solutions with
//             shipment visibility.
//           </p>
//         </div>

//         <div>
//           <h3>Services</h3>
//           <div className="footer-links">
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/pickup-request">Pickup Request</Link>
//           </div>
//         </div>

//         <div>
//           <h3>Company</h3>
//           <div className="footer-links">
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/partnership">Partnership</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </div>
//         </div>

//         <div>
//           <h3>Contact</h3>
//           <div className="footer-links">
//             <a href="tel:+919493924742">+91 94939 24742</a>
//             <a href="tel:+918712164677">+91 87121 64677</a>
//           </div>
//         </div>
//       </div>

//       <div className="container-site footer-bottom">
//         © {new Date().getFullYear()} Sreshta Logistics.
//       </div>
//     </footer>
//   );
// }

// export default function ServicesPage() {
//   return (
//     <>
//       <Header />

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Sreshta Logistics
//             </span>

//             <h1>Logistics Services Built Around Your Shipment</h1>

//             <p>
//               From individual documents to commercial cargo, choose a service
//               designed around your destination, shipment type and delivery
//               requirement.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <span className="section-label">Our Core Services</span>

//             <h2 className="section-title">
//               One Logistics Platform. Multiple Shipping Solutions.
//             </h2>

//             <p className="section-description">
//               Sreshta brings domestic, international, freight and pickup
//               requirements into one connected logistics experience.
//             </p>

//             <div className="card-grid" style={{ marginTop: 42 }}>
//               {services.map((service) => (
//                 <Link
//                   key={service.title}
//                   href={service.href}
//                   className="service-card"
//                 >
//                   <div className="service-icon">{service.icon}</div>
//                   <h3>{service.title}</h3>
//                   <p>{service.description}</p>

//                   <div
//                     style={{
//                       marginTop: 20,
//                       color: "var(--logistics-teal-dark)",
//                       fontSize: ".82rem",
//                       fontWeight: 750,
//                     }}
//                   >
//                     Learn More →
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section" style={{ background: "#f5f8fb" }}>
//           <div className="container-site">
//             <div className="split-grid">
//               <div className="image-card">
//                 <img
//                   src="/images/logistics-hero-bg.jpg"
//                   alt="Sreshta logistics transportation"
//                 />
//               </div>

//               <div>
//                 <span className="section-label">Why Sreshta</span>

//                 <h2 className="section-title">
//                   Designed Around Visibility and Reliability
//                 </h2>

//                 <p className="section-description">
//                   The Sreshta logistics experience is designed to make booking,
//                   tracking and communication easier for customers and
//                   businesses.
//                 </p>

//                 <ul className="feature-list">
//                   <li>
//                     <span className="check">✓</span>
//                     <span>Professional domestic and international services.</span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>Flexible cargo and freight options.</span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>Simple online tracking using your AWB.</span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>Convenient booking and pickup requests.</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="section dark-section">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#6de1e5" }}>
//               Start Shipping
//             </span>

//             <h2 className="section-title">
//               Have a Shipment Requirement?
//             </h2>

//             <p className="section-description">
//               Book a freight shipment or request a pickup from your location.
//             </p>

//             <div style={{ marginTop: 28 }}>
//               <Link href="/logistics/book-freight" className="btn-primary">
//                 Book a Freight →
//               </Link>
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </>
//   );
// }












import Link from "next/link";

import { CONTACTS, ROUTES } from "@/utils/constants";

export const dynamic = "force-dynamic";

type ServiceCard = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

/** Marketing fallback when Firestore has no public service records */
const FALLBACK_SERVICES: ServiceCard[] = [
  {
    title: "International Logistics",
    description:
      "International shipment solutions for documents, parcels and commercial consignments with professional coordination.",
    icon: "✈",
    href: ROUTES.LOGISTICS_INTERNATIONAL,
  },
  {
    title: "Domestic Logistics",
    description:
      "Reliable domestic movement across India for personal, business and commercial shipping requirements.",
    icon: "▣",
    href: ROUTES.LOGISTICS_DOMESTIC,
  },
  {
    title: "Cargo & Freight",
    description:
      "Flexible solutions for larger shipments, commercial cargo and freight movement.",
    icon: "⚓",
    href: ROUTES.LOGISTICS_CARGO,
  },
  {
    title: "Pickup Requests",
    description:
      "Request shipment pickup from your location and allow our team to coordinate the next steps.",
    icon: "⌖",
    href: ROUTES.LOGISTICS_PICKUP,
  },
];

function mapServiceTypeToHref(type?: string): string {
  const value = String(type || "").toUpperCase();

  if (value.includes("INTERNATIONAL") || value.includes("AIR")) {
    return ROUTES.LOGISTICS_INTERNATIONAL;
  }
  if (value.includes("DOMESTIC") || value.includes("SURFACE")) {
    return ROUTES.LOGISTICS_DOMESTIC;
  }
  if (value.includes("CARGO") || value.includes("FREIGHT")) {
    return ROUTES.LOGISTICS_CARGO;
  }

  return ROUTES.LOGISTICS_SERVICES;
}

function mapServiceTypeToIcon(type?: string): string {
  const value = String(type || "").toUpperCase();

  if (value.includes("INTERNATIONAL") || value.includes("AIR")) return "✈";
  if (value.includes("DOMESTIC") || value.includes("SURFACE")) return "▣";
  if (value.includes("CARGO") || value.includes("FREIGHT")) return "⚓";
  return "📦";
}

async function loadServices(): Promise<ServiceCard[]> {
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const { FIRESTORE_COLLECTIONS } = await import("@/utils/constants");

    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.SERVICES)
      .get();

    const fromDb: ServiceCard[] = snap.docs
      .map((doc) => {
        const data = doc.data();
        const enabled =
          data.enabled === undefined ? true : Boolean(data.enabled);

        if (!enabled) return null;

        return {
          title: String(data.name || data.title || "Service"),
          description: String(
            data.description ||
              "Professional logistics service available through Sreshta.",
          ),
          icon: mapServiceTypeToIcon(
            String(data.type || data.serviceType || ""),
          ),
          href: mapServiceTypeToHref(
            String(data.type || data.serviceType || ""),
          ),
        } satisfies ServiceCard;
      })
      .filter((item): item is ServiceCard => item !== null);

    if (fromDb.length > 0) {
      return fromDb;
    }
  } catch (error) {
    console.error("Failed to load services from Firestore:", error);
  }

  return FALLBACK_SERVICES;
}

function Header() {
  return (
    <header className="site-header">
      <div className="container-site header-inner">
        <Link href={ROUTES.LOGISTICS}>
          <img
            src="/images/sreshta-logistics-logo.png"
            alt="Sreshta Logistics"
            className="header-logo"
          />
        </Link>

        <nav className="desktop-nav">
          <Link href={ROUTES.LOGISTICS}>Home</Link>
          <Link href={ROUTES.LOGISTICS_SERVICES}>Services</Link>
          <Link href={ROUTES.LOGISTICS_INTERNATIONAL}>International</Link>
          <Link href={ROUTES.LOGISTICS_DOMESTIC}>Domestic</Link>
          <Link href={ROUTES.LOGISTICS_CARGO}>Cargo & Freight</Link>
          <Link href={ROUTES.LOGISTICS_ABOUT}>About</Link>
          <Link href={ROUTES.LOGISTICS_CONTACT}>Contact</Link>
        </nav>

        <div className="header-actions">
          <Link href={ROUTES.LOGISTICS_TRACK} className="btn-secondary">
            Track
          </Link>
          <Link href={ROUTES.LOGISTICS_BOOK} className="btn-primary">
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
          <p>
            Reliable domestic, international and freight solutions with
            shipment visibility.
          </p>
        </div>

        <div>
          <h3>Services</h3>
          <div className="footer-links">
            <Link href={ROUTES.LOGISTICS_INTERNATIONAL}>International</Link>
            <Link href={ROUTES.LOGISTICS_DOMESTIC}>Domestic</Link>
            <Link href={ROUTES.LOGISTICS_CARGO}>Cargo & Freight</Link>
            <Link href={ROUTES.LOGISTICS_PICKUP}>Pickup Request</Link>
          </div>
        </div>

        <div>
          <h3>Company</h3>
          <div className="footer-links">
            <Link href={ROUTES.LOGISTICS_ABOUT}>About</Link>
            <Link href={ROUTES.LOGISTICS_PARTNERSHIP}>Partnership</Link>
            <Link href={ROUTES.LOGISTICS_CONTACT}>Contact</Link>
          </div>
        </div>

        <div>
          <h3>Contact</h3>
          <div className="footer-links">
            <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
              +91 {CONTACTS.MANAGING_DIRECTOR.phone}
            </a>
            <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
              +91 {CONTACTS.PARTNER.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="container-site footer-bottom">
        © {new Date().getFullYear()} Sreshta Logistics.
      </div>
    </footer>
  );
}

export default async function ServicesPage() {
  const services = await loadServices();

  return (
    <>
      <Header />

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Sreshta Logistics
            </span>

            <h1>Logistics Services Built Around Your Shipment</h1>

            <p>
              From individual documents to commercial cargo, choose a service
              designed around your destination, shipment type and delivery
              requirement.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <span className="section-label">Our Core Services</span>

            <h2 className="section-title">
              One Logistics Platform. Multiple Shipping Solutions.
            </h2>

            <p className="section-description">
              Sreshta brings domestic, international, freight and pickup
              requirements into one connected logistics experience.
            </p>

            <div className="card-grid" style={{ marginTop: 42 }}>
              {services.map((service) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="service-card"
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <div
                    style={{
                      marginTop: 20,
                      color: "var(--logistics-teal-dark)",
                      fontSize: ".82rem",
                      fontWeight: 750,
                    }}
                  >
                    Learn More →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <div className="split-grid">
              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Sreshta logistics transportation"
                />
              </div>

              <div>
                <span className="section-label">Why Sreshta</span>

                <h2 className="section-title">
                  Designed Around Visibility and Reliability
                </h2>

                <p className="section-description">
                  The Sreshta logistics experience is designed to make booking,
                  tracking and communication easier for customers and
                  businesses.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>
                      Professional domestic and international services.
                    </span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Flexible cargo and freight options.</span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Simple online tracking using your AWB.</span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Convenient booking and pickup requests.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <span className="section-label" style={{ color: "#6de1e5" }}>
              Start Shipping
            </span>

            <h2 className="section-title">Have a Shipment Requirement?</h2>

            <p className="section-description">
              Book a freight shipment or request a pickup from your location.
            </p>

            <div style={{ marginTop: 28 }}>
              <Link href={ROUTES.LOGISTICS_BOOK} className="btn-primary">
                Book a Freight →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}