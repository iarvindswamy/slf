import { NextRequest } from "next/server";

import {
  clearSession,
  getSessionCookie,
} from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
) {
  try {
    const sessionCookie =
      await getSessionCookie();

    if (sessionCookie) {
      try {
        const decoded =
          await adminAuth.verifySessionCookie(
            sessionCookie,
            false,
          );

        /*
         * Revoke Firebase refresh tokens.
         * This helps invalidate existing Firebase
         * authentication sessions.
         */
        await adminAuth.revokeRefreshTokens(
          decoded.uid,
        );
      } catch {
        /*
         * Even if the session is already invalid,
         * the local application cookie should still
         * be removed.
         */
      }
    }

    await clearSession();

    return successResponse(
      {
        loggedOut: true,
      },
      200,
      "Logout successful.",
    );
  } catch (error) {
    console.error(
      "POST /api/auth/logout failed:",
      error,
    );

    /*
     * Still attempt to clear the local cookie.
     */
    try {
      await clearSession();
    } catch {
      // Ignore secondary cookie failure.
    }

    return errorResponse(
      "LOGOUT_FAILED",
      "Unable to complete logout.",
      500,
    );
  }
}