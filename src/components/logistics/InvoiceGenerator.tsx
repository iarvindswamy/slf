"use client";

import {
  Download,
  FileText,
  Loader2,
} from "lucide-react";

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoicePreviewData = {
  invoiceId?: string;
  invoiceNumber?: string;
  date: string;

  sellerName: string;
  sellerAddress?: string;
  sellerGstin?: string;

  customerName: string;
  customerAddress?: string;
  customerGstin?: string;

  awb?: string;

  items: InvoiceLineItem[];

  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
};

type InvoiceGeneratorProps = {
  invoice: InvoicePreviewData;
  onGenerate?: () => Promise<void>;
  generating?: boolean;
};

export default function InvoiceGenerator({
  invoice,
  onGenerate,
  generating = false,
}: InvoiceGeneratorProps) {
  return (
    <section className="rounded-xl border bg-white">
      <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">
            Invoice Preview
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Review the invoice before sending it to the server-side PDF generator.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={
            generating
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}

          {generating
            ? "Generating..."
            : "Generate Invoice"}
        </button>
      </div>

      <div className="p-5">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />

                <h3 className="text-lg font-bold">
                  {invoice.sellerName}
                </h3>
              </div>

              {invoice.sellerAddress && (
                <p className="mt-2 max-w-xs whitespace-pre-line text-xs leading-5 text-gray-500">
                  {
                    invoice.sellerAddress
                  }
                </p>
              )}

              {invoice.sellerGstin && (
                <p className="mt-2 text-xs text-gray-500">
                  GSTIN:{" "}
                  {
                    invoice.sellerGstin
                  }
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <h4 className="text-xl font-bold">
                INVOICE
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                {invoice.invoiceNumber ??
                  "Pending"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {invoice.date}
              </p>

              {invoice.awb && (
                <p className="mt-2 text-xs font-medium">
                  AWB: {invoice.awb}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 border-b py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Bill To
              </p>

              <p className="mt-2 text-sm font-semibold">
                {
                  invoice.customerName
                }
              </p>

              {invoice.customerAddress && (
                <p className="mt-1 whitespace-pre-line text-xs leading-5 text-gray-500">
                  {
                    invoice.customerAddress
                  }
                </p>
              )}

              {invoice.customerGstin && (
                <p className="mt-2 text-xs text-gray-500">
                  GSTIN:{" "}
                  {
                    invoice.customerGstin
                  }
                </p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Description
                  </th>

                  <th className="py-3 text-right text-xs font-semibold uppercase text-gray-400">
                    Qty
                  </th>

                  <th className="py-3 text-right text-xs font-semibold uppercase text-gray-400">
                    Rate
                  </th>

                  <th className="py-3 text-right text-xs font-semibold uppercase text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {invoice.items.map(
                  (item) => (
                    <tr
                      key={item.id}
                    >
                      <td className="py-3 text-sm">
                        {
                          item.description
                        }
                      </td>

                      <td className="py-3 text-right text-sm">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="py-3 text-right text-sm">
                        ₹
                        {item.rate.toFixed(
                          2,
                        )}
                      </td>

                      <td className="py-3 text-right text-sm font-medium">
                        ₹
                        {item.amount.toFixed(
                          2,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto max-w-xs space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                ₹
                {invoice.subtotal.toFixed(
                  2,
                )}
              </span>
            </div>

            {invoice.discount !==
              undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Discount
                </span>

                <span>
                  -₹
                  {invoice.discount.toFixed(
                    2,
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Tax
              </span>

              <span>
                ₹
                {invoice.tax.toFixed(
                  2,
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>
                Total
              </span>

              <span>
                ₹
                {invoice.total.toFixed(
                  2,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}