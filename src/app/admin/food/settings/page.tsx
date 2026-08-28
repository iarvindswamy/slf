"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type FoodSettings = {
  storeName: string;
  defaultCurrency: string;
  supportEmail: string;
  supportPhone: string;
  allowProductVariants: boolean;
  showOutOfStockProducts: boolean;
  allowProductReviews: boolean;
  acceptNewOrders: boolean;
  requirePaymentBeforeProcessing: boolean;
  enableOrderNotifications: boolean;
  paymentProvider: string;
  enableCashfreePayments: boolean;
};

type ApiResponse =
  | {
      success: true;
      data: FoodSettings;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const DEFAULT_SETTINGS: FoodSettings = {
  storeName: "Sreshta Foods",
  defaultCurrency: "INR",
  supportEmail: "",
  supportPhone: "",
  allowProductVariants: true,
  showOutOfStockProducts: false,
  allowProductReviews: false,
  acceptNewOrders: true,
  requirePaymentBeforeProcessing: true,
  enableOrderNotifications: true,
  paymentProvider: "Cashfree",
  enableCashfreePayments: false,
};

export default function FoodSettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState<FoodSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to manage settings.");
        }

        const token = await user.getIdToken();
        const res = await fetch("/api/food/settings", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(
            json.error?.message || "Failed to load food settings.",
          );
        }

        if (!cancelled) {
          setSettings({ ...DEFAULT_SETTINGS, ...json.data });
          setDirty(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load food settings.",
          );
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  function updateField<K extends keyof FoodSettings>(
    key: K,
    value: FoodSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setDirty(true);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      if (!settings.storeName.trim()) {
        throw new Error("Store name is required.");
      }

      if (!settings.defaultCurrency.trim()) {
        throw new Error("Default currency is required.");
      }

      const token = await user.getIdToken();

      const payload: FoodSettings = {
        ...settings,
        storeName: settings.storeName.trim(),
        defaultCurrency: settings.defaultCurrency.trim().toUpperCase(),
        supportEmail: settings.supportEmail.trim().toLowerCase(),
        supportPhone: settings.supportPhone.trim(),
        paymentProvider: settings.paymentProvider.trim() || "Cashfree",
      };

      const res = await fetch("/api/food/settings", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.success) {
        throw new Error(
          json.error?.message || "Failed to save food settings.",
        );
      }

      setSettings({ ...DEFAULT_SETTINGS, ...json.data });
      setDirty(false);
      setMessage(json.message || "Food settings saved.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save food settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Food
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
          Food Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage food storefront and order preferences.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading settings…
          </h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="Store">
            <Field
              label="Store Name"
              value={settings.storeName}
              onChange={(v) => updateField("storeName", v)}
              required
            />
            <Field
              label="Default Currency"
              value={settings.defaultCurrency}
              onChange={(v) => updateField("defaultCurrency", v)}
              required
            />
            <Field
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(v) => updateField("supportEmail", v)}
            />
            <Field
              label="Support Phone"
              value={settings.supportPhone}
              onChange={(v) => updateField("supportPhone", v)}
            />
          </Section>

          <Section title="Products">
            <Toggle
              label="Allow product variants"
              checked={settings.allowProductVariants}
              onChange={(v) => updateField("allowProductVariants", v)}
            />
            <Toggle
              label="Show out-of-stock products"
              checked={settings.showOutOfStockProducts}
              onChange={(v) => updateField("showOutOfStockProducts", v)}
            />
            <Toggle
              label="Allow product reviews"
              checked={settings.allowProductReviews}
              onChange={(v) => updateField("allowProductReviews", v)}
            />
          </Section>

          <Section title="Orders">
            <Toggle
              label="Accept new orders"
              checked={settings.acceptNewOrders}
              onChange={(v) => updateField("acceptNewOrders", v)}
            />
            <Toggle
              label="Require payment before processing"
              checked={settings.requirePaymentBeforeProcessing}
              onChange={(v) =>
                updateField("requirePaymentBeforeProcessing", v)
              }
            />
            <Toggle
              label="Enable order notifications"
              checked={settings.enableOrderNotifications}
              onChange={(v) => updateField("enableOrderNotifications", v)}
            />
          </Section>

          <Section title="Payments">
            <Field
              label="Payment Provider"
              value={settings.paymentProvider}
              onChange={(v) => updateField("paymentProvider", v)}
            />
            <Toggle
              label="Enable Cashfree payments"
              checked={settings.enableCashfreePayments}
              onChange={(v) => updateField("enableCashfreePayments", v)}
            />
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !dirty}
              className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Cashfree credentials must never be stored here or exposed to browser
        JS. Payment secrets stay in server env vars; this page only stores
        feature flags and storefront preferences in Firestore.
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="font-bold text-[#3b2516]">{title}</h3>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-orange-600"
      />
    </label>
  );
}