"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title?: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  variant?:
    | "danger"
    | "warning"
    | "primary";

  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,

  title = "Confirm action",

  message =
    "Are you sure you want to continue?",

  confirmText = "Confirm",
  cancelText = "Cancel",

  variant = "danger",

  loading = false,
}: ConfirmDialogProps) {
  const buttonClasses = {
    danger:
      "bg-red-600 text-white hover:bg-red-700",

    warning:
      "bg-amber-500 text-white hover:bg-amber-600",

    primary:
      "bg-slate-900 text-white hover:bg-slate-800",
  };

  return (
    <Modal
      open={open}
      onClose={
        loading
          ? () => {}
          : onClose
      }
      title={title}
      size="sm"
      closeOnBackdrop={
        !loading
      }
      closeOnEscape={
        !loading
      }
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>

        <div>
          <p className="text-sm leading-6 text-gray-600">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={
            onClose
          }
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelText}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={
            onConfirm
          }
          className={[
            "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            buttonClasses[
              variant
            ],
          ].join(" ")}
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {loading
            ? "Processing..."
            : confirmText}
        </button>
      </div>
    </Modal>
  );
}