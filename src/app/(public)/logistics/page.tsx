// // import Link from "next/link";

// // const services = [
// //   {
// //     title: "International Freight",
// //     description:
// //       "Reliable international shipping solutions for documents, parcels, commercial cargo and time-sensitive consignments.",
// //     href: "/logistics/international",
// //     icon: "✈",
// //   },
// //   {
// //     title: "Domestic Logistics",
// //     description:
// //       "Fast and dependable domestic transportation solutions connecting businesses and customers across India.",
// //     href: "/logistics/domestic",
// //     icon: "🚚",
// //   },
// //   {
// //     title: "Cargo & Freight",
// //     description:
// //       "Flexible cargo and freight services for shipments requiring dependable handling and transportation.",
// //     href: "/logistics/cargo-freight",
// //     icon: "📦",
// //   },
// // ];

// // const shippingModes = [
// //   {
// //     title: "Air Freight",
// //     description:
// //       "For urgent and time-sensitive shipments where speed matters.",
// //     icon: "✈️",
// //   },
// //   {
// //     title: "Surface Transport",
// //     description:
// //       "Cost-effective transportation for domestic shipments and cargo.",
// //     icon: "🚛",
// //   },
// //   {
// //     title: "International Shipping",
// //     description:
// //       "Solutions for sending shipments across international destinations.",
// //     icon: "🌍",
// //   },
// // ];

// // const steps = [
// //   {
// //     number: "01",
// //     title: "Book Your Shipment",
// //     description:
// //       "Submit your shipment details and choose the service that fits your requirement.",
// //   },
// //   {
// //     number: "02",
// //     title: "Pickup & Processing",
// //     description:
// //       "Our team coordinates pickup and processes your shipment for transportation.",
// //   },
// //   {
// //     number: "03",
// //     title: "Track Your Shipment",
// //     description:
// //       "Use your AWB number to follow your shipment throughout its journey.",
// //   },
// //   {
// //     number: "04",
// //     title: "Safe Delivery",
// //     description:
// //       "Your shipment reaches its destination through our logistics network.",
// //   },
// // ];

// // export default function LogisticsPage() {
// //   return (
// //     <main className="min-h-screen bg-white">
// //       {/* =====================================================
// //           HEADER
// //           ===================================================== */}

// //       <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082f49]/95 text-white backdrop-blur-md">
// //         <div className="container">
// //           <div className="flex h-[72px] items-center justify-between">
// //             {/* Logo */}
// //             <Link
// //               href="/logistics"
// //               className="flex items-center gap-3"
// //               aria-label="Sreshta Logistics Home"
// //             >
// //               <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white">
// //                 <img
// //                   src="/images/sreshta-logistics-logo.png"
// //                   alt="Sreshta Logistics"
// //                   className="h-full w-full object-contain"
// //                 />
// //               </div>

// //               <div className="hidden sm:block">
// //                 <div className="text-lg font-extrabold tracking-tight">
// //                   SRESHTA
// //                 </div>
// //                 <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300">
// //                   Logistics
// //                 </div>
// //               </div>
// //             </Link>

// //             {/* Navigation */}
// //             <nav className="hidden items-center gap-7 lg:flex">
// //               <Link
// //                 href="/logistics"
// //                 className="text-sm font-medium text-white transition hover:text-teal-300"
// //               >
// //                 Home
// //               </Link>

// //               <Link
// //                 href="/logistics/services"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 Services
// //               </Link>

// //               <Link
// //                 href="/logistics/international"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 International
// //               </Link>

// //               <Link
// //                 href="/logistics/domestic"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 Domestic
// //               </Link>

// //               <Link
// //                 href="/logistics/cargo-freight"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 Cargo & Freight
// //               </Link>

// //               <Link
// //                 href="/logistics/about"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 About
// //               </Link>

// //               <Link
// //                 href="/logistics/contact"
// //                 className="text-sm font-medium text-slate-200 transition hover:text-teal-300"
// //               >
// //                 Contact
// //               </Link>
// //             </nav>

// //             {/* Header Actions */}
// //             <div className="flex items-center gap-2">
// //               <Link
// //                 href="/logistics/track"
// //                 className="hidden rounded-lg border border-teal-400/40 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:border-teal-300 hover:bg-teal-400/10 sm:inline-flex"
// //               >
// //                 Track Shipment
// //               </Link>

// //               <Link
// //                 href="/logistics/book-freight"
// //                 className="btn btn-logistics"
// //               >
// //                 Book Now
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* =====================================================
// //           HERO
// //           ===================================================== */}

// //       <section className="relative min-h-[680px] overflow-hidden bg-[#041f32] text-white">
// //         {/* Background */}
// //         <div className="absolute inset-0">
// //           <img
// //             src="/images/logistics-hero-bg.jpg"
// //             alt=""
// //             className="h-full w-full object-cover opacity-40"
// //           />

// //           <div className="absolute inset-0 bg-gradient-to-r from-[#041f32] via-[#082f49]/90 to-[#082f49]/45" />
// //         </div>

// //         {/* Hero Content */}
// //         <div className="container relative z-10">
// //           <div className="grid min-h-[680px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr]">
// //             <div className="max-w-3xl">
// //               <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-200 backdrop-blur">
// //                 <span className="h-2 w-2 rounded-full bg-teal-300" />
// //                 Reliable Logistics Solutions
// //               </div>

// //               <h1 className="heading-hero text-white">
// //                 Moving Your World,
// //                 <span className="block text-teal-300">
// //                   One Shipment at a Time.
// //                 </span>
// //               </h1>

// //               <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
// //                 Sreshta Logistics provides dependable domestic,
// //                 international, cargo and freight solutions designed to move
// //                 your shipments safely and efficiently.
// //               </p>

// //               <div className="mt-9 flex flex-wrap gap-3">
// //                 <Link
// //                   href="/logistics/book-freight"
// //                   className="btn btn-logistics px-6 py-3"
// //                 >
// //                   Book a Shipment
// //                   <span aria-hidden="true">→</span>
// //                 </Link>

// //                 <Link
// //                   href="/logistics/services"
// //                   className="btn border border-white/25 bg-white/10 px-6 py-3 text-white backdrop-blur hover:bg-white/15"
// //                 >
// //                   Explore Services
// //                 </Link>
// //               </div>

// //               {/* Trust Indicators */}
// //               <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7">
// //                 <div>
// //                   <div className="text-2xl font-bold">Domestic</div>
// //                   <div className="text-sm text-slate-400">
// //                     Shipping Solutions
// //                   </div>
// //                 </div>

// //                 <div>
// //                   <div className="text-2xl font-bold">International</div>
// //                   <div className="text-sm text-slate-400">
// //                     Freight Services
// //                   </div>
// //                 </div>

// //                 <div>
// //                   <div className="text-2xl font-bold">24/7</div>
// //                   <div className="text-sm text-slate-400">
// //                     Shipment Tracking
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Tracking Card */}
// //             <div className="lg:justify-self-end">
// //               <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
// //                 <div className="mb-6">
// //                   <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
// //                     Shipment Tracking
// //                   </p>

