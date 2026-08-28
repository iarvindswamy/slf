"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type DestinationStatus = "ACTIVE" | "INACTIVE";

type Destination = {
  id: string;
  destinationId: string;
  name: string;
  code?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  serviceCenter?: string;
  serviceCenterId?: string;
  status: DestinationStatus;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type DestinationForm = {
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  serviceCenter: string;
  status: DestinationStatus;
};

type ApiResponse =
  | {
      success: true;
      data: Destination[] | Destination;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: DestinationForm = {
  name: "",
  code: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  serviceCenter: "",
  status: "ACTIVE",
};

function normalizeDestination(
  raw: Record<string, unknown>,
): Destination | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  const destinationId = String(raw.destinationId || raw.id || "").trim();
  if (!destinationId) return null;

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();
  const enabled =
    raw.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    id: String(raw.id || destinationId),
    destinationId,
    name,
    code: raw.code ? String(raw.code) : undefined,
    city: String(raw.city || "").trim(),
    state: raw.state ? String(raw.state) : undefined,
    country: String(raw.country || "India").trim(),
    postalCode: raw.postalCode ? String(raw.postalCode) : undefined,
    serviceCenter: raw.serviceCenter
      ? String(raw.serviceCenter)
      : undefined,
    serviceCenterId: raw.serviceCenterId
      ? String(raw.serviceCenterId)
      : undefined,
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function toForm(destination?: Destination | null): DestinationForm {
  if (!destination) return { ...EMPTY_FORM };

  return {
    name: destination.name || "",
    code: destination.code || "",
    city: destination.city || "",
    state: destination.state || "",
    country: destination.country || "India",
    postalCode: destination.postalCode || "",
    serviceCenter: destination.serviceCenter || "",
    status: destination.status || "ACTIVE",
  };
}

export default function DestinationsPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DestinationStatus>(
    "ALL",
  );
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadDestinations() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error(
            "Authentication is required to manage destinations.",
          );
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/destinations", {
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
            json.error?.message || "Failed to load destinations.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload) ? payload : [];

        const normalized = list
          .map((item) =>
            normalizeDestination(item as unknown as Record<string, unknown>),
          )
          .filter(Boolean) as Destination[];

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load destinations.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return [
        item.destinationId,
        item.name,
        item.code,
        item.city,
        item.state,
        item.country,
        item.postalCode,
        item.serviceCenter,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function openEdit(destination: Destination) {
    setEditing(destination);
    setForm(toForm(destination));
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof DestinationForm>(
    key: K,
    value: DestinationForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
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

      const name = form.name.trim();
      const city = form.city.trim();
      const country = form.country.trim() || "India";

      if (!name) {
        throw new Error("Destination name is required.");
      }

      if (!city) {
        throw new Error("City is required.");
      }

      const token = await user.getIdToken();

      const payload = {
        name,
        code: form.code.trim() || undefined,
        city,
        state: form.state.trim() || undefined,
        country,
        postalCode: form.postalCode.trim() || undefined,
        serviceCenter: form.serviceCenter.trim() || undefined,
        status: form.status,
        ...(editing ? { destinationId: editing.destinationId } : {}),
      };

      const res = await fetch("/api/logistics/destinations", {
        method: editing ? "PATCH" : "POST",
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
          json.error?.message || "Failed to save destination.",
        );
      }

      setMessage(
        editing
          ? "Destination updated successfully."
          : "Destination created successfully.",
      );
      closeForm();
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save destination.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(destination: Destination) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();
      const nextStatus: DestinationStatus =
        destination.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await fetch("/api/logistics/destinations", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinationId: destination.destinationId,
          status: nextStatus,
        }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.success) {
        throw new Error(
          json.error?.message || "Failed to update status.",
        );
      }

      setMessage(
        `Destination marked as ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`,
      );
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update status.",
      );
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100";

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Masters
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Destinations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage supported shipment destinations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
          >
            + Add Destination
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, city, state, code, PIN..."
          className={inputClass}
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | DestinationStatus)
          }
          className={inputClass}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading destinations...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching destination records from the server.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            No destinations found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {items.length === 0
              ? "Create the first destination for shipment routing."
              : "No destinations match your current search or filter."}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
            >
              + Add Destination
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">PIN</th>
                  <th className="px-4 py-3 font-semibold">Service Center</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((destination) => (
                  <tr
                    key={destination.destinationId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {destination.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {destination.destinationId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {destination.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {[destination.city, destination.state, destination.country]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {destination.postalCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {destination.serviceCenter || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          destination.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {destination.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(destination)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(destination)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {destination.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Showing {filtered.length} of {items.length} destinations
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#06284c]">
                  {editing ? "Edit destination" : "Add destination"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? `Updating ${editing.destinationId}`
                    : "Create a shipment destination for routing and booking."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Destination Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Hyderabad"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  className={inputClass}
                  placeholder="Optional code"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  City *
                </label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className={inputClass}
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  value={form.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                  className={inputClass}
                  placeholder="State"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Country *
                </label>
                <input
                  value={form.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                  className={inputClass}
                  placeholder="India"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  PIN Code
                </label>
                <input
                  value={form.postalCode}
                  onChange={(e) => updateForm("postalCode", e.target.value)}
                  className={inputClass}
                  placeholder="6-digit PIN"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Service Center
                </label>
                <input
                  value={form.serviceCenter}
                  onChange={(e) =>
                    updateForm("serviceCenter", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Linked service center"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm(
                      "status",
                      e.target.value as DestinationStatus,
                    )
                  }
                  className={inputClass}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Destination"
                      : "Create Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}