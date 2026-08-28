"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, Save, RefreshCw, Pencil } from "lucide-react";

type FuelSurcharge = {
  id: string;
  name: string;          // e.g. DHL, FedEx, Aramex
  percentage?: number;
  amount?: number;       // fixed amount option
  enabled: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
};

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string } };

export default function FuelSurchargesPage() {
  const { user, loading: authLoading } = useAuth();

  const [rows, setRows] = useState<FuelSurcharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New / edit form
  const [form, setForm] = useState({
    name: "",
    percentage: "",
    amount: "",
    enabled: true,
  });

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const res = await fetch("/api/logistics/settings/fuel-surcharge", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = (await res.json()) as ApiResponse<FuelSurcharge[] | { items: FuelSurcharge[] }>;

      if (!json.success) {
        throw new Error(json.error?.message || "Failed to load fuel surcharges");
      }

      const list = Array.isArray(json.data)
        ? json.data
        : (json.data as any).items || [];

      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [authLoading, user]);

  const resetForm = () => {
    setForm({ name: "", percentage: "", amount: "", enabled: true });
    setEditingId(null);
  };

  const startEdit = (row: FuelSurcharge) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      percentage: row.percentage != null ? String(row.percentage) : "",
      amount: row.amount != null ? String(row.amount) : "",
      enabled: row.enabled,
    });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      setError("Carrier / Vendor name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = await user.getIdToken();
      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        percentage: form.percentage ? Number(form.percentage) : undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        enabled: form.enabled,
      };

      const res = await fetch("/api/logistics/settings/fuel-surcharge", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save");
      }

      setMessage(editingId ? "Fuel surcharge updated" : "Fuel surcharge added");
      resetForm();
      await loadData();
      setTimeout(() => setMessage(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this fuel surcharge?")) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/logistics/settings/fuel-surcharge?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Delete failed");
      }

      setMessage("Deleted successfully");
      await loadData();
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Fuel Surcharges
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Super Admin only — Manage carrier fuel surcharges (DHL, FedEx, etc.).
            Co-loaders can only view/apply them.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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

      {/* Add / Edit Form */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">
          {editingId ? "Edit Fuel Surcharge" : "Add Fuel Surcharge"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Carrier / Vendor Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. DHL, FedEx, Aramex"
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Percentage (%)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.percentage}
              onChange={(e) => setForm({ ...form, percentage: e.target.value })}
              placeholder="e.g. 14.5"
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Fixed Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Optional"
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
            />
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="h-4 w-4"
              />
              Enabled
            </label>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#087f87] px-5 text-sm font-bold text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading || authLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No fuel surcharges configured yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Carrier / Vendor</th>
                <th className="px-5 py-3">Percentage</th>
                <th className="px-5 py-3">Fixed Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-semibold">{row.name}</td>
                  <td className="px-5 py-4">
                    {row.percentage != null ? `${row.percentage}%` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {row.amount != null ? `₹${row.amount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        row.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {row.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="rounded p-1.5 text-gray-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}