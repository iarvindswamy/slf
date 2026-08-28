"use client";

import {
  X,
} from "lucide-react";

import {
  useEffect,
} from "react";

type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type ModalProps = {
  open: boolean;
  onClose: () => void;

  title?: string;
  description?: string;

  children: React.ReactNode;

  size?: ModalSize;

  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;

  showCloseButton?: boolean;
};

const sizeClasses: Record<
  ModalSize,
  string
> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown =
      (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
            "Escape" &&
          closeOnEscape
        ) {
          onClose();
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        "";
    };
  }, [
    open,
    closeOnEscape,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        title
          ? "modal-title"
          : undefined
      }
    >
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => {
          if (
            closeOnBackdrop
          ) {
            onClose();
          }
        }}
      />

      <div
        className={[
          "relative z-10 max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
          sizeClasses[size],
        ].join(" ")}
      >
        {(title ||
          showCloseButton) && (
          <div className="flex items-start justify-between border-b px-5 py-4">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={
                  onClose
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}