"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

type LocalCartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  image?: string;
};

const CART_STORAGE_KEY = "sreshta-food-cart";

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

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug || "").trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
              : "Failed to load product.",
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
              : "Failed to load product.",
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

  const product = useMemo(() => {
    if (!slug) {
      return null;
    }

    return (
      products.find((item) => item.slug === slug) ?? null
    );
  }, [products, slug]);

  useEffect(() => {
    if (!product) {
      setSelectedVariant("");
      return;
    }

    setSelectedVariant(product.variants[0]?.id ?? "");
    setQuantity(1);
    setAdded(false);
  }, [product]);

  const variant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      product.variants.find(
        (item) => item.id === selectedVariant,
      ) ?? product.variants[0] ?? null
    );
  }, [product, selectedVariant]);

  function addToCart() {
    if (!product || !variant) {
      return;
    }

    const existingRaw = localStorage.getItem(CART_STORAGE_KEY);

    let cart: LocalCartItem[] = [];

    try {
      cart = existingRaw ? JSON.parse(existingRaw) : [];
      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.productId &&
        item.variantId === variant.id,
    );

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: cart[existingIndex].quantity + quantity,
        price: variant.price,
        productName: product.name,
        variantName: variant.label,
        variantLabel: variant.label,
        imageUrl: product.image,
        image: product.image,
      };
    } else {
      cart.push({
        productId: product.productId,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.label,
        variantLabel: variant.label,
        price: variant.price,
        quantity,
        imageUrl: product.image,
        image: product.image,
      });
    }

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart),
    );

    window.dispatchEvent(new Event("storage"));
    setAdded(true);
  }

  return (
    <>
      <Header />

      <main>
        <section className="section">
          <div className="container-site">
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
                  Loading product...
                </h2>
                <p style={{ color: "#78716c", margin: 0 }}>
                  Please wait while we fetch product details.
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
                  Could not load product
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
            ) : !product || !variant ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 70,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fffaf5",
                }}
              >
                <h2 style={{ color: "#451a03" }}>
                  Product not found
                </h2>
                <p style={{ color: "#78716c" }}>
                  This product is unavailable or the link is
                  invalid.
                </p>
                <Link
                  href="/food/products"
                  className="btn-primary"
                  style={{
                    marginTop: 15,
                    background: "#d97706",
                  }}
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="split-grid">
                <div
                  style={{
                    borderRadius: 18,
                    background: "#fff8ef",
                    padding: 50,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "80%",
                      maxHeight: 450,
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div>
                  <span
                    className="section-label"
                    style={{ color: "#b45309" }}
                  >
                    {product.category}
                  </span>

                  <h1
                    style={{
                      margin: 0,
                      color: "#451a03",
                      fontSize: "clamp(2.3rem, 5vw, 4rem)",
                      lineHeight: 1,
                    }}
                  >
                    {product.name}
                  </h1>

                  <p
                    style={{
                      color: "#78716c",
                      marginTop: 20,
                      fontSize: 16,
                    }}
                  >
                    {product.description}
                  </p>

                  <div style={{ marginTop: 30 }}>
                    <label
                      className="form-label"
                      htmlFor="variant"
                    >
                      Choose Quantity
                    </label>

                    <select
                      id="variant"
                      className="select"
                      style={{ marginTop: 8 }}
                      value={selectedVariant}
                      onChange={(event) => {
                        setSelectedVariant(event.target.value);
                        setAdded(false);
                      }}
                    >
                      {product.variants.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.label} — ₹{item.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <label className="form-label">
                      Quantity
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        marginTop: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity((value) =>
                            Math.max(1, value - 1),
                          );
                          setAdded(false);
                        }}
                        style={{
                          width: 42,
                          height: 42,
                          border: "1px solid #e7d8c6",
                          borderRadius: 8,
                          background: "#fff",
                        }}
                      >
                        −
                      </button>

                      <strong>{quantity}</strong>

                      <button
                        type="button"
                        onClick={() => {
                          setQuantity((value) => value + 1);
                          setAdded(false);
                        }}
                        style={{
                          width: 42,
                          height: 42,
                          border: "1px solid #e7d8c6",
                          borderRadius: 8,
                          background: "#fff",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 20,
                    }}
                  >
                    <strong
                      style={{
                        color: "#92400e",
                        fontSize: 28,
                      }}
                    >
                      ₹{variant.price * quantity}
                    </strong>

                    <button
                      type="button"
                      onClick={addToCart}
                      className="btn-primary"
                      style={{
                        background: "#d97706",
                        minHeight: 52,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>

                  {added && (
                    <div className="notice">
                      Product added to your cart successfully.
                      <div style={{ marginTop: 8 }}>
                        <Link
                          href="/food/cart"
                          style={{
                            color: "#92400e",
                            fontWeight: 800,
                          }}
                        >
                          View Cart →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          className="section"
          style={{ background: "#fffbf7" }}
        >
          <div className="container-site">
            <h2
              className="section-title"
              style={{
                color: "#451a03",
                fontSize: "2.2rem",
              }}
            >
              Product Highlights
            </h2>

            <div
              className="card-grid"
              style={{ marginTop: 35 }}
            >
              <div className="service-card">
                <div className="service-icon">✓</div>
                <h3>Carefully Selected</h3>
                <p>
                  Product selection focused on quality and
                  consistency.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">⚖</div>
                <h3>Multiple Variants</h3>
                <p>
                  Select the quantity that works for your
                  requirement.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">📦</div>
                <h3>Easy Ordering</h3>
                <p>
                  Add products to your cart and continue to
                  checkout.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">🔎</div>
                <h3>Order Tracking</h3>
                <p>
                  Track your order after successful purchase.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}