// // import { NextRequest, NextResponse } from "next/server";
// // import { generateAwbLabelPdf } from "@/lib/pdf/awbLabelGenerator";
// // import { generateProformaInvoicePdf } from "@/lib/pdf/proformaInvoiceGenerator";
// // import { numberToWords } from "@/utils/numberToWords";

// // export const runtime = "nodejs";

// // type GeneratePdfBody = {
// //   type: "awb-label" | "proforma" | "both";
// //   // Shared / AWB fields
// //   awb: string;
// //   accountCode?: string;
// //   bookDate?: string;
// //   invoiceNo?: string;
// //   invoiceDate?: string;

// //   shipperName: string;
// //   shipperAddress: string;
// //   shipperCity?: string;
// //   shipperState?: string;
// //   shipperPincode?: string;
// //   shipperPhone?: string;
// //   shipperCountry?: string;
// //   shipperTaxId?: string;

// //   consigneeName: string;
// //   consigneeAddress: string;
// //   consigneeCity?: string;
// //   consigneeState?: string;
// //   consigneePincode?: string;
// //   consigneePhone?: string;
// //   consigneeCountry?: string;

// //   serviceType?: string;
// //   product?: string;
// //   vendor?: string;
// //   preCarriageBy?: string;
// //   placeOfLoading?: string;
// //   portOfDischarge?: string;
// //   finalDestination?: string;
// //   countryOfOrigin?: string;
// //   countryOfDestination?: string;
// //   termOfDelivery?: string;
// //   otherReference?: string;
// //   csbType?: string;
// //   exportReason?: string;

// //   pieces?: number;
// //   actualWeight?: number;
// //   chargeableWeight?: number;
// //   dimensions?: string;
// //   declaredValue?: number;
// //   currency?: string;
// //   content?: string;

// //   items?: Array<{
// //     description: string;
// //     shopName?: string;
// //     shopAddress?: string;
// //     hsCode: string;
// //     quantity: number;
// //     weight?: number;
// //     unitRate: number;
// //     amount: number;
// //   }>;
// //   totalAmount?: number;
// // };

// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = (await req.json()) as GeneratePdfBody;

// //     if (!body.awb?.trim()) {
// //       return NextResponse.json(
// //         { error: "AWB number is required." },
// //         { status: 400 },
// //       );
// //     }

// //     if (!body.type) {
// //       return NextResponse.json(
// //         { error: "type must be 'awb-label' | 'proforma' | 'both'." },
// //         { status: 400 },
// //       );
// //     }

// //     const results: Record<string, string> = {};

// //     // ---------- AWB Label ----------
// //     if (body.type === "awb-label" || body.type === "both") {
// //       const labelBytes = await generateAwbLabelPdf({
// //         awb: body.awb,
// //         accountCode: body.accountCode,
// //         bookDate: body.bookDate,
// //         shipperName: body.shipperName,
// //         shipperAddress: body.shipperAddress,
// //         shipperCity: body.shipperCity || "",
// //         shipperState: body.shipperState,
// //         shipperPincode: body.shipperPincode,
// //         shipperPhone: body.shipperPhone,
// //         shipperCountry: body.shipperCountry || "INDIA",
// //         consigneeName: body.consigneeName,
// //         consigneeAddress: body.consigneeAddress,
// //         consigneeCity: body.consigneeCity || "",
// //         consigneeState: body.consigneeState,
// //         consigneePincode: body.consigneePincode,
// //         consigneePhone: body.consigneePhone,
// //         consigneeCountry: body.consigneeCountry,
// //         serviceType: body.serviceType || body.product,
// //         product: body.product,
// //         vendor: body.vendor,
// //         pieces: body.pieces ?? 1,
// //         actualWeight: body.actualWeight ?? 0,
// //         chargeableWeight: body.chargeableWeight ?? 0,
// //         dimensions: body.dimensions,
// //         declaredValue: body.declaredValue,
// //         currency: body.currency || "INR",
// //         content: body.content,
// //         csbType: body.csbType,
// //       });

// //       results.awbLabel = Buffer.from(labelBytes).toString("base64");
// //     }

// //     // ---------- Proforma Invoice ----------
// //     if (body.type === "proforma" || body.type === "both") {
// //       const total = body.totalAmount ?? 0;

