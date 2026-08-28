"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatPhone } from "@/utils/formatters";

type ServiceCenterStatus = "ACTIVE" | "INACTIVE";

type ServiceCenter = {
  id: string;
  serviceCenterId: string;
  name: string;
  code?: string;
  manager?: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: ServiceCenterStatus;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ServiceCenterForm = {
  name: string;
  code: string;
  manager: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: ServiceCenterStatus;
};

type ApiResponse =
  | {
      success: true;
      data: ServiceCenter[] | ServiceCenter;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: ServiceCenterForm = {
  name: "",
  code: "",
  manager: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  status: "ACTIVE",
};

function normalizeServiceCenter(
  raw: Record<string, unknown>,
): ServiceCenter | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  const serviceCenterId = String(
    raw.serviceCenterId || raw.id || "",
  ).trim();
  if (!serviceCenterId) return null;

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();
  const enabled =
    raw.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    id: String(raw.id || serviceCenterId),
    serviceCenterId,
    name,
    code: raw.code ? String(raw.code) : undefined,
    manager: raw.manager ? String(raw.manager) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    email: raw.email ? String(raw.email) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    city: String(raw.city || "").trim() || "—",
    state: raw.state ? String(raw.state) : undefined,
    postalCode: raw.postalCode ? String(raw.postalCode) : undefined,
    country: raw.country ? String(raw.country) : "India",
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function toForm(center?: ServiceCenter | null): ServiceCenterForm {
  if (!center) return { ...EMPTY_FORM };

  return {
    name: center.name || "",
    code: center.code || "",
    manager: center.manager || "",
    phone: center.phone || "",
    email: center.email || "",
    address: center.address || "",
    city: center.city === "—" ? "" : center.city || "",
    state: center.state || "",
    postalCode: center.postalCode || "",
    country: center.country || "India",
    status: center.status,
  };
}

export default function ServiceCentersPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ServiceCenterStatus
  >("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCenter | null>(null);
  const [form, setForm] = useState<ServiceCenterForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadServiceCenters() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error(
            "Authentication is required to manage service centers.",
          );
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/service-centers", {
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
            json.error?.message || "Failed to load service centers.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload) ? payload : [];

        const normalized = list
          .map((item) =>
            normalizeServiceCenter(
              item as unknown as Record<string, unknown>,
            ),
          )
          .filter(Boolean) as ServiceCenter[];

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load service centers.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServiceCenters();

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
        item.serviceCenterId,
        item.name,
        item.code,
        item.manager,
        item.phone,
        item.email,
        item.city,
        item.state,
        item.postalCode,
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

  function openEdit(center: ServiceCenter) {
    setEditing(center);
    setForm(toForm(center));
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof ServiceCenterForm>(
    key: K,
    value: ServiceCenterForm[K],
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

      if (!name) {
        throw new Error("Service center name is required.");
      }

      if (!city) {
        throw new Error("City is required.");
      }

      const token = await user.getIdToken();

      const payload = {
        name,
        code: form.code.trim() || undefined,
        manager: form.manager.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        country: form.country.trim() || "India",
        status: form.status,
        ...(editing
          ? { serviceCenterId: editing.serviceCenterId }
          : {}),
      };

      const res = await fetch("/api/logistics/service-centers", {
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
          json.error?.message || "Failed to save service center.",
        );
      }

      setMessage(
        editing
          ? "Service center updated successfully."
          : "Service center created successfully.",
      );
      closeForm();
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save service center.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(center: ServiceCenter) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();
      const nextStatus: ServiceCenterStatus =
        center.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await fetch("/api/logistics/service-centers", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceCenterId: center.serviceCenterId,
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
        `Service center marked as ${
          nextStatus === "ACTIVE" ? "active" : "inactive"
        }.`,
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
            Service Centers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage operational logistics service centers.
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
            + Add Service Center
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, city, phone…"
          className={inputClass}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as "ALL" | ServiceCenterStatus,
            )
          }
          className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading service centers…
          </h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            No service centers found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Create a service center or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Center</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((center) => (
                  <tr
                    key={center.serviceCenterId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {center.serviceCenterId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#06284c]">
                        {center.name}
                      </p>
                      {center.manager && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Manager: {center.manager}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {center.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {[center.city, center.state, center.postalCode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>
                        {center.phone
                          ? formatPhone(center.phone)
                          : "—"}
                      </div>
                      {center.email && (
                        <div className="text-xs text-slate-500">
                          {center.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          center.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {center.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(center)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(center)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {center.status === "ACTIVE"
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
            Showing {filtered.length} of {items.length} service centers
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#06284c]">
                  {editing
                    ? "Edit service center"
                    : "Add service center"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? `Updating ${editing.serviceCenterId}`
                    : "Create an operational logistics service center."}
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
                  Center Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={inputClass}
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
                  placeholder="e.g. VJA-HUB"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Manager
                </label>
                <input
                  value={form.manager}
                  onChange={(e) => updateForm("manager", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  className={inputClass}
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
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  PIN Code
                </label>
                <input
                  value={form.postalCode}
                  onChange={(e) =>
                    updateForm("postalCode", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                  className={inputClass}
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
                      e.target.value as ServiceCenterStatus,
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
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Update center"
                      : "Create center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}