"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatPhone } from "@/utils/formatters";

type VendorStatus = "ACTIVE" | "INACTIVE";

type Vendor = {
  id: string;
  vendorId: string;
  name: string;
  code?: string;
  vendorType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstin?: string;
  bankDetails?: string;
  status: VendorStatus;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type VendorForm = {
  name: string;
  code: string;
  vendorType: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  gstin: string;
  bankDetails: string;
  status: VendorStatus;
};

type ApiResponse =
  | {
      success: true;
      data: Vendor[] | Vendor;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: VendorForm = {
  name: "",
  code: "",
  vendorType: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  gstin: "",
  bankDetails: "",
  status: "ACTIVE",
};

function normalizeVendor(raw: Record<string, unknown>): Vendor | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  const vendorId = String(raw.vendorId || raw.id || "").trim();
  if (!vendorId) return null;

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();
  const enabled =
    raw.enabled === undefined
      ? statusRaw !== "INACTIVE"
      : Boolean(raw.enabled);

  return {
    id: String(raw.id || vendorId),
    vendorId,
    name,
    code: raw.code ? String(raw.code) : undefined,
    vendorType: raw.vendorType
      ? String(raw.vendorType)
      : raw.type
        ? String(raw.type)
        : undefined,
    contactPerson: raw.contactPerson
      ? String(raw.contactPerson)
      : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    email: raw.email ? String(raw.email) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    city: raw.city ? String(raw.city) : undefined,
    gstin: raw.gstin ? String(raw.gstin) : undefined,
    bankDetails: raw.bankDetails ? String(raw.bankDetails) : undefined,
    status: enabled ? "ACTIVE" : "INACTIVE",
    enabled,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function toForm(vendor?: Vendor | null): VendorForm {
  if (!vendor) return { ...EMPTY_FORM };

  return {
    name: vendor.name || "",
    code: vendor.code || "",
    vendorType: vendor.vendorType || "",
    contactPerson: vendor.contactPerson || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    address: vendor.address || "",
    city: vendor.city || "",
    gstin: vendor.gstin || "",
    bankDetails: vendor.bankDetails || "",
    status: vendor.status,
  };
}

export default function VendorsPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VendorStatus>(
    "ALL",
  );
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<VendorForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadVendors() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to manage vendors.");
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/vendors", {
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
            json.error?.message || "Failed to load vendors.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload) ? payload : [];

        const normalized = list
          .map((item) =>
            normalizeVendor(item as unknown as Record<string, unknown>),
          )
          .filter(Boolean) as Vendor[];

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load vendors.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVendors();

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
        item.vendorId,
        item.name,
        item.code,
        item.vendorType,
        item.contactPerson,
        item.phone,
        item.email,
        item.city,
        item.gstin,
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

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    setForm(toForm(vendor));
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof VendorForm>(
    key: K,
    value: VendorForm[K],
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
        throw new Error("Vendor name is required.");
      }

      const token = await user.getIdToken();

      const payload = {
        name,
        code: form.code.trim() || undefined,
        vendorType: form.vendorType.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        bankDetails: form.bankDetails.trim() || undefined,
        status: form.status,
        ...(editing ? { vendorId: editing.vendorId } : {}),
      };

      const res = await fetch("/api/logistics/vendors", {
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
          json.error?.message || "Failed to save vendor.",
        );
      }

      setMessage(
        editing
          ? "Vendor updated successfully."
          : "Vendor created successfully.",
      );
      closeForm();
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(vendor: Vendor) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();
      const nextStatus: VendorStatus =
        vendor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await fetch("/api/logistics/vendors", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: vendor.vendorId,
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
        `Vendor marked as ${
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
            Vendors
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage logistics vendor records.
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
            + Add Vendor
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, type, contact, GSTIN…"
          className={inputClass}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | VendorStatus)
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
            Loading vendors…
          </h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            No vendors found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Create a vendor or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor) => (
                  <tr
                    key={vendor.vendorId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {vendor.vendorId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#06284c]">
                        {vendor.name}
                      </p>
                      {vendor.code && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {vendor.code}
                        </p>
                      )}
                      {vendor.gstin && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          GSTIN: {vendor.gstin}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {vendor.vendorType || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{vendor.contactPerson || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {vendor.phone ? formatPhone(vendor.phone) : "—"}
                      </div>
                      {vendor.email && (
                        <div className="text-xs text-slate-500">
                          {vendor.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {vendor.city || vendor.address || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          vendor.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(vendor)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(vendor)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {vendor.status === "ACTIVE"
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
            Showing {filtered.length} of {items.length} vendors
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#06284c]">
                  {editing ? "Edit vendor" : "Add vendor"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? `Updating ${editing.vendorId}`
                    : "Create a logistics vendor record."}
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
                  Vendor Name *
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
                  Vendor Type
                </label>
                <input
                  value={form.vendorType}
                  onChange={(e) =>
                    updateForm("vendorType", e.target.value)
                  }
                  className={inputClass}
                  placeholder="e.g. Transport / Cargo"
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
                  placeholder="e.g. VND-HYD"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contact Person
                </label>
                <input
                  value={form.contactPerson}
                  onChange={(e) =>
                    updateForm("contactPerson", e.target.value)
                  }
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
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
                  GSTIN
                </label>
                <input
                  value={form.gstin}
                  onChange={(e) => updateForm("gstin", e.target.value)}
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
                      e.target.value as VendorStatus,
                    )
                  }
                  className={inputClass}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Bank Details
                </label>
                <textarea
                  value={form.bankDetails}
                  onChange={(e) =>
                    updateForm("bankDetails", e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
                  placeholder="Account name, number, IFSC (optional)"
                />
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
                      ? "Update vendor"
                      : "Create vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}








