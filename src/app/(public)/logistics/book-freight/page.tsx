// "use client";

// import Link from "next/link";
// import { FormEvent, useState } from "react";

// export default function BookFreightPage() {
//   const [submitted, setSubmitted] = useState(false);

//   function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setSubmitted(true);
//   }

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/logistics">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="header-logo"
//             />
//           </Link>

//           <nav className="desktop-nav">
//             <Link href="/logistics">Home</Link>
//             <Link href="/logistics/services">Services</Link>
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </nav>

//           <div className="header-actions">
//             <Link href="/logistics/track" className="btn-secondary">
//               Track
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Book a Freight
//             </span>

//             <h1>Tell Us About Your Shipment</h1>

//             <p>
//               Submit your shipment details and our logistics team can review
//               your requirement and coordinate the next step.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="form-shell">
//               <span className="section-label">Shipment Request</span>

//               <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                 Freight Booking Request
//               </h2>

//               <p className="section-description">
//                 Please provide the basic information below. Detailed
//                 operational AWB creation will happen through the logistics
//                 workflow.
//               </p>

//               <form onSubmit={handleSubmit}>
//                 <div className="form-grid" style={{ marginTop: 30 }}>
//                   <div className="form-group">
//                     <label className="form-label">Full Name *</label>
//                     <input
//                       className="input"
//                       name="name"
//                       placeholder="Your full name"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Phone *</label>
//                     <input
//                       className="input"
//                       name="phone"
//                       type="tel"
//                       placeholder="10-digit phone number"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Email</label>
//                     <input
//                       className="input"
//                       name="email"
//                       type="email"
//                       placeholder="you@example.com"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Shipment Type *</label>
//                     <select className="select" name="shipmentType" required>
//                       <option value="">Select shipment type</option>
//                       <option value="document">Document</option>
//                       <option value="parcel">Parcel</option>
//                       <option value="commercial">Commercial Shipment</option>
//                       <option value="cargo">Cargo / Freight</option>
//                     </select>
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Origin *</label>
//                     <input
//                       className="input"
//                       name="origin"
//                       placeholder="City / location"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Destination *</label>
//                     <input
//                       className="input"
//                       name="destination"
//                       placeholder="City / country"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Approximate Weight</label>
//                     <input
//                       className="input"
//                       name="weight"
//                       type="number"
//                       min="0"
//                       step="0.1"
//                       placeholder="Weight in kg"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Preferred Service</label>
//                     <select className="select" name="service">
//                       <option value="">Select service</option>
//                       <option value="international">International</option>
//                       <option value="domestic">Domestic</option>
//                       <option value="cargo">Cargo & Freight</option>
//                     </select>
//                   </div>

//                   <div className="form-group full">
//                     <label className="form-label">Additional Details</label>
//                     <textarea
//                       className="textarea"
//                       name="message"
//                       placeholder="Tell us anything important about the shipment."
//                     />
//                   </div>
//                 </div>

//                 <div className="form-actions">
//                   <button type="submit" className="btn-primary">
//                     Submit Booking Request →
//                   </button>
//                 </div>
//               </form>

//               {submitted && (
//                 <div className="notice">
//                   Your freight request has been captured in this frontend
//                   demonstration. Backend submission will be connected in the
//                   API integration phase.
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className="footer">
//         <div className="container-site footer-main">
//           <div>
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="footer-logo"
//             />
//             <p>Reliable logistics solutions for every shipment requirement.</p>
//           </div>

//           <div>
//             <h3>Services</h3>
//             <div className="footer-links">
//               <Link href="/logistics/international">International</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             </div>
//           </div>

//           <div>
//             <h3>Track</h3>
//             <div className="footer-links">
//               <Link href="/logistics/track">Track Shipment</Link>
//               <Link href="/logistics/pickup-request">Pickup Request</Link>
//             </div>
//           </div>

//           <div>
//             <h3>Contact</h3>
//             <div className="footer-links">
//               <a href="tel:+919493924742">+91 94939 24742</a>
//               <a href="tel:+918712164677">+91 87121 64677</a>
//             </div>
//           </div>
//         </div>

//         <div className="container-site footer-bottom">
//           © {new Date().getFullYear()} Sreshta Logistics.
//         </div>
//       </footer>
//     </>
//   );
// }