// //                   <h2 className="mt-2 text-2xl font-bold text-white">
// //                     Where is your shipment?
// //                   </h2>

// //                   <p className="mt-2 text-sm leading-6 text-slate-300">
// //                     Enter your Air Waybill number to view the latest shipment
// //                     status.
// //                   </p>
// //                 </div>

// //                 <form
// //                   action="/logistics/track"
// //                   method="GET"
// //                   className="space-y-3"
// //                 >
// //                   <label
// //                     htmlFor="hero-awb"
// //                     className="sr-only"
// //                   >
// //                     AWB Number
// //                   </label>

// //                   <input
// //                     id="hero-awb"
// //                     name="awb"
// //                     type="text"
// //                     placeholder="Enter AWB / Tracking Number"
// //                     className="h-12 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
// //                   />

// //                   <button
// //                     type="submit"
// //                     className="btn btn-logistics h-12 w-full"
// //                   >
// //                     Track Shipment
// //                     <span aria-hidden="true">→</span>
// //                   </button>
// //                 </form>

// //                 <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
// //                   <span className="h-2 w-2 rounded-full bg-teal-400" />
// //                   Real-time tracking will be connected to the logistics
// //                   tracking system.
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           SERVICES
// //           ===================================================== */}

// //       <section className="section logistics-surface">
// //         <div className="container">
// //           <div className="mx-auto max-w-2xl text-center">
// //             <div className="logistics-accent-line mx-auto" />

// //             <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
// //               Our Services
// //             </p>

// //             <h2 className="heading-xl mt-3 text-slate-900">
// //               Logistics built around your shipment
// //             </h2>

// //             <p className="mt-5 text-slate-600">
// //               From domestic transportation to international freight, choose a
// //               logistics solution designed around your requirements.
// //             </p>
// //           </div>

// //           <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //             {services.map((service) => (
// //               <Link
// //                 key={service.title}
// //                 href={service.href}
// //                 className="card card-hover group p-7"
// //               >
// //                 <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-2xl transition group-hover:bg-teal-600 group-hover:grayscale-0">
// //                   {service.icon}
// //                 </div>

// //                 <h3 className="heading-md mt-6 text-slate-900">
// //                   {service.title}
// //                 </h3>

// //                 <p className="mt-3 leading-7 text-slate-600">
// //                   {service.description}
// //                 </p>

// //                 <div className="mt-6 font-semibold text-teal-700">
// //                   Learn More →
// //                 </div>
// //               </Link>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           SHIPPING MODES
// //           ===================================================== */}

// //       <section className="section bg-slate-50">
// //         <div className="container">
// //           <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
// //             <div>
// //               <div className="logistics-accent-line" />

// //               <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
// //                 Flexible Transportation
// //               </p>

// //               <h2 className="heading-xl mt-3 text-slate-900">
// //                 The right mode for every shipment
// //               </h2>

// //               <p className="mt-6 max-w-xl leading-8 text-slate-600">
// //                 Whether your shipment is urgent, large, domestic or
// //                 international, Sreshta Logistics provides multiple
// //                 transportation options to meet your needs.
// //               </p>

// //               <Link
// //                 href="/logistics/services"
// //                 className="btn btn-navy mt-8"
// //               >
// //                 View All Services
// //               </Link>
// //             </div>

// //             <div className="grid gap-5 sm:grid-cols-3">
// //               {shippingModes.map((mode) => (
// //                 <div
// //                   key={mode.title}
// //                   className="card card-hover p-5"
// //                 >
// //                   <div className="text-3xl">{mode.icon}</div>

// //                   <h3 className="mt-5 font-bold text-slate-900">
// //                     {mode.title}
// //                   </h3>

// //                   <p className="mt-3 text-sm leading-6 text-slate-600">
// //                     {mode.description}
// //                   </p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           HOW IT WORKS
// //           ===================================================== */}

// //       <section className="section bg-white">
// //         <div className="container">
// //           <div className="mx-auto max-w-2xl text-center">
// //             <div className="logistics-accent-line mx-auto" />

// //             <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
// //               How It Works
// //             </p>

// //             <h2 className="heading-xl mt-3 text-slate-900">
// //               Simple from pickup to delivery
// //             </h2>

// //             <p className="mt-5 text-slate-600">
// //               We make the shipping process straightforward so you can focus
// //               on your business.
// //             </p>
// //           </div>

// //           <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
// //             {steps.map((step) => (
// //               <div
// //                 key={step.number}
// //                 className="relative"
// //               >
// //                 <div className="text-5xl font-black text-teal-100">
// //                   {step.number}
// //                 </div>

// //                 <h3 className="mt-3 text-xl font-bold text-slate-900">
// //                   {step.title}
// //                 </h3>

// //                 <p className="mt-3 text-sm leading-7 text-slate-600">
// //                   {step.description}
// //                 </p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           TRACKING CTA
// //           ===================================================== */}

// //       <section className="section logistics-gradient text-white">
// //         <div className="container">
// //           <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
// //             <div>
// //               <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
// //                 Track Your Shipment
// //               </p>

// //               <h2 className="heading-xl mt-3">
// //                 Know where your shipment is, every step of the way.
// //               </h2>

// //               <p className="mt-5 max-w-2xl leading-8 text-slate-300">
// //                 Enter your AWB number and follow the journey of your shipment
// //                 through every available tracking stage.
// //               </p>
// //             </div>

// //             <Link
// //               href="/logistics/track"
// //               className="btn rounded-lg bg-white px-7 py-3 font-bold text-[#082f49] hover:bg-slate-100"
// //             >
// //               Track AWB →
// //             </Link>
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           BUSINESS CTA
// //           ===================================================== */}

// //       <section className="section bg-slate-50">
// //         <div className="container">
// //           <div className="overflow-hidden rounded-3xl bg-[#041f32] px-7 py-12 text-white md:px-12 lg:px-16">
// //             <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
// //               <div>
// //                 <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
// //                   Need a Logistics Partner?
// //                 </p>

// //                 <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
// //                   Let&apos;s move your shipment.
// //                 </h2>

// //                 <p className="mt-4 max-w-2xl leading-7 text-slate-300">
// //                   Talk to the Sreshta Logistics team about your domestic,
// //                   international or freight requirements.
// //                 </p>
// //               </div>

// //               <div className="flex flex-wrap gap-3">
// //                 <Link
// //                   href="/logistics/contact"
// //                   className="btn btn-logistics"
// //                 >
// //                   Contact Us
// //                 </Link>

// //                 <Link
// //                   href="/logistics/partnership"
// //                   className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15"
// //                 >
// //                   Partnership
// //                 </Link>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           CONTACT / FOOTER
// //           ===================================================== */}

// //       <footer className="bg-[#020617] text-white">
// //         <div className="container py-14">
// //           <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
// //             {/* Company */}
// //             <div>
// //               <div className="flex items-center gap-3">
// //                 <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white">
// //                   <img
// //                     src="/images/sreshta-logistics-logo.png"
// //                     alt="Sreshta Logistics"
// //                     className="h-full w-full object-contain"
// //                   />
// //                 </div>

