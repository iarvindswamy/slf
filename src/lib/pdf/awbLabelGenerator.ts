// import "server-only";

// import {
//   PDFDocument,
//   StandardFonts,
//   rgb,
//   degrees,
// } from "pdf-lib";

// export type AwbLabelData = {
//   awb: string;
//   accountCode?: string;
//   bookDate?: string;

//   shipperName: string;
//   shipperAddress: string;
//   shipperCity: string;
//   shipperState?: string;
//   shipperPincode?: string;
//   shipperPhone?: string;
//   shipperCountry?: string;

//   consigneeName: string;
//   consigneeAddress: string;
//   consigneeCity: string;
//   consigneeState?: string;
//   consigneePincode?: string;
//   consigneePhone?: string;
//   consigneeCountry?: string;

//   serviceType?: string;
//   product?: string;
//   vendor?: string;

//   pieces: number;
//   actualWeight: number;
//   chargeableWeight: number;
//   dimensions?: string; // e.g. "37*37*24*1=7"

//   declaredValue?: number;
//   currency?: string;
//   content?: string;
//   csbType?: string;
// };

// export async function generateAwbLabelPdf(
//   data: AwbLabelData,
// ): Promise<Uint8Array> {
//   const pdf = await PDFDocument.create();
//   const page = pdf.addPage([595.28, 841.89]); // A4
//   const { width, height } = page.getSize();

//   const font = await pdf.embedFont(StandardFonts.Helvetica);
//   const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

//   const margin = 28;
//   let y = height - margin;

//   const drawText = (
//     text: string,
//     x: number,
//     yPos: number,
//     size = 9,
//     isBold = false,
//   ) => {
//     page.drawText(text || "", {
//       x,
//       y: yPos,
//       size,
//       font: isBold ? bold : font,
//       color: rgb(0, 0, 0),
//     });
//   };

//   // Header bar
//   page.drawRectangle({
//     x: margin,
//     y: y - 22,
//     width: width - margin * 2,
//     height: 28,
//     color: rgb(0.05, 0.12, 0.23),
//   });
//   drawText("SHIPMENT LABEL", margin + 8, y - 14, 12, true);
//   drawText(
//     data.accountCode ? `Account: ${data.accountCode}` : "",
//     width - margin - 140,
//     y - 14,
//     10,
//     true,
//   );
//   y -= 40;

//   // AWB + Barcode placeholder
//   drawText(`AWB No: ${data.awb}`, margin, y, 14, true);
//   drawText(
//     data.bookDate ? `Date: ${data.bookDate}` : "",
//     width / 2,
//     y,
//     10,
//   );
//   y -= 8;

//   // Simple barcode representation (lines)
//   const barcodeY = y - 28;
//   page.drawRectangle({
//     x: margin,
//     y: barcodeY,
//     width: 220,
//     height: 32,
//     borderColor: rgb(0, 0, 0),
//     borderWidth: 1,
//   });
//   // Fake barcode lines
//   for (let i = 0; i < 40; i++) {
//     const bx = margin + 6 + i * 5;
//     const bh = 10 + (i % 3) * 6;
//     page.drawRectangle({
//       x: bx,
//       y: barcodeY + 4,
//       width: 1.5,
//       height: bh,
//       color: rgb(0, 0, 0),
//     });
//   }
//   drawText(data.awb, margin + 50, barcodeY - 12, 9);
//   y = barcodeY - 28;

//   // Two-column addresses
//   const colW = (width - margin * 2 - 12) / 2;

//   // Shipper box
//   page.drawRectangle({
//     x: margin,
//     y: y - 110,
//     width: colW,
//     height: 115,
//     borderColor: rgb(0.7, 0.7, 0.7),
//     borderWidth: 0.8,
//   });
//   drawText("FROM (SHIPPER)", margin + 6, y - 12, 8, true);
//   drawText(data.shipperName, margin + 6, y - 26, 10, true);
//   drawText(data.shipperAddress, margin + 6, y - 40, 8);
//   drawText(
//     `${data.shipperCity || ""} ${data.shipperState || ""} ${data.shipperPincode || ""}`,
//     margin + 6,
//     y - 52,
//     8,
//   );
//   drawText(data.shipperCountry || "INDIA", margin + 6, y - 64, 8);
//   if (data.shipperPhone) {
//     drawText(`Tel: ${data.shipperPhone}`, margin + 6, y - 78, 8);
//   }

