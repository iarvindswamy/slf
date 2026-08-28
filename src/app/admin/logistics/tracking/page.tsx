"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  TRACKING_STATUSES,
  type TrackingStatus,
} from "@/types/tracking";

type ApiResponse =
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

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [awb, setAwb] = useState("");
  const [status, setStatus] =
    useState<TrackingStatus>("IN_TRANSIT");
  const [location, setLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("awb");

    if (fromQuery) {
      try {
        setAwb(decodeURIComponent(fromQuery).trim());
      } catch {
        setAwb(fromQuery.trim());
      }
    }
  }, [searchParams]);

  async function updateTracking() {
    try {
      setSubmitting(true);
      setMessage(null);
      setError(null);

      const normalizedAwb = awb.trim();
      const normalizedLocation = location.trim();

      if (!normalizedAwb) {
        throw new Error("AWB is required.");
      }

      if (!normalizedLocation) {
        throw new Error("Location is required.");
      }

      if (!user) {
        throw new Error(
          "Authentication is required to update tracking.",
        );
      }

      const token = await user.getIdToken();

      const res = await fetch("/api/logistics/tracking/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          awb: normalizedAwb,
          status,
          trackingStageId: status,
          location: normalizedLocation,
          remarks: remarks.trim() || undefined,
        }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to update tracking.",
        );
      }

      setMessage(
        json.message ||
          `Tracking updated: ${normalizedAwb} → ${status} at ${normalizedLocation}.`,
      );

      setLocation("");
      setRemarks("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update tracking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <Header />

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-[#06284c]">
            Update Shipment Tracking
          </h3>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <Field
            label="AWB"
            value={awb}
            onChange={setAwb}
            placeholder="AWB-260814001"
          />

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Tracking Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as TrackingStatus)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {TRACKING_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Current Location"
            value={location}
            onChange={setLocation}
            placeholder="Hyderabad Hub"
          />

          <Field
            label="Event Date / Time"
            value="Server timestamp"
            onChange={() => {}}
            placeholder="Use server timestamp"
            disabled
          />

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Internal Note
            </label>

            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              placeholder="Operational note..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={updateTracking}
            disabled={submitting || authLoading}
            className="rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Tracking"}
          </button>

          {awb.trim() && (
            <Link
              href={`/admin/logistics/awb/${encodeURIComponent(awb.trim())}`}
              className="text-sm font-bold text-[#087f87]"
            >
              View AWB →
            </Link>
          )}
        </div>
      </section>

      {message && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
        Logistics
      </p>

      <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
        Shipment Tracking
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Add or update shipment tracking events.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:bg-slate-100"
      />
    </div>
  );
}