// //                 <div>
// //                   <div className="font-extrabold">SRESHTA</div>
// //                   <div className="text-[10px] uppercase tracking-[0.2em] text-teal-300">
// //                     Logistics
// //                   </div>
// //                 </div>
// //               </div>

// //               <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
// //                 Reliable logistics and freight solutions for domestic and
// //                 international shipments.
// //               </p>
// //             </div>

// //             {/* Services */}
// //             <div>
// //               <h3 className="font-bold">Services</h3>

// //               <div className="mt-4 space-y-3 text-sm text-slate-400">
// //                 <Link
// //                   href="/logistics/international"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   International
// //                 </Link>

// //                 <Link
// //                   href="/logistics/domestic"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Domestic
// //                 </Link>

// //                 <Link
// //                   href="/logistics/cargo-freight"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Cargo & Freight
// //                 </Link>

// //                 <Link
// //                   href="/logistics/pickup-request"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Pickup Request
// //                 </Link>
// //               </div>
// //             </div>

// //             {/* Company */}
// //             <div>
// //               <h3 className="font-bold">Company</h3>

// //               <div className="mt-4 space-y-3 text-sm text-slate-400">
// //                 <Link
// //                   href="/logistics/about"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   About Us
// //                 </Link>

// //                 <Link
// //                   href="/logistics/partnership"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Partnership
// //                 </Link>

// //                 <Link
// //                   href="/logistics/contact"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Contact
// //                 </Link>

// //                 <Link
// //                   href="/logistics/track"
// //                   className="block transition hover:text-teal-300"
// //                 >
// //                   Track Shipment
// //                 </Link>
// //               </div>
// //             </div>

// //             {/* Contact */}
// //             <div>
// //               <h3 className="font-bold">Contact</h3>

// //               <div className="mt-4 space-y-4 text-sm text-slate-400">
// //                 <div>
// //                   <div className="font-semibold text-white">
// //                     Tummala Santosh Kumar
// //                   </div>

// //                   <div className="text-xs uppercase tracking-wider text-teal-300">
// //                     Managing Director
// //                   </div>

// //                   <a
// //                     href="tel:9493924742"
// //                     className="mt-1 block hover:text-teal-300"
// //                   >
// //                     +91 94939 24742
// //                   </a>
// //                 </div>

// //                 <div>
// //                   <div className="font-semibold text-white">
// //                     Yaragalla Kalyan
// //                   </div>

// //                   <div className="text-xs uppercase tracking-wider text-teal-300">
// //                     Partner
// //                   </div>

// //                   <a
// //                     href="tel:8712164677"
// //                     className="mt-1 block hover:text-teal-300"
// //                   >
// //                     +91 87121 64677
// //                   </a>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500">
// //             <div className="flex flex-col justify-between gap-3 sm:flex-row">
// //               <p>
// //                 © {new Date().getFullYear()} Sreshta Logistics. All rights
// //                 reserved.
// //               </p>

// //               <p>
// //                 Logistics • Freight • Transportation
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </footer>
// //     </main>
// //   );
// // }





















// // "use client";

// // import Link from "next/link";
// // import { FormEvent } from "react";
// // import { useRouter } from "next/navigation";

// // const services = [
// //   {
// //     icon: "✈",
// //     title: "International Logistics",
// //     description:
// //       "Reliable international shipment solutions for documents, parcels and commercial cargo.",
// //     href: "/logistics/international",
// //   },
// //   {
// //     icon: "▣",
// //     title: "Domestic Logistics",
// //     description:
// //       "Fast and dependable shipping solutions connecting destinations across India.",
// //     href: "/logistics/domestic",
// //   },
// //   {
// //     icon: "⚓",
// //     title: "Cargo & Freight",
// //     description:
// //       "Flexible freight solutions for larger shipments, commercial goods and cargo movement.",
// //     href: "/logistics/cargo-freight",
// //   },
// //   {
// //     icon: "⌖",
// //     title: "Pickup Request",
// //     description:
// //       "Request a convenient pickup from your location and let our team handle the next steps.",
// //     href: "/logistics/pickup-request",
// //   },
// // ];

// // const steps = [
// //   {
// //     number: "01",
// //     title: "Book Your Shipment",
// //     description:
// //       "Share your shipment details and choose the service that fits your requirement.",
// //   },
// //   {
// //     number: "02",
// //     title: "Pickup & Processing",
// //     description:
// //       "Our team coordinates pickup and prepares your shipment for secure movement.",
// //   },
// //   {
// //     number: "03",
// //     title: "Track in Transit",
// //     description:
// //       "Follow your shipment through its journey using the Sreshta AWB tracking system.",
// //   },
// //   {
// //     number: "04",
// //     title: "Safe Delivery",
// //     description:
// //       "Your shipment reaches its destination with visibility throughout the process.",
// //   },
// // ];

// // const testimonials = [
// //   {
// //     text: "The process was simple and the shipment updates gave us confidence throughout the journey.",
// //     name: "Business Customer",
// //   },
// //   {
// //     text: "Sreshta made our regular shipping requirements easier to manage with responsive support.",
// //     name: "Commercial Client",
// //   },
// //   {
// //     text: "A professional logistics experience with clear communication from pickup to delivery.",
// //     name: "Retail Customer",
// //   },
// // ];

// // function Header() {
// //   return (
// //     <header className="site-header">
// //       <div className="container-site header-inner">
// //         <Link href="/logistics" aria-label="Sreshta Logistics home">
// //           <img
// //             src="/images/sreshta-logistics-logo.png"
// //             alt="Sreshta Logistics"
// //             className="header-logo"
// //           />
// //         </Link>

// //         <nav className="desktop-nav" aria-label="Main navigation">
// //           <Link href="/logistics">Home</Link>
// //           <Link href="/logistics/services">Services</Link>
// //           <Link href="/logistics/international">International</Link>
// //           <Link href="/logistics/domestic">Domestic</Link>
// //           <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
// //           <Link href="/logistics/about">About</Link>
// //           <Link href="/logistics/contact">Contact</Link>
// //         </nav>

// //         <div className="header-actions">
// //           <Link href="/logistics/track" className="btn-secondary">
// //             Track
// //           </Link>
// //           <Link href="/logistics/book-freight" className="btn-primary">
// //             Book a Freight
// //           </Link>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }

// // function Footer() {
// //   return (
// //     <footer className="footer">
// //       <div className="container-site footer-main">
// //         <div>
// //           <img
// //             src="/images/sreshta-logistics-logo.png"
// //             alt="Sreshta Logistics"
// //             className="footer-logo"
// //           />
// //           <p>
// //             Professional logistics solutions designed around reliable
// //             movement, clear communication and shipment visibility.
// //           </p>
// //         </div>

// //         <div>
// //           <h3>Services</h3>
// //           <div className="footer-links">
// //             <Link href="/logistics/international">International</Link>
// //             <Link href="/logistics/domestic">Domestic</Link>
// //             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
// //             <Link href="/logistics/pickup-request">Pickup Request</Link>
// //           </div>
// //         </div>

