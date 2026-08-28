import {
  NextRequest,
} from "next/server";

import {
  adminStorage,
  adminDb,
} from "@/lib/firebase-admin";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

function extensionForType(
  type: string,
) {
  switch (type) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "application/pdf":
      return "pdf";

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";

    case "application/vnd.ms-excel":
      return "xls";

    default:
      return "bin";
  }
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

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const context =
      String(
        formData.get(
          "context",
        ) ?? "",
      ).trim();

    const ownerId =
      String(
        formData.get(
          "ownerId",
        ) ??
          user.userId,
      ).trim();

    if (
      !file ||
      !(file instanceof File)
    ) {
      return errorResponse(
        "FILE_REQUIRED",
        "file is required.",
        400,
      );
    }

    if (
      file.size <= 0
    ) {
      return errorResponse(
        "EMPTY_FILE",
        "Uploaded file is empty.",
        400,
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return errorResponse(
        "FILE_TOO_LARGE",
        "Maximum file size is 10 MB.",
        400,
      );
    }

    if (
      !ALLOWED_TYPES.has(
        file.type,
      )
    ) {
      return errorResponse(
        "UNSUPPORTED_FILE_TYPE",
        "This file type is not supported.",
        400,
      );
    }

    /*
     * Basic ownership protection.
     *
     * Admins may upload on behalf of
     * business contexts; public users can
     * only use their own user ID.
     */
    const isPrivileged =
      [
        "SUPER_ADMIN",
        "ADMIN",
        "FOOD_MANAGER",
        "FOOD_OPERATOR",
        "LOGISTICS_MANAGER",
      ].includes(
        user.role,
      );

    if (
      ownerId !==
        user.userId &&
      !isPrivileged
    ) {
      return errorResponse(
        "OWNERSHIP_DENIED",
        "You cannot upload files for another owner.",
        403,
      );
    }

    const bytes =
      await file.arrayBuffer();

    const extension =
      extensionForType(
        file.type,
      );

    const uploadId =
      crypto.randomUUID();

    const filePath =
      `uploads/${context || "general"}/${ownerId}/${uploadId}.${extension}`;

    const bucket =
      adminStorage.bucket();

    const storageFile =
      bucket.file(
        filePath,
      );

    await storageFile.save(
      Buffer.from(
        bytes,
      ),
      {
        metadata: {
          contentType:
            file.type,

          metadata: {
            uploadId,
            ownerId,
            context,
            originalName:
              file.name,
          },
        },
      },
    );

    const [
      signedUrl,
    ] =
      await storageFile.getSignedUrl(
        {
          action: "read",

          expires:
            Date.now() +
            1000 *
              60 *
              60 *
              24 *
              7,
        },
      );

    const uploadRef =
      adminDb
        .collection(
          "uploads",
        )
        .doc(uploadId);

    await uploadRef.set({
      uploadId,

      ownerId,

      context:
        context ||
        "general",

      originalName:
        file.name,

      contentType:
        file.type,

      size:
        file.size,

      storagePath:
        filePath,

      downloadUrl:
        signedUrl,

      uploadedBy:
        user.userId,

      createdAt:
        new Date().toISOString(),
    });

    return successResponse(
      {
        uploadId,

        fileName:
          file.name,

        contentType:
          file.type,

        size:
          file.size,

        storagePath:
          filePath,

        downloadUrl:
          signedUrl,
      },
      201,
      "File uploaded successfully.",
    );
  } catch (error) {
    console.error(
      "POST /api/uploads",
      error,
    );

    return errorResponse(
      "UPLOAD_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to upload file.",
      500,
    );
  }
}