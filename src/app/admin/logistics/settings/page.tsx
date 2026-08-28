"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type LogisticsSettings = {
  companyDisplayName: string;
  defaultServiceCenter: string;
  defaultCurrency: string;
  requireCustomerSelection: boolean;
  requireReceiverPhone: boolean;
  requireShipmentDescription: boolean;
  enablePublicTracking: boolean;
  showLatestLocationPublicly: boolean;
  showInternalNotesPublicly: boolean;
  enableTransactionalNotifications: boolean;
  enableWhatsAppIntegration: boolean;
};

type ApiResponse =
  | {
      success: true;
      data: LogisticsSettings;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const DEFAULT_SETTINGS: LogisticsSettings = {
  companyDisplayName: "Sreshta Logistics",
  defaultServiceCenter: "",
  defaultCurrency: "INR",
  requireCustomerSelection: true,
  requireReceiverPhone: true,
  requireShipmentDescription: true,
  enablePublicTracking: true,
  showLatestLocationPublicly: true,
  showInternalNotesPublicly: false,
  enableTransactionalNotifications: true,
  enableWhatsAppIntegration: false,
};

export default function LogisticsSettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const [settings, setSettings] =
    useState<LogisticsSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to manage settings.");
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/settings", {
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
            json.error?.message || "Failed to load logistics settings.",
          );
        }

        if (!cancelled) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...json.data,
          });
          setDirty(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load logistics settings.",
          );
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  function updateField<K extends keyof LogisticsSettings>(
    key: K,
    value: LogisticsSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setDirty(true);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const companyDisplayName = settings.companyDisplayName.trim();

      if (!companyDisplayName) {
        throw new Error("Company display name is required.");
      }

      if (!settings.defaultCurrency.trim()) {
        throw new Error("Default currency is required.");
      }

      const token = await user.getIdToken();

      const payload: LogisticsSettings = {
        ...settings,
        companyDisplayName,
        defaultServiceCenter: settings.defaultServiceCenter.trim(),
        defaultCurrency: settings.defaultCurrency.trim().toUpperCase(),
      };

      const res = await fetch("/api/logistics/settings", {
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
          json.error?.message || "Failed to save logistics settings.",
        );
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...json.data,
      });
      setDirty(false);
      setMessage(json.message || "Settings saved successfully.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save logistics settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
          Logistics
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
          Logistics Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure operational preferences. Changes are stored server-side.
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
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading settings…
          </h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="General">
            <Field
              label="Company Display Name"
              value={settings.companyDisplayName}
              onChange={(value) => updateField("companyDisplayName", value)}
              required
            />
            <Field
              label="Default Service Center"
              value={settings.defaultServiceCenter}
              onChange={(value) => updateField("defaultServiceCenter", value)}
              placeholder="serviceCenterId (optional)"
            />
            <Field
              label="Default Currency"
              value={settings.defaultCurrency}
              onChange={(value) => updateField("defaultCurrency", value)}
              required
            />
          </Section>

          <Section title="Booking">
            <Toggle
              label="Require customer selection"
              checked={settings.requireCustomerSelection}
              onChange={(value) =>
                updateField("requireCustomerSelection", value)
              }
            />
            <Toggle
              label="Require receiver phone"
              checked={settings.requireReceiverPhone}
              onChange={(value) => updateField("requireReceiverPhone", value)}
            />
            <Toggle
              label="Require shipment description"
              checked={settings.requireShipmentDescription}
              onChange={(value) =>
                updateField("requireShipmentDescription", value)
              }
            />
          </Section>

          <Section title="Tracking">
            <Toggle
              label="Enable public tracking"
              checked={settings.enablePublicTracking}
              onChange={(value) => updateField("enablePublicTracking", value)}
            />
            <Toggle
              label="Show latest location publicly"
              checked={settings.showLatestLocationPublicly}
              onChange={(value) =>
                updateField("showLatestLocationPublicly", value)
              }
            />
            <Toggle
              label="Show internal operational notes publicly"
              checked={settings.showInternalNotesPublicly}
              onChange={(value) =>
                updateField("showInternalNotesPublicly", value)
              }
            />
          </Section>

          <Section title="Notifications">
            <Toggle
              label="Enable transactional notifications"
              checked={settings.enableTransactionalNotifications}
              onChange={(value) =>
                updateField("enableTransactionalNotifications", value)
              }
            />
            <Toggle
              label="Enable WhatsApp integration"
              checked={settings.enableWhatsAppIntegration}
              onChange={(value) =>
                updateField("enableWhatsAppIntegration", value)
              }
            />
          </Section>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={saving || !dirty}
              className="rounded-lg bg-[#087f87] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Settings are stored in Firestore and protected by auth + permission
        checks. Client UI never bypasses server authorization.
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
        <h3 className="font-bold text-[#06284c]">{title}</h3>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
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
        className="h-4 w-4 accent-[#087f87]"
      />
    </label>
  );
}