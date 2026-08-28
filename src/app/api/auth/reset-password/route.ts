import { NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

type ResetPasswordBody = {
  email?: string;
};

function normalizeEmail(email: string) {
  return email
    .trim()
    .toLowerCase();
}

export async function POST(
  request: NextRequest,
) {
  try {
    let body: ResetPasswordBody;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Request body must contain valid JSON.",
        400,
      );
    }

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    if (!email) {
      return errorResponse(
        "EMAIL_REQUIRED",
        "Email is required.",
        400,
      );
    }

    /*
     * Generic response prevents account enumeration.
     */
    const genericMessage =
      "If an account exists for this email, a password reset link has been sent.";

    let user;

    try {
      user =
        await adminAuth.getUserByEmail(
          email,
        );
    } catch {
      return successResponse(
        {
          sent: true,
        },
        200,
        genericMessage,
      );
    }

    if (user.disabled) {
      return successResponse(
        {
          sent: true,
        },
        200,
        genericMessage,
      );
    }

    const continueUrl =
      process.env.PASSWORD_RESET_CONTINUE_URL ??
      "http://localhost:3000/reset-password";

    const resetLink =
      await adminAuth.generatePasswordResetLink(
        email,
        {
          url: continueUrl,
          handleCodeInApp: false,
        },
      );

    try {
      await sendPasswordResetEmail(
        email,
        resetLink,
      );
    } catch (error) {
      console.error(
        "Password reset email failed:",
        error,
      );

      return errorResponse(
        "EMAIL_DELIVERY_FAILED",
        "Unable to send password reset email.",
        500,
      );
    }

    return successResponse(
      {
        sent: true,
      },
      200,
      genericMessage,
    );
  } catch (error) {
    console.error(
      "POST /api/auth/reset-password failed:",
      error,
    );

    return errorResponse(
      "RESET_PASSWORD_FAILED",
      "Unable to process password reset request.",
      500,
    );
  }
}