// //         <div>
// //           <h3>Company</h3>
// //           <div className="footer-links">
// //             <Link href="/logistics/about">About Us</Link>
// //             <Link href="/logistics/partnership">Partnership</Link>
// //             <Link href="/logistics/contact">Contact</Link>
// //             <Link href="/logistics/track">Track Shipment</Link>
// //           </div>
// //         </div>

// //         <div>
// //           <h3>Get in Touch</h3>
// //           <div className="footer-links">
// //             <a href="tel:+919493924742">+91 94939 24742</a>
// //             <a href="tel:+918712164677">+91 87121 64677</a>
// //             <span>India</span>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="container-site footer-bottom">
// //         © {new Date().getFullYear()} Sreshta Logistics. All rights reserved.
// //       </div>
// //     </footer>
// //   );
// // }

// // export default function LogisticsHomePage() {
// //   const router = useRouter();

// //   function handleTracking(event: FormEvent<HTMLFormElement>) {
// //     event.preventDefault();

// //     const form = new FormData(event.currentTarget);
// //     const awb = String(form.get("awb") || "").trim();

// //     if (!awb) return;

// //     router.push(`/logistics/track/${encodeURIComponent(awb)}`);
// //   }

// //   return (
// //     <>
// //       <Header />

// //       <main>
// //         <section className="hero">
// //           <div className="container-site hero-inner">
// //             <div className="hero-content">
// //               <span className="hero-eyebrow">
// //                 Domestic • International • Cargo
// //               </span>

// //               <h1 className="hero-title">
// //                 Moving Your World.
// //                 <br />
// //                 <span>One Shipment at a Time.</span>
// //               </h1>

// //               <p className="hero-description">
// //                 Reliable logistics and freight solutions built around secure
// //                 movement, clear communication and shipment visibility.
// //               </p>

// //               <div className="hero-actions">
// //                 <Link href="/logistics/book-freight" className="btn-primary">
// //                   Book a Freight →
// //                 </Link>

// //                 <Link href="/logistics/services" className="btn-secondary">
// //                   Explore Services
// //                 </Link>
// //               </div>
// //             </div>
// //           </div>
// //         </section>

// //         <section className="tracking-strip">
// //           <div className="container-site">
// //             <div className="tracking-card">
// //               <div className="tracking-heading">
// //                 <div>
// //                   <h2>Track Your Shipment</h2>
// //                   <p>
// //                     Enter your AWB number to view the latest shipment status.
// //                   </p>
// //                 </div>
// //               </div>

// //               <form className="tracking-form" onSubmit={handleTracking}>
// //                 <input
// //                   name="awb"
// //                   className="input"
// //                   placeholder="Enter AWB / Tracking Number"
// //                   aria-label="AWB tracking number"
// //                   required
// //                 />

// //                 <button className="btn-primary" type="submit">
// //                   Track Now
// //                 </button>
// //               </form>
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section">
// //           <div className="container-site">
// //             <span className="section-label">Our Services</span>
// //             <h2 className="section-title">
// //               Complete Logistics Solutions for Every Requirement
// //             </h2>

// //             <p className="section-description">
// //               From individual shipments to commercial freight, Sreshta
// //               provides flexible logistics solutions designed around your
// //               delivery requirements.
// //             </p>

// //             <div className="card-grid" style={{ marginTop: 40 }}>
// //               {services.map((service) => (
// //                 <Link
// //                   href={service.href}
// //                   className="service-card"
// //                   key={service.title}
// //                 >
// //                   <div className="service-icon">{service.icon}</div>
// //                   <h3>{service.title}</h3>
// //                   <p>{service.description}</p>
// //                 </Link>
// //               ))}
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section" style={{ background: "#f5f8fb" }}>
// //           <div className="container-site">
// //             <div className="split-grid">
// //               <div>
// //                 <span className="section-label">Shipping Network</span>

// //                 <h2 className="section-title">
// //                   Reliable Movement Across India and Beyond
// //                 </h2>

// //                 <p className="section-description">
// //                   Choose the logistics mode and service model that matches your
// //                   shipment. Our solutions are designed for documents, parcels,
// //                   commercial consignments and cargo.
// //                 </p>

// //                 <ul className="feature-list">
// //                   <li>
// //                     <span className="check">✓</span>
// //                     <span>
// //                       International shipment support with professional
// //                       documentation and coordination.
// //                     </span>
// //                   </li>

// //                   <li>
// //                     <span className="check">✓</span>
// //                     <span>
// //                       Domestic delivery solutions for businesses and
// //                       individual customers.
// //                     </span>
// //                   </li>

// //                   <li>
// //                     <span className="check">✓</span>
// //                     <span>
// //                       Cargo and freight services for larger and commercial
// //                       shipments.
// //                     </span>
// //                   </li>

// //                   <li>
// //                     <span className="check">✓</span>
// //                     <span>
// //                       Shipment tracking for better visibility throughout the
// //                       journey.
// //                     </span>
// //                   </li>
// //                 </ul>

// //                 <div style={{ marginTop: 30 }}>
// //                   <Link
// //                     href="/logistics/services"
// //                     className="btn-primary"
// //                   >
// //                     View All Services →
// //                   </Link>
// //                 </div>
// //               </div>

// //               <div className="image-card">
// //                 <img
// //                   src="/images/logistics-hero-bg.jpg"
// //                   alt="Sreshta logistics transportation"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section">
// //           <div className="container-site">
// //             <span className="section-label">How It Works</span>

// //             <h2 className="section-title">
// //               Simple, Transparent and Reliable
// //             </h2>

// //             <p className="section-description">
// //               We keep the shipment journey straightforward so customers can
// //               focus on their business while Sreshta handles the logistics.
// //             </p>

// //             <div className="steps" style={{ marginTop: 45 }}>
// //               {steps.map((step) => (
// //                 <div className="step" key={step.number}>
// //                   <span className="step-number">{step.number}</span>
// //                   <h3>{step.title}</h3>
// //                   <p>{step.description}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section">
// //           <div className="container-site">
// //             <div className="stats-grid">
// //               <div className="stat">
// //                 <strong>24/7</strong>
// //                 <span>Shipment Visibility</span>
// //               </div>

// //               <div className="stat">
// //                 <strong>3+</strong>
// //                 <span>Core Shipping Modes</span>
// //               </div>

// //               <div className="stat">
// //                 <strong>100%</strong>
// //                 <span>Customer Focus</span>
// //               </div>

// //               <div className="stat">
// //                 <strong>1</strong>
// //                 <span>Connected Logistics Platform</span>
// //               </div>
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section dark-section">
// //           <div className="container-site">
// //             <span className="section-label" style={{ color: "#6de1e5" }}>
// //               Customer Trust
// //             </span>

// //             <h2 className="section-title">
// //               Professional Service. Clear Communication. Reliable Movement.
// //             </h2>

// //             <p className="section-description">
// //               Sreshta is designed to give customers confidence from booking
// //               through delivery.
// //             </p>

// //             <div className="testimonial-grid" style={{ marginTop: 40 }}>
// //               {testimonials.map((item) => (
// //                 <div className="testimonial" key={item.name}>
// //                   <p>“{item.text}”</p>
// //                   <strong>{item.name}</strong>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </section>

