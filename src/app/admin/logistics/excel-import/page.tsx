"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type ImportResult = {
  uploadId?: string;
  fileName?: string;
  totalRows?: number;
  imported?: number;
  updated?: number;
  failed?: number;
};

type ApiResponse =
  | {
      success: true;
      data: ImportResult;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const MAX_CLIENT_SIZE_MB = 5;

export default function ExcelImportPage() {
  const { user, loading: authLoading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function onFileChange(next: File | null) {
    setFile(next);
    setError(null);
    setMessage(null);
    setResult(null);
  }

  async function handleImport() {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      setResult(null);

      if (!user) {
        throw new Error("Authentication is required to import Excel data.");
      }

      if (!file) {
        throw new Error("Please select an Excel file first.");
      }

      const lower = file.name.toLowerCase();

      if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
        throw new Error("Only .xlsx and .xls files are supported.");
      }

      if (file.size > MAX_CLIENT_SIZE_MB * 1024 * 1024) {
        throw new Error(`Maximum Excel file size is ${MAX_CLIENT_SIZE_MB} MB.`);
      }

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/logistics/excel-import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.success) {
        throw new Error(
          json.error?.message || "Excel import failed.",
        );
      }

      setResult(json.data || {});
      setMessage(
        json.message || "Excel import completed successfully.",
      );
      setFile(null);

      // clear native file input
      const input = document.getElementById(
        "excel-file-input",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to import Excel file.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
          Logistics
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
          Excel Import
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Import approved logistics spreadsheet data into Firestore.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-[#06284c]">Upload Spreadsheet</h3>

          <div className="mt-5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="text-4xl">📊</div>
            <h4 className="mt-4 font-bold">Select an Excel file</h4>
            <p className="mt-1 text-sm text-slate-500">
              Only .xlsx / .xls · max {MAX_CLIENT_SIZE_MB} MB
            </p>

            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="mt-5 block w-full text-sm"
              disabled={submitting || authLoading}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />

            {file && (
              <p className="mt-3 text-xs font-semibold text-[#087f87]">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={submitting || authLoading || !file}
            className="mt-5 w-full rounded-lg bg-[#087f87] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Validating & Importing…" : "Validate & Import"}
          </button>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Import summary
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <SummaryItem label="Upload ID" value={result.uploadId || "—"} mono />
                <SummaryItem label="File" value={result.fileName || "—"} />
                <SummaryItem
                  label="Total rows"
                  value={String(result.totalRows ?? 0)}
                />
                <SummaryItem
                  label="Imported"
                  value={String(result.imported ?? 0)}
                />
                <SummaryItem
                  label="Updated"
                  value={String(result.updated ?? 0)}
                />
                <SummaryItem
                  label="Failed"
                  value={String(result.failed ?? 0)}
                />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-[#06284c]">Import Process</h3>

          <div className="mt-5 space-y-4">
            {[
              ["01", "Upload", "Select the approved spreadsheet."],
              ["02", "Validate", "Server validates structure and fields."],
              ["03", "Import", "Valid rows are written to AWBs."],
              ["04", "Audit", "Upload is logged with import counts."],
            ].map(([number, title, text]) => (
              <div key={number} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06284c] text-xs font-bold text-white">
                  {number}
                </div>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-xs text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            Requires permission <code className="font-mono">LOGISTICS_EXCEL_IMPORT</code>.
            Column mapping is defined server-side in{" "}
            <code className="font-mono">/api/logistics/excel-import</code>.
          </div>

          {!user && !authLoading && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Sign in with an authorized logistics account before importing.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-[#06284c] ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}