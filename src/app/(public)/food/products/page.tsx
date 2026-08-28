"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductVariant = {
  id: string;
  label: string;
  price: number;
};

type Product = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  status: "ACTIVE" | "INACTIVE";
  featured: boolean;
  variants: ProductVariant[];
};

type ApiResponse =
  | {
      success: true;
      data: Record<string, unknown>[];
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeProduct(
  raw: Record<string, unknown>,
): Product | null {
  const id = String(raw.id || raw.productId || "");
  const productId = String(raw.productId || raw.id || id);
  const name = String(raw.name || "").trim();
  const slug = String(raw.slug || slugify(name) || id);

  if (!id || !name) {
    return null;
  }

  const status =
    String(raw.status || "ACTIVE").toUpperCase() === "INACTIVE"
      ? "INACTIVE"
      : "ACTIVE";

  if (status !== "ACTIVE") {
    return null;
  }

  const category =
    String(raw.categoryName || raw.category || "General").trim() ||
    "General";

  const image = String(
    raw.imageUrl ||
      raw.image ||
      "/images/default-product-placeholder.png",
  );

  const description = String(raw.description || "");
  const featured = Boolean(raw.featured);

  const rawVariants = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
    : [];

  const variants: ProductVariant[] = rawVariants
    .map((variant, index) => {
      const enabled =
        variant.enabled === undefined
          ? true
          : Boolean(variant.enabled);

      if (!enabled) {
        return null;
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price) || price < 0) {
        return null;
      }

      return {
        id: String(
          variant.variantId ||
            variant.id ||
            `${productId}-v${index}`,
        ),
        label: String(
          variant.name ||
            variant.label ||
            `Option ${index + 1}`,
        ),
        price,
      };
    })
    .filter(Boolean) as ProductVariant[];

  if (variants.length === 0) {
    return null;
  }

  return {
    id,
    productId,
    slug,
    name,
    category,
    description,
    image,
    status,
    featured,
    variants,
  };
}

function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #f0e5d6",
      }}
    >
      <div
        className="container-site"
        style={{
          minHeight: 78,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 25,
        }}
      >
        <Link href="/food">
          <img
            src="/images/sreshta-food-logo.png"
            alt="Sreshta Foods"
            style={{ width: 165 }}
          />
        </Link>

        <nav style={{ display: "flex", gap: 25 }}>
          <Link href="/food">Home</Link>
          <Link href="/food/products">Products</Link>
          <Link href="/food/categories/dry-fruits">
            Categories
          </Link>
        </nav>

        <Link
          href="/food/cart"
          className="btn-primary"
          style={{ background: "#d97706" }}
        >
          🛒 Cart
        </Link>
      </div>
    </header>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/food/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load products.",
          );
        }

        const list = Array.isArray(json.data) ? json.data : [];
        const normalized = list
          .map((item) => normalizeProduct(item))
          .filter(Boolean) as Product[];

        if (!cancelled) {
          setProducts(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load products.",
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category)),
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <>
      <Header />

      <main>
        <section
          style={{
            background: "#fff7ed",
            padding: "75px 0",
          }}
        >
          <div className="container-site">
            <span
              className="section-label"
              style={{ color: "#b45309" }}
            >
              Sreshta Foods
            </span>

            <h1
              className="section-title"
              style={{ color: "#451a03" }}
            >
              Shop Our Products
            </h1>

            <p className="section-description">
              Browse our collection and choose the quantity that
              suits you.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: 12,
                marginBottom: 35,
              }}
            >
              <input
                className="input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                disabled={loading}
              />

              <select
                className="select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={loading}
              >
                {categories.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <h2 style={{ color: "#451a03", marginBottom: 8 }}>
                  Loading products...
                </h2>
                <p style={{ color: "#78716c", margin: 0 }}>
                  Please wait while we fetch the latest catalog.
                </p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #fecaca",
                  borderRadius: 14,
                  background: "#fef2f2",
                }}
              >
                <h2 style={{ color: "#991b1b", marginBottom: 8 }}>
                  Could not load products
                </h2>
                <p style={{ color: "#7f1d1d", margin: 0 }}>
                  {error}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{
                    marginTop: 20,
                    background: "#d97706",
                  }}
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <h2 style={{ color: "#451a03", marginBottom: 8 }}>
                  No products found
                </h2>
                <p style={{ color: "#78716c", margin: 0 }}>
                  {products.length === 0
                    ? "No products are available yet."
                    : "Try a different search or category."}
                </p>
              </div>
            ) : (
              <div className="card-grid">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/food/products/${product.slug}`}
                    key={product.productId}
                    style={{
                      overflow: "hidden",
                      border: "1px solid #f0e5d6",
                      borderRadius: 14,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "1",
                        background: "#fff8ef",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "75%",
                          height: "75%",
                          objectFit: "contain",
                        }}
                      />
                    </div>

                    <div style={{ padding: 20 }}>
                      <span
                        style={{
                          color: "#b45309",
                          fontSize: 12,
                          fontWeight: 750,
                        }}
                      >
                        {product.category}
                      </span>

                      <h3
                        style={{
                          color: "#451a03",
                          margin: "6px 0",
                        }}
                      >
                        {product.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#78716c",
                          fontSize: 13,
                        }}
                      >
                        {product.description}
                      </p>

                      <strong
                        style={{
                          display: "block",
                          marginTop: 14,
                          color: "#92400e",
                        }}
                      >
                        From ₹
                        {Math.min(
                          ...product.variants.map(
                            (variant) => variant.price,
                          ),
                        )}
                      </strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}