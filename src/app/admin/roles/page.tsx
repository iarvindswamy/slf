"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type RoleModule = "LOGISTICS" | "FOOD" | "BOTH";

type RoleRow = {
  name: string;
  description: string;
  module: RoleModule;
  permissionsCount: number;
  permissions: string[];
};

type ApiResponse =
  | {
      success: true;
      data: { roles: RoleRow[] } | RoleRow[];
      message?: string;
    }
  | {
      success: false;
      error: { code: string; message: string };
    };

export default function RolesPage() {
  const { user, loading: authLoading } = useAuth();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to view roles.");
        }

        const token = await user.getIdToken();
        const res = await fetch("/api/admin/roles", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error?.message || "Failed to load roles.");
        }

        const payload = json.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.roles)
            ? payload.roles
            : [];

        if (!cancelled) {
          setRoles(list);
          setSelected((current) => current || list[0]?.name || "");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load roles.");
          setRoles([]);
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

  const role = useMemo(
    () => roles.find((item) => item.name === selected) || null,
    [roles, selected],
  );

  return (
    <div className="mx-auto max-w-[1300px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#06284c]">
          Administration
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">Roles</h2>
        <p className="mt-1 text-sm text-slate-500">
          Canonical admin roles and permissions enforced by{" "}
          <code className="font-mono">can()</code>.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">Loading roles…</h3>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.3fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="px-2 py-2 font-bold text-[#06284c]">
              Canonical Roles
            </h3>

            <div className="mt-3 space-y-1">
              {roles.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelected(item.name)}
                  className={`w-full rounded-lg p-3 text-left ${
                    selected === item.name
                      ? "bg-[#06284c] text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold">{item.name}</p>
                  <p
                    className={`mt-1 text-xs ${
                      selected === item.name
                        ? "text-white/60"
                        : "text-slate-400"
                    }`}
                  >
                    {item.module} · {item.permissionsCount} permissions
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {!role ? (
              <p className="text-sm text-slate-500">Select a role.</p>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
                  Role
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[#06284c]">
                  {role.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {role.description}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Card label="Module" value={role.module} />
                  <Card
                    label="Permissions"
                    value={String(role.permissionsCount)}
                  />
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Assigned permissions
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  Permission counts come from the live server role map used by{" "}
                  <code className="font-mono">can()</code>. This screen is
                  read-only; change grants in{" "}
                  <code className="font-mono">src/lib/permissions.ts</code>.
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-[#06284c]">{value}</p>
    </div>
  );
}