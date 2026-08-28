import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
          404
        </p>

        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Page not found
        </h1>

        <p className="mt-4 text-slate-500">
          The page you are looking for doesn't
          exist or may have been moved.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/logistics"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Logistics
          </Link>

          <Link
            href="/food"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Sreshta Foods
          </Link>
        </div>
      </div>
    </main>
  );
}