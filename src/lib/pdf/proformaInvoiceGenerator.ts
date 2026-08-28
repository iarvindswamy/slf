// import "server-only";

// import {
//   PDFDocument,
//   StandardFonts,
//   rgb,
// } from "pdf-lib";

// import { numberToWords } from "@/utils/numberToWords";

// export type ProformaItem = {
//   description: string;
//   shopName?: string;
//   shopAddress?: string;
//   hsCode: string;
//   quantity: number;
//   weight?: number;
//   unitRate: number;
//   amount: number;
// };

// export type ProformaInvoiceData = {
//   awb: string;
//   invoiceNo: string;
//   invoiceDate: string;
//   accountCode?: string;

//   shipperName: string;
//   shipperAddress: string;
//   shipperPhone?: string;
//   shipperTaxId?: string; // Aadhaar / GSTIN

//   consigneeName: string;
//   consigneeAddress: string;
//   consigneeCity?: string;
//   consigneeState?: string;
//   consigneePincode?: string;
//   consigneeCountry?: string;
//   consigneePhone?: string;

//   preCarriageBy?: string;
//   placeOfLoading?: string;
//   portOfDischarge?: string;
//   finalDestination?: string;
//   countryOfOrigin?: string;
//   countryOfDestination?: string;
//   termOfDelivery?: string;
//   otherReference?: string;
//   csbType?: string;
//   exportReason?: string;

//   items: ProformaItem[];
//   totalAmount: number;
//   totalPieces?: number;
//   actualWeight?: number;
//   chargeableWeight?: number;
//   declaredValue?: number;
// };

// export async function generateProformaInvoicePdf(
//   data: ProformaInvoiceData,
// ): Promise<Uint8Array> {
//   const pdf = await PDFDocument.create();
//   const page = pdf.addPage([595.28, 841.89]);
//   const { width, height } = page.getSize();

//   const font = await pdf.embedFont(StandardFonts.Helvetica);
//   const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

//   const margin = 32;
//   let y = height - margin;

//   const text = (
//     str: string,
//     x: number,
//     yPos: number,
//     size = 8,
//     isBold = false,
//   ) => {
//     page.drawText(String(str || ""), {
//       x,
//       y: yPos,
//       size,
//       font: isBold ? bold : font,
//       color: rgb(0, 0, 0),
//     });
//   };

//   // Title
//   text("INVOICE", width / 2 - 30, y, 16, true);
//   y -= 18;
//   text(`AWB: ${data.awb}`, margin, y, 9, true);
//   text(`Invoice No: ${data.invoiceNo}`, width / 2, y, 9);
//   text(`Date: ${data.invoiceDate}`, width - margin - 90, y, 9);
//   y -= 16;

//   if (data.accountCode) {
//     text(`Account: ${data.accountCode}`, margin, y, 9, true);
//     y -= 14;
//   }

//   // Shipper / Consignee boxes
//   const boxH = 95;
//   const colW = (width - margin * 2 - 10) / 2;

//   page.drawRectangle({
//     x: margin,
//     y: y - boxH,
//     width: colW,
//     height: boxH,
//     borderWidth: 0.7,
//     borderColor: rgb(0.6, 0.6, 0.6),
//   });
//   text("SHIPPER", margin + 4, y - 12, 8, true);
//   text(data.shipperName, margin + 4, y - 26, 9, true);
//   text(data.shipperAddress, margin + 4, y - 40, 7);
//   if (data.shipperPhone) text(`Ph: ${data.shipperPhone}`, margin + 4, y - 54, 7);
//   if (data.shipperTaxId) text(`Tax ID: ${data.shipperTaxId}`, margin + 4, y - 66, 7);

