"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type AuditModule = "LOGISTICS" | "FOOD" | "SYSTEM";

type AuditLog = {
  id: string;
  auditLogId: string;
  userId: string;
  action: string;
  module: AuditModule;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

type ApiResponse =
  | {
      success: true;
      data: {
        logs?: AuditLog[];
        total?: number;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || "—";
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function moduleBadge(module: AuditModule) {
  if (module === "LOGISTICS") {
    return "bg-cyan-50 text-cyan-800";
  }
  if (module === "FOOD") {
    return "bg-orange-50 text-orange-800";
  }
  return "bg-slate-100 text-slate-700";
}

export default function AuditLogsPage() {
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"ALL" | AuditModule>("ALL");
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Authentication is required to view audit logs.");
        }

        const token = await user.getIdToken();
        const params = new URLSearchParams();
        params.set("limit", "150");
        if (moduleFilter !== "ALL") {
          params.set("module", moduleFilter);
        }

        const res = await fetch(
          `/api/admin/audit-logs?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(
            json.error?.message || "Failed to load audit logs.",
          );
        }

        const list = Array.isArray(json.data?.logs) ? json.data.logs : [];

        if (!cancelled) {
          setLogs(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load audit logs.",
          );
          setLogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, moduleFilter, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;

    return logs.filter((item) =>
      [
        item.auditLogId,
        item.userId,
        item.action,
        item.module,
        item.resourceType,
        item.resourceId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [logs, search]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#06284c]">
            Administration
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Audit Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Live activity trail from server-side writeAuditLog events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((v) => v + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search action, userId, resource…"
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />

        <select
          value={moduleFilter}
          onChange={(e) =>
            setModuleFilter(e.target.value as "ALL" | AuditModule)
          }
          className="rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All modules</option>
          <option value="LOGISTICS">LOGISTICS</option>
          <option value="FOOD">FOOD</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading audit logs…
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const open = expandedId === log.id;

                    return (
                      <tr key={log.id} className="align-top">
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {formatTime(log.timestamp)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-700">
                          {log.userId}
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#06284c]">
                          {log.action}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${moduleBadge(
                              log.module,
                            )}`}
                          >
                            {log.module}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          <div className="font-semibold">
                            {log.resourceType}
                          </div>
                          {log.resourceId && (
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              {log.resourceId}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {log.metadata &&
                          Object.keys(log.metadata).length > 0 ? (
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(open ? null : log.id)
                                }
                                className="text-xs font-bold text-[#087f87]"
                              >
                                {open ? "Hide" : "View"} metadata
                              </button>
                              {open && (
                                <pre className="mt-2 max-w-md overflow-x-auto rounded-lg bg-slate-50 p-3 text-[11px] text-slate-700">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filtered.length} event
            {filtered.length === 1 ? "" : "s"}
            {moduleFilter !== "ALL" ? ` · module ${moduleFilter}` : ""}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Requires <code className="font-mono">ADMIN_AUDIT_VIEW</code> (or{" "}
        <code className="font-mono">ADMIN_USER_MANAGE</code>). Events are
        written by <code className="font-mono">writeAuditLog</code> across
        logistics, food, and admin APIs.
      </div>
    </div>
  );
}