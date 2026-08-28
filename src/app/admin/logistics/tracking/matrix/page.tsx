"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TrackingMatrixTable, {
  type AwbMatrixRow,
  type TrackingStage,
} from "@/components/logistics/TrackingMatrixTable";
import { RefreshCw, Search } from "lucide-react";

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      error: { code: string; message: string };
    };

const DEFAULT_STAGES: TrackingStage[] = [
  {
    trackingStageId: "1",
    code: "BOOKING_CONFIRMED",
    label: "BOOKING CONFIRMED",
    enabled: true,
    order: 1,
  },
  {
    trackingStageId: "2",
    code: "SHIPMENT_RECEIVED",
    label: "SHIPMENT RECEIVED",
    enabled: true,
    order: 2,
  },
  {
    trackingStageId: "3",
    code: "HANDLING_IN_PROGRESS",
    label: "HANDLING IN PROGRESS",
    enabled: true,
    order: 3,
  },
  {
    trackingStageId: "4",
    code: "PROCESSED_AND_PACKED",
    label: "PROCESSED AND PACKED FOR EXPORT",
    enabled: true,
    order: 4,
  },
  {
    trackingStageId: "5",
    code: "SHIPPING_LABEL_GENERATED",
    label: "SHIPPING LABEL GENERATED",
    enabled: true,
    order: 5,
  },
  {
    trackingStageId: "6",
    code: "FORWARDED_TO_AIRPORT",
    label: "SHIPMENT FORWARDED TO AIRPORT",
    enabled: true,
    order: 6,
  },
];

function getDemoAuth(): {
  role?: string;
  accountCode?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      localStorage.getItem("sreshta-demo-auth") || "{}",
    );
  } catch {
    return {};
  }
}

async function buildAuthHeaders(
  user: { getIdToken?: () => Promise<string> } | null,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (
    user &&
    typeof user.getIdToken === "function"
  ) {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      return headers;
    } catch {
      // fall through to demo
    }
  }

  if (typeof window !== "undefined") {
    const demo = localStorage.getItem("sreshta-demo-auth");
    if (demo) headers["X-Demo-Auth"] = demo;
  }

  return headers;
}