// //       const proformaBytes = await generateProformaInvoicePdf({
// //         awb: body.awb,
// //         invoiceNo: body.invoiceNo || `INV-${body.awb}`,
// //         invoiceDate: body.invoiceDate || new Date().toISOString().slice(0, 10),
// //         accountCode: body.accountCode,
// //         shipperName: body.shipperName,
// //         shipperAddress: body.shipperAddress,
// //         shipperPhone: body.shipperPhone,
// //         shipperTaxId: body.shipperTaxId,
// //         consigneeName: body.consigneeName,
// //         consigneeAddress: body.consigneeAddress,
// //         consigneeCity: body.consigneeCity,
// //         consigneeState: body.consigneeState,
// //         consigneePincode: body.consigneePincode,
// //         consigneeCountry: body.consigneeCountry,
// //         preCarriageBy: body.preCarriageBy || body.vendor,
// //         placeOfLoading: body.placeOfLoading,
// //         portOfDischarge: body.portOfDischarge,
// //         finalDestination: body.finalDestination || body.consigneeCountry,
// //         countryOfOrigin: body.countryOfOrigin || "INDIA",
// //         countryOfDestination:
// //           body.countryOfDestination || body.consigneeCountry,
// //         termOfDelivery: body.termOfDelivery || "CIF",
// //         otherReference: body.otherReference || body.exportReason,
// //         csbType: body.csbType,
// //         exportReason: body.exportReason,
// //         items: body.items || [],
// //         totalAmount: total,
// //         totalPieces: body.pieces,
// //         actualWeight: body.actualWeight,
// //         chargeableWeight: body.chargeableWeight,
// //         declaredValue: body.declaredValue,
// //       });

// //       results.proforma = Buffer.from(proformaBytes).toString("base64");
// //       results.amountInWords = numberToWords(total);
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       awb: body.awb,
// //       ...results,
// //     });
// //   } catch (err) {
// //     console.error("[generate-pdf]", err);
// //     return NextResponse.json(
// //       {
// //         error:
// //           err instanceof Error
// //             ? err.message
// //             : "Failed to generate PDF",
// //       },
// //       { status: 500 },
// //     );
// //   }
// // }



// import { NextRequest, NextResponse } from "next/server";
// import { getCurrentUser } from "@/lib/auth";
// import { can } from "@/lib/permissions";
// import { successResponse, errorResponse } from "@/lib/api-response";

// import { generateAwbLabelPdf } from "@/lib/pdf/awbLabelGenerator";
// import { generateProformaInvoicePdf } from "@/lib/pdf/proformaInvoiceGenerator";

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
//     }

//     // Allow both Super Admin and Co-loaders who can create invoices
//     if (
//       !can(user, "LOGISTICS_INVOICE_CREATE") &&
//       !can(user, "LOGISTICS_AWB_CREATE")
//     ) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to generate logistics documents.",
//         403,
//       );
//     }

//     const body = await request.json();

//     const type = body.type as "awb-label" | "proforma" | "both";

//     if (!type || !["awb-label", "proforma", "both"].includes(type)) {
//       return errorResponse(
//         "INVALID_TYPE",
//         "type must be 'awb-label', 'proforma' or 'both'.",
//         400,
//       );
//     }

//     if (!body.awb) {
//       return errorResponse("AWB_REQUIRED", "awb is required.", 400);
//     }

//     // ---------- Common data mapping ----------
//     const common = {
//       awb: String(body.awb),
//       accountCode: body.accountCode || "",
//       bookDate: body.bookDate || body.invoiceDate || "",
//       invoiceNo: body.invoiceNo || body.invoiceNumber || `INV-${body.awb}`,
//       invoiceDate: body.invoiceDate || body.bookDate || new Date().toLocaleDateString("en-GB"),

//       shipperName: body.shipperName || "",
//       shipperAddress: body.shipperAddress || "",
//       shipperCity: body.shipperCity || "",
//       shipperState: body.shipperState || "",
//       shipperPincode: body.shipperPincode || "",
//       shipperPhone: body.shipperPhone || "",
//       shipperCountry: body.shipperCountry || "INDIA",
//       shipperTaxId: body.shipperTaxId || body.shipperGstin || "",

//       consigneeName: body.consigneeName || "",
//       consigneeAddress: body.consigneeAddress || "",
//       consigneeCity: body.consigneeCity || "",
//       consigneeState: body.consigneeState || "",
//       consigneePincode: body.consigneePincode || "",
//       consigneePhone: body.consigneePhone || "",
//       consigneeCountry: body.consigneeCountry || "U.S.A.",