// //         <section className="section">
// //           <div className="container-site">
// //             <div
// //               style={{
// //                 borderRadius: 18,
// //                 background:
// //                   "linear-gradient(110deg, #06284c, #087f87)",
// //                 padding: "50px",
// //                 color: "white",
// //               }}
// //             >
// //               <h2
// //                 style={{
// //                   margin: 0,
// //                   fontSize: "clamp(2rem, 4vw, 3rem)",
// //                   lineHeight: 1.05,
// //                 }}
// //               >
// //                 Ready to Move Your Shipment?
// //               </h2>

// //               <p
// //                 style={{
// //                   maxWidth: 650,
// //                   margin: "16px 0 25px",
// //                   color: "rgba(255,255,255,.78)",
// //                 }}
// //               >
// //                 Book a freight shipment, request a pickup or speak with our
// //                 team about your logistics requirement.
// //               </p>

// //               <div className="hero-actions">
// //                 <Link href="/logistics/book-freight" className="btn-primary">
// //                   Book a Freight
// //                 </Link>

// //                 <Link
// //                   href="/logistics/pickup-request"
// //                   className="btn-secondary"
// //                 >
// //                   Request Pickup
// //                 </Link>
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       </main>

// //       <Footer />
// //     </>
// //   );
// // }










// "use client";

// import Link from "next/link";
// import { FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import PublicModuleToggle from "@/components/global/PublicModuleToggle";

// const services = [
//   {
//     icon: "✈",
//     title: "International Logistics",
//     description:
//       "Reliable international shipment solutions for documents, parcels and commercial cargo.",
//     href: "/logistics/international",
//   },
//   {
//     icon: "▣",
//     title: "Domestic Logistics",
//     description:
//       "Fast and dependable shipping solutions connecting destinations across India.",
//     href: "/logistics/domestic",
//   },
//   {
//     icon: "⚓",
//     title: "Cargo & Freight",
//     description:
//       "Flexible freight solutions for larger shipments, commercial goods and cargo movement.",
//     href: "/logistics/cargo-freight",
//   },
//   {
//     icon: "⌖",
//     title: "Pickup Request",
//     description:
//       "Request a convenient pickup from your location and let our team handle the next steps.",
//     href: "/logistics/pickup-request",
//   },
// ];

// const steps = [
//   {
//     number: "01",
//     title: "Book Your Shipment",
//     description:
//       "Share your shipment details and choose the service that fits your requirement.",
//   },
//   {
//     number: "02",
//     title: "Pickup & Processing",
//     description:
//       "Our team coordinates pickup and prepares your shipment for secure movement.",
//   },
//   {
//     number: "03",
//     title: "Track in Transit",
//     description:
//       "Follow your shipment through its journey using the Sreshta AWB tracking system.",
//   },
//   {
//     number: "04",
//     title: "Safe Delivery",
//     description:
//       "Your shipment reaches its destination with visibility throughout the process.",
//   },
// ];

// const testimonials = [
//   {
//     text: "The process was simple and the shipment updates gave us confidence throughout the journey.",
//     name: "Business Customer",
//   },
//   {
//     text: "Sreshta made our regular shipping requirements easier to manage with responsive support.",
//     name: "Commercial Client",
//   },
//   {
//     text: "A professional logistics experience with clear communication from pickup to delivery.",
//     name: "Retail Customer",
//   },
// ];

// function Header() {
//   return (
//     <header className="site-header">
//       <div className="container-site header-inner">
//         <Link href="/logistics" aria-label="Sreshta Logistics home">
//           <img
//             src="/images/sreshta-logistics-logo.png"
//             alt="Sreshta Logistics"
//             className="header-logo"
//           />
//         </Link>

//         <nav className="desktop-nav" aria-label="Main navigation">
//           <Link href="/logistics">Home</Link>
//           <Link href="/logistics/services">Services</Link>
//           <Link href="/logistics/international">International</Link>
//           <Link href="/logistics/domestic">Domestic</Link>
//           <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//           <Link href="/logistics/about">About</Link>
//           <Link href="/logistics/contact">Contact</Link>
//         </nav>

//         <div
//           className="header-actions"
//           style={{ display: "flex", alignItems: "center", gap: 12 }}
//         >
//           <PublicModuleToggle active="LOGISTICS" />
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
//             Professional logistics solutions designed around reliable
//             movement, clear communication and shipment visibility.
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
//             <Link href="/logistics/about">About Us</Link>
//             <Link href="/logistics/partnership">Partnership</Link>
//             <Link href="/logistics/contact">Contact</Link>
//             <Link href="/logistics/track">Track Shipment</Link>
//           </div>
//         </div>

//         <div>
//           <h3>Get in Touch</h3>
//           <div className="footer-links">
//             <a href="tel:+919493924742">+91 94939 24742</a>
//             <a href="tel:+918712164677">+91 87121 64677</a>
//             <span>India</span>
//           </div>
//         </div>
//       </div>

//       <div className="container-site footer-bottom">
//         © {new Date().getFullYear()} Sreshta Logistics. All rights reserved.
//       </div>
//     </footer>
//   );
// }

// export default function LogisticsHomePage() {
//   const router = useRouter();

//   function handleTracking(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const form = new FormData(event.currentTarget);
//     const awb = String(form.get("awb") || "").trim();

//     if (!awb) return;

//     router.push(`/logistics/track/${encodeURIComponent(awb)}`);
//   }

//   return (
//     <>
//       <Header />

//       <main>
//         <section className="hero">
//           <div className="container-site hero-inner">
//             <div className="hero-content">
//               <span className="hero-eyebrow">
//                 Domestic • International • Cargo
//               </span>

//               <h1 className="hero-title">
//                 Moving Your World.
//                 <br />
//                 <span>One Shipment at a Time.</span>
//               </h1>

//               <p className="hero-description">
//                 Reliable logistics and freight solutions built around secure
//                 movement, clear communication and shipment visibility.
//               </p>

//               <div className="hero-actions">
//                 <Link href="/logistics/book-freight" className="btn-primary">
//                   Book a Freight →
//                 </Link>

//                 <Link href="/logistics/services" className="btn-secondary">
//                   Explore Services
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="tracking-strip">
//           <div className="container-site">
//             <div className="tracking-card">
//               <div className="tracking-heading">
//                 <div>
//                   <h2>Track Your Shipment</h2>
//                   <p>
//                     Enter your AWB number to view the latest shipment status.
//                   </p>
//                 </div>
//               </div>

//               <form className="tracking-form" onSubmit={handleTracking}>
//                 <input
//                   name="awb"
//                   className="input"
//                   placeholder="Enter AWB / Tracking Number"
//                   aria-label="AWB tracking number"
//                   required
//                 />

//                 <button className="btn-primary" type="submit">
//                   Track Now
//                 </button>
//               </form>
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <span className="section-label">Our Services</span>
//             <h2 className="section-title">
//               Complete Logistics Solutions for Every Requirement
//             </h2>