//   // Consignee box
//   page.drawRectangle({
//     x: margin + colW + 12,
//     y: y - 110,
//     width: colW,
//     height: 115,
//     borderColor: rgb(0.7, 0.7, 0.7),
//     borderWidth: 0.8,
//   });
//   drawText("TO (CONSIGNEE)", margin + colW + 18, y - 12, 8, true);
//   drawText(data.consigneeName, margin + colW + 18, y - 26, 10, true);
//   drawText(data.consigneeAddress, margin + colW + 18, y - 40, 8);
//   drawText(
//     `${data.consigneeCity || ""} ${data.consigneeState || ""} ${data.consigneePincode || ""}`,
//     margin + colW + 18,
//     y - 52,
//     8,
//   );
//   drawText(
//     data.consigneeCountry || "",
//     margin + colW + 18,
//     y - 64,
//     8,
//   );
//   if (data.consigneePhone) {
//     drawText(
//       `Tel: ${data.consigneePhone}`,
//       margin + colW + 18,
//       y - 78,
//       8,
//     );
//   }

//   y -= 130;

//   // Service / Weight info
//   page.drawRectangle({
//     x: margin,
//     y: y - 70,
//     width: width - margin * 2,
//     height: 75,
//     borderColor: rgb(0.7, 0.7, 0.7),
//     borderWidth: 0.8,
//   });

//   const info = [
//     [`Service: ${data.serviceType || data.product || "-"}`, `Vendor: ${data.vendor || "-"}`],
//     [`Pieces: ${data.pieces}`, `Actual Wt: ${data.actualWeight} kg`],
//     [`Charged Wt: ${data.chargeableWeight} kg`, `Dims: ${data.dimensions || "-"}`],
//     [
//       `Declared Value: ${data.currency || "INR"} ${data.declaredValue ?? 0}`,
//       `CSB: ${data.csbType || "-"}`,
//     ],
//   ];

//   info.forEach((row, i) => {
//     drawText(row[0], margin + 8, y - 16 - i * 14, 9);
//     drawText(row[1], margin + 280, y - 16 - i * 14, 9);
//   });

//   y -= 90;

//   // Content
//   drawText("Contents:", margin, y, 9, true);
//   drawText(data.content || "USED CLOTHES / GIFT", margin + 60, y, 9);
//   y -= 24;

//   // POD box
//   page.drawRectangle({
//     x: margin,
//     y: y - 90,
//     width: width - margin * 2,
//     height: 95,
//     borderColor: rgb(0.7, 0.7, 0.7),
//     borderWidth: 0.8,
//   });
//   drawText("PROOF OF DELIVERY (POD)", margin + 8, y - 14, 9, true);
//   drawText("Receiver's Signature: _______________________________", margin + 8, y - 40, 9);
//   drawText("Date: ____ / ____ / ________    Time: ______ AM/PM", margin + 8, y - 60, 9);
//   drawText("(Capital letters very important)", margin + 8, y - 78, 7);

//   // Footer
//   drawText(
//     "Sreshta Logistics  •  Generated on " + new Date().toLocaleString("en-IN"),
//     margin,
//     30,
//     7,
//   );

//   return pdf.save();
// }










import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
} from "pdf-lib";

export type AwbLabelData = {
  awb: string;
  accountCode?: string;          // e.g. WH439 / WF439
  bookDate?: string;             // YYYY-MM-DD or DD/MM/YYYY
  printedAt?: string;

  // Shipper
  shipperName: string;
  shipperAddress: string;
  shipperCity?: string;
  shipperState?: string;
  shipperPincode?: string;
  shipperPhone?: string;
  shipperCountry?: string;

  // Consignee
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity?: string;
  consigneeState?: string;
  consigneePincode?: string;
  consigneePhone?: string;
  consigneeCountry?: string;

  // Service
  serviceType?: string;          // SPX INTERNATIONAL PRIORITY
  product?: string;
  vendor?: string;               // FEDERAL EXPRESS CORPORATION / FDX

  // Package
  pieces: number;
  actualWeight: number;
  chargeableWeight: number;
  dimensions?: string;           // e.g. "37*37*24*1=7"

  // Customs
  declaredValue?: number;
  currency?: string;             // INR
  content?: string;              // USED CLOTHES
  csbType?: string;              // CSB4
  specialInstructions?: string;
  origin?: string;               // GUNTUR
};

