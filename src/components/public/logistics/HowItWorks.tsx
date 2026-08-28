import {
  FileText,
  PackageCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Book your shipment",
    description:
      "Provide shipment, sender and receiver details.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Shipment pickup",
    description:
      "Your shipment is collected and processed.",
    icon: PackageCheck,
  },
  {
    number: "03",
    title: "Track in transit",
    description:
      "Follow shipment movement through the tracking system.",
    icon: Truck,
  },
  {
    number: "04",
    title: "Delivered",
    description:
      "Shipment reaches its destination successfully.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Shipping made simple
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            A straightforward process from booking to final
            delivery.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector */}
          <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gray-200 lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white shadow-md">
                  <Icon className="h-6 w-6" />
                </div>

                <span className="mt-5 block text-xs font-bold tracking-wider text-gray-400">
                  STEP {step.number}
                </span>

                <h3 className="mt-2 font-semibold text-slate-900">
                  {step.title}
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}