import Link from "next/link";

type FooterProps = {
  module?: "LOGISTICS" | "FOOD" | "BOTH";
};

export default function Footer({
  module = "BOTH",
}: FooterProps) {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">

        <div className="grid gap-8 md:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">
                S
              </div>

              <span className="font-semibold text-gray-900">
                Sreshta
              </span>
            </div>

            <p className="max-w-xs text-sm leading-6 text-gray-500">
              Reliable logistics and quality food
              products through one connected platform.
            </p>
          </div>

          {/* Logistics */}
          {(module === "BOTH" ||
            module === "LOGISTICS") && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Logistics
              </h3>

              <div className="space-y-2 text-sm text-gray-500">
                <Link
                  href="/logistics"
                  className="block hover:text-gray-900"
                >
                  Logistics Home
                </Link>

                <Link
                  href="/logistics/services"
                  className="block hover:text-gray-900"
                >
                  Services
                </Link>

                <Link
                  href="/logistics/track"
                  className="block hover:text-gray-900"
                >
                  Track Shipment
                </Link>

                <Link
                  href="/logistics/book-freight"
                  className="block hover:text-gray-900"
                >
                  Book Freight
                </Link>
              </div>
            </div>
          )}

          {/* Food */}
          {(module === "BOTH" ||
            module === "FOOD") && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Food
              </h3>

              <div className="space-y-2 text-sm text-gray-500">
                <Link
                  href="/food"
                  className="block hover:text-gray-900"
                >
                  Food Home
                </Link>

                <Link
                  href="/food/products"
                  className="block hover:text-gray-900"
                >
                  Products
                </Link>

                <Link
                  href="/food/cart"
                  className="block hover:text-gray-900"
                >
                  Cart
                </Link>

                <Link
                  href="/food/checkout"
                  className="block hover:text-gray-900"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Company
            </h3>

            <div className="space-y-2 text-sm text-gray-500">
              <Link
                href="/logistics/about"
                className="block hover:text-gray-900"
              >
                About
              </Link>

              <Link
                href="/logistics/contact"
                className="block hover:text-gray-900"
              >
                Contact
              </Link>

              <Link
                href="/privacy"
                className="block hover:text-gray-900"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="block hover:text-gray-900"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t pt-6 text-xs text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Sreshta.
            All rights reserved.
          </p>

          <p>
            Logistics & Food Platform
          </p>
        </div>
      </div>
    </footer>
  );
}