//       serviceType: body.serviceType || body.product || "SPX INTERNATIONAL PRIORITY",
//       vendor: body.vendor || body.preCarriageBy || "FEDERAL EXPRESS CORPORATION",
//       preCarriageBy: body.preCarriageBy || body.vendor || "FDX",
//       placeOfLoading: body.placeOfLoading || body.origin || "GUNTUR",
//       portOfDischarge: body.portOfDischarge || "",
//       finalDestination: body.finalDestination || body.consigneeCountry || "U.S.A.",
//       countryOfOrigin: body.countryOfOrigin || "INDIA",
//       countryOfDestination: body.countryOfDestination || body.consigneeCountry || "U.S.A.",
//       termOfDelivery: body.termOfDelivery || body.termOfInvoice || "CIF",
//       otherReference: body.otherReference || body.exportReason || "UNSOLICITED GIFT - NOT FOR SALE",
//       csbType: body.csbType || "CSB4",
//       content: body.content || "USED CLOTHES",
//       specialInstructions: body.specialInstructions || "",

//       pieces: Number(body.pieces || body.totalPieces || 1),
//       actualWeight: Number(body.actualWeight || 0),
//       chargeableWeight: Number(body.chargeableWeight || body.actualWeight || 0),
//       dimensions: body.dimensions || "",
//       declaredValue: Number(body.declaredValue || 0),
//       currency: body.currency || "INR",
//       totalAmount: Number(body.totalAmount || 0),

//       items: Array.isArray(body.items)
//         ? body.items.map((item: any, index: number) => ({
//             description: item.description || "",
//             shopName: item.shopName || "",
//             shopAddress: item.shopAddress || "",
//             hsCode: item.hsCode || "",
//             quantity: Number(item.quantity || 1),
//             weight: item.weight != null ? Number(item.weight) : undefined,
//             unitRate: Number(item.unitRate || item.rate || 0),
//             amount: Number(item.amount || 0),
//             boxNo: item.boxNo || index + 1,
//           }))
//         : [],
//     };

//     // ---------- Generate PDFs ----------
//     const result: {
//       success: boolean;
//       awbLabel?: string;
//       proforma?: string;
//       message?: string;
//     } = { success: true };

//     if (type === "awb-label" || type === "both") {
//       const labelBytes = await generateAwbLabelPdf({
//         awb: common.awb,
//         accountCode: common.accountCode,
//         bookDate: common.bookDate,
//         shipperName: common.shipperName,
//         shipperAddress: common.shipperAddress,
//         shipperCity: common.shipperCity,
//         shipperState: common.shipperState,
//         shipperPincode: common.shipperPincode,
//         shipperPhone: common.shipperPhone,
//         shipperCountry: common.shipperCountry,
//         consigneeName: common.consigneeName,
//         consigneeAddress: common.consigneeAddress,
//         consigneeCity: common.consigneeCity,
//         consigneeState: common.consigneeState,
//         consigneePincode: common.consigneePincode,
//         consigneePhone: common.consigneePhone,
//         consigneeCountry: common.consigneeCountry,
//         serviceType: common.serviceType,
//         vendor: common.vendor,
//         pieces: common.pieces,
//         actualWeight: common.actualWeight,
//         chargeableWeight: common.chargeableWeight,
//         dimensions: common.dimensions,
//         declaredValue: common.declaredValue,
//         currency: common.currency,
//         content: common.content,
//         csbType: common.csbType,
//         specialInstructions: common.specialInstructions,
//         origin: common.placeOfLoading,
//       });

//       result.awbLabel = Buffer.from(labelBytes).toString("base64");
//     }

