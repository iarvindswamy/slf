import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

type FoodHeroProps = {
  title?: string;
  subtitle?: string;
};

export default function FoodHero({
  title = "Quality Food Products, Delivered to You.",
  subtitle = "Explore our collection of carefully selected food products, variants and convenient delivery options.",
}: FoodHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
            <ShoppingBag className="h-4 w-4" />
            Sreshta Food
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/food/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Shop Products
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/food/categories"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[420px] lg:block">
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <Image
              src="/images/default-product-placeholder.png"
              alt="Food products"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sreshta Food
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              Discover products you'll love.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}