//             <p className="section-description">
//               From individual shipments to commercial freight, Sreshta
//               provides flexible logistics solutions designed around your
//               delivery requirements.
//             </p>

//             <div className="card-grid" style={{ marginTop: 40 }}>
//               {services.map((service) => (
//                 <Link
//                   href={service.href}
//                   className="service-card"
//                   key={service.title}
//                 >
//                   <div className="service-icon">{service.icon}</div>
//                   <h3>{service.title}</h3>
//                   <p>{service.description}</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section" style={{ background: "#f5f8fb" }}>
//           <div className="container-site">
//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Shipping Network</span>

//                 <h2 className="section-title">
//                   Reliable Movement Across India and Beyond
//                 </h2>

//                 <p className="section-description">
//                   Choose the logistics mode and service model that matches your
//                   shipment. Our solutions are designed for documents, parcels,
//                   commercial consignments and cargo.
//                 </p>

//                 <ul className="feature-list">
//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       International shipment support with professional
//                       documentation and coordination.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Domestic delivery solutions for businesses and
//                       individual customers.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Cargo and freight services for larger and commercial
//                       shipments.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Shipment tracking for better visibility throughout the
//                       journey.
//                     </span>
//                   </li>
//                 </ul>

//                 <div style={{ marginTop: 30 }}>
//                   <Link href="/logistics/services" className="btn-primary">
//                     View All Services →
//                   </Link>
//                 </div>
//               </div>

//               <div className="image-card">
//                 <img
//                   src="/images/logistics-hero-bg.jpg"
//                   alt="Sreshta logistics transportation"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <span className="section-label">How It Works</span>

//             <h2 className="section-title">
//               Simple, Transparent and Reliable
//             </h2>

//             <p className="section-description">
//               We keep the shipment journey straightforward so customers can
//               focus on their business while Sreshta handles the logistics.
//             </p>

//             <div className="steps" style={{ marginTop: 45 }}>
//               {steps.map((step) => (
//                 <div className="step" key={step.number}>
//                   <span className="step-number">{step.number}</span>
//                   <h3>{step.title}</h3>
//                   <p>{step.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="stats-grid">
//               <div className="stat">
//                 <strong>24/7</strong>
//                 <span>Shipment Visibility</span>
//               </div>

//               <div className="stat">
//                 <strong>3+</strong>
//                 <span>Core Shipping Modes</span>
//               </div>

//               <div className="stat">
//                 <strong>100%</strong>
//                 <span>Customer Focus</span>
//               </div>

//               <div className="stat">
//                 <strong>1</strong>
//                 <span>Connected Logistics Platform</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="section dark-section">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#6de1e5" }}>
//               Customer Trust
//             </span>

//             <h2 className="section-title">
//               Professional Service. Clear Communication. Reliable Movement.
//             </h2>

//             <p className="section-description">
//               Sreshta is designed to give customers confidence from booking
//               through delivery.
//             </p>

//             <div className="testimonial-grid" style={{ marginTop: 40 }}>
//               {testimonials.map((item) => (
//                 <div className="testimonial" key={item.name}>
//                   <p>“{item.text}”</p>
//                   <strong>{item.name}</strong>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div
//               style={{
//                 borderRadius: 18,
//                 background: "linear-gradient(110deg, #06284c, #087f87)",
//                 padding: "50px",
//                 color: "white",
//               }}
//             >
//               <h2
//                 style={{
//                   margin: 0,
//                   fontSize: "clamp(2rem, 4vw, 3rem)",
//                   lineHeight: 1.05,
//                 }}
//               >
//                 Ready to Move Your Shipment?
//               </h2>

//               <p
//                 style={{
//                   maxWidth: 650,
//                   margin: "16px 0 25px",
//                   color: "rgba(255,255,255,.78)",
//                 }}
//               >
//                 Book a freight shipment, request a pickup or speak with our
//                 team about your logistics requirement.
//               </p>

//               <div className="hero-actions">
//                 <Link href="/logistics/book-freight" className="btn-primary">
//                   Book a Freight
//                 </Link>

//                 <Link
//                   href="/logistics/pickup-request"
//                   className="btn-secondary"
//                 >
//                   Request Pickup
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </>
//   );
// }












// "use client";

// import Link from "next/link";
// import { FormEvent } from "react";
// import { useRouter } from "next/navigation";

// const services = [
//   {
//     icon: "✈",
//     title: "International Logistics",
//     description:
//       "Reliable international shipment solutions for documents, parcels and commercial cargo.",
//     href: "/logistics/international",
//   },
//   {
//     icon: "▣",
//     title: "Domestic Logistics",
//     description:
//       "Fast and dependable shipping solutions connecting destinations across India.",
//     href: "/logistics/domestic",
//   },
//   {
//     icon: "⚓",
//     title: "Cargo & Freight",
//     description:
//       "Flexible freight solutions for larger shipments, commercial goods and cargo movement.",
//     href: "/logistics/cargo-freight",
//   },
//   {
//     icon: "⌖",
//     title: "Pickup Request",
//     description:
//       "Request a convenient pickup from your location and let our team handle the next steps.",
//     href: "/logistics/pickup-request",
//   },
// ];

// const steps = [
//   {
//     number: "01",
//     title: "Book Your Shipment",
//     description:
//       "Share your shipment details and choose the service that fits your requirement.",
//   },
//   {
//     number: "02",
//     title: "Pickup & Processing",
//     description:
//       "Our team coordinates pickup and prepares your shipment for secure movement.",
//   },
//   {
//     number: "03",
//     title: "Track in Transit",
//     description:
//       "Follow your shipment through its journey using the Sreshta AWB tracking system.",
//   },
//   {
//     number: "04",
//     title: "Safe Delivery",
//     description:
//       "Your shipment reaches its destination with visibility throughout the process.",
//   },
// ];

// const testimonials = [
//   {
//     text: "The process was simple and the shipment updates gave us confidence throughout the journey.",
//     name: "Business Customer",
//   },
//   {
//     text: "Sreshta made our regular shipping requirements easier to manage with responsive support.",
//     name: "Commercial Client",
//   },
//   {
//     text: "A professional logistics experience with clear communication from pickup to delivery.",
//     name: "Retail Customer",
//   },
// ];

// function Header() {
//   return (
//     <header className="site-header">
//       <div className="container-site header-inner">
//         <Link href="/logistics" aria-label="Sreshta Logistics home">
//           <img
//             src="/images/sreshta-logistics-logo.png"
//             alt="Sreshta Logistics"
//             className="header-logo"
//           />
//         </Link>

//         <nav className="desktop-nav" aria-label="Main navigation">
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
//             Professional logistics solutions designed around reliable
//             movement, clear communication and shipment visibility.
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
//             <Link href="/logistics/about">About Us</Link>
//             <Link href="/logistics/partnership">Partnership</Link>
//             <Link href="/logistics/contact">Contact</Link>
//             <Link href="/logistics/track">Track Shipment</Link>
//           </div>
//         </div>

//         <div>
//           <h3>Get in Touch</h3>
//           <div className="footer-links">
//             <a href="tel:+919493924742">+91 94939 24742</a>
//             <a href="tel:+918712164677">+91 87121 64677</a>
//             <span>India</span>
//           </div>
//         </div>
//       </div>

