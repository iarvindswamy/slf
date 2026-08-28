"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SERVICE_TYPES } from "@/utils/constants";
import type { ServiceType } from "@/types/logistics";

type ServiceStatus = "ACTIVE" | "INACTIVE";

type LogisticsServiceRow = {
  id: string;
  serviceId: string;
  name: string;
  code?: string;
  type: ServiceType;
  description?: string;
  coverage?: string;
  status: ServiceStatus;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ServiceForm = {
  name: string;
  code: string;
  type: ServiceType;
  description: string;
  coverage: string;
  status: ServiceStatus;
};

type ApiResponse =
  | {
      success: true;
      data: LogisticsServiceRow[] | LogisticsServiceRow;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: ServiceForm = {
  name: "",
  code: "",
  type: "DOMESTIC",
  description: "",
  coverage: "",
  status: "ACTIVE",
};

function isServiceType(value: string): value is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(value);
}

function normalizeService(
  raw: Record<string, unknown>,
): LogisticsServiceRow | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  const serviceId = String(raw.serviceId || raw.id || "").trim();
  if (!serviceId) return null;

  const typeRaw = String(raw.type || raw.serviceType || "DOMESTIC").toUpperCase();
  const type: ServiceType = isServiceType(typeRaw) ? typeRaw : "DOMESTIC";

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();
  const enabled =
    raw.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    id: String(raw.id || serviceId),
    serviceId,
    name,
    code: raw.code ? String(raw.code) : undefined,
    type,
    description: raw.description ? String(raw.description) : undefined,
    coverage: raw.coverage ? String(raw.coverage) : undefined,
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function toForm(service?: LogisticsServiceRow | null): ServiceForm {
  if (!service) return { ...EMPTY_FORM };

  return {
    name: service.name || "",
    code: service.code || "",
    type: service.type || "DOMESTIC",
    description: service.description || "",
    coverage: service.coverage || "",
    status: service.status,
  };
}

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<LogisticsServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ServiceStatus>(
    "ALL",
  );
  const [typeFilter, setTypeFilter] = useState<"ALL" | ServiceType>("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LogisticsServiceRow | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to manage services.");
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/services", {
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
            json.error?.message || "Failed to load services.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload) ? payload : [];

        const normalized = list
          .map((item) =>
            normalizeService(item as unknown as Record<string, unknown>),
          )
          .filter(Boolean) as LogisticsServiceRow[];

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load services.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServices();

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

      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }

      if (!query) return true;

      return [
        item.serviceId,
        item.name,
        item.code,
        item.type,
        item.description,
        item.coverage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, statusFilter, typeFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function openEdit(service: LogisticsServiceRow) {
    setEditing(service);
    setForm(toForm(service));
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof ServiceForm>(
    key: K,
    value: ServiceForm[K],
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

      if (!name) {
        throw new Error("Service name is required.");
      }

      if (!isServiceType(form.type)) {
        throw new Error("A valid service type is required.");
      }

      const token = await user.getIdToken();

      const payload = {
        name,
        code: form.code.trim() || undefined,
        type: form.type,
        description: form.description.trim() || undefined,
        coverage: form.coverage.trim() || undefined,
        status: form.status,
        ...(editing ? { serviceId: editing.serviceId } : {}),
      };

      const res = await fetch("/api/logistics/services", {
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
          json.error?.message || "Failed to save service.",
        );
      }

      setMessage(
        editing
          ? "Service updated successfully."
          : "Service created successfully.",
      );
      closeForm();
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(service: LogisticsServiceRow) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();
      const nextStatus: ServiceStatus =
        service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await fetch("/api/logistics/services", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service.serviceId,
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
        `Service marked as ${
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
            Services
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage available logistics services.
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
            + Add Service
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, type, coverage…"
          className={inputClass}
        />

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "ALL" | ServiceType)
          }
          className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All types</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | ServiceStatus)
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
            Loading services…
          </h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            No services found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Create a service or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Coverage</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((service) => (
                  <tr
                    key={service.serviceId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {service.serviceId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#06284c]">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {service.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {service.code || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {service.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {service.coverage || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          service.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(service)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(service)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {service.status === "ACTIVE"
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
            Showing {filtered.length} of {items.length} services
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#06284c]">
                  {editing ? "Edit service" : "Add service"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? `Updating ${editing.serviceId}`
                    : "Create a logistics service used in booking and rates."}
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

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Service Name *
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
                  Service Code
                </label>
                <input
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. DOM-EXP"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Service Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    updateForm("type", e.target.value as ServiceType)
                  }
                  className={inputClass}
                  required
                >
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Coverage
                </label>
                <input
                  value={form.coverage}
                  onChange={(e) => updateForm("coverage", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Domestic / International"
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
                      e.target.value as ServiceStatus,
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
                      ? "Update service"
                      : "Create service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}