//     if (type === "proforma" || type === "both") {
//       const proformaBytes = await generateProformaInvoicePdf({
//         awb: common.awb,
//         invoiceNo: common.invoiceNo,
//         invoiceDate: common.invoiceDate,
//         accountCode: common.accountCode,
//         exporterRef: common.preCarriageBy,
//         shipperName: common.shipperName,
//         shipperAddress: common.shipperAddress,
//         shipperPhone: common.shipperPhone,
//         shipperTaxId: common.shipperTaxId,
//         shipperCity: common.shipperCity,
//         shipperState: common.shipperState,
//         shipperPincode: common.shipperPincode,
//         shipperCountry: common.shipperCountry,
//         consigneeName: common.consigneeName,
//         consigneeAddress: common.consigneeAddress,
//         consigneeCity: common.consigneeCity,
//         consigneeState: common.consigneeState,
//         consigneePincode: common.consigneePincode,
//         consigneeCountry: common.consigneeCountry,
//         consigneePhone: common.consigneePhone,
//         preCarriageBy: common.preCarriageBy,
//         placeOfLoading: common.placeOfLoading,
//         portOfDischarge: common.portOfDischarge,
//         finalDestination: common.finalDestination,
//         countryOfOrigin: common.countryOfOrigin,
//         countryOfDestination: common.countryOfDestination,
//         termOfDelivery: common.termOfDelivery,
//         otherReference: common.otherReference,
//         totalPieces: common.pieces,
//         packageType: "PKT",
//         actualWeight: common.actualWeight,
//         chargeableWeight: common.chargeableWeight,
//         declaredValue: common.declaredValue,
//         items: common.items,
//         totalAmount: common.totalAmount,
//       });

//       result.proforma = Buffer.from(proformaBytes).toString("base64");
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("POST /api/admin/logistics/generate-pdf", error);

//     return errorResponse(
//       "PDF_GENERATION_FAILED",
//       error instanceof Error ? error.message : "Unable to generate PDF.",
//       500,
//     );
//   }
// }











