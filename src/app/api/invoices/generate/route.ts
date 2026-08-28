import { NextRequest } from "next/server";

import {
  adminDb,
  adminStorage,
} from "@/lib/firebase-admin";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  can,
} from "@/lib/permissions";

import {
  writeAuditLog,
} from "@/lib/audit";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

import {
  generateInvoicePdf,
} from "@/lib/invoice-pdf";

import {
  generateInvoiceNumber,
} from "@/lib/invoice-number";

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (
      !can(
        user,
        "LOGISTICS_INVOICE_CREATE",
      ) &&
      !can(
        user,
        "FOOD_INVOICE_CREATE",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to generate invoices.",
        403,
      );
    }

    const body =
      await request.json();

    const orderId =
      body.orderId?.trim();

    const awb =
      body.awb?.trim();

    if (
      !orderId &&
      !awb
    ) {
      return errorResponse(
        "SOURCE_REQUIRED",
        "orderId or awb is required.",
        400,
      );
    }

    let sourceData: any;
    let sourceType:
      | "FOOD_ORDER"
      | "AWB";

    if (orderId) {
      const ref =
        adminDb
          .collection(
            "foodOrders",
          )
          .doc(orderId);

      const snapshot =
        await ref.get();

      if (!snapshot.exists) {
        return errorResponse(
          "ORDER_NOT_FOUND",
          "Food order was not found.",
          404,
        );
      }

      sourceData =
        snapshot.data();

      sourceType =
        "FOOD_ORDER";
    } else {
      const query =
        await adminDb
          .collection("awbs")
          .where(
            "awb",
            "==",
            awb,
          )
          .limit(1)
          .get();

      if (query.empty) {
        return errorResponse(
          "AWB_NOT_FOUND",
          "AWB was not found.",
          404,
        );
      }

      sourceData =
        query.docs[0].data();

      sourceType =
        "AWB";
    }

    const invoiceNumber =
      await generateInvoiceNumber();

    const items =
      sourceType ===
      "FOOD_ORDER"
        ? (
            sourceData.items ??
            []
          ).map(
            (item: any) => ({
              name:
                item.productName,

              variant:
                item.variantLabel,

              quantity:
                Number(
                  item.quantity,
                ),

              unitPrice:
                Number(
                  item.unitPrice,
                ),

              total:
                Number(
                  item.lineTotal,
                ),
            }),
          )
        : [
            {
              name:
                `Logistics shipment ${sourceData.awb}`,

              variant:
                sourceData.serviceType,

              quantity: 1,

              unitPrice:
                Number(
                  sourceData.charges
                    ?.freight ??
                    0,
                ),

              total:
                Number(
                  sourceData.charges
                    ?.total ??
                    0,
                ),
            },
          ];

    const pdfBytes =
      await generateInvoicePdf(
        {
          invoiceNumber,

          orderId:
            sourceType ===
            "FOOD_ORDER"
              ? sourceData.orderId
              : undefined,

          awb:
            sourceType ===
            "AWB"
              ? sourceData.awb
              : undefined,

          customerName:
            sourceType ===
            "FOOD_ORDER"
              ? sourceData
                  .customer
                  ?.name ??
                "Customer"
              : sourceData
                  .customerName ??
                "Customer",

          customerPhone:
            sourceType ===
            "FOOD_ORDER"
              ? sourceData
                  .customer
                  ?.phone
              : undefined,

          customerEmail:
            sourceType ===
            "FOOD_ORDER"
              ? sourceData
                  .customer
                  ?.email
              : undefined,

          address:
            sourceData
              .shippingAddress
              ? JSON.stringify(
                  sourceData
                    .shippingAddress,
                )
              : undefined,

          items,

          subtotal:
            Number(
              sourceData.subtotal ??
                sourceData.charges
                  ?.taxableAmount ??
                0,
            ),

          discount:
            Number(
              sourceData.discount ??
                sourceData.charges
                  ?.discount ??
                0,
            ),

          tax:
            Number(
              sourceData.tax ??
                sourceData.charges
                  ?.gst ??
                0,
            ),

          deliveryFee:
            Number(
              sourceData.deliveryFee ??
                sourceData.charges
                  ?.deliveryCharges ??
                0,
            ),

          total:
            Number(
              sourceData.total ??
                sourceData.charges
                  ?.total ??
                0,
            ),

          createdAt:
            new Date().toISOString(),
        },
      );

    const bucket =
      adminStorage.bucket();

    const filePath =
      `invoices/${invoiceNumber}.pdf`;

    const file =
      bucket.file(
        filePath,
      );

    await file.save(
      Buffer.from(
        pdfBytes,
      ),
      {
        metadata: {
          contentType:
            "application/pdf",

          metadata: {
            invoiceNumber,
          },
        },
      },
    );

    const [signedUrl] =
      await file.getSignedUrl({
        action: "read",
        expires:
          Date.now() +
          1000 *
            60 *
            60 *
            24 *
            7,
      });

    const invoiceRef =
      adminDb
        .collection(
          "invoices",
        )
        .doc();

    const invoice = {
      invoiceId:
        invoiceRef.id,

      invoiceNumber,

      sourceType,

      orderId:
        sourceType ===
        "FOOD_ORDER"
          ? sourceData.orderId
          : null,

      awb:
        sourceType ===
        "AWB"
          ? sourceData.awb
          : null,

      filePath,

      downloadUrl:
        signedUrl,

      total:
        Number(
          sourceData.total ??
            sourceData.charges
              ?.total ??
            0,
        ),

      createdBy:
        user.userId,

      createdAt:
        new Date().toISOString(),
    };

    await invoiceRef.set(
      invoice,
    );

    await writeAuditLog({
      userId:
        user.userId,

      action:
        "INVOICE_GENERATED",

      resourceType:
        "INVOICE",

      resourceId:
        invoiceRef.id,

      metadata: {
        invoiceNumber,
        sourceType,
        orderId:
          invoice.orderId,
        awb:
          invoice.awb,
      },
    });

    return successResponse(
      {
        invoice,
      },
      201,
      "Invoice generated successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/invoices/generate",
      error,
    );

    return errorResponse(
      "INVOICE_GENERATION_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to generate invoice.",
      500,
    );
  }
}