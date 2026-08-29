// import "server-only";

// import type { DecodedIdToken } from "firebase-admin/auth";

// import { adminAuth, adminDb } from "@/lib/firebase-admin";
// import type { PermissionUser } from "@/lib/permissions";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// export type AuthenticatedUser = {
//   userId: string;
//   email: string | null;
//   name: string | null;
//   token: DecodedIdToken;
// };

// export class AuthenticationError extends Error {
//   status = 401;

//   constructor(message = "Authentication required.") {
//     super(message);
//     this.name = "AuthenticationError";
//   }
// }

// function extractBearerToken(
//   authorization: string | null,
// ): string | null {
//   if (!authorization) {
//     return null;
//   }

//   const match = authorization.match(/^Bearer\s+(.+)$/i);
//   return match?.[1] ?? null;
// }

// export async function verifyIdToken(
//   idToken: string,
// ): Promise<AuthenticatedUser> {
//   try {
//     const token = await adminAuth.verifyIdToken(idToken);

//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     throw new AuthenticationError(
//       "Invalid or expired authentication token.",
//     );
//   }
// }

// export async function requireAuth(
//   request: Request,
// ): Promise<AuthenticatedUser> {
//   const authorization = request.headers.get("authorization");
//   const token = extractBearerToken(authorization);

//   if (!token) {
//     throw new AuthenticationError();
//   }

//   return verifyIdToken(token);
// }

// export async function getOptionalAuth(
//   request: Request,
// ): Promise<AuthenticatedUser | null> {
//   const authorization = request.headers.get("authorization");
//   const token = extractBearerToken(authorization);

//   if (!token) {
//     return null;
//   }

//   try {
//     return await verifyIdToken(token);
//   } catch {
//     return null;
//   }
// }

// export async function createCustomToken(
//   userId: string,
// ): Promise<string> {
//   return adminAuth.createCustomToken(userId);
// }

// /** Used by API routes for role checks */
// export async function getCurrentUser(
//   request: Request,
// ): Promise<PermissionUser | null> {
//   try {
//     const authUser = await getOptionalAuth(request);

//     if (!authUser) {
//       return null;
//     }

//     const userSnap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.USERS)
//       .doc(authUser.userId)
//       .get();

//     const role =
//       (userSnap.exists &&
//         (userSnap.data()?.role as PermissionUser["role"])) ||
//       null;

//     return {
//       userId: authUser.userId,
//       role,
//     };
//   } catch {
//     return null;
//   }
// }






import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { PermissionUser } from "@/lib/permissions";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

export type AuthenticatedUser = {
  userId: string;
  email: string | null;
  name: string | null;
  token: DecodedIdToken;
};

export class AuthenticationError extends Error {
  status = 401;

  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

const SESSION_COOKIE = "sreshta_session";
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

function extractBearerToken(
  authorization: string | null,
): string | null {
  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function verifyIdToken(
  idToken: string,
): Promise<AuthenticatedUser> {
  try {
    const token = await adminAuth.verifyIdToken(idToken);

    return {
      userId: token.uid,
      email: typeof token.email === "string" ? token.email : null,
      name: typeof token.name === "string" ? token.name : null,
      token,
    };
  } catch {
    throw new AuthenticationError(
      "Invalid or expired authentication token.",
    );
  }
}

export async function requireAuth(
  request: Request,
): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization");
  const token = extractBearerToken(authorization);

  if (!token) {
    throw new AuthenticationError();
  }

  return verifyIdToken(token);
}

export async function getOptionalAuth(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const authorization = request.headers.get("authorization");
  const token = extractBearerToken(authorization);

  if (!token) {
    return null;
  }

  try {
    return await verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function createCustomToken(userId: string): Promise<string> {
  return adminAuth.createCustomToken(userId);
}

/**
 * Create a Firebase session cookie and set it on the response cookies.
 * Used by /api/auth/login
 */
export async function createSession(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  cookies().set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

/**
 * Read the session cookie value (if any).
 * Used by /api/auth/logout
 */
export function getSessionCookie(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

/**
 * Clear the session cookie.
 * Used by /api/auth/logout
 */
export async function clearSession(): Promise<void> {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Used by API routes for role checks */
export async function getCurrentUser(
  request: Request,
): Promise<PermissionUser | null> {
  try {
    const authUser = await getOptionalAuth(request);

    if (!authUser) {
      return null;
    }

    const userSnap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.USERS)
      .doc(authUser.userId)
      .get();

    const role =
      (userSnap.exists &&
        (userSnap.data()?.role as PermissionUser["role"])) ||
      null;

    return {
      userId: authUser.userId,
      role,
    };
  } catch {
    return null;
  }
}
