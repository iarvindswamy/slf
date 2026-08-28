"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TrackingStage = {
  trackingStageId: string;
  code: string;
  label: string;
  description?: string;
  enabled: boolean;
  /** Display order (1-based preferred) */
  order: number;
};

export type AwbMatrixRow = {
  awb: string;
  customerName?: string;
  destination?: string;
  currentStatus?: string;
  bookDate?: string;
  accountCode?: string;
  /** Map of stageCode → checkbox state */
  stages: Record<
    string,
    {
      checked: boolean;
      timestamp?: string;
      updatedBy?: string;
    }
  >;
};

type TrackingMatrixTableProps = {
  /** "config" = Super Admin stage editor | "operational" = per-AWB checkbox matrix */
  mode?: "config" | "operational";

  // ---- Config mode ----
  stages?: TrackingStage[];
  onStagesChange?: (stages: TrackingStage[]) => void;
  readOnly?: boolean;

  // ---- Operational mode ----
  rows?: AwbMatrixRow[];
  activeStages?: TrackingStage[];
  onToggleStage?: (
    awb: string,
    stageCode: string,
    checked: boolean,
  ) => Promise<void>;
  onViewPdf?: (awb: string) => void;
  loading?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TrackingMatrixTable({
  mode = "config",
  stages = [],
  onStagesChange,
  readOnly = false,
  rows = [],
  activeStages = [],
  onToggleStage,
  onViewPdf,
  loading = false,
}: TrackingMatrixTableProps) {
  const [toggling, setToggling] = useState<string | null>(null);

  /* ===================== CONFIG MODE ===================== */
  if (mode === "config") {
    const update = (
      id: string,
      field: keyof TrackingStage,
      value: string | boolean | number,
    ) => {
      onStagesChange?.(
        stages.map((stage) =>
          stage.trackingStageId === id
            ? { ...stage, [field]: value }
            : stage,
        ),
      );
    };

    const addStage = () => {
      const nextOrder =
        stages.reduce((max, s) => Math.max(max, s.order || 0), 0) + 1;
      onStagesChange?.([
        ...stages,
        {
          trackingStageId: crypto.randomUUID(),
          code: `CUSTOM_${nextOrder}`,
          label: "New Stage",
          description: "",
          enabled: true,
          order: nextOrder,
        },
      ]);
    };

    const removeStage = (id: string) => {
      const target = stages.find((s) => s.trackingStageId === id);
      if (
        target &&
        !window.confirm(
          `Remove stage "${target.label || target.code}"? This cannot be undone from this screen.`,
        )
      ) {
        return;
      }

      onStagesChange?.(
        stages
          .filter((s) => s.trackingStageId !== id)
          .map((s, index) => ({ ...s, order: index + 1 })),
      );
    };

    const sorted = stages.slice().sort((a, b) => a.order - b.order);

    return (
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Tracking Stage Configurator
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Super Admin only — Add, edit, reorder or disable global
              stages. These drive the checkbox matrix and public
              timeline.
            </p>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={addStage}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Stage
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Label
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Enabled
                </th>
                {!readOnly && <th className="px-4 py-3" />}
              </tr>
            </thead>

            <tbody className="divide-y">
              {sorted.map((stage) => (
                <tr key={stage.trackingStageId}>
                  <td className="px-4 py-3 text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      value={stage.order}
                      onChange={(e) =>
                        update(
                          stage.trackingStageId,
                          "order",
                          Number(e.target.value) || 1,
                        )
                      }
                      disabled={readOnly}
                      className="h-9 w-16 rounded border px-2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={stage.code}
                      onChange={(e) =>
                        update(
                          stage.trackingStageId,
                          "code",
                          e.target.value
                            .toUpperCase()
                            .replace(/\s+/g, "_"),
                        )
                      }
                      disabled={readOnly}
                      className="h-9 w-44 rounded border px-2 font-mono text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={stage.label}
                      onChange={(e) =>
                        update(
                          stage.trackingStageId,
                          "label",
                          e.target.value,
                        )
                      }
                      disabled={readOnly}
                      className="h-9 w-48 rounded border px-2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={stage.description ?? ""}
                      onChange={(e) =>
                        update(
                          stage.trackingStageId,
                          "description",
                          e.target.value,
                        )
                      }
                      disabled={readOnly}
                      className="h-9 w-64 rounded border px-2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={stage.enabled}
                      onChange={(e) =>
                        update(
                          stage.trackingStageId,
                          "enabled",
                          e.target.checked,
                        )
                      }
                      disabled={readOnly}
                      className="h-4 w-4"
                    />
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          removeStage(stage.trackingStageId)
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove stage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stages.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">
            No tracking stages configured. Click{" "}
            <strong>Add Stage</strong> or save defaults from the
            server.
          </div>
        )}
      </section>
    );
  }

  /* ===================== OPERATIONAL MODE ===================== */

  const enabledStages = (activeStages || [])
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const handleToggle = async (
    awb: string,
    stageCode: string,
    currentlyChecked: boolean,
  ) => {
    if (!onToggleStage) return;

    const key = `${awb}|${stageCode}`;
    try {
      setToggling(key);
      await onToggleStage(awb, stageCode, !currentlyChecked);
    } finally {
      setToggling(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-slate-800">
          Operational Tracking Matrix
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Tick stages as the shipment progresses. Updates appear on the
          public tracking page.
        </p>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading AWBs…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No AWBs found for the selected filters.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-900 px-4 py-3 text-left text-xs font-semibold uppercase">
                  AWB
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Customer / Destination
                </th>
                {enabledStages.map((stage) => (
                  <th
                    key={stage.code}
                    className="px-3 py-3 text-center text-[11px] font-semibold uppercase leading-tight"
                    title={stage.description || stage.label}
                  >
                    <div className="mx-auto max-w-[100px]">
                      {stage.label}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.awb} className="hover:bg-slate-50/60">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-mono text-xs font-bold text-[#087f87]">
                    {row.awb}
                    {row.accountCode && (
                      <div className="text-[10px] font-normal text-gray-400">
                        {row.accountCode}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {row.customerName || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {row.destination || "—"}
                      {row.bookDate ? ` · ${row.bookDate}` : ""}
                    </div>
                  </td>

                  {enabledStages.map((stage) => {
                    const stageData = row.stages[stage.code] || {
                      checked: false,
                    };
                    const key = `${row.awb}|${stage.code}`;
                    const isToggling = toggling === key;

                    return (
                      <td
                        key={stage.code}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          type="button"
                          disabled={!!toggling}
                          onClick={() =>
                            handleToggle(
                              row.awb,
                              stage.code,
                              stageData.checked,
                            )
                          }
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
                            stageData.checked
                              ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                              : "border-gray-300 bg-white text-gray-400 hover:border-slate-400"
                          } ${isToggling ? "opacity-50" : ""}`}
                          title={
                            stageData.timestamp
                              ? `Updated: ${new Date(stageData.timestamp).toLocaleString("en-IN")}${
                                  stageData.updatedBy
                                    ? ` by ${stageData.updatedBy}`
                                    : ""
                                }`
                              : stage.label
                          }
                        >
                          {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : stageData.checked ? (
                            <Check
                              className="h-4 w-4"
                              strokeWidth={3}
                            />
                          ) : null}
                        </button>
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onViewPdf?.(row.awb)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}