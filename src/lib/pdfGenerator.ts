import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

export type PdfInvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type PdfInvoiceData = {
  invoiceNumber: string;
  date: string;

  sellerName: string;
  sellerAddress?: string;
  sellerGstin?: string;

  customerName: string;
  customerAddress?: string;
  customerGstin?: string;

  awb?: string;

  items: PdfInvoiceItem[];

  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
};

function money(
  value: number,
): string {
  return `INR ${value.toFixed(
    2,
  )}`;
}

function safeText(
  value:
    | string
    | undefined,
): string {
  return value ?? "";
}

export async function generateInvoicePdf(
  invoice: PdfInvoiceData,
): Promise<Uint8Array> {
  const pdf =
    await PDFDocument.create();

  const regular =
    await pdf.embedFont(
      StandardFonts.Helvetica,
    );

  const bold =
    await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

  const page =
    pdf.addPage([
      595.28,
      841.89,
    ]);

  const {
    width,
    height,
  } = page.getSize();

  const margin = 45;

  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPosition: number,
    size = 10,
    font = regular,
  ) => {
    page.drawText(text, {
      x,
      y: yPosition,
      size,
      font,
      color: rgb(
        0.12,
        0.15,
        0.2,
      ),
    });
  };

  const drawLine = (
    yPosition: number,
  ) => {
    page.drawLine({
      start: {
        x: margin,
        y: yPosition,
      },
      end: {
        x:
          width - margin,
        y: yPosition,
      },
      thickness: 0.7,
      color: rgb(
        0.82,
        0.84,
        0.88,
      ),
    });
  };

  // Header
  drawText(
    invoice.sellerName,
    margin,
    y,
    18,
    bold,
  );

  drawText(
    "INVOICE",
    width - 135,
    y,
    18,
    bold,
  );

  y -= 25;

  if (invoice.sellerAddress) {
    drawText(
      safeText(
        invoice.sellerAddress,
      ),
      margin,
      y,
      9,
    );

    y -= 14;
  }

  if (invoice.sellerGstin) {
    drawText(
      `GSTIN: ${invoice.sellerGstin}`,
      margin,
      y,
      9,
    );

    y -= 14;
  }

  drawText(
    `Invoice No: ${invoice.invoiceNumber}`,
    width - 200,
    y + 28,
    9,
  );

  drawText(
    `Date: ${invoice.date}`,
    width - 200,
    y + 14,
    9,
  );

  if (invoice.awb) {
    drawText(
      `AWB: ${invoice.awb}`,
      width - 200,
      y,
      9,
    );
  }

  y -= 20;

  drawLine(y);

  y -= 30;

  // Customer
  drawText(
    "BILL TO",
    margin,
    y,
    9,
    bold,
  );

  y -= 16;

  drawText(
    invoice.customerName,
    margin,
    y,
    11,
    bold,
  );

  y -= 14;

  if (invoice.customerAddress) {
    drawText(
      invoice.customerAddress,
      margin,
      y,
      9,
    );

    y -= 14;
  }

  if (invoice.customerGstin) {
    drawText(
      `GSTIN: ${invoice.customerGstin}`,
      margin,
      y,
      9,
    );

    y -= 14;
  }

  y -= 20;

  // Table
  const descriptionX =
    margin;

  const quantityX = 360;

  const rateX = 420;

  const amountX = 500;

  page.drawRectangle({
    x: margin,
    y: y - 8,
    width:
      width -
      margin * 2,
    height: 24,
    color: rgb(
      0.94,
      0.95,
      0.97,
    ),
  });

  drawText(
    "Description",
    descriptionX,
    y,
    9,
    bold,
  );

  drawText(
    "Qty",
    quantityX,
    y,
    9,
    bold,
  );

  drawText(
    "Rate",
    rateX,
    y,
    9,
    bold,
  );

  drawText(
    "Amount",
    amountX,
    y,
    9,
    bold,
  );

  y -= 28;

  for (const item of invoice.items) {
    if (y < 150) {
      break;
    }

    drawText(
      item.description.slice(
        0,
        48,
      ),
      descriptionX,
      y,
      9,
    );

    drawText(
      String(item.quantity),
      quantityX,
      y,
      9,
    );

    drawText(
      money(item.rate),
      rateX,
      y,
      9,
    );

    drawText(
      money(item.amount),
      amountX,
      y,
      9,
    );

    y -= 22;
  }

  drawLine(y);

  y -= 25;

  // Totals
  const totalX =
    width - 190;

  drawText(
    "Subtotal",
    totalX,
    y,
    9,
  );

  drawText(
    money(invoice.subtotal),
    width - 90,
    y,
    9,
  );

  y -= 18;

  if (
    invoice.discount !==
      undefined &&
    invoice.discount > 0
  ) {
    drawText(
      "Discount",
      totalX,
      y,
      9,
    );

    drawText(
      `- ${money(
        invoice.discount,
      )}`,
      width - 100,
      y,
      9,
    );

    y -= 18;
  }

  drawText(
    "Tax",
    totalX,
    y,
    9,
  );

  drawText(
    money(invoice.tax),
    width - 90,
    y,
    9,
  );

  y -= 22;

  page.drawRectangle({
    x: totalX - 10,
    y: y - 8,
    width: 155,
    height: 30,
    color: rgb(
      0.94,
      0.95,
      0.97,
    ),
  });

  drawText(
    "TOTAL",
    totalX,
    y,
    10,
    bold,
  );

  drawText(
    money(invoice.total),
    width - 110,
    y,
    10,
    bold,
  );

  // Footer
  drawText(
    "Generated by Sreshta Logistics + Sreshta Foods",
    margin,
    45,
    8,
  );

  return pdf.save();
}

export function pdfBytesToBase64(
  bytes: Uint8Array,
): string {
  return Buffer.from(
    bytes,
  ).toString("base64");
}