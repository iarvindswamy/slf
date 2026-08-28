"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type CouponType = "PERCENTAGE" | "FIXED";

type Coupon = {
  couponId: string;
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  enabled: boolean;
};

type CouponForm = {
  code: string;
  type: CouponType;
  value: string;
  minimumOrderAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
};

type ApiListResponse =
  | {
      success: true;
      data: Record<string, unknown>[] | {
        coupons?: Record<string, unknown>[];
        data?: Record<string, unknown>[];
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

type ApiMutationResponse =
  | {
      success: true;
      data?: unknown;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minimumOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
};

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.type === "PERCENTAGE") {
    return `${coupon.value}%`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(coupon.value);
}

function formatUsage(coupon: Coupon): string {
  const used = coupon.usedCount || 0;
  const limit =
    coupon.usageLimit === undefined || coupon.usageLimit === null
      ? "∞"
      : String(coupon.usageLimit);

  return `${used} / ${limit}`;
}

function normalizeCoupon(
  raw: Record<string, unknown>,
): Coupon | null {
  const couponId = String(raw.couponId || raw.id || "").trim();
  const code = String(raw.code || "").trim().toUpperCase();

  if (!couponId || !code) {
    return null;
  }

  const typeRaw = String(raw.type || "PERCENTAGE").toUpperCase();
  const type: CouponType =
    typeRaw === "FIXED" ? "FIXED" : "PERCENTAGE";

  const enabled =
    raw.enabled === undefined
      ? String(raw.status || "ACTIVE").toUpperCase() !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    couponId,
    code,
    type,
    value: Number(raw.value || 0),
    minimumOrderAmount:
      raw.minimumOrderAmount !== undefined
        ? Number(raw.minimumOrderAmount)
        : undefined,
    maximumDiscount:
      raw.maximumDiscount !== undefined
        ? Number(raw.maximumDiscount)
        : undefined,
    usageLimit:
      raw.usageLimit !== undefined && raw.usageLimit !== null
        ? Number(raw.usageLimit)
        : undefined,
    usedCount: Number(raw.usedCount || 0),
    startsAt: raw.startsAt ? String(raw.startsAt) : undefined,
    expiresAt: raw.expiresAt ? String(raw.expiresAt) : undefined,
    enabled,
  };
}

export default function CouponsPage() {
  const { user, loading: authLoading } = useAuth();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadCoupons() {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch("/api/food/coupons", {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const json = (await res.json()) as ApiListResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error.message
              : "Failed to load coupons. Ensure /api/food/coupons exists.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.coupons)
            ? payload.coupons
            : Array.isArray(payload.data)
              ? payload.data
              : [];

        const normalized = list
          .map((item) => normalizeCoupon(item))
          .filter(Boolean) as Coupon[];

        if (!cancelled) {
          setCoupons(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load coupons.",
          );
          setCoupons([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCoupons();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const activeCount = useMemo(
    () => coupons.filter((coupon) => coupon.enabled).length,
    [coupons],
  );

  function updateForm<K extends keyof CouponForm>(
    key: K,
    value: CouponForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function createCoupon() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const code = form.code.trim().toUpperCase();
      const value = Number(form.value);

      if (!code) {
        throw new Error("Coupon code is required.");
      }

      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Discount value must be greater than zero.");
      }

      const token = await user.getIdToken();

      const payload = {
        code,
        type: form.type,
        value,
        minimumOrderAmount: form.minimumOrderAmount
          ? Number(form.minimumOrderAmount)
          : undefined,
        usageLimit: form.usageLimit
          ? Number(form.usageLimit)
          : undefined,
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
        enabled: true,
      };

      const res = await fetch("/api/food/coupons", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiMutationResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to create coupon.",
        );
      }

      setMessage("Coupon created successfully.");
      setForm(EMPTY_FORM);
      setShowForm(false);
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create coupon.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(coupon: Coupon) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();

      const res = await fetch("/api/food/coupons", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          couponId: coupon.couponId,
          enabled: !coupon.enabled,
        }),
      });

      const json = (await res.json()) as ApiMutationResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to update coupon.",
        );
      }

      setCoupons((current) =>
        current.map((item) =>
          item.couponId === coupon.couponId
            ? {
                ...item,
                enabled: !item.enabled,
              }
            : item,
        ),
      );

      setMessage(
        `Coupon ${coupon.code} marked as ${
          !coupon.enabled ? "ACTIVE" : "INACTIVE"
        }.`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update coupon.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
            Coupons
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage promotional discount coupons.
            {coupons.length > 0
              ? ` ${activeCount} active of ${coupons.length}.`
              : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            {showForm ? "Close Form" : "+ Create Coupon"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-[#3b2516]">
            Create Coupon
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Coupon Code
              </label>
              <input
                value={form.code}
                onChange={(e) =>
                  updateForm("code", e.target.value.toUpperCase())
                }
                placeholder="WELCOME10"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Discount Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  updateForm(
                    "type",
                    e.target.value as CouponType,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed (₹)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Discount Value
              </label>
              <input
                value={form.value}
                onChange={(e) => updateForm("value", e.target.value)}
                placeholder={form.type === "PERCENTAGE" ? "10" : "100"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Minimum Order
              </label>
              <input
                value={form.minimumOrderAmount}
                onChange={(e) =>
                  updateForm("minimumOrderAmount", e.target.value)
                }
                placeholder="500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Maximum Uses
              </label>
              <input
                value={form.usageLimit}
                onChange={(e) =>
                  updateForm("usageLimit", e.target.value)
                }
                placeholder="500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Start Date
              </label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) =>
                  updateForm("startsAt", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                End Date
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  updateForm("expiresAt", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={createCoupon}
            disabled={saving}
            className="mt-4 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Coupon"}
          </button>
        </section>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading coupons...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching promotional codes from the server.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">couponId</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Expires</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      No coupons found. Create your first coupon.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.couponId}>
                      <td className="px-5 py-4 font-mono text-xs text-orange-600">
                        {coupon.couponId}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {coupon.code}
                      </td>

                      <td className="px-5 py-4">
                        {formatDiscount(coupon)}
                      </td>

                      <td className="px-5 py-4">
                        {formatUsage(coupon)}
                      </td>

                      <td className="px-5 py-4">
                        {formatDate(coupon.expiresAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            coupon.enabled
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {coupon.enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => toggleCoupon(coupon)}
                          className="text-xs font-bold text-orange-600"
                        >
                          {coupon.enabled
                            ? "Disable →"
                            : "Enable →"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}