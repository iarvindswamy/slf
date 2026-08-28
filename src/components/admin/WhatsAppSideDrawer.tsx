// "use client";

// import { useEffect, useState } from "react";
// import {
//   X,
//   Send,
//   FileText,
//   Loader2,
//   MessageCircle,
//   Phone,
//   User,
// } from "lucide-react";

// export type WhatsAppDrawerPayload = {
//   /** Customer / consignee name */
//   customerName: string;
//   /** Phone in any format – will be normalized */
//   phone: string;
//   /** AWB or Order ID */
//   reference: string;
//   /** Total amount shown in the message */
//   amount?: number;
//   /** Module context for branding */
//   module?: "LOGISTICS" | "FOOD";
//   /** Optional pre-generated PDF blob / URL */
//   pdfBlob?: Blob | null;
//   pdfFileName?: string;
//   /** Optional tracking link */
//   trackingUrl?: string;
// };

// type WhatsAppSideDrawerProps = {
//   open: boolean;
//   onClose: () => void;
//   payload: WhatsAppDrawerPayload | null;
//   /** Called when user clicks “Send PDF to Customer WhatsApp” */
//   onSend?: (data: {
//     phone: string;
//     message: string;
//     pdfBlob?: Blob | null;
//     fileName?: string;
//   }) => Promise<void>;
// };

// function normalizePhone(phone: string): string {
//   const digits = phone.replace(/\D/g, "");
//   if (digits.length === 10) return `91${digits}`;
//   if (digits.length === 12 && digits.startsWith("91")) return digits;
//   return digits;
// }

// function buildDefaultMessage(payload: WhatsAppDrawerPayload): string {
//   const brand =
//     payload.module === "FOOD" ? "Sreshta Foods" : "Sreshta Logistics";

//   const amountLine =
//     payload.amount != null
//       ? `\nTotal Amount: ₹${payload.amount.toFixed(2)}`
//       : "";

//   const trackLine = payload.trackingUrl
//     ? `\nTrack here: ${payload.trackingUrl}`
//     : "";

//   return `Dear ${payload.customerName},

// Your invoice for ${payload.reference} (${brand}) is ready.${amountLine}${trackLine}

// Thank you for choosing ${brand}.`;
// }

// export default function WhatsAppSideDrawer({
//   open,
//   onClose,
//   payload,
//   onSend,
// }: WhatsAppSideDrawerProps) {
//   const [message, setMessage] = useState("");
//   const [phone, setPhone] = useState("");
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     if (open && payload) {
//       setMessage(buildDefaultMessage(payload));
//       setPhone(payload.phone || "");
//       setError("");
//       setSuccess("");
//     }
//   }, [open, payload]);

//   if (!open || !payload) return null;

//   const handleSend = async () => {
//     const normalized = normalizePhone(phone);
//     if (normalized.length < 12) {
//       setError("Please enter a valid 10-digit Indian mobile number.");
//       return;
//     }

//     if (!message.trim()) {
//       setError("Message cannot be empty.");
//       return;
//     }

//     try {
//       setSending(true);
//       setError("");
//       setSuccess("");

//       if (onSend) {
//         await onSend({
//           phone: normalized,
//           message: message.trim(),
//           pdfBlob: payload.pdfBlob,
//           fileName:
//             payload.pdfFileName ||
//             `Invoice_${payload.reference}.pdf`,
//         });
//         setSuccess("Message + PDF sent successfully via WhatsApp.");
//       } else {
//         // Fallback: open wa.me link (no PDF attachment)
//         const text = encodeURIComponent(message.trim());
//         window.open(`https://wa.me/${normalized}?text=${text}`, "_blank");
//         setSuccess("WhatsApp opened. Attach the PDF manually if needed.");
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to send WhatsApp message.",
//       );
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 z-40 bg-black/30 transition-opacity"
//         onClick={onClose}
//       />

//       {/* Drawer */}
//       <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b bg-emerald-600 px-5 py-4 text-white">
//           <div className="flex items-center gap-2">
//             <MessageCircle className="h-5 w-5" />
//             <h2 className="text-base font-semibold">
//               WhatsApp Business Dispatch
//             </h2>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-1.5 hover:bg-emerald-500"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           {/* Customer card */}
//           <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
//             <div className="flex items-center gap-2 text-sm">
//               <User className="h-4 w-4 text-gray-400" />
//               <span className="font-medium text-gray-900">
//                 {payload.customerName}
//               </span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <Phone className="h-4 w-4 text-gray-400" />
//               <input
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="h-9 flex-1 rounded-lg border px-3 text-sm outline-none focus:border-emerald-500"
//                 placeholder="Customer mobile number"
//               />
//             </div>
//             <div className="text-xs text-gray-500">
//               Reference: <span className="font-medium">{payload.reference}</span>
//             </div>
//           </div>

//           {/* Message template */}
//           <div>
//             <label className="mb-1.5 block text-sm font-medium text-gray-700">
//               Message Preview
//             </label>
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               rows={8}
//               className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
//             />
//           </div>

//           {/* PDF attachment indicator */}
//           {payload.pdfBlob && (
//             <div className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3">
//               <FileText className="h-5 w-5 text-emerald-600" />
//               <div className="flex-1 min-w-0">
//                 <p className="truncate text-sm font-medium text-emerald-900">
//                   {payload.pdfFileName || `Invoice_${payload.reference}.pdf`}
//                 </p>
//                 <p className="text-xs text-emerald-700">
//                   PDF will be attached automatically
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Status messages */}
//           {error && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//               {success}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="border-t p-5">
//           <button
//             type="button"
//             onClick={handleSend}
//             disabled={sending}
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
//           >
//             {sending ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Sending...
//               </>
//             ) : (
//               <>
//                 <Send className="h-4 w-4" />
//                 Send PDF to Customer WhatsApp
//               </>
//             )}
//           </button>

