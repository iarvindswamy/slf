"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatPhone } from "@/utils/formatters";

type ReceiverStatus = "ACTIVE" | "INACTIVE";

type Receiver = {
  id: string;
  receiverId: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstin?: string;
  status: ReceiverStatus;
  createdAt?: string;
  updatedAt?: string;
};

type ReceiverForm = {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  gstin: string;
  status: ReceiverStatus;
};

type ApiResponse =
  | {
      success: true;
      data: Receiver[] | Receiver;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const EMPTY_FORM: ReceiverForm = {
  name: "",
  companyName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  gstin: "",
  status: "ACTIVE",
};

function normalizeReceiver(raw: Record<string, unknown>): Receiver | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  const receiverId = String(raw.receiverId || raw.id || "").trim();
  if (!receiverId) return null;

  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();

  return {
    id: String(raw.id || receiverId),
    receiverId,
    name,
    companyName: raw.companyName ? String(raw.companyName) : undefined,
    phone: String(raw.phone || "").trim(),
    email: raw.email ? String(raw.email) : undefined,
    address: raw.address
      ? String(raw.address)
      : raw.addressLine1
        ? String(raw.addressLine1)
        : undefined,
    city: raw.city ? String(raw.city) : undefined,
    state: raw.state ? String(raw.state) : undefined,
    postalCode: raw.postalCode ? String(raw.postalCode) : undefined,
    gstin: raw.gstin ? String(raw.gstin) : undefined,
    status: statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function toForm(receiver?: Receiver | null): ReceiverForm {
  if (!receiver) return { ...EMPTY_FORM };

  return {
    name: receiver.name || "",
    companyName: receiver.companyName || "",
    phone: receiver.phone || "",
    email: receiver.email || "",
    address: receiver.address || "",
    city: receiver.city || "",
    state: receiver.state || "",
    postalCode: receiver.postalCode || "",
    gstin: receiver.gstin || "",
    status: receiver.status || "ACTIVE",
  };
}

export default function ReceiversPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Receiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReceiverStatus>(
    "ALL",
  );
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Receiver | null>(null);
  const [form, setForm] = useState<ReceiverForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadReceivers() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error(
            "Authentication is required to manage receivers.",
          );
        }

        const token = await user.getIdToken();

        const res = await fetch("/api/logistics/receivers", {
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
            json.error?.message || "Failed to load receivers.",
          );
        }

        const payload = json.data;
        const list = Array.isArray(payload) ? payload : [];

        const normalized = list
          .map((item) =>
            normalizeReceiver(item as unknown as Record<string, unknown>),
          )
          .filter(Boolean) as Receiver[];

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load receivers.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReceivers();

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
        item.receiverId,
        item.name,
        item.companyName,
        item.phone,
        item.email,
        item.city,
        item.state,
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

  function openEdit(receiver: Receiver) {
    setEditing(receiver);
    setForm(toForm(receiver));
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof ReceiverForm>(
    key: K,
    value: ReceiverForm[K],
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
      const phone = form.phone.trim();

      if (!name) {
        throw new Error("Receiver name is required.");
      }

      if (!phone) {
        throw new Error("Phone is required.");
      }

      const token = await user.getIdToken();

      const payload = {
        name,
        companyName: form.companyName.trim() || undefined,
        phone,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        status: form.status,
        ...(editing ? { receiverId: editing.receiverId } : {}),
      };

      const res = await fetch("/api/logistics/receivers", {
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
          json.error?.message || "Failed to save receiver.",
        );
      }

      setMessage(
        editing
          ? "Receiver updated successfully."
          : "Receiver created successfully.",
      );
      closeForm();
      setReloadKey((value) => value + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save receiver.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(receiver: Receiver) {
    try {
      setError(null);
      setMessage(null);

      if (!user) {
        throw new Error("Authentication is required.");
      }

      const token = await user.getIdToken();
      const nextStatus: ReceiverStatus =
        receiver.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await fetch("/api/logistics/receivers", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: receiver.receiverId,
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
        `Receiver marked as ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`,
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
            Receivers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage shipment receiver and consignee records.
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
            + Add Receiver
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, city, GSTIN..."
          className={inputClass}
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | ReceiverStatus)
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
            Loading receivers...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Fetching receiver records from the server.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            No receivers found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {items.length === 0
              ? "Create the first receiver/consignee for AWB booking."
              : "No receivers match your current search or filter."}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white"
            >
              + Add Receiver
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receiver</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">GSTIN</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((receiver) => (
                  <tr
                    key={receiver.receiverId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {receiver.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {receiver.receiverId}
                        {receiver.companyName
                          ? ` · ${receiver.companyName}`
                          : ""}
                        {receiver.email ? ` · ${receiver.email}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPhone(receiver.phone)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {[receiver.city, receiver.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {receiver.gstin || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          receiver.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {receiver.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(receiver)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(receiver)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {receiver.status === "ACTIVE"
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
            Showing {filtered.length} of {items.length} receivers
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#06284c]">
                  {editing ? "Edit receiver" : "Add receiver"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? `Updating ${editing.receiverId}`
                    : "Create a receiver/consignee record for AWB booking."}
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
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={inputClass}
                  placeholder="Receiver / consignee name"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <input
                  value={form.companyName}
                  onChange={(e) => updateForm("companyName", e.target.value)}
                  className={inputClass}
                  placeholder="Optional company"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className={inputClass}
                  placeholder="10-digit mobile"
                  required
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
                  placeholder="email@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
                  placeholder="Street address"
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
                  placeholder="City"
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
                  GSTIN
                </label>
                <input
                  value={form.gstin}
                  onChange={(e) => updateForm("gstin", e.target.value)}
                  className={inputClass}
                  placeholder="GSTIN (optional)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm("status", e.target.value as ReceiverStatus)
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
                      ? "Update Receiver"
                      : "Create Receiver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}