"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LOGISTICS_MANAGER"
  | "LOGISTICS_OPERATOR"
  | "FOOD_MANAGER"
  | "FOOD_OPERATOR"
  | "ACCOUNTANT"
  | "VIEWER";

type UserModule = "LOGISTICS" | "FOOD" | "BOTH";
type UserStatus = "ACTIVE" | "INACTIVE";

type AdminUser = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  module: UserModule;
  status: UserStatus;
};

type UserForm = {
  name: string;
  email: string;
  role: UserRole;
  module: UserModule;
  status: UserStatus;
};

type ApiResponse =
  | {
      success: true;
      data: AdminUser[] | AdminUser;
      message?: string;
    }
  | {
      success: false;
      error: { code: string; message: string };
    };

const ROLE_OPTIONS = Object.values(USER_ROLES) as UserRole[];

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  role: "VIEWER",
  module: "BOTH",
  status: "ACTIVE",
};

function normalizeUser(raw: Record<string, unknown>): AdminUser | null {
  const userId = String(raw.userId || raw.id || "").trim();
  const name = String(raw.name || "").trim();
  const email = String(raw.email || "").trim();
  if (!userId || !name || !email) return null;

  const role = String(raw.role || "VIEWER").toUpperCase() as UserRole;
  const module = String(raw.module || "BOTH").toUpperCase() as UserModule;
  const statusRaw = String(raw.status || "ACTIVE").toUpperCase();

  return {
    id: String(raw.id || userId),
    userId,
    name,
    email,
    role: ROLE_OPTIONS.includes(role) ? role : "VIEWER",
    module:
      module === "LOGISTICS" || module === "FOOD" || module === "BOTH"
        ? module
        : "BOTH",
    status: statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"ALL" | UserModule>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to manage users.");
        }

        const token = await user.getIdToken();
        const res = await fetch("/api/admin/users", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error?.message || "Failed to load users.");
        }

        const list = Array.isArray(json.data) ? json.data : [];
        const normalized = list
          .map((row) => normalizeUser(row as unknown as Record<string, unknown>))
          .filter(Boolean) as AdminUser[];

        if (!cancelled) setItems(normalized);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load users.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      if (moduleFilter !== "ALL" && item.module !== moduleFilter) return false;
      if (!q) return true;
      return [item.userId, item.name, item.email, item.role, item.module, item.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, search, moduleFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function openEdit(row: AdminUser) {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      role: row.role,
      module: row.module,
      status: row.status,
    });
    setFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!user) throw new Error("Authentication is required.");

      const name = form.name.trim();
      const email = form.email.trim();
      if (!name) throw new Error("Name is required.");
      if (!email) throw new Error("Email is required.");

      const token = await user.getIdToken();
      const payload = {
        name,
        email,
        role: form.role,
        module: form.module,
        status: form.status,
        ...(editing ? { userId: editing.userId } : {}),
      };

      const res = await fetch("/api/admin/users", {
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
        throw new Error(json.error?.message || "Failed to save user.");
      }

      setMessage(editing ? "User updated." : "User created.");
      closeForm();
      setReloadKey((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(row: AdminUser) {
    try {
      setError(null);
      setMessage(null);

      if (!user) throw new Error("Authentication is required.");

      const next: UserStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const token = await user.getIdToken();

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: row.userId, status: next }),
      });

      const json = (await res.json()) as ApiResponse;
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to update status.");
      }

      setMessage(`${row.name} marked as ${next}.`);
      setReloadKey((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status.");
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#06284c]">
            Administration
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">Users</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage admin users, roles and module access.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((v) => v + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-[#06284c] px-4 py-2.5 text-sm font-bold text-white"
          >
            + Add User
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

      {formOpen && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-[#06284c]">
              {editing ? `Edit ${editing.userId}` : "Add User"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => updateForm("name", v)}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => updateForm("email", v)}
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => updateForm("role", e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Module
              </label>
              <select
                value={form.module}
                onChange={(e) =>
                  updateForm("module", e.target.value as UserModule)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="LOGISTICS">LOGISTICS</option>
                <option value="FOOD">FOOD</option>
                <option value="BOTH">BOTH</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  updateForm("status", e.target.value as UserStatus)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#06284c] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Update User" : "Create User"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, email, role..."
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />
        <select
          value={moduleFilter}
          onChange={(e) =>
            setModuleFilter(e.target.value as "ALL" | UserModule)
          }
          className="rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All Modules</option>
          <option value="LOGISTICS">LOGISTICS</option>
          <option value="FOOD">FOOD</option>
          <option value="BOTH">BOTH</option>
        </select>
      </div>

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">Loading users…</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">userId</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.userId}>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#087f87]">
                        {row.userId}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                          {row.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">{row.module}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            row.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="text-xs font-bold text-[#087f87]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(row)}
                            className="text-xs font-bold text-slate-600"
                          >
                            {row.status === "ACTIVE" ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Profiles are stored in Firestore <code className="font-mono">users</code>.
        Permission enforcement uses role →{" "}
        <code className="font-mono">ROLE_PERMISSIONS</code> (
        <code className="font-mono">ADMIN_USER_MANAGE</code> required).
        Firebase Auth account creation is separate if you later invite by email.
      </div>
    </div>
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
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
      />
    </div>
  );
}