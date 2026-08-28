import Link from "next/link";
import {
  ArrowRight,
  Plane,
  Truck,
  Ship,
  Package,
  Warehouse,
  Boxes,
} from "lucide-react";

type Service = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const services: Service[] = [
  {
    title: "Domestic Logistics",
    description:
      "Reliable shipment movement across domestic destinations.",
    href: "/logistics/domestic",
    icon: <Truck className="h-6 w-6" />,
  },
  {
    title: "International Logistics",
    description:
      "International shipping solutions for documents and cargo.",
    href: "/logistics/international",
    icon: <Plane className="h-6 w-6" />,
  },
  {
    title: "Cargo & Freight",
    description:
      "Freight solutions for larger and commercial shipments.",
    href: "/logistics/cargo-freight",
    icon: <Ship className="h-6 w-6" />,
  },
  {
    title: "Express Delivery",
    description:
      "Time-sensitive shipment handling and delivery.",
    href: "/logistics/services",
    icon: <Package className="h-6 w-6" />,
  },
  {
    title: "Warehousing",
    description:
      "Storage and handling solutions for business requirements.",
    href: "/logistics/services",
    icon: <Warehouse className="h-6 w-6" />,
  },
  {
    title: "Bulk Shipments",
    description:
      "Efficient handling of multiple pieces and larger consignments.",
    href: "/logistics/cargo-freight",
    icon: <Boxes className="h-6 w-6" />,
  },
];

type ServiceCardsProps = {
  servicesData?: Service[];
};

export default function ServiceCards({
  servicesData = services,
}: ServiceCardsProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Our Services
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Logistics solutions built around your needs
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            From individual shipments to commercial freight,
            choose the service that fits your requirement.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition group-hover:bg-slate-900 group-hover:text-white">
                {service.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {service.description}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                Learn more
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}