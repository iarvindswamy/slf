// "use client";

// import Link from "next/link";
// import { FormEvent, useState } from "react";

// export default function PickupRequestPage() {
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
//             <Link href="/logistics/book-freight" className="btn-primary">
//               Book Freight
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Pickup Request
//             </span>

//             <h1>Schedule a Convenient Shipment Pickup</h1>

//             <p>
//               Tell us where and when your shipment should be collected and
//               provide the basic shipment information.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="form-shell">
//               <span className="section-label">Pickup Details</span>

//               <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                 Request a Pickup
//               </h2>

//               <form onSubmit={handleSubmit}>
//                 <div className="form-grid" style={{ marginTop: 30 }}>
//                   <div className="form-group">
//                     <label className="form-label">Name *</label>
//                     <input
//                       className="input"
//                       name="name"
//                       placeholder="Your name"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Phone *</label>
//                     <input
//                       className="input"
//                       name="phone"
//                       type="tel"
//                       placeholder="Phone number"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Email</label>
//                     <input
//                       className="input"
//                       name="email"
//                       type="email"
//                       placeholder="Email address"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Preferred Date *</label>
//                     <input
//                       className="input"
//                       name="date"
//                       type="date"
//                       required
//                     />
//                   </div>

//                   <div className="form-group full">
//                     <label className="form-label">Pickup Address *</label>
//                     <textarea
//                       className="textarea"
//                       name="address"
//                       placeholder="Complete pickup address"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">City *</label>
//                     <input
//                       className="input"
//                       name="city"
//                       placeholder="City"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">PIN Code *</label>
//                     <input
//                       className="input"
//                       name="pinCode"
//                       placeholder="PIN code"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Shipment Type *</label>
//                     <select className="select" name="shipmentType" required>
//                       <option value="">Select type</option>
//                       <option value="document">Document</option>
//                       <option value="parcel">Parcel</option>
//                       <option value="commercial">Commercial</option>
//                       <option value="cargo">Cargo / Freight</option>
//                     </select>
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

//                   <div className="form-group full">
//                     <label className="form-label">Additional Information</label>
//                     <textarea
//                       className="textarea"
//                       name="message"
//                       placeholder="Any instructions for the pickup team?"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-actions">
//                   <button type="submit" className="btn-primary">
//                     Submit Pickup Request →
//                   </button>
//                 </div>
//               </form>

//               {submitted && (
//                 <div className="notice">
//                   Your pickup request has been captured in the frontend
//                   demonstration. The real API submission will be connected
//                   during backend integration.
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
//             <p>Convenient pickup support for your shipment.</p>
//           </div>

//           <div>
//             <h3>Services</h3>
//             <div className="footer-links">
//               <Link href="/logistics/services">All Services</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/international">International</Link>
//             </div>
//           </div>

//           <div>
//             <h3>Quick Links</h3>
//             <div className="footer-links">
//               <Link href="/logistics/book-freight">Book Freight</Link>
//               <Link href="/logistics/track">Track</Link>
//               <Link href="/logistics/contact">Contact</Link>
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
  | { status: "success"; pickupRequestId: string }
  | { status: "error"; message: string };

export default function PickupRequestPage() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      date: String(data.get("date") || "").trim(),
      address: String(data.get("address") || "").trim(),
      city: String(data.get("city") || "").trim(),
      pinCode: String(data.get("pinCode") || "").trim(),
      shipmentType: String(data.get("shipmentType") || "").trim(),
      weight: String(data.get("weight") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/logistics/pickup-request", {
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
            "Unable to submit your pickup request. Please try again.",
        });
        return;
      }

      setState({
        status: "success",
        pickupRequestId: String(json.data?.pickupRequestId || ""),
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

  const loading = state.status === "loading";

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
            <Link href={ROUTES.LOGISTICS_BOOK} className="btn-primary">
              Book Freight
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Pickup Request
            </span>

            <h1>Schedule a Convenient Shipment Pickup</h1>

            <p>
              Tell us where and when your shipment should be collected and
              provide the basic shipment information.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="form-shell">
              <span className="section-label">Pickup Details</span>

              <h2 className="section-title" style={{ fontSize: "2rem" }}>
                Request a Pickup
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginTop: 30 }}>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      className="input"
                      name="name"
                      placeholder="Your name"
                      required
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="input"
                      name="email"
                      type="email"
                      placeholder="Email address"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Date *</label>
                    <input
                      className="input"
                      name="date"
                      type="date"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Pickup Address *</label>
                    <textarea
                      className="textarea"
                      name="address"
                      placeholder="Complete pickup address"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      className="input"
                      name="city"
                      placeholder="City"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      className="input"
                      name="pinCode"
                      placeholder="PIN code"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipment Type *</label>
                    <select
                      className="select"
                      name="shipmentType"
                      required
                      disabled={loading}
                    >
                      <option value="">Select type</option>
                      <option value="document">Document</option>
                      <option value="parcel">Parcel</option>
                      <option value="commercial">Commercial</option>
                      <option value="cargo">Cargo / Freight</option>
                    </select>
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
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Additional Information</label>
                    <textarea
                      className="textarea"
                      name="message"
                      placeholder="Any instructions for the pickup team?"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Pickup Request →"}
                  </button>
                </div>
              </form>

              {state.status === "success" && (
                <div className="notice" style={{ marginTop: 20 }}>
                  Your pickup request was submitted successfully
                  {state.pickupRequestId
                    ? ` (Ref: ${state.pickupRequestId})`
                    : ""}
                  . Our team will contact you to confirm the pickup.
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
            <p>Convenient pickup support for your shipment.</p>
          </div>

          <div>
            <h3>Services</h3>
            <div className="footer-links">
              <Link href={ROUTES.LOGISTICS_SERVICES}>All Services</Link>
              <Link href={ROUTES.LOGISTICS_DOMESTIC}>Domestic</Link>
              <Link href={ROUTES.LOGISTICS_INTERNATIONAL}>International</Link>
            </div>
          </div>

          <div>
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link href={ROUTES.LOGISTICS_BOOK}>Book Freight</Link>
              <Link href={ROUTES.LOGISTICS_TRACK}>Track</Link>
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
    </>
  );
}