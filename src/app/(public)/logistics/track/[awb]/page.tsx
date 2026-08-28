import Link from "next/link";
import { notFound } from "next/navigation";

import { TRACKING_STATUS_LABELS, CONTACTS } from "@/utils/constants";
import { formatDate, formatDateTime } from "@/utils/formatters";
import type { TrackingStatus } from "@/types/tracking";

export const dynamic = "force-dynamic";

type TrackingDetailPageProps = {
  params: {
    awb: string;
  };
};

type PublicEvent = {
  id: string;
  status: TrackingStatus;
  title: string;
  location: string;
  description: string;
  timestamp: string;
  active: boolean;
};

type PublicShipment = {
  awb: string;
  currentStatus: TrackingStatus;
  origin: string;
  destination: string;
  shipmentDate?: string;
  latestLocation?: string;
  serviceType?: string;
};

function formatAwb(awb: string) {
  try {
    return decodeURIComponent(awb).trim().toUpperCase();
  } catch {
    return awb.trim().toUpperCase();
  }
}

function statusTitle(status: TrackingStatus): string {
  return (
    TRACKING_STATUS_LABELS[status] ||
    status
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

async function loadTracking(awb: string): Promise<{
  shipment: PublicShipment | null;
  events: PublicEvent[];
  error: string | null;
}> {
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const { getTrackingEvents } = await import("@/lib/tracking");

    const snap = await adminDb
      .collection("awbs")
      .where("awb", "==", awb)
      .limit(1)
      .get();

    if (snap.empty) {
      return {
        shipment: null,
        events: [],
        error: "Shipment was not found for this AWB.",
      };
    }

    const data = snap.docs[0]!.data();
    const rawEvents = await getTrackingEvents(awb);

    const currentStatus = (data.currentStatus ||
      rawEvents[rawEvents.length - 1]?.status ||
      "BOOKED") as TrackingStatus;

    const shipment: PublicShipment = {
      awb: String(data.awb || awb),
      currentStatus,
      origin: String(data.origin || "—"),
      destination: String(data.destination || "—"),
      shipmentDate: data.shipmentDate
        ? String(data.shipmentDate)
        : undefined,
      latestLocation: data.latestLocation
        ? String(data.latestLocation)
        : rawEvents[rawEvents.length - 1]?.location,
      serviceType: data.serviceType
        ? String(data.serviceType)
        : data.service
          ? String(data.service)
          : undefined,
    };

    const events: PublicEvent[] = rawEvents.map((event, index) => ({
      id: event.id,
      status: event.status,
      title: statusTitle(event.status),
      location: event.location || "—",
      description:
        event.description ||
        `Shipment status updated to ${statusTitle(event.status)}.`,
      timestamp: event.timestamp
        ? formatDateTime(event.timestamp)
        : "—",
      active: true,
    }));

    const currentIndex = events.findIndex(
      (e) => e.status === currentStatus,
    );

    const normalizedEvents = events.map((event, index) => ({
      ...event,
      active:
        currentIndex === -1
          ? index === events.length - 1
          : index <= currentIndex,
    }));

    return { shipment, events: normalizedEvents, error: null };
  } catch (err) {
    console.error("Public tracking load failed:", err);
    return {
      shipment: null,
      events: [],
      error:
        "Unable to load tracking information right now. Please try again later.",
    };
  }
}

export default async function TrackingDetailPage({
  params,
}: TrackingDetailPageProps) {
  const awb = formatAwb(params.awb);

  if (!awb) {
    notFound();
  }

  const { shipment, events, error } = await loadTracking(awb);

  if (error || !shipment) {
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
                Track Another
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
                Shipment Tracking
              </span>
              <h1>Shipment {awb}</h1>
              <p>
                {error ||
                  "No public tracking information is available for this AWB."}
              </p>
            </div>
          </section>

          <section className="section">
            <div className="container-site" style={{ textAlign: "center" }}>
              <div
                className="form-shell"
                style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
              >
                <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                  Shipment not found
                </h2>
                <p className="section-description">
                  Please check the AWB number and try again. If you believe
                  this is an error, contact support.
                </p>
                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/logistics/track" className="btn-primary">
                    Track Another
                  </Link>
                  <Link href="/logistics/contact" className="btn-secondary">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container-site footer-bottom">
            © {new Date().getFullYear()} Sreshta Logistics.
          </div>
        </footer>
      </>
    );
  }

  const currentLabel = statusTitle(shipment.currentStatus);
  const latestLocation =
    shipment.latestLocation ||
    events[events.length - 1]?.location ||
    "—";

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
              Track Another
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
              Shipment Tracking
            </span>
            <h1>Shipment {shipment.awb}</h1>
            <p>
              Follow the current shipment status and public tracking timeline
              below.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="tracking-summary">
              <div className="summary-box">
                <span>AWB</span>
                <strong>{shipment.awb}</strong>
              </div>
              <div className="summary-box">
                <span>Current Status</span>
                <strong style={{ color: "var(--logistics-teal-dark)" }}>
                  {currentLabel}
                </strong>
              </div>
              <div className="summary-box">
                <span>Origin</span>
                <strong>{shipment.origin}</strong>
              </div>
              <div className="summary-box">
                <span>Destination</span>
                <strong>{shipment.destination}</strong>
              </div>
            </div>

            <div className="split-grid">
              <div>
                <span className="section-label">Tracking Timeline</span>
                <h2 className="section-title" style={{ fontSize: "2rem" }}>
                  Shipment Journey
                </h2>
                <p className="section-description">
                  Public tracking information is limited to shipment details
                  appropriate for customer visibility.
                </p>

                {events.length === 0 ? (
                  <div className="notice" style={{ marginTop: 35 }}>
                    No tracking events have been recorded yet for this AWB.
                  </div>
                ) : (
                  <div className="timeline" style={{ marginTop: 35 }}>
                    {events.map((event) => (
                      <div
                        className={`timeline-item ${
                          event.active ? "active" : ""
                        }`}
                        key={event.id}
                      >
                        <span className="timeline-dot" />
                        <div className="timeline-content">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 15,
                              flexWrap: "wrap",
                            }}
                          >
                            <h3>{event.title}</h3>
                            <span
                              style={{
                                color: event.active
                                  ? "var(--logistics-teal-dark)"
                                  : "#94a3b8",
                                fontSize: ".7rem",
                                fontWeight: 800,
                              }}
                            >
                              {event.status}
                            </span>
                          </div>
                          <p>{event.description}</p>
                          <p style={{ marginTop: 9 }}>
                            <strong>{event.location}</strong> ·{" "}
                            {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="form-shell" style={{ padding: 24 }}>
                  <span className="section-label">Shipment Details</span>
                  <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
                    <div>
                      <span className="form-label">Shipment Date</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {shipment.shipmentDate
                          ? formatDate(shipment.shipmentDate)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Latest Location</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {latestLocation}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Service</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {shipment.serviceType
                          ? shipment.serviceType
                              .toLowerCase()
                              .split("_")
                              .map(
                                (p) =>
                                  p.charAt(0).toUpperCase() + p.slice(1),
                              )
                              .join(" ")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Current Status</span>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "var(--logistics-teal-dark)",
                          fontWeight: 750,
                        }}
                      >
                        {currentLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="service-card" style={{ marginTop: 18 }}>
                  <div className="service-icon">?</div>
                  <h3>Need Help?</h3>
                  <p>
                    Contact the Sreshta team if you need assistance with this
                    shipment.
                  </p>
                  <div style={{ marginTop: 15 }}>
                    <Link href="/logistics/contact" className="btn-secondary">
                      Contact Support
                    </Link>
                  </div>
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
            <p>Reliable logistics with transparent shipment visibility.</p>
          </div>
          <div>
            <h3>Tracking</h3>
            <div className="footer-links">
              <Link href="/logistics/track">Track Another Shipment</Link>
              <Link href="/logistics/services">Services</Link>
            </div>
          </div>
          <div>
            <h3>Booking</h3>
            <div className="footer-links">
              <Link href="/logistics/book-freight">Book Freight</Link>
              <Link href="/logistics/pickup-request">Request Pickup</Link>
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
    </>
  );
}