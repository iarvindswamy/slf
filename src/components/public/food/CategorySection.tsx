import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FolderOpen,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
};

type CategorySectionProps = {
  categories: Category[];
  title?: string;
  description?: string;
};

export default function CategorySection({
  categories,
  title = "Shop by Category",
  description = "Explore our products by category.",
}: CategorySectionProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Categories
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {description}
            </p>
          </div>

          <Link
            href="/food/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/food/categories/${category.slug}`}
              className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-slate-900">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                    {category.description}
                  </p>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                  Explore
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}