export async function generateAwbLabelPdf(
  data: AwbLabelData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 18;
  const black = rgb(0, 0, 0);
  const gray = rgb(0.35, 0.35, 0.35);
  const lightGray = rgb(0.92, 0.92, 0.92);

  const drawText = (
    text: string,
    x: number,
    y: number,
    size = 8,
    isBold = false,
    color = black,
  ) => {
    page.drawText(String(text || ""), {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color,
    });
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    borderWidth = 0.8,
    fill?: ReturnType<typeof rgb>,
  ) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: black,
      borderWidth,
      color: fill,
    });
  };

  // ========== TOP HEADER ==========
  const topY = height - margin;

  drawText(
    data.printedAt ||
      new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    margin,
    topY - 10,
    7,
  );

  drawText("Shipment Label", width / 2 - 35, topY - 10, 10, true);
  drawText(
    `Printed on  ${data.bookDate || new Date().toLocaleDateString("en-GB")}`,
    width - margin - 130,
    topY - 10,
    7,
  );

  // Top thick line
  page.drawLine({
    start: { x: margin, y: topY - 16 },
    end: { x: width - margin, y: topY - 16 },
    thickness: 1.2,
    color: black,
  });

  // ========== ACCOUNT / ORIGIN / AWB / CUSTOMER REF ==========
  let y = topY - 34;

  // Account Number box
  drawRect(margin, y - 38, 145, 42);
  drawText("1. ACCOUNT NUMBER", margin + 4, y - 10, 7, true);
  drawText(data.accountCode || "WH439", margin + 4, y - 26, 14, true);

  // Origin + AWB
  drawRect(margin + 145, y - 38, 220, 42);
  drawText(data.origin || "GUNTUR", margin + 155, y - 12, 11, true);
  drawText(data.awb, margin + 155, y - 30, 16, true);

  // Customer Reference
  drawRect(margin + 365, y - 38, width - margin * 2 - 365, 42);
  drawText("CUSTOMER REFERENCE", margin + 370, y - 10, 7, true);
  drawText("SRESHTA COURIERS", margin + 370, y - 26, 10, true);

  // ========== MAIN BODY - 3 COLUMNS ==========
  y = y - 48;

  const col1W = 195;
  const col2W = 195;
  const col3W = width - margin * 2 - col1W - col2W;

  // ---- LEFT: SHIPPER ----
  drawRect(margin, y - 155, col1W, 160);
  drawText("S", margin + 4, y - 12, 9, true);
  drawText("H", margin + 4, y - 24, 9, true);
  drawText("I", margin + 4, y - 36, 9, true);
  drawText("P", margin + 4, y - 48, 9, true);
  drawText("P", margin + 4, y - 60, 9, true);
  drawText("E", margin + 4, y - 72, 9, true);
  drawText("R", margin + 4, y - 84, 9, true);

  drawText(data.shipperName, margin + 18, y - 14, 9, true);
  // Address lines
  const shipAddrLines = wrapText(data.shipperAddress || "", 28);
  shipAddrLines.forEach((line, i) => {
    drawText(line, margin + 18, y - 28 - i * 11, 8);
  });
  drawText(
    `${data.shipperCity || ""} ${data.shipperState || ""}`.trim(),
    margin + 18,
    y - 28 - shipAddrLines.length * 11,
    8,
  );
  drawText(
    data.shipperPincode || "",
    margin + 18,
    y - 40 - shipAddrLines.length * 11,
    8,
  );
  if (data.shipperPhone) {
    drawText(data.shipperPhone, margin + 18, y - 54 - shipAddrLines.length * 11, 8);
  }

  // ---- MIDDLE: CONSIGNEE ----
  drawRect(margin + col1W, y - 155, col2W, 160);
  drawText("C", margin + col1W + 4, y - 12, 9, true);
  drawText("O", margin + col1W + 4, y - 24, 9, true);
  drawText("N", margin + col1W + 4, y - 36, 9, true);
  drawText("S", margin + col1W + 4, y - 48, 9, true);
  drawText("I", margin + col1W + 4, y - 60, 9, true);
  drawText("G", margin + col1W + 4, y - 72, 9, true);
  drawText("N", margin + col1W + 4, y - 84, 9, true);
  drawText("E", margin + col1W + 4, y - 96, 9, true);
  drawText("E", margin + col1W + 4, y - 108, 9, true);

  drawText(data.consigneeName, margin + col1W + 18, y - 14, 9, true);
  const consAddrLines = wrapText(data.consigneeAddress || "", 26);
  consAddrLines.forEach((line, i) => {
    drawText(line, margin + col1W + 18, y - 28 - i * 11, 8);
  });
  drawText(
    `${data.consigneeCity || ""} ${data.consigneeState || ""}`.trim(),
    margin + col1W + 18,
    y - 28 - consAddrLines.length * 11,
    8,
  );
  drawText(
    data.consigneePincode || "",
    margin + col1W + 18,
    y - 40 - consAddrLines.length * 11,
    8,
  );
  drawText(
    `Country : ${data.consigneeCountry || "U.S.A."}`,
    margin + col1W + 18,
    y - 54 - consAddrLines.length * 11,
    8,
  );
  if (data.consigneePhone) {
    drawText(
      data.consigneePhone,
      margin + col1W + 18,
      y - 68 - consAddrLines.length * 11,
      8,
    );
  }

  // ---- RIGHT: SERVICE + CONTENTS + SIZE ----
  drawRect(margin + col1W + col2W, y - 155, col3W, 160);

  // Service Type
  drawRect(margin + col1W + col2W, y - 28, col3W, 28, 0.6, lightGray);
  drawText("SERVICE TYPE", margin + col1W + col2W + 4, y - 10, 7, true);
  drawText(
    data.serviceType || data.product || "SPX  INTERNATIONAL PRIORITY",
    margin + col1W + col2W + 4,
    y - 22,
    8,
    true,
  );

  drawText(
    data.vendor || "FEDERAL EXPRESS CORPORATION",
    margin + col1W + col2W + 4,
    y - 42,
    8,
  );

  drawText("FULL DESCRIPTION OF CONTENTS :-", margin + col1W + col2W + 4, y - 58, 7, true);
  drawText(data.content || "USED CLOTHES", margin + col1W + col2W + 4, y - 70, 8);

  drawText("SPECIAL INSTRUCTIONS :-", margin + col1W + col2W + 4, y - 90, 7, true);
  drawText(data.specialInstructions || "", margin + col1W + col2W + 4, y - 102, 8);

  // Size & Weight box
  drawRect(margin + col1W + col2W, y - 155, col3W, 48);
  drawText("SIZE & WEIGHT", margin + col1W + col2W + 4, y - 118, 7, true);
  drawText(`Pieces :   ${data.pieces}`, margin + col1W + col2W + 4, y - 132, 8);
  drawText(
    `Weight   ${data.actualWeight.toFixed(3)}   Kgs`,
    margin + col1W + col2W + 4,
    y - 144,
    8,
  );

  // ========== BOTTOM SECTION ==========
  y = y - 170;

  // Left: Sender Authorisation + POD
  drawRect(margin, y - 175, 210, 180);

  // ICL style logo placeholder
  drawText("ICL", margin + 70, y - 25, 18, true);
  drawText("Integrated Couriers & Logistics", margin + 30, y - 40, 7);

  drawText("SENDER'S AUTHORISATION AND SIGNATURE", margin + 8, y - 58, 7, true);
  drawText("SENDER'S SIGNATURE", margin + 8, y - 78, 8);
  drawText("DATE", margin + 8, y - 98, 8);

  // Thick line
  page.drawLine({
    start: { x: margin + 8, y: y - 110 },
    end: { x: margin + 200, y: y - 110 },
    thickness: 1,
  });

  drawText("PROOF OF DELIVERY (POD)", margin + 8, y - 128, 9, true);
  drawText("RECEIVER'S SIGNATURE", margin + 8, y - 148, 8);
  drawText("DATE    /     /            TIME     AM/PM", margin + 8, y - 168, 7);
  drawText("(CAPITAL LETTERS VERY IMPORTANT)", margin + 8, y - 182, 6);

  // Middle: Declared Value + CSB4 + Barcode
  drawRect(margin + 210, y - 175, 175, 180);

  drawText("DECLARED VALUE FOR", margin + 220, y - 18, 7, true);
  drawText("CUSTOMS AND CURRENCY", margin + 220, y - 30, 7, true);
  drawText(
    `${data.declaredValue ?? 3200} ${data.currency || "INR"}`,
    margin + 220,
    y - 50,
    14,
    true,
  );

  // CSB4 big stamp
  drawRect(margin + 230, y - 105, 130, 40, 1.5);
  drawText(data.csbType || "CSB4", margin + 260, y - 90, 18, true);

  // Barcode area
  drawRect(margin + 220, y - 165, 155, 50);
  // Simple barcode simulation
  for (let i = 0; i < 42; i++) {
    const bx = margin + 228 + i * 3.4;
    const bh = 18 + (i % 4) * 5;
    page.drawRectangle({
      x: bx,
      y: y - 155,
      width: 1.4,
      height: bh,
      color: black,
    });
  }
  drawText(data.awb, margin + 255, y - 172, 9, true);

  // Right: Size & Weight details
  drawRect(margin + 385, y - 175, width - margin * 2 - 385, 180);

  drawText("SIZE & WEIGHT", margin + 395, y - 18, 8, true);
  drawText(`Pieces :   ${data.pieces}`, margin + 395, y - 40, 10);
  drawText(
    `Weight   ${data.actualWeight.toFixed(3)}   Kgs`,
    margin + 395,
    y - 60,
    10,
  );
  drawText(data.dimensions || "37*37*24*1=7", margin + 395, y - 85, 10);
  drawText(
    `CHARGED WEIGHT   ${data.chargeableWeight.toFixed(2)}`,
    margin + 395,
    y - 115,
    11,
    true,
  );

  // Footer
  drawText(
    "Sreshta Logistics  •  System Generated Label",
    margin,
    18,
    7,
    false,
    gray,
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
  return lines.slice(0, 5); // max 5 lines
}