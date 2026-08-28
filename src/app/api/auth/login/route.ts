import { NextRequest } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createSession } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

type LoginBody = {
  email?: string;
  password?: string;
};

type FirebasePasswordResponse = {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

type FirebaseErrorResponse = {
  error?: {
    message?: string;
  };
};

function normalizeEmail(email: string) {
  return email
    .trim()
    .toLowerCase();
}

function mapFirebaseLoginError(
  message?: string,
) {
  switch (message) {
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
    case "INVALID_LOGIN_CREDENTIALS":
      return {
        code: "INVALID_CREDENTIALS",
        message:
          "Invalid email or password.",
      };

    case "USER_DISABLED":
      return {
        code: "USER_DISABLED",
        message:
          "This account has been disabled.",
      };

    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return {
        code: "TOO_MANY_ATTEMPTS",
        message:
          "Too many login attempts. Please try again later.",
      };

    default:
      return {
        code: "AUTHENTICATION_FAILED",
        message:
          "Unable to authenticate at this time.",
      };
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    let body: LoginBody;

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

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email) {
      return errorResponse(
        "EMAIL_REQUIRED",
        "Email is required.",
        400,
      );
    }

    if (!password) {
      return errorResponse(
        "PASSWORD_REQUIRED",
        "Password is required.",
        400,
      );
    }

    if (password.length < 6) {
      return errorResponse(
        "INVALID_PASSWORD",
        "Password is invalid.",
        400,
      );
    }

    const apiKey =
      process.env.FIREBASE_WEB_API_KEY;

    if (!apiKey) {
      console.error(
        "Missing FIREBASE_WEB_API_KEY",
      );

      return errorResponse(
        "SERVER_CONFIGURATION_ERROR",
        "Authentication service is not configured.",
        500,
      );
    }

    const firebaseResponse =
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
          apiKey,
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
          cache: "no-store",
        },
      );

    const firebaseData =
      (await firebaseResponse.json()) as
        | FirebasePasswordResponse
        | FirebaseErrorResponse;

    if (!firebaseResponse.ok) {
      const error = mapFirebaseLoginError(
        "error" in firebaseData
          ? firebaseData.error?.message
          : undefined,
      );

      return errorResponse(
        error.code,
        error.message,
        401,
      );
    }

    if (
      !("idToken" in firebaseData) ||
      !firebaseData.idToken
    ) {
      return errorResponse(
        "AUTHENTICATION_FAILED",
        "Firebase did not return an authentication token.",
        401,
      );
    }

    const decodedToken =
      await adminAuth.verifyIdToken(
        firebaseData.idToken,
      );

    const uid = decodedToken.uid;

    const userSnapshot =
      await adminDb
        .collection("users")
        .doc(uid)
        .get();

    if (!userSnapshot.exists) {
      return errorResponse(
        "USER_PROFILE_NOT_FOUND",
        "Authenticated user does not have an application profile.",
        403,
      );
    }

    const userData =
      userSnapshot.data();

    if (!userData) {
      return errorResponse(
        "USER_PROFILE_NOT_FOUND",
        "User profile could not be loaded.",
        403,
      );
    }

    if (userData.isActive === false) {
      return errorResponse(
        "USER_DISABLED",
        "This account has been disabled.",
        403,
      );
    }

    if (
      typeof userData.role !== "string" ||
      typeof userData.module !== "string"
    ) {
      return errorResponse(
        "INVALID_USER_PROFILE",
        "User role or module configuration is invalid.",
        500,
      );
    }

    await createSession(
      firebaseData.idToken,
    );

    return successResponse(
      {
        user: {
          userId: uid,
          email:
            typeof userData.email === "string"
              ? userData.email
              : decodedToken.email ?? email,
          displayName:
            typeof userData.displayName ===
            "string"
              ? userData.displayName
              : decodedToken.name ?? undefined,
          role: userData.role,
          module: userData.module,
          isActive:
            userData.isActive !== false,
        },
      },
      200,
      "Login successful.",
    );
  } catch (error) {
    console.error(
      "POST /api/auth/login failed:",
      error,
    );

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to complete login.",
      500,
    );
  }
}