//           <p className="mt-2 text-center text-xs text-gray-400">
//             Uses WhatsApp Cloud API when configured, otherwise opens wa.me
//           </p>
//         </div>
//       </aside>
//     </>
//   );
// }











"use client";

import { useEffect, useState } from "react";
import {
  X,
  Send,
  FileText,
  Loader2,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

export type WhatsAppDrawerPayload = {
  /** Customer / consignee name */
  customerName: string;
  /** Phone in any format – will be normalized */
  phone: string;
  /** AWB or Order ID */
  reference: string;
  /** Total amount shown in the message */
  amount?: number;
  /** Module context for branding */
  module?: "LOGISTICS" | "FOOD";
  /**
   * Optional PDF blob for parent handlers.
   * WhatsApp Cloud API document send needs a public URL — prefer pdfUrl.
   */
  pdfBlob?: Blob | null;
  /** Public URL of PDF (preferred for Cloud API document send) */
  pdfUrl?: string;
  pdfFileName?: string;
  /** Optional tracking link */
  trackingUrl?: string;
};

type WhatsAppSideDrawerProps = {
  open: boolean;
  onClose: () => void;
  payload: WhatsAppDrawerPayload | null;
  /** Optional custom send. If omitted, uses /api/whatsapp/send */
  onSend?: (data: {
    phone: string;
    message: string;
    pdfBlob?: Blob | null;
    pdfUrl?: string;
    fileName?: string;
  }) => Promise<void>;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function buildDefaultMessage(payload: WhatsAppDrawerPayload): string {
  const brand =
    payload.module === "FOOD" ? "Sreshta Foods" : "Sreshta Logistics";

  const amountLine =
    payload.amount != null
      ? `\nTotal Amount: ₹${payload.amount.toFixed(2)}`
      : "";

  const trackLine = payload.trackingUrl
    ? `\nTrack here: ${payload.trackingUrl}`
    : "";

  return `Dear ${payload.customerName},

Your invoice for ${payload.reference} (${brand}) is ready.${amountLine}${trackLine}

Thank you for choosing ${brand}.`;
}

async function defaultApiSend(args: {
  phone: string;
  message: string;
  pdfUrl?: string;
  fileName?: string;
  reference?: string;
  module?: "LOGISTICS" | "FOOD";
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (typeof window !== "undefined") {
    const demo = localStorage.getItem("sreshta-demo-auth");
    if (demo) headers["X-Demo-Auth"] = demo;
  }

  // 1) Send text message
  const textRes = await fetch("/api/whatsapp/send", {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "text",
      phone: args.phone,
      message: args.message,
      reference: args.reference,
      module: args.module,
    }),
  });

  const textJson = await textRes.json();

  if (!textRes.ok || !textJson.success) {
    throw new Error(
      textJson?.error?.message || "Failed to send WhatsApp text.",
    );
  }

  // 2) Optional document (requires public URL for Cloud API)
  if (args.pdfUrl) {
    const docRes = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "document",
        phone: args.phone,
        documentUrl: args.pdfUrl,
        filename: args.fileName || "invoice.pdf",
        caption: args.message.slice(0, 1000),
        reference: args.reference,
        module: args.module,
      }),
    });

    const docJson = await docRes.json();

    if (!docRes.ok || !docJson.success) {
      throw new Error(
        docJson?.error?.message ||
          "Text sent, but PDF document failed.",
      );
    }
  }
}

