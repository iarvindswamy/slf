import {
  createHash,
  randomInt,
  timingSafeEqual,
} from "crypto";

import { NextRequest } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createSession } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

type OtpRequestBody = {
  action?: "request" | "verify";
  email?: string;
  otp?: string;
};

const OTP_EXPIRY_MS =
  10 * 60 * 1000;

const OTP_MAX_ATTEMPTS = 5;

const OTP_COLLECTION =
  "authOtpChallenges";

function normalizeEmail(email: string) {
  return email
    .trim()
    .toLowerCase();
}

function hashOtp(
  otp: string,
) {
  return createHash("sha256")
    .update(
      `${otp}:${process.env.FIREBASE_PROJECT_ID ?? "sreshta"}`,
    )
    .digest("hex");
}

function safeCompare(
  first: string,
  second: string,
) {
  const firstBuffer =
    Buffer.from(first, "hex");

  const secondBuffer =
    Buffer.from(second, "hex");

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    firstBuffer,
    secondBuffer,
  );
}

function generateOtp() {
  return randomInt(
    100000,
    1000000,
  ).toString();
}

export async function POST(
  request: NextRequest,
) {
  try {
    let body: OtpRequestBody;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Request body must contain valid JSON.",
        400,
      );
    }

    const action = body.action;

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

    if (
      action !== "request" &&
      action !== "verify"
    ) {
      return errorResponse(
        "INVALID_ACTION",
        'Action must be either "request" or "verify".',
        400,
      );
    }

    if (action === "request") {
      return requestOtp(email);
    }

    return verifyOtp(
      email,
      body.otp,
    );
  } catch (error) {
    console.error(
      "POST /api/auth/otp failed:",
      error,
    );

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to process OTP request.",
      500,
    );
  }
}

async function requestOtp(
  email: string,
) {
  const userRecord =
    await adminAuth
      .getUserByEmail(email)
      .catch(() => null);

  /*
   * Do not reveal whether an email exists.
   * This prevents account enumeration.
   */
  if (!userRecord) {
    return successResponse(
      {
        sent: true,
      },
      200,
      "If the account exists, a verification code has been sent.",
    );
  }

  const otp =
    generateOtp();

  const otpHash =
    hashOtp(otp);

  const challengeRef =
    adminDb
      .collection(OTP_COLLECTION)
      .doc();

  const now = Date.now();

  await challengeRef.set({
    id: challengeRef.id,
    email,
    userId: userRecord.uid,
    otpHash,
    attempts: 0,
    createdAt: now,
    expiresAt:
      now + OTP_EXPIRY_MS,
    used: false,
  });

  try {
    await sendOtpEmail(
      email,
      otp,
    );
  } catch (error) {
    console.error(
      "OTP email delivery failed:",
      error,
    );

    await challengeRef.delete();

    return errorResponse(
      "OTP_DELIVERY_FAILED",
      "Unable to send verification code.",
      500,
    );
  }

  return successResponse(
    {
      sent: true,
      expiresInSeconds:
        OTP_EXPIRY_MS / 1000,
    },
    200,
    "If the account exists, a verification code has been sent.",
  );
}

async function verifyOtp(
  email: string,
  otp?: string,
) {
  if (
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp)
  ) {
    return errorResponse(
      "INVALID_OTP",
      "OTP must contain exactly 6 digits.",
      400,
    );
  }

  const snapshot =
    await adminDb
      .collection(OTP_COLLECTION)
      .where("email", "==", email)
      .where("used", "==", false)
      .limit(10)
      .get();

  if (snapshot.empty) {
    return errorResponse(
      "OTP_INVALID",
      "Invalid or expired verification code.",
      401,
    );
  }

  const docs = snapshot.docs.sort(
    (a, b) => {
      const aTime =
        Number(a.data().createdAt ?? 0);

      const bTime =
        Number(b.data().createdAt ?? 0);

      return bTime - aTime;
    },
  );

  const challenge =
    docs[0];

  const data =
    challenge.data();

  const now = Date.now();

  if (
    Number(data.expiresAt ?? 0) <=
    now
  ) {
    await challenge.ref.update({
      used: true,
    });

    return errorResponse(
      "OTP_EXPIRED",
      "Verification code has expired.",
      401,
    );
  }

  const attempts =
    Number(data.attempts ?? 0);

  if (
    attempts >=
    OTP_MAX_ATTEMPTS
  ) {
    await challenge.ref.update({
      used: true,
    });

    return errorResponse(
      "OTP_ATTEMPTS_EXCEEDED",
      "Too many incorrect verification attempts.",
      429,
    );
  }

  const suppliedHash =
    hashOtp(otp);

  const valid =
    safeCompare(
      suppliedHash,
      String(data.otpHash),
    );

  if (!valid) {
    await challenge.ref.update({
      attempts: attempts + 1,
    });

    return errorResponse(
      "OTP_INVALID",
      "Invalid or expired verification code.",
      401,
    );
  }

  const uid =
    String(data.userId);

  const userRecord =
    await adminAuth.getUser(uid);

  if (userRecord.disabled) {
    return errorResponse(
      "USER_DISABLED",
      "This account has been disabled.",
      403,
    );
  }

  const userSnapshot =
    await adminDb
      .collection("users")
      .doc(uid)
      .get();

  if (!userSnapshot.exists) {
    return errorResponse(
      "USER_PROFILE_NOT_FOUND",
      "User profile could not be found.",
      403,
    );
  }

  const userData =
    userSnapshot.data();

  if (!userData) {
    return errorResponse(
      "USER_PROFILE_NOT_FOUND",
      "User profile could not be found.",
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

  /*
   * We need a Firebase ID token to create
   * an application session cookie.
   *
   * For OTP-only login, this implementation
   * requires the client to exchange the OTP
   * through a trusted Firebase custom-token
   * flow.
   *
   * Firebase Admin creates the custom token.
   */
  const customToken =
    await adminAuth.createCustomToken(
      uid,
      {
        authMethod: "otp",
      },
    );

  await challenge.ref.update({
    used: true,
    usedAt: now,
  });

  /*
   * The custom token is intentionally returned
   * rather than pretending it is an ID token.
   *
   * The client must exchange it with Firebase
   * Auth and then call /api/auth/login/session
   * if OTP-only session establishment is desired.
   */
  return successResponse(
    {
      verified: true,
      customToken,
      user: {
        userId: uid,
        email:
          typeof userData.email === "string"
            ? userData.email
            : userRecord.email ?? email,
        displayName:
          typeof userData.displayName ===
          "string"
            ? userData.displayName
            : userRecord.displayName ??
              undefined,
        role: userData.role,
        module: userData.module,
        isActive:
          userData.isActive !== false,
      },
    },
    200,
    "OTP verified successfully.",
  );
}