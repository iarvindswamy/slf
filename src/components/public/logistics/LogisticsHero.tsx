"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
  Globe2,
} from "lucide-react";

type LogisticsHeroProps = {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
};

export default function LogisticsHero({
  title = "Reliable Logistics. Delivered with Confidence.",
  subtitle = "Domestic and international logistics solutions for businesses and individuals, with transparent tracking and dependable service.",
  backgroundImage = "/images/logistics-hero-bg.jpg",
}: LogisticsHeroProps) {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-slate-950">
      {/* Background */}
      <Image
        src={backgroundImage}
        alt="Logistics transportation"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          {/* Content */}
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Trusted logistics solutions
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/logistics/book-freight"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Book a Shipment
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/logistics/track"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Track Shipment
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "Domestic delivery",
                "International shipping",
                "End-to-end tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right cards */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl bg-white p-5">
                  <Package className="h-7 w-7 text-slate-900" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Express Shipments
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Fast and dependable movement of your shipments.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-5">
                  <Truck className="h-7 w-7 text-slate-900" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Domestic Logistics
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Door-to-door delivery across locations.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-5">
                  <Globe2 className="h-7 w-7 text-slate-900" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    International
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    International cargo and freight solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}