//   page.drawRectangle({
//     x: margin + colW + 10,
//     y: y - boxH,
//     width: colW,
//     height: boxH,
//     borderWidth: 0.7,
//     borderColor: rgb(0.6, 0.6, 0.6),
//   });
//   text("CONSIGNEE", margin + colW + 14, y - 12, 8, true);
//   text(data.consigneeName, margin + colW + 14, y - 26, 9, true);
//   text(data.consigneeAddress, margin + colW + 14, y - 40, 7);
//   text(
//     `${data.consigneeCity || ""} ${data.consigneeState || ""} ${data.consigneePincode || ""}`,
//     margin + colW + 14,
//     y - 52,
//     7,
//   );
//   text(data.consigneeCountry || "", margin + colW + 14, y - 64, 7);
//   if (data.consigneePhone)
//     text(`Ph: ${data.consigneePhone}`, margin + colW + 14, y - 76, 7);

//   y -= boxH + 14;

//   // Routing info
//   const route = [
//     ["Pre-Carriage By", data.preCarriageBy || "-"],
//     ["Place of Loading", data.placeOfLoading || "-"],
//     ["Port of Discharge", data.portOfDischarge || "-"],
//     ["Final Destination", data.finalDestination || data.consigneeCountry || "-"],
//     ["Country of Origin", data.countryOfOrigin || "INDIA"],
//     ["Country of Destination", data.countryOfDestination || data.consigneeCountry || "-"],
//     ["Term of Delivery", data.termOfDelivery || "CIF"],
//     ["Other Reference", data.otherReference || data.exportReason || "-"],
//   ];

//   route.forEach((row, i) => {
//     const x = i % 2 === 0 ? margin : margin + colW + 10;
//     if (i % 2 === 0 && i > 0) y -= 12;
//     text(`${row[0]}: `, x, y, 7, true);
//     text(row[1], x + 95, y, 7);
//   });
//   y -= 20;

//   // Items table header
//   const headers = ["#", "Description", "HS Code", "Qty", "Rate", "Amount"];
//   const colXs = [margin, margin + 25, margin + 260, margin + 340, margin + 390, margin + 460];

//   page.drawRectangle({
//     x: margin,
//     y: y - 16,
//     width: width - margin * 2,
//     height: 18,
//     color: rgb(0.12, 0.18, 0.28),
//   });
//   headers.forEach((h, i) => {
//     page.drawText(h, {
//       x: colXs[i],
//       y: y - 12,
//       size: 8,
//       font: bold,
//       color: rgb(1, 1, 1),
//     });
//   });
//   y -= 22;

//   // Items
//   data.items.forEach((item, idx) => {
//     if (y < 120) {
//       // simple overflow protection – new page could be added later
//       y = 120;
//     }

//     const desc = item.shopName
//       ? `${item.description}  [${item.shopName}]`
//       : item.description;

//     text(String(idx + 1), colXs[0], y, 7);
//     text(desc.slice(0, 55), colXs[1], y, 7);
//     text(item.hsCode, colXs[2], y, 7);
//     text(String(item.quantity), colXs[3], y, 7);
//     text(item.unitRate.toFixed(2), colXs[4], y, 7);
//     text(item.amount.toFixed(2), colXs[5], y, 7);
//     y -= 13;

//     if (item.shopAddress) {
//       text(item.shopAddress.slice(0, 70), colXs[1], y, 6);
//       y -= 11;
//     }
//   });

//   y -= 8;

//   // Totals
//   page.drawLine({
//     start: { x: margin, y },
//     end: { x: width - margin, y },
//     thickness: 0.6,
//   });
//   y -= 14;

//   text(`Total Pieces: ${data.totalPieces ?? data.items.length}`, margin, y, 8);
//   text(`Weight: ${data.actualWeight ?? "-"} kg`, margin + 140, y, 8);
//   text(`Charged Wt: ${data.chargeableWeight ?? "-"} kg`, margin + 280, y, 8);
//   y -= 14;

//   text("TOTAL", margin + 390, y, 10, true);
//   text(`INR ${data.totalAmount.toFixed(2)}`, margin + 450, y, 10, true);
//   y -= 16;

//   text("Amount in Words:", margin, y, 8, true);
//   text(numberToWords(data.totalAmount), margin + 95, y, 8);
//   y -= 20;

//   // Declaration
//   text(
//     "DECLARATION: THIS IS TO CERTIFY THAT THE RATE AND QUANTITY MENTIONED IN THIS INVOICE IS TRUE AND CORRECT.",
//     margin,
//     y,
//     7,
//   );
//   y -= 30;