export default function WhatsAppSideDrawer({
  open,
  onClose,
  payload,
  onSend,
}: WhatsAppSideDrawerProps) {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open && payload) {
      setMessage(buildDefaultMessage(payload));
      setPhone(payload.phone || "");
      setError("");
      setSuccess("");
    }
  }, [open, payload]);

  if (!open || !payload) return null;

  const hasPdf = Boolean(payload.pdfUrl || payload.pdfBlob);

  const handleSend = async () => {
    const normalized = normalizePhone(phone);

    if (normalized.length < 12) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      if (onSend) {
        await onSend({
          phone: normalized,
          message: message.trim(),
          pdfBlob: payload.pdfBlob,
          pdfUrl: payload.pdfUrl,
          fileName:
            payload.pdfFileName ||
            `Invoice_${payload.reference}.pdf`,
        });
        setSuccess(
          hasPdf
            ? "Message + PDF sent successfully via WhatsApp."
            : "Message sent successfully via WhatsApp.",
        );
        return;
      }

      // Built-in API path
      try {
        await defaultApiSend({
          phone: normalized,
          message: message.trim(),
          pdfUrl: payload.pdfUrl,
          fileName:
            payload.pdfFileName ||
            `Invoice_${payload.reference}.pdf`,
          reference: payload.reference,
          module: payload.module,
        });

        setSuccess(
          payload.pdfUrl
            ? "Message + PDF sent successfully via WhatsApp."
            : "Message sent successfully via WhatsApp.",
        );
      } catch (apiErr) {
        // Fallback: open wa.me (no PDF attach)
        const text = encodeURIComponent(message.trim());
        window.open(
          `https://wa.me/${normalized}?text=${text}`,
          "_blank",
        );
        setSuccess(
          `API unavailable (${
            apiErr instanceof Error ? apiErr.message : "error"
          }). WhatsApp opened — attach PDF manually if needed.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send WhatsApp message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-emerald-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-base font-semibold">
              WhatsApp Business Dispatch
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-emerald-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {payload.customerName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 flex-1 rounded-lg border px-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Customer mobile number"
              />
            </div>
            <div className="text-xs text-gray-500">
              Reference:{" "}
              <span className="font-medium">{payload.reference}</span>
              {payload.module ? (
                <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                  {payload.module}
                </span>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Message Preview
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {(payload.pdfUrl || payload.pdfBlob) && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-emerald-900">
                  {payload.pdfFileName ||
                    `Invoice_${payload.reference}.pdf`}
                </p>
                <p className="text-xs text-emerald-700">
                  {payload.pdfUrl
                    ? "PDF URL will be sent via WhatsApp Cloud API"
                    : "PDF blob present — parent must upload/provide public URL for auto-attach"}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
        </div>

        <div className="border-t p-5">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to Customer WhatsApp
              </>
            )}
          </button>

          <p className="mt-2 text-center text-xs text-gray-400">
            Uses WhatsApp Cloud API when configured, otherwise opens
            wa.me
          </p>
        </div>
      </aside>
    </>
  );
}