export default function TrackingMatrixPage() {
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"operational" | "config">(
    "operational",
  );
  const [stages, setStages] = useState<TrackingStage[]>(DEFAULT_STAGES);
  const [rows, setRows] = useState<AwbMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const role =
    (user as { role?: string } | null)?.role ||
    getDemoAuth().role ||
    null;

  const canConfigureStages =
    role === "SUPER_ADMIN" || role === "ADMIN";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await buildAuthHeaders(
        user as { getIdToken?: () => Promise<string> } | null,
      );

      // 1. Stages
      const stagesRes = await fetch(
        "/api/logistics/tracking/stages",
        { headers, cache: "no-store" },
      );
      const stagesJson =
        (await stagesRes.json()) as ApiResponse<
          TrackingStage[] | { stages: TrackingStage[] }
        >;

      let loadedStages: TrackingStage[] = [];

      if (stagesJson.success) {
        const raw = Array.isArray(stagesJson.data)
          ? stagesJson.data
          : (stagesJson.data as { stages?: TrackingStage[] })
              ?.stages || [];

        loadedStages = raw
          .map((s: TrackingStage & { id?: string; sortOrder?: number }, idx: number) => ({
            trackingStageId:
              s.trackingStageId || s.id || `TS-${idx}`,
            code: String(s.code || "").toUpperCase(),
            label: s.label || s.code || `Stage ${idx + 1}`,
            description: s.description || "",
            enabled: s.enabled !== false,
            order: s.order ?? s.sortOrder ?? idx + 1,
          }))
          .sort((a, b) => a.order - b.order);
      }

      if (loadedStages.length === 0) {
        loadedStages = DEFAULT_STAGES;
      }

      setStages(loadedStages);

      // 2. Matrix rows
      const awbRes = await fetch(
        "/api/logistics/tracking/matrix",
        { headers, cache: "no-store" },
      );
      const awbJson = (await awbRes.json()) as ApiResponse<
        unknown
      >;

      if (awbJson.success) {
        const data = awbJson.data as
          | unknown[]
          | { rows?: unknown[]; awbs?: unknown[] };

        const list = Array.isArray(data)
          ? data
          : data?.rows || data?.awbs || [];

        const mapped: AwbMatrixRow[] = (
          list as Array<Record<string, unknown>>
        ).map((item) => {
          const stageMap: AwbMatrixRow["stages"] = {};

          if (Array.isArray(item.events)) {
            (item.events as Array<Record<string, unknown>>).forEach(
              (ev) => {
                const code = String(
                  ev.status || ev.code || "",
                );
                if (!code) return;
                stageMap[code] = {
                  checked: true,
                  timestamp: String(
                    ev.timestamp || ev.createdAt || "",
                  ),
                  updatedBy:
                    typeof ev.updatedBy === "string"
                      ? ev.updatedBy
                      : undefined,
                };
              },
            );
          } else if (
            item.stages &&
            typeof item.stages === "object"
          ) {
            Object.entries(
              item.stages as Record<string, unknown>,
            ).forEach(([code, val]) => {
              if (val && typeof val === "object") {
                const v = val as Record<string, unknown>;
                stageMap[code] = {
                  checked: Boolean(v.checked ?? true),
                  timestamp:
                    typeof v.timestamp === "string"
                      ? v.timestamp
                      : undefined,
                  updatedBy:
                    typeof v.updatedBy === "string"
                      ? v.updatedBy
                      : undefined,
                };
              } else {
                stageMap[code] = {
                  checked: Boolean(val),
                };
              }
            });
          }

          return {
            awb: String(item.awb || ""),
            customerName: String(
              item.customerName ||
                item.consigneeName ||
                item.receiverName ||
                "",
            ),
            destination: String(
              item.destination ||
                item.consigneeCountry ||
                "",
            ),
            currentStatus:
              typeof item.currentStatus === "string"
                ? item.currentStatus
                : undefined,
            bookDate: String(
              item.bookDate || item.shipmentDate || "",
            ),
            accountCode:
              typeof item.accountCode === "string"
                ? item.accountCode
                : undefined,
            stages: stageMap,
          };
        });

        setRows(mapped.filter((r) => r.awb));
      } else {
        setRows([]);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, reloadKey, loadData]);

  const handleToggleStage = async (
    awb: string,
    stageCode: string,
    checked: boolean,
  ) => {
    try {
      const headers = await buildAuthHeaders(
        user as { getIdToken?: () => Promise<string> } | null,
      );
      headers["Content-Type"] = "application/json";

      const res = await fetch("/api/logistics/tracking/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          awb,
          status: stageCode,
          checked,
          action: checked ? "ADD" : "REMOVE",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || "Failed to update stage",
        );
      }

      setRows((prev) =>
        prev.map((row) => {
          if (row.awb !== awb) return row;
          return {
            ...row,
            stages: {
              ...row.stages,
              [stageCode]: {
                checked,
                timestamp: checked
                  ? new Date().toISOString()
                  : undefined,
                updatedBy:
                  (user as { displayName?: string; email?: string } | null)
                    ?.displayName ||
                  (user as { email?: string } | null)?.email ||
                  "Staff",
              },
            },
          };
        }),
      );

      setMessage(`Updated ${awb} → ${stageCode}`);
      setTimeout(() => setMessage(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
      setReloadKey((k) => k + 1);
    }
  };

  const saveConfig = async () => {
    if (!canConfigureStages) {
      setError("Only Super Admin can save stage configuration.");
      return;
    }

    try {
      setSavingConfig(true);
      setError(null);

      const headers = await buildAuthHeaders(
        user as { getIdToken?: () => Promise<string> } | null,
      );
      headers["Content-Type"] = "application/json";

      const res = await fetch("/api/logistics/tracking/stages", {
        method: "PUT",
        headers,
        body: JSON.stringify({ stages }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || "Failed to save stages",
        );
      }

      setMessage("Stage configuration saved successfully");
      setTimeout(() => setMessage(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleViewPdf = async (awb: string) => {
    try {
      const res = await fetch(
        "/api/admin/logistics/generate-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "both", awb }),
        },
      );

      const json = await res.json();

      if (json.awbLabel) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${json.awbLabel}`;
        link.download = `AWB_Label_${awb}.pdf`;
        link.click();
      }
      if (json.proforma) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${json.proforma}`;
        link.download = `Proforma_${awb}.pdf`;
        link.click();
      }

      if (!json.awbLabel && !json.proforma) {
        setError("PDF was not returned by the server.");
      }
    } catch {
      setError("Failed to generate PDF");
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.awb.toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.destination || "").toLowerCase().includes(q) ||
        (r.accountCode || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Tracking Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "operational"
              ? "Mark shipment stages for each AWB. Changes appear on public tracking."
              : "Super Admin: Configure global tracking stages."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setMode("operational")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === "operational"
                  ? "bg-[#087f87] text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Operational
            </button>
            <button
              type="button"
              onClick={() => {
                if (!canConfigureStages) {
                  setError(
                    "Only Super Admin / Admin can configure stages.",
                  );
                  return;
                }
                setMode("config");
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === "config"
                  ? "bg-[#087f87] text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Configure Stages
            </button>
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          {mode === "config" && canConfigureStages && (
            <button
              type="button"
              onClick={saveConfig}
              disabled={savingConfig}
              className="rounded-lg bg-[#087f87] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {savingConfig ? "Saving…" : "Save Stages"}
            </button>
          )}
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

      {mode === "operational" && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AWB, customer, destination, account..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#087f87]"
            />
          </div>
        </div>
      )}

      {mode === "operational" ? (
        <TrackingMatrixTable
          mode="operational"
          rows={filteredRows}
          activeStages={stages}
          onToggleStage={handleToggleStage}
          onViewPdf={handleViewPdf}
          loading={loading || authLoading}
        />
      ) : (
        <TrackingMatrixTable
          mode="config"
          stages={stages}
          onStagesChange={setStages}
          readOnly={!canConfigureStages}
        />
      )}
    </div>
  );
}