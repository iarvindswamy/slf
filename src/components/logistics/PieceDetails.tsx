"use client";

import { Plus, Trash2 } from "lucide-react";

export type ShipmentPiece = {
  id: string;
  childAwb?: string;
  description?: string;
  quantity: number;
  weightKg: number;          // actual weight per piece
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  division?: number;         // default 5000
  volumetricWeight?: number; // auto-calculated
  chargeableWeight?: number; // max(actual, volumetric)
};

type PieceDetailsProps = {
  pieces: ShipmentPiece[];
  onChange: (pieces: ShipmentPiece[]) => void;
  disabled?: boolean;
};

function calcVolumetric(
  length?: number,
  width?: number,
  height?: number,
  qty = 1,
  division = 5000,
): number {
  if (!length || !width || !height || division <= 0) return 0;
  return Number(
    ((length * width * height * qty) / division).toFixed(3),
  );
}

function calcChargeable(actual: number, volumetric: number): number {
  return Number(Math.max(actual, volumetric).toFixed(3));
}

export default function PieceDetails({
  pieces,
  onChange,
  disabled = false,
}: PieceDetailsProps) {
  const addPiece = () => {
    onChange([
      ...pieces,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        weightKg: 0,
        lengthCm: 0,
        widthCm: 0,
        heightCm: 0,
        division: 5000,
        volumetricWeight: 0,
        chargeableWeight: 0,
      },
    ]);
  };

  const updatePiece = (
    id: string,
    field: keyof ShipmentPiece,
    value: string | number,
  ) => {
    onChange(
      pieces.map((piece) => {
        if (piece.id !== id) return piece;

        const next: ShipmentPiece = {
          ...piece,
          [field]: value,
        };

        // Re-calculate volumetric & chargeable whenever relevant fields change
        const length = Number(next.lengthCm || 0);
        const width = Number(next.widthCm || 0);
        const height = Number(next.heightCm || 0);
        const qty = Number(next.quantity || 1);
        const division = Number(next.division || 5000);
        const actualPerPiece = Number(next.weightKg || 0);
        const actualTotal = actualPerPiece * qty;

        const volumetric = calcVolumetric(
          length,
          width,
          height,
          qty,
          division,
        );
        const chargeable = calcChargeable(actualTotal, volumetric);

        next.volumetricWeight = volumetric;
        next.chargeableWeight = chargeable;

        return next;
      }),
    );
  };

  const removePiece = (id: string) => {
    onChange(pieces.filter((p) => p.id !== id));
  };

  // Summary totals
  const totalPieces = pieces.reduce(
    (s, p) => s + Number(p.quantity || 0),
    0,
  );
  const totalActual = pieces.reduce(
    (s, p) => s + Number(p.weightKg || 0) * Number(p.quantity || 0),
    0,
  );
  const totalVolumetric = pieces.reduce(
    (s, p) => s + Number(p.volumetricWeight || 0),
    0,
  );
  const totalChargeable = pieces.reduce(
    (s, p) => s + Number(p.chargeableWeight || 0),
    0,
  );

  const input =
    "h-9 w-full rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-slate-600 disabled:bg-gray-50";

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b bg-slate-50 px-5 py-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Click here to enter Pieces details
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Measurement unit: Centimeter &nbsp;|&nbsp; Division default: 5000
          </p>
        </div>

        <button
          type="button"
          onClick={addPiece}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        {pieces.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">No pieces added yet.</p>
            <button
              type="button"
              onClick={addPiece}
              className="mt-2 text-sm font-semibold text-slate-900 hover:underline"
            >
              Add the first piece
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Actl Weight/PC</th>
                <th className="px-3 py-2.5">No. Of Pieces</th>
                <th className="px-3 py-2.5">Length</th>
                <th className="px-3 py-2.5">Width</th>
                <th className="px-3 py-2.5">Height</th>
                <th className="px-3 py-2.5">Division</th>
                <th className="px-3 py-2.5">Vol Weight</th>
                <th className="px-3 py-2.5">Chrg Weight</th>
                <th className="px-3 py-2.5 w-12" />
              </tr>
            </thead>

            <tbody>
              {pieces.map((piece, index) => (
                <tr
                  key={piece.id}
                  className="border-b border-gray-100 odd:bg-gray-50/50"
                >
                  <td className="px-3 py-2 text-gray-500">
                    {index + 1}
                  </td>

                  {/* Actual weight per piece */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      value={piece.weightKg}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "weightKg",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-24"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Quantity */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      value={piece.quantity}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Length */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      value={piece.lengthCm ?? ""}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "lengthCm",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Width */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      value={piece.widthCm ?? ""}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "widthCm",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Height */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      value={piece.heightCm ?? ""}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "heightCm",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Division */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      value={piece.division ?? 5000}
                      onChange={(e) =>
                        updatePiece(
                          piece.id,
                          "division",
                          Number(e.target.value),
                        )
                      }
                      className={input + " w-20"}
                      disabled={disabled}
                    />
                  </td>

                  {/* Volumetric (read-only) */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={piece.volumetricWeight ?? 0}
                      readOnly
                      className={input + " w-24 bg-gray-50"}
                    />
                  </td>

                  {/* Chargeable (read-only) */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={piece.chargeableWeight ?? 0}
                      readOnly
                      className={
                        input + " w-24 bg-gray-50 font-semibold"
                      }
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removePiece(piece.id)}
                      disabled={disabled}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer totals – matches Xpression summary */}
            <tfoot>
              <tr className="bg-slate-100 font-semibold">
                <td className="px-3 py-2.5 text-right" colSpan={2}>
                  Totals
                </td>
                <td className="px-3 py-2.5">{totalPieces}</td>
                <td colSpan={4} />
                <td className="px-3 py-2.5">
                  {totalVolumetric.toFixed(3)}
                </td>
                <td className="px-3 py-2.5">
                  {totalChargeable.toFixed(3)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}

        {/* Quick summary cards */}
        {pieces.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Total Pieces</p>
              <p className="mt-0.5 text-lg font-bold">{totalPieces}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Actual Weight</p>
              <p className="mt-0.5 text-lg font-bold">
                {totalActual.toFixed(3)} kg
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Volumetric Weight</p>
              <p className="mt-0.5 text-lg font-bold">
                {totalVolumetric.toFixed(3)} kg
              </p>
            </div>
            <div className="rounded-lg bg-slate-900 px-4 py-3 text-white">
              <p className="text-xs text-slate-300">Chargeable Weight</p>
              <p className="mt-0.5 text-lg font-bold">
                {totalChargeable.toFixed(3)} kg
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}