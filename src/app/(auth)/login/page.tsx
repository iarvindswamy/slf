"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    /*
     * FRONTEND-ONLY MOCK
     *
     * Real implementation:
     *
     * POST /api/auth/login
     *       ↓
     * Firebase Authentication
     *       ↓
     * Application session
     *       ↓
     * Role-aware authorization
     */

    setTimeout(() => {
      setLoading(false);

      localStorage.setItem(
        "sreshta-demo-auth",
        JSON.stringify({
          userId: "demo-user",
          email,
          role: "ADMIN",
          module: "LOGISTICS",
          isAuthenticated: true,
        }),
      );

      router.push("/admin");
    }, 700);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr .9fr",
        background: "#f7fafc",
      }}
    >
      <section
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: 70,
          background:
            "linear-gradient(135deg, #06284c, #087f87)",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 650,
          }}
        >
          <Link href="/">
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta"
              style={{
                width: 190,
                filter: "brightness(0) invert(1)",
                marginBottom: 45,
              }}
            />
          </Link>

          <span
            style={{
              display: "inline-block",
              marginBottom: 15,
              color: "#75e1e4",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Sreshta Business Platform
          </span>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              lineHeight: 1,
              letterSpacing: "-.045em",
            }}
          >
            Manage logistics.
            <br />
            Manage food.
            <br />
            One platform.
          </h1>

          <p
            style={{
              maxWidth: 550,
              marginTop: 25,
              color: "rgba(255,255,255,.72)",
              fontSize: 16,
            }}
          >
            Secure access to the Sreshta operational platform for logistics,
            food, orders, shipments and administration.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginTop: 40,
            }}
          >
            {[
              ["LOGISTICS", "Shipments"],
              ["FOOD", "Orders"],
              ["ADMIN", "Operations"],
            ].map(([title, text]) => (
              <div
                key={title}
                style={{
                  border:
                    "1px solid rgba(255,255,255,.12)",
                  borderRadius: 10,
                  background:
                    "rgba(255,255,255,.05)",
                  padding: 16,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#fff",
                    fontSize: 12,
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    color:
                      "rgba(255,255,255,.55)",
                    fontSize: 12,
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          placeItems: "center",
          padding: 30,
        }}
      >
        <div
          style={{
            width: "min(460px, 100%)",
            border: "1px solid #dbe5ee",
            borderRadius: 16,
            background: "#fff",
            padding: 35,
            boxShadow:
              "0 25px 70px rgba(8,45,85,.08)",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                marginBottom: 12,
                color: "#087f87",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              Secure Login
            </span>

            <h2
              style={{
                margin: 0,
                color: "#082d55",
                fontSize: 32,
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: 14,
                marginTop: 8,
              }}
            >
              Sign in to access the Sreshta platform.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 18,
              marginTop: 30,
            }}
          >
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="email"
              >
                Email Address
              </label>

              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="password"
              >
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    paddingRight: 90,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 7,
                    minHeight: 34,
                    border: 0,
                    borderRadius: 6,
                    background: "#f1f5f9",
                    padding: "0 10px",
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="notice error"
                style={{ marginTop: 0 }}
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                minHeight: 52,
              }}
            >
              {loading
                ? "Signing in..."
                : "Sign In →"}
            </button>
          </form>

          <div
            style={{
              marginTop: 25,
              borderTop: "1px solid #e2e8f0",
              paddingTop: 20,
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#64748b",
                marginBottom: 4,
              }}
            >
              Development mode
            </strong>

            Authentication is currently represented by a frontend mock. The
            final implementation will use Firebase Authentication and
            server-side authorization.
          </div>

          <div
            style={{
              marginTop: 20,
              textAlign: "center",
            }}
          >
            <Link
              href="/food"
              style={{
                color: "#087f87",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ← Back to Sreshta Foods
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}