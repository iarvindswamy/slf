import Link from "next/link";
import {
  ArrowRight,
  Plane,
  Truck,
  Ship,
  Package,
} from "lucide-react";

const modes = [
  {
    title: "Air Freight",
    description:
      "For shipments where speed and reliable movement are important.",
    icon: Plane,
    href: "/logistics/international",
  },
  {
    title: "Road Transport",
    description:
      "Domestic movement through dependable road transportation.",
    icon: Truck,
    href: "/logistics/domestic",
  },
  {
    title: "Sea Freight",
    description:
      "Suitable for larger international cargo and freight requirements.",
    icon: Ship,
    href: "/logistics/cargo-freight",
  },
  {
    title: "Express",
    description:
      "Time-sensitive shipment options for urgent requirements.",
    icon: Package,
    href: "/logistics/services",
  },
];

export default function ShippingModes() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Shipping Modes
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Choose the right way to move your shipment
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              Flexible transportation options for different
              shipment sizes, destinations and delivery
              requirements.
            </p>
          </div>

          <Link
            href="/logistics/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            View all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {modes.map((mode) => {
            const Icon = mode.icon;

            return (
              <Link
                key={mode.title}
                href={mode.href}
                className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  {mode.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                  Explore
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}