//   text("This is a system generated invoice and does not require signature.", margin, y, 7);
//   text("AUTHORIZED SIGNATORY", width - margin - 120, y, 8, true);

//   // Footer
//   text(
//     `Sreshta Logistics  •  Generated ${new Date().toLocaleString("en-IN")}`,
//     margin,
//     28,
//     7,
//   );

//   return pdf.save();
// }







import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { numberToWords } from "@/utils/numberToWords";

export type ProformaItem = {
  description: string;
  shopName?: string;
  shopAddress?: string;
  hsCode: string;
  quantity: number;
  weight?: number;
  unitRate: number;
  amount: number;
  boxNo?: number;
};

export type ProformaInvoiceData = {
  awb: string;
  invoiceNo: string;
  invoiceDate: string;           // DD/MM/YYYY preferred
  accountCode?: string;
  exporterRef?: string;          // e.g. ARI - 200601

  // Shipper
  shipperName: string;
  shipperAddress: string;
  shipperPhone?: string;
  shipperTaxId?: string;         // Aadhaar / GSTIN
  shipperCity?: string;
  shipperState?: string;
  shipperPincode?: string;
  shipperCountry?: string;

  // Consignee
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity?: string;
  consigneeState?: string;
  consigneePincode?: string;
  consigneeCountry?: string;
  consigneePhone?: string;

  // Routing
  preCarriageBy?: string;        // FDX
  placeOfLoading?: string;       // GUNTUR
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin?: string;      // INDIA
  countryOfDestination?: string; // U.S.A.
  termOfDelivery?: string;       // CIF
  otherReference?: string;       // UNSOLICITED GIFT - NOT FOR SALE
  vesselFlightNo?: string;
  portOfReceipt?: string;

  // Package
  totalPieces?: number;
  packageType?: string;          // PKT / BOX
  actualWeight?: number;
  chargeableWeight?: number;
  declaredValue?: number;

  // Items
  items: ProformaItem[];
  totalAmount: number;
};