import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { errorResponse } from "@/lib/api-response";
import { generateAwbLabelPdf } from "@/lib/pdf/awbLabelGenerator";
import { generateProformaInvoicePdf } from "@/lib/pdf/proformaInvoiceGenerator";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (
      !can(user, "LOGISTICS_INVOICE_CREATE") &&
      !can(user, "LOGISTICS_AWB_CREATE")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to generate logistics documents.",
        403,
      );
    }

    const body = await request.json();

    const type = body.type as "awb-label" | "proforma" | "both";

    if (!type || !["awb-label", "proforma", "both"].includes(type)) {
      return errorResponse(
        "INVALID_TYPE",
        "type must be 'awb-label', 'proforma' or 'both'.",
        400,
      );
    }

    if (!body.awb) {
      return errorResponse("AWB_REQUIRED", "awb is required.", 400);
    }

    const common = {
      awb: String(body.awb),
      accountCode: body.accountCode || "",
      bookDate: body.bookDate || body.invoiceDate || "",
      invoiceNo:
        body.invoiceNo || body.invoiceNumber || `INV-${body.awb}`,
      invoiceDate:
        body.invoiceDate ||
        body.bookDate ||
        new Date().toLocaleDateString("en-GB"),

      shipperName: body.shipperName || "",
      shipperAddress: body.shipperAddress || "",
      shipperCity: body.shipperCity || "",
      shipperState: body.shipperState || "",
      shipperPincode: body.shipperPincode || "",
      shipperPhone: body.shipperPhone || "",
      shipperCountry: body.shipperCountry || "INDIA",
      shipperTaxId: body.shipperTaxId || body.shipperGstin || "",

      consigneeName: body.consigneeName || "",
      consigneeAddress: body.consigneeAddress || "",
      consigneeCity: body.consigneeCity || "",
      consigneeState: body.consigneeState || "",
      consigneePincode: body.consigneePincode || "",
      consigneePhone: body.consigneePhone || "",
      consigneeCountry: body.consigneeCountry || "U.S.A.",

      serviceType:
        body.serviceType || body.product || "SPX INTERNATIONAL PRIORITY",
      vendor:
        body.vendor ||
        body.preCarriageBy ||
        "FEDERAL EXPRESS CORPORATION",
      preCarriageBy: body.preCarriageBy || body.vendor || "FDX",
      placeOfLoading: body.placeOfLoading || body.origin || "GUNTUR",
      portOfDischarge: body.portOfDischarge || "",
      finalDestination:
        body.finalDestination || body.consigneeCountry || "U.S.A.",
      countryOfOrigin: body.countryOfOrigin || "INDIA",
      countryOfDestination:
        body.countryOfDestination || body.consigneeCountry || "U.S.A.",
      termOfDelivery: body.termOfDelivery || body.termOfInvoice || "CIF",
      otherReference:
        body.otherReference ||
        body.exportReason ||
        "UNSOLICITED GIFT - NOT FOR SALE",
      csbType: body.csbType || "CSB4",
      content: body.content || "USED CLOTHES",
      specialInstructions: body.specialInstructions || "",

      pieces: Number(body.pieces || body.totalPieces || 1),
      actualWeight: Number(body.actualWeight || 0),
      chargeableWeight: Number(
        body.chargeableWeight || body.actualWeight || 0,
      ),
      dimensions: body.dimensions || "",
      declaredValue: Number(body.declaredValue || 0),
      currency: body.currency || "INR",
      totalAmount: Number(body.totalAmount || 0),

      items: Array.isArray(body.items)
        ? body.items.map((item: any, index: number) => ({
            description: item.description || "",
            shopName: item.shopName || "",
            shopAddress: item.shopAddress || "",
            hsCode: item.hsCode || "",
            quantity: Number(item.quantity || 1),
            weight: item.weight != null ? Number(item.weight) : undefined,
            unitRate: Number(item.unitRate || item.rate || 0),
            amount: Number(item.amount || 0),
            boxNo: item.boxNo || index + 1,
          }))
        : [],
    };

    const result: {
      success: boolean;
      awbLabel?: string;
      proforma?: string;
      message?: string;
    } = { success: true };

    if (type === "awb-label" || type === "both") {
      const labelBytes = await generateAwbLabelPdf({
        awb: common.awb,
        accountCode: common.accountCode,
        bookDate: common.bookDate,
        shipperName: common.shipperName,
        shipperAddress: common.shipperAddress,
        shipperCity: common.shipperCity,
        shipperState: common.shipperState,
        shipperPincode: common.shipperPincode,
        shipperPhone: common.shipperPhone,
        shipperCountry: common.shipperCountry,
        consigneeName: common.consigneeName,
        consigneeAddress: common.consigneeAddress,
        consigneeCity: common.consigneeCity,
        consigneeState: common.consigneeState,
        consigneePincode: common.consigneePincode,
        consigneePhone: common.consigneePhone,
        consigneeCountry: common.consigneeCountry,
        serviceType: common.serviceType,
        vendor: common.vendor,
        pieces: common.pieces,
        actualWeight: common.actualWeight,
        chargeableWeight: common.chargeableWeight,
        dimensions: common.dimensions,
        declaredValue: common.declaredValue,
        currency: common.currency,
        content: common.content,
        csbType: common.csbType,
        specialInstructions: common.specialInstructions,
        origin: common.placeOfLoading,
      });

      result.awbLabel = Buffer.from(labelBytes).toString("base64");
    }

    if (type === "proforma" || type === "both") {
      const proformaBytes = await generateProformaInvoicePdf({
        awb: common.awb,
        invoiceNo: common.invoiceNo,
        invoiceDate: common.invoiceDate,
        accountCode: common.accountCode,
        exporterRef: common.preCarriageBy,
        shipperName: common.shipperName,
        shipperAddress: common.shipperAddress,
        shipperPhone: common.shipperPhone,
        shipperTaxId: common.shipperTaxId,
        shipperCity: common.shipperCity,
        shipperState: common.shipperState,
        shipperPincode: common.shipperPincode,
        shipperCountry: common.shipperCountry,
        consigneeName: common.consigneeName,
        consigneeAddress: common.consigneeAddress,
        consigneeCity: common.consigneeCity,
        consigneeState: common.consigneeState,
        consigneePincode: common.consigneePincode,
        consigneeCountry: common.consigneeCountry,
        consigneePhone: common.consigneePhone,
        preCarriageBy: common.preCarriageBy,
        placeOfLoading: common.placeOfLoading,
        portOfDischarge: common.portOfDischarge,
        finalDestination: common.finalDestination,
        countryOfOrigin: common.countryOfOrigin,
        countryOfDestination: common.countryOfDestination,
        termOfDelivery: common.termOfDelivery,
        otherReference: common.otherReference,
        totalPieces: common.pieces,
        packageType: "PKT",
        actualWeight: common.actualWeight,
        chargeableWeight: common.chargeableWeight,
        declaredValue: common.declaredValue,
        items: common.items,
        totalAmount: common.totalAmount,
      });

      result.proforma = Buffer.from(proformaBytes).toString("base64");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/admin/logistics/generate-pdf", error);

    return errorResponse(
      "PDF_GENERATION_FAILED",
      error instanceof Error ? error.message : "Unable to generate PDF.",
      500,
    );
  }
}
