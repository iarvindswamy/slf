import { NextRequest } from "next/server";

import * as XLSX from "xlsx";

import {
  adminDb,
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
  isValidAWB,
} from "@/utils/validators";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_ROWS = 5000;

type ImportRow = {
  awb?: string;
  customerId?: string;
  senderId?: string;
  receiverId?: string;

  origin?: string;
  destination?: string;

  serviceId?: string;

  shipmentDate?: string;

  currentStatus?: string;

  actualWeightKg?: number;
  chargeableWeightKg?: number;

  freight?: number;
  fuelSurcharge?: number;
  gst?: number;
  total?: number;
};

function normalizeString(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizeNumber(
  value: unknown,
) {
  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}

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
        "LOGISTICS_EXCEL_IMPORT",
      )
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to import Excel data.",
        403,
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      !(file instanceof File)
    ) {
      return errorResponse(
        "FILE_REQUIRED",
        "Excel file is required.",
        400,
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return errorResponse(
        "FILE_TOO_LARGE",
        "Maximum Excel file size is 5 MB.",
        400,
      );
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls")
    ) {
      return errorResponse(
        "INVALID_FILE_TYPE",
        "Only .xlsx and .xls files are supported.",
        400,
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(
        arrayBuffer,
        {
          type: "array",
          cellDates: true,
        },
      );

    const sheetName =
      workbook.SheetNames[0];

    if (!sheetName) {
      return errorResponse(
        "EMPTY_WORKBOOK",
        "The workbook does not contain a worksheet.",
        400,
      );
    }

    const worksheet =
      workbook.Sheets[
        sheetName
      ];

    const rows =
      XLSX.utils.sheet_to_json<ImportRow>(
        worksheet,
        {
          defval: "",
        },
      );

    if (
      rows.length === 0
    ) {
      return errorResponse(
        "EMPTY_SHEET",
        "The worksheet does not contain data.",
        400,
      );
    }

    if (
      rows.length >
      MAX_ROWS
    ) {
      return errorResponse(
        "TOO_MANY_ROWS",
        `Maximum ${MAX_ROWS} rows are allowed per import.`,
        400,
      );
    }

    const errors: Array<{
      row: number;
      message: string;
    }> = [];

    const normalized =
      rows.map(
        (row, index) => {
          const rowNumber =
            index + 2;

          const awb =
            normalizeString(
              row.awb,
            );

          if (!awb) {
            errors.push({
              row: rowNumber,
              message:
                "awb is required.",
            });

            return null;
          }

          if (
            !isValidAWB(awb)
          ) {
            errors.push({
              row: rowNumber,
              message:
                "Invalid AWB.",
            });

            return null;
          }

          return {
            awb,

            customerId:
              normalizeString(
                row.customerId,
              ),

            senderId:
              normalizeString(
                row.senderId,
              ),

            receiverId:
              normalizeString(
                row.receiverId,
              ),

            origin:
              normalizeString(
                row.origin,
              ),

            destination:
              normalizeString(
                row.destination,
              ),

            serviceId:
              normalizeString(
                row.serviceId,
              ),

            shipmentDate:
              normalizeString(
                row.shipmentDate,
              ),

            currentStatus:
              normalizeString(
                row.currentStatus,
              ) ||
              "BOOKED",

            actualWeightKg:
              normalizeNumber(
                row.actualWeightKg,
              ),

            chargeableWeightKg:
              normalizeNumber(
                row.chargeableWeightKg,
              ),

            charges: {
              freight:
                normalizeNumber(
                  row.freight,
                ),

              fuelSurcharge:
                normalizeNumber(
                  row.fuelSurcharge,
                ),

              gst:
                normalizeNumber(
                  row.gst,
                ),

              total:
                normalizeNumber(
                  row.total,
                ),
            },
          };
        },
      );

    if (
      errors.length > 0
    ) {
      return errorResponse(
        "VALIDATION_FAILED",
        "Excel validation failed.",
        400,
      );
    }

    const validRows =
      normalized.filter(
        (
          row,
        ): row is NonNullable<
          typeof row
        > =>
          row !== null,
      );

    let imported = 0;
    let updated = 0;

    const batch =
      adminDb.batch();

    for (
      const row of validRows
    ) {
      const existing =
        await adminDb
          .collection("awbs")
          .where(
            "awb",
            "==",
            row.awb,
          )
          .limit(1)
          .get();

      if (
        existing.empty
      ) {
        const ref =
          adminDb
            .collection(
              "awbs",
            )
            .doc();

        batch.set(ref, {
          awb:
            row.awb,

          customerId:
            row.customerId,

          senderId:
            row.senderId,

          receiverId:
            row.receiverId,

          origin:
            row.origin,

          destination:
            row.destination,

          serviceId:
            row.serviceId,

          shipmentDate:
            row.shipmentDate,

          actualWeightKg:
            row.actualWeightKg,

          chargeableWeightKg:
            row.chargeableWeightKg,

          currentStatus:
            row.currentStatus,

          charges:
            row.charges,

          createdBy:
            user.userId,

          updatedBy:
            user.userId,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),

          awbDocumentId:
            ref.id,
        });

        imported++;
      } else {
        const ref =
          existing.docs[0].ref;

        batch.update(ref, {
          customerId:
            row.customerId,

          senderId:
            row.senderId,

          receiverId:
            row.receiverId,

          origin:
            row.origin,

          destination:
            row.destination,

          serviceId:
            row.serviceId,

          shipmentDate:
            row.shipmentDate,

          actualWeightKg:
            row.actualWeightKg,

          chargeableWeightKg:
            row.chargeableWeightKg,

          currentStatus:
            row.currentStatus,

          charges:
            row.charges,

          updatedBy:
            user.userId,

          updatedAt:
            new Date().toISOString(),
        });

        updated++;
      }
    }

    await batch.commit();

    const uploadRef =
      adminDb
        .collection(
          "uploads",
        )
        .doc();

    await uploadRef.set({
      uploadId:
        uploadRef.id,

      fileName:
        file.name,

      fileSize:
        file.size,

      fileType:
        file.type,

      module:
        "LOGISTICS",

      recordCount:
        validRows.length,

      imported,
      updated,

      uploadedBy:
        user.userId,

      createdAt:
        new Date().toISOString(),
    });

    await writeAuditLog({
      userId:
        user.userId,

      action:
        "EXCEL_IMPORT_COMPLETED",

      resourceType:
        "UPLOAD",

      resourceId:
        uploadRef.id,

      metadata: {
        fileName:
          file.name,

        recordCount:
          validRows.length,

        imported,
        updated,
      },
    });

    return successResponse(
      {
        uploadId:
          uploadRef.id,

        fileName:
          file.name,

        totalRows:
          rows.length,

        imported,
        updated,

        failed:
          errors.length,
      },
      201,
      "Excel import completed successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/logistics/excel-import:",
      error,
    );

    return errorResponse(
      "EXCEL_IMPORT_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to import Excel file.",
      500,
    );
  }
}