export async function generateProformaInvoicePdf(
  data: ProformaInvoiceData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 22;
  const black = rgb(0, 0, 0);
  const gray = rgb(0.3, 0.3, 0.3);

  const text = (
    str: string,
    x: number,
    y: number,
    size = 8,
    isBold = false,
  ) => {
    page.drawText(String(str || ""), {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: black,
    });
  };

  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    borderWidth = 0.7,
  ) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: black,
      borderWidth,
    });
  };

  let y = height - margin;

  // ========== TOP HEADER ==========
  text(data.awb, margin, y - 8, 9, true);
  text("INVOICE", width / 2 - 25, y - 10, 14, true);
  y -= 22;

  // Top info row
  const topBoxH = 52;
  rect(margin, y - topBoxH, 220, topBoxH);
  text("SHIPPER :", margin + 4, y - 12, 7, true);
  text(data.shipperName, margin + 4, y - 24, 9, true);

  const shipAddr = wrapText(data.shipperAddress || "", 38);
  shipAddr.forEach((line, i) => {
    text(line, margin + 4, y - 36 - i * 10, 7);
  });

  // Right top boxes
  rect(margin + 220, y - topBoxH, 120, topBoxH);
  text("INVOICE NO :", margin + 224, y - 12, 7, true);
  text(data.invoiceNo || "", margin + 224, y - 26, 9, true);
  text("AWB NO :", margin + 224, y - 40, 7, true);
  text(data.awb, margin + 224, y - 50, 8, true);

  rect(margin + 340, y - topBoxH, 100, topBoxH);
  text("DATE :", margin + 344, y - 12, 7, true);
  text(data.invoiceDate || "", margin + 344, y - 26, 9, true);
  text("PCS :", margin + 344, y - 40, 7, true);
  text(
    `${data.totalPieces ?? 1}   ${data.packageType || "PKT"}`,
    margin + 344,
    y - 50,
    8,
  );

  rect(margin + 440, y - topBoxH, width - margin * 2 - 440, topBoxH);
  text("EXPORTER'S REF :", margin + 444, y - 12, 7, true);
  text(data.exporterRef || data.preCarriageBy || "FDX", margin + 444, y - 26, 9, true);

  y -= topBoxH + 6;

  // ========== SHIPPER + CONSIGNEE ==========
  const midH = 95;

  // Shipper details
  rect(margin, y - midH, 270, midH);
  text("SHIPPER", margin + 4, y - 12, 8, true);
  text(data.shipperName, margin + 4, y - 26, 9, true);

  const fullShipAddr = [
    data.shipperAddress,
    [data.shipperCity, data.shipperState, data.shipperPincode]
      .filter(Boolean)
      .join(" "),
    data.shipperCountry || "INDIA",
  ]
    .filter(Boolean)
    .join(", ");

  const shipLines = wrapText(fullShipAddr, 48);
  shipLines.forEach((line, i) => {
    text(line, margin + 4, y - 40 - i * 10, 7);
  });

  if (data.shipperTaxId) {
    text(`Aadhaar Number- ${data.shipperTaxId}`, margin + 4, y - 70, 7);
  }
  if (data.shipperPhone) {
    text(`PH : ${data.shipperPhone}`, margin + 4, y - 84, 7);
  }

  // Consignee
  rect(margin + 270, y - midH, width - margin * 2 - 270, midH);
  text("CONSIGNEE :", margin + 274, y - 12, 8, true);
  text(data.consigneeName, margin + 274, y - 26, 9, true);

  const consLines = wrapText(data.consigneeAddress || "", 40);
  consLines.forEach((line, i) => {
    text(line, margin + 274, y - 40 - i * 10, 7);
  });

  text(
    `${data.consigneeCity || ""} ${data.consigneeState || ""}`.trim(),
    margin + 274,
    y - 40 - consLines.length * 10,
    7,
  );
  text(
    data.consigneeCountry || "U.S.A.",
    margin + 274,
    y - 52 - consLines.length * 10,
    7,
  );
  if (data.consigneePhone) {
    text(`PH : ${data.consigneePhone}`, margin + 274, y - 66 - consLines.length * 10, 7);
  }

  text("WEIGHT :", margin + 400, y - 12, 7, true);
  if (data.actualWeight) {
    text(`${data.actualWeight.toFixed(3)} Kgs`, margin + 450, y - 12, 8);
  }

  y -= midH + 4;

  // ========== ROUTING ROW ==========
  const routeH = 48;
  rect(margin, y - routeH, width - margin * 2, routeH);

  // Row 1
  text("PRE-CARRIAGE BY :", margin + 4, y - 12, 7, true);
  text(data.preCarriageBy || "FDX", margin + 95, y - 12, 8);

  text("PORT OF RECEIPT BY PRE CAR", margin + 160, y - 12, 7, true);

  text("OTHER REFERENCE (S)", margin + 340, y - 12, 7, true);
  text(
    data.otherReference || "UNSOLICITED GIFT - NOT FOR SALE",
    margin + 340,
    y - 24,
    8,
    true,
  );

  // Row 2
  text("VESSEL/FLIGHT NO.", margin + 4, y - 36, 7, true);
  text(data.vesselFlightNo || "", margin + 95, y - 36, 8);

  text("PLACE OF LOADING", margin + 160, y - 36, 7, true);
  text(data.placeOfLoading || "GUNTUR", margin + 250, y - 36, 8);

  text("COUNTRY OF ORIGIN", margin + 340, y - 36, 7, true);
  text(data.countryOfOrigin || "INDIA", margin + 430, y - 36, 8);

  text("COUNTRY OF DESTINATION", margin + 480, y - 36, 7, true);
  text(data.countryOfDestination || "U.S.A.", margin + 580, y - 36, 8);

  y -= routeH + 2;

  // Second routing row
  rect(margin, y - 22, width - margin * 2, 22);
  text("PORT OF DISCHARGE", margin + 4, y - 14, 7, true);
  text(data.portOfDischarge || data.placeOfLoading || "GUNTUR", margin + 100, y - 14, 8);

  text("FINAL DESTINATION", margin + 220, y - 14, 7, true);
  text(
    data.finalDestination || data.consigneeCountry || "U.S.A.",
    margin + 310,
    y - 14,
    8,
  );

  text("TERM OF DELIVERY AND PAYMENTS :", margin + 400, y - 14, 7, true);
  text(data.termOfDelivery || "CIF", margin + 540, y - 14, 8, true);

  y -= 28;

  // ========== ITEMS TABLE ==========
  const col = {
    sr: margin,
    box: margin + 28,
    desc: margin + 55,
    weight: margin + 320,
    hs: margin + 370,
    qty: margin + 440,
    rate: margin + 475,
    amt: margin + 520,
  };

  // Header
  rect(margin, y - 18, width - margin * 2, 18);
  page.drawRectangle({
    x: margin,
    y: y - 18,
    width: width - margin * 2,
    height: 18,
    color: rgb(0.15, 0.15, 0.15),
  });

  const headerColor = rgb(1, 1, 1);
  const hText = (str: string, x: number) => {
    page.drawText(str, {
      x,
      y: y - 13,
      size: 7,
      font: bold,
      color: headerColor,
    });
  };

  hText("SR NO", col.sr + 2);
  hText("BOX", col.box);
  hText("DESCRIPTION OF GOODS", col.desc);
  hText("WEIGHT", col.weight);
  hText("HS CODE", col.hs);
  hText("QTY", col.qty);
  hText("RATE", col.rate);
  hText("AMT", col.amt);

  y -= 20;

  // Items
  data.items.forEach((item, idx) => {
    if (y < 140) return; // safety

    const descParts: string[] = [item.description];
    if (item.shopName) {
      descParts.push(`_SHOP NAME:${item.shopName}`);
    }
    if (item.shopAddress) {
      descParts.push(`,ADDRESS:${item.shopAddress}`);
    }
    const fullDesc = descParts.join("");

    const descLines = wrapText(fullDesc, 42);

    const rowHeight = Math.max(28, descLines.length * 10 + 8);

    // light alternate row
    if (idx % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: y - rowHeight,
        width: width - margin * 2,
        height: rowHeight,
        color: rgb(0.97, 0.97, 0.97),
      });
    }

    text(String(idx + 1), col.sr + 6, y - 12, 8);
    text(String(item.boxNo ?? 1), col.box + 4, y - 12, 8);

    descLines.forEach((line, i) => {
      text(line, col.desc, y - 11 - i * 10, 7);
    });

    text(
      item.weight != null ? item.weight.toFixed(3) : "",
      col.weight,
      y - 12,
      8,
    );
    text(item.hsCode || "", col.hs, y - 12, 7);
    text(String(item.quantity), col.qty + 4, y - 12, 8);
    text(item.unitRate.toFixed(2), col.rate, y - 12, 8);
    text(item.amount.toFixed(2), col.amt, y - 12, 8);

    y -= rowHeight;
  });

  // ========== TOTALS ==========
  y -= 6;
  rect(margin, y - 22, width - margin * 2, 22);
  text("TOTAL =", margin + 450, y - 15, 9, true);
  text(data.totalAmount.toFixed(2), margin + 510, y - 15, 10, true);

  y -= 30;

  // Amount in words
  text("AMOUNT IN WORDS :", margin, y, 8, true);
  text(
    numberToWords(data.totalAmount) ||
      `INR ${data.totalAmount.toFixed(2)} Only`,
    margin + 100,
    y,
    8,
  );

  y -= 28;

  // Declaration
  text(
    "DECLARATION : THIS IS CERTIFY THAT THE RATE AND QUANTITY MENTIONED IN THIS INVOICE IS TRUE AND CORRECT.",
    margin,
    y,
    7,
  );

  y -= 40;

  // Signature area
  text(
    "This is system generated invoice does not require signature.",
    margin,
    y,
    7,
  );

  text("AUTHORIZED SIGNATORY", width - margin - 120, y, 8, true);

  // Footer
  text(
    `Sreshta Logistics  •  Generated ${new Date().toLocaleString("en-IN")}`,
    margin,
    18,
    7,
    false,
  );

  return pdf.save();
}

// Simple text wrapper
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}