//       <div className="container-site footer-bottom">
//         © {new Date().getFullYear()} Sreshta Logistics. All rights reserved.
//       </div>
//     </footer>
//   );
// }

// export default function LogisticsHomePage() {
//   const router = useRouter();

//   function handleTracking(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const form = new FormData(event.currentTarget);
//     const awb = String(form.get("awb") || "").trim();

//     if (!awb) return;

//     router.push(`/logistics/track/${encodeURIComponent(awb)}`);
//   }

//   return (
//     <>
//       <Header />

//       <main>
//         <section className="hero">
//           <div className="container-site hero-inner">
//             <div className="hero-content">
//               <span className="hero-eyebrow">
//                 Domestic • International • Cargo
//               </span>

//               <h1 className="hero-title">
//                 Moving Your World.
//                 <br />
//                 <span>One Shipment at a Time.</span>
//               </h1>

//               <p className="hero-description">
//                 Reliable logistics and freight solutions built around secure
//                 movement, clear communication and shipment visibility.
//               </p>

//               <div className="hero-actions">
//                 <Link href="/logistics/book-freight" className="btn-primary">
//                   Book a Freight →
//                 </Link>

//                 <Link href="/logistics/services" className="btn-secondary">
//                   Explore Services
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="tracking-strip">
//           <div className="container-site">
//             <div className="tracking-card">
//               <div className="tracking-heading">
//                 <div>
//                   <h2>Track Your Shipment</h2>
//                   <p>
//                     Enter your AWB number to view the latest shipment status.
//                   </p>
//                 </div>
//               </div>

//               <form className="tracking-form" onSubmit={handleTracking}>
//                 <input
//                   name="awb"
//                   className="input"
//                   placeholder="Enter AWB / Tracking Number"
//                   aria-label="AWB tracking number"
//                   required
//                 />

//                 <button className="btn-primary" type="submit">
//                   Track Now
//                 </button>
//               </form>
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <span className="section-label">Our Services</span>
//             <h2 className="section-title">
//               Complete Logistics Solutions for Every Requirement
//             </h2>

//             <p className="section-description">
//               From individual shipments to commercial freight, Sreshta
//               provides flexible logistics solutions designed around your
//               delivery requirements.
//             </p>

//             <div className="card-grid" style={{ marginTop: 40 }}>
//               {services.map((service) => (
//                 <Link
//                   href={service.href}
//                   className="service-card"
//                   key={service.title}
//                 >
//                   <div className="service-icon">{service.icon}</div>
//                   <h3>{service.title}</h3>
//                   <p>{service.description}</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section" style={{ background: "#f5f8fb" }}>
//           <div className="container-site">
//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Shipping Network</span>

//                 <h2 className="section-title">
//                   Reliable Movement Across India and Beyond
//                 </h2>

//                 <p className="section-description">
//                   Choose the logistics mode and service model that matches your
//                   shipment. Our solutions are designed for documents, parcels,
//                   commercial consignments and cargo.
//                 </p>

//                 <ul className="feature-list">
//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       International shipment support with professional
//                       documentation and coordination.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Domestic delivery solutions for businesses and
//                       individual customers.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Cargo and freight services for larger and commercial
//                       shipments.
//                     </span>
//                   </li>

//                   <li>
//                     <span className="check">✓</span>
//                     <span>
//                       Shipment tracking for better visibility throughout the
//                       journey.
//                     </span>
//                   </li>
//                 </ul>

//                 <div style={{ marginTop: 30 }}>
//                   <Link href="/logistics/services" className="btn-primary">
//                     View All Services →
//                   </Link>
//                 </div>
//               </div>

//               <div className="image-card">
//                 <img
//                   src="/images/logistics-hero-bg.jpg"
//                   alt="Sreshta logistics transportation"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <span className="section-label">How It Works</span>

//             <h2 className="section-title">
//               Simple, Transparent and Reliable
//             </h2>

//             <p className="section-description">
//               We keep the shipment journey straightforward so customers can
//               focus on their business while Sreshta handles the logistics.
//             </p>

//             <div className="steps" style={{ marginTop: 45 }}>
//               {steps.map((step) => (
//                 <div className="step" key={step.number}>
//                   <span className="step-number">{step.number}</span>
//                   <h3>{step.title}</h3>
//                   <p>{step.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="stats-grid">
//               <div className="stat">
//                 <strong>24/7</strong>
//                 <span>Shipment Visibility</span>
//               </div>

//               <div className="stat">
//                 <strong>3+</strong>
//                 <span>Core Shipping Modes</span>
//               </div>

//               <div className="stat">
//                 <strong>100%</strong>
//                 <span>Customer Focus</span>
//               </div>

//               <div className="stat">
//                 <strong>1</strong>
//                 <span>Connected Logistics Platform</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="section dark-section">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#6de1e5" }}>
//               Customer Trust
//             </span>

//             <h2 className="section-title">
//               Professional Service. Clear Communication. Reliable Movement.
//             </h2>

//             <p className="section-description">
//               Sreshta is designed to give customers confidence from booking
//               through delivery.
//             </p>

//             <div className="testimonial-grid" style={{ marginTop: 40 }}>
//               {testimonials.map((item) => (
//                 <div className="testimonial" key={item.name}>
//                   <p>“{item.text}”</p>
//                   <strong>{item.name}</strong>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div
//               style={{
//                 borderRadius: 18,
//                 background: "linear-gradient(110deg, #06284c, #087f87)",
//                 padding: "50px",
//                 color: "white",
//               }}
//             >
//               <h2
//                 style={{
//                   margin: 0,
//                   fontSize: "clamp(2rem, 4vw, 3rem)",
//                   lineHeight: 1.05,
//                 }}
//               >
//                 Ready to Move Your Shipment?
//               </h2>

//               <p
//                 style={{
//                   maxWidth: 650,
//                   margin: "16px 0 25px",
//                   color: "rgba(255,255,255,.78)",
//                 }}
//               >
//                 Book a freight shipment, request a pickup or speak with our
//                 team about your logistics requirement.
//               </p>

//               <div className="hero-actions">
//                 <Link href="/logistics/book-freight" className="btn-primary">
//                   Book a Freight
//                 </Link>

//                 <Link
//                   href="/logistics/pickup-request"
//                   className="btn-secondary"
//                 >
//                   Request Pickup
//                 </Link>
//               </div>
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
import HomeTrackForm from "@/components/public/logistics/HomeTrackForm";

const services = [
  {
    icon: "✈",
    title: "International Logistics",
    description:
      "Reliable international shipment solutions for documents, parcels and commercial cargo.",
    href: ROUTES.LOGISTICS_INTERNATIONAL,
  },
  {
    icon: "▣",
    title: "Domestic Logistics",
    description:
      "Fast and dependable shipping solutions connecting destinations across India.",
    href: ROUTES.LOGISTICS_DOMESTIC,
  },
  {
    icon: "⚓",
    title: "Cargo & Freight",
    description:
      "Flexible freight solutions for larger shipments, commercial goods and cargo movement.",
    href: ROUTES.LOGISTICS_CARGO,
  },
  {
    icon: "⌖",
    title: "Pickup Request",
    description:
      "Request a convenient pickup from your location and let our team handle the next steps.",
    href: ROUTES.LOGISTICS_PICKUP,
  },
];

