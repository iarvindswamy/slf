import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { can, type PermissionUser } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import {
  sendWhatsAppText,
  sendWhatsAppTemplate,
  sendWhatsAppDocument,
} from "@/lib/whatsapp";

function resolveDemoUser(
  request: NextRequest,
): PermissionUser | null {
  const demoHeader = request.headers.get("x-demo-auth");
  if (!demoHeader) return null;

  try {
    const parsed = JSON.parse(demoHeader) as {
      userId?: string;
      role?: string;
    };

    if (!parsed.userId || !parsed.role) return null;

    return {
      userId: parsed.userId,
      role: parsed.role as PermissionUser["role"],
    };
  } catch {
    return null;
  }
}

function canSendWhatsApp(user: PermissionUser | null): boolean {
  if (!user?.role) return false;

  // Super Admin / Admin always
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return true;
  }

  // Staff who can create/view invoices or update food orders
  return (
    can(user, "LOGISTICS_INVOICE_CREATE") ||
    can(user, "LOGISTICS_INVOICE_VIEW") ||
    can(user, "FOOD_ORDER_UPDATE") ||
    can(user, "FOOD_ORDER_VIEW")
  );
}

export async function POST(request: NextRequest) {
  try {
    let user: PermissionUser | null = null;

    try {
      const authUser = await getCurrentUser(request);
      if (authUser) {
        user = {
          userId: authUser.userId,
          role: authUser.role,
        };
      }
    } catch {
      // Firebase auth deferred — try demo header
    }

    if (!user) {
      user = resolveDemoUser(request);
    }

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (!canSendWhatsApp(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to send WhatsApp messages.",
        403,
      );
    }

    const body = await request.json();

    const phone = String(body.phone ?? "").trim();
    const type = String(body.type ?? "text").trim().toLowerCase();

    if (!phone) {
      return errorResponse(
        "PHONE_REQUIRED",
        "Phone number is required.",
        400,
      );
    }

    let result: unknown;

    switch (type) {
      case "text": {
        const message = String(body.message ?? "").trim();

        if (!message) {
          return errorResponse(
            "MESSAGE_REQUIRED",
            "Message is required.",
            400,
          );
        }

        result = await sendWhatsAppText({
          phone,
          message,
        });
        break;
      }

      case "template": {
        const templateName = String(
          body.templateName ?? "",
        ).trim();
        const languageCode = String(
          body.languageCode ?? "en_US",
        ).trim();

        if (!templateName) {
          return errorResponse(
            "TEMPLATE_REQUIRED",
            "templateName is required.",
            400,
          );
        }

        result = await sendWhatsAppTemplate({
          phone,
          templateName,
          languageCode,
          parameters: Array.isArray(body.parameters)
            ? body.parameters.map(String)
            : [],
          components: body.components,
        });
        break;
      }

      case "document": {
        const documentUrl = String(
          body.documentUrl ?? "",
        ).trim();

        if (!documentUrl) {
          return errorResponse(
            "DOCUMENT_URL_REQUIRED",
            "documentUrl is required.",
            400,
          );
        }

        result = await sendWhatsAppDocument({
          phone,
          documentUrl,
          filename: body.filename ?? "document.pdf",
          caption: body.caption,
        });
        break;
      }

      default:
        return errorResponse(
          "INVALID_MESSAGE_TYPE",
          "Supported types are text, template and document.",
          400,
        );
    }

    await writeAuditLog({
      userId: user.userId,
      action: "WHATSAPP_MESSAGE_SENT",
      resourceType: "WHATSAPP",
      metadata: {
        type,
        phoneLast4: phone.replace(/\D/g, "").slice(-4),
        reference: body.reference ?? null,
        module: body.module ?? null,
      },
    });

    return successResponse(
      {
        sent: true,
        result,
      },
      200,
      "WhatsApp message sent successfully.",
    );
  } catch (error) {
    console.error("POST /api/whatsapp/send", error);

    return errorResponse(
      "WHATSAPP_SEND_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to send WhatsApp message.",
      500,
    );
  }
}