"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { CONTACTS, ROUTES } from "@/utils/constants";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; bookingRequestId: string }
  | { status: "error"; message: string };

export default function BookFreightPage() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      shipmentType: String(data.get("shipmentType") || "").trim(),
      origin: String(data.get("origin") || "").trim(),
      destination: String(data.get("destination") || "").trim(),
      weight: String(data.get("weight") || "").trim(),
      service: String(data.get("service") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/logistics/book-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          weight: payload.weight ? Number(payload.weight) : undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setState({
          status: "error",
          message:
            json?.error?.message ||
            "Unable to submit your request. Please try again.",
        });
        return;
      }

      setState({
        status: "success",
        bookingRequestId: String(
          json.data?.bookingRequestId || "",
        ),
      });

      form.reset();
    } catch {
      setState({
        status: "error",
        message:
          "Network error. Please check your connection and try again.",
      });
    }
  }

  return (
    <>
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
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Book a Freight
            </span>

            <h1>Tell Us About Your Shipment</h1>

            <p>
              Submit your shipment details and our logistics team can review
              your requirement and coordinate the next step.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="form-shell">
              <span className="section-label">Shipment Request</span>

              <h2 className="section-title" style={{ fontSize: "2rem" }}>
                Freight Booking Request
              </h2>

              <p className="section-description">
                Please provide the basic information below. Detailed
                operational AWB creation will happen through the logistics
                workflow.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginTop: 30 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="input"
                      name="name"
                      placeholder="Your full name"
                      required
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      className="input"
                      name="phone"
                      type="tel"
                      placeholder="10-digit phone number"
                      required
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="input"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipment Type *</label>
                    <select
                      className="select"
                      name="shipmentType"
                      required
                      disabled={state.status === "loading"}
                    >
                      <option value="">Select shipment type</option>
                      <option value="document">Document</option>
                      <option value="parcel">Parcel</option>
                      <option value="commercial">Commercial Shipment</option>
                      <option value="cargo">Cargo / Freight</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Origin *</label>
                    <input
                      className="input"
                      name="origin"
                      placeholder="City / location"
                      required
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination *</label>
                    <input
                      className="input"
                      name="destination"
                      placeholder="City / country"
                      required
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approximate Weight</label>
                    <input
                      className="input"
                      name="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Weight in kg"
                      disabled={state.status === "loading"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Service</label>
                    <select
                      className="select"
                      name="service"
                      disabled={state.status === "loading"}
                    >
                      <option value="">Select service</option>
                      <option value="international">International</option>
                      <option value="domestic">Domestic</option>
                      <option value="cargo">Cargo & Freight</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Additional Details</label>
                    <textarea
                      className="textarea"
                      name="message"
                      placeholder="Tell us anything important about the shipment."
                      disabled={state.status === "loading"}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={state.status === "loading"}
                  >
                    {state.status === "loading"
                      ? "Submitting..."
                      : "Submit Booking Request →"}
                  </button>
                </div>
              </form>

              {state.status === "success" && (
                <div className="notice" style={{ marginTop: 20 }}>
                  Your freight request was submitted successfully
                  {state.bookingRequestId
                    ? ` (Ref: ${state.bookingRequestId})`
                    : ""}
                  . Our team will contact you shortly.
                </div>
              )}

              {state.status === "error" && (
                <div
                  className="notice"
                  style={{
                    marginTop: 20,
                    background: "#fef2f2",
                    color: "#b91c1c",
                  }}
                >
                  {state.message}
                </div>
              )}
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
            <p>Reliable logistics solutions for every shipment requirement.</p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href={ROUTES.LOGISTICS_INTERNATIONAL}>International</Link>
              <Link href={ROUTES.LOGISTICS_DOMESTIC}>Domestic</Link>
              <Link href={ROUTES.LOGISTICS_CARGO}>Cargo & Freight</Link>
            </div>
          </div>

          <div>
            <h3>Track</h3>
            <div className="footer-links">
              <Link href={ROUTES.LOGISTICS_TRACK}>Track Shipment</Link>
              <Link href={ROUTES.LOGISTICS_PICKUP}>Pickup Request</Link>
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