const steps = [
  {
    number: "01",
    title: "Book Your Shipment",
    description:
      "Share your shipment details and choose the service that fits your requirement.",
  },
  {
    number: "02",
    title: "Pickup & Processing",
    description:
      "Our team coordinates pickup and prepares your shipment for secure movement.",
  },
  {
    number: "03",
    title: "Track in Transit",
    description:
      "Follow your shipment through its journey using the Sreshta AWB tracking system.",
  },
  {
    number: "04",
    title: "Safe Delivery",
    description:
      "Your shipment reaches its destination with visibility throughout the process.",
  },
];

const testimonials = [
  {
    text: "The process was simple and the shipment updates gave us confidence throughout the journey.",
    name: "Business Customer",
  },
  {
    text: "Sreshta made our regular shipping requirements easier to manage with responsive support.",
    name: "Commercial Client",
  },
  {
    text: "A professional logistics experience with clear communication from pickup to delivery.",
    name: "Retail Customer",
  },
];

function Header() {
  return (
    <header className="site-header">
      <div className="container-site header-inner">
        <Link href={ROUTES.LOGISTICS} aria-label="Sreshta Logistics home">
          <img
            src="/images/sreshta-logistics-logo.png"
            alt="Sreshta Logistics"
            className="header-logo"
          />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
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
            Professional logistics solutions designed around reliable
            movement, clear communication and shipment visibility.
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
            <Link href={ROUTES.LOGISTICS_ABOUT}>About Us</Link>
            <Link href={ROUTES.LOGISTICS_PARTNERSHIP}>Partnership</Link>
            <Link href={ROUTES.LOGISTICS_CONTACT}>Contact</Link>
            <Link href={ROUTES.LOGISTICS_TRACK}>Track Shipment</Link>
          </div>
        </div>

        <div>
          <h3>Get in Touch</h3>
          <div className="footer-links">
            <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
              +91 {CONTACTS.MANAGING_DIRECTOR.phone}
            </a>
            <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
              +91 {CONTACTS.PARTNER.phone}
            </a>
            <span>India</span>
          </div>
        </div>
      </div>

      <div className="container-site footer-bottom">
        © {new Date().getFullYear()} Sreshta Logistics. All rights reserved.
      </div>
    </footer>
  );
}

export default function LogisticsHomePage() {
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="container-site hero-inner">
            <div className="hero-content">
              <span className="hero-eyebrow">
                Domestic • International • Cargo
              </span>

              <h1 className="hero-title">
                Moving Your World.
                <br />
                <span>One Shipment at a Time.</span>
              </h1>

              <p className="hero-description">
                Reliable logistics and freight solutions built around secure
                movement, clear communication and shipment visibility.
              </p>

              <div className="hero-actions">
                <Link href={ROUTES.LOGISTICS_BOOK} className="btn-primary">
                  Book a Freight →
                </Link>
                <Link href={ROUTES.LOGISTICS_SERVICES} className="btn-secondary">
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="tracking-strip">
          <div className="container-site">
            <div className="tracking-card">
              <div className="tracking-heading">
                <div>
                  <h2>Track Your Shipment</h2>
                  <p>
                    Enter your AWB number to view the latest shipment status.
                  </p>
                </div>
              </div>

              {/* Live navigation to dynamic tracking page */}
              <HomeTrackForm />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">
              Complete Logistics Solutions for Every Requirement
            </h2>
            <p className="section-description">
              From individual shipments to commercial freight, Sreshta
              provides flexible logistics solutions designed around your
              delivery requirements.
            </p>

            <div className="card-grid" style={{ marginTop: 40 }}>
              {services.map((service) => (
                <Link
                  href={service.href}
                  className="service-card"
                  key={service.title}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#f5f8fb" }}>
          <div className="container-site">
            <div className="split-grid">
              <div>
                <span className="section-label">Shipping Network</span>
                <h2 className="section-title">
                  Reliable Movement Across India and Beyond
                </h2>
                <p className="section-description">
                  Choose the logistics mode and service model that matches your
                  shipment. Our solutions are designed for documents, parcels,
                  commercial consignments and cargo.
                </p>

                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span>
                    <span>
                      International shipment support with professional
                      documentation and coordination.
                    </span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>
                      Domestic delivery solutions for businesses and
                      individual customers.
                    </span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>
                      Cargo and freight services for larger and commercial
                      shipments.
                    </span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>
                      Shipment tracking for better visibility throughout the
                      journey.
                    </span>
                  </li>
                </ul>

                <div style={{ marginTop: 30 }}>
                  <Link href={ROUTES.LOGISTICS_SERVICES} className="btn-primary">
                    View All Services →
                  </Link>
                </div>
              </div>

              <div className="image-card">
                <img
                  src="/images/logistics-hero-bg.jpg"
                  alt="Sreshta logistics transportation"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">
              Simple, Transparent and Reliable
            </h2>
            <p className="section-description">
              We keep the shipment journey straightforward so customers can
              focus on their business while Sreshta handles the logistics.
            </p>

            <div className="steps" style={{ marginTop: 45 }}>
              {steps.map((step) => (
                <div className="step" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="stats-grid">
              <div className="stat">
                <strong>24/7</strong>
                <span>Shipment Visibility</span>
              </div>
              <div className="stat">
                <strong>3+</strong>
                <span>Core Shipping Modes</span>
              </div>
              <div className="stat">
                <strong>100%</strong>
                <span>Customer Focus</span>
              </div>
              <div className="stat">
                <strong>1</strong>
                <span>Connected Logistics Platform</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="container-site">
            <span className="section-label" style={{ color: "#6de1e5" }}>
              Customer Trust
            </span>
            <h2 className="section-title">
              Professional Service. Clear Communication. Reliable Movement.
            </h2>
            <p className="section-description">
              Sreshta is designed to give customers confidence from booking
              through delivery.
            </p>

            <div className="testimonial-grid" style={{ marginTop: 40 }}>
              {testimonials.map((item) => (
                <div className="testimonial" key={item.name}>
                  <p>“{item.text}”</p>
                  <strong>{item.name}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div
              style={{
                borderRadius: 18,
                background: "linear-gradient(110deg, #06284c, #087f87)",
                padding: "50px",
                color: "white",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: 1.05,
                }}
              >
                Ready to Move Your Shipment?
              </h2>
              <p
                style={{
                  maxWidth: 650,
                  margin: "16px 0 25px",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                Book a freight shipment, request a pickup or speak with our
                team about your logistics requirement.
              </p>
              <div className="hero-actions">
                <Link href={ROUTES.LOGISTICS_BOOK} className="btn-primary">
                  Book a Freight
                </Link>
                <Link href={ROUTES.LOGISTICS_PICKUP} className="btn-secondary">
                  Request Pickup
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}