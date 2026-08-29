// import "server-only";

// import {
//   cert,
//   getApps,
//   initializeApp,
//   type App,
// } from "firebase-admin/app";

// import {
//   getAuth,
//   type Auth,
// } from "firebase-admin/auth";

// import {
//   getFirestore,
//   type Firestore,
// } from "firebase-admin/firestore";

// function requiredEnv(
//   name: string,
// ): string {
//   const value =
//     process.env[name];

//   if (!value) {
//     throw new Error(
//       `Missing server environment variable: ${name}`,
//     );
//   }

//   return value;
// }

// function getAdminApp(): App {
//   const existing =
//     getApps();

//   if (existing.length > 0) {
//     return existing[0]!;
//   }

//   const projectId =
//     requiredEnv(
//       "FIREBASE_PROJECT_ID",
//     );

//   const clientEmail =
//     requiredEnv(
//       "FIREBASE_CLIENT_EMAIL",
//     );

//   const privateKey =
//     requiredEnv(
//       "FIREBASE_PRIVATE_KEY",
//     ).replace(
//       /\\n/g,
//       "\n",
//     );

//   return initializeApp({
//     credential: cert({
//       projectId,
//       clientEmail,
//       privateKey,
//     }),
//   });
// }

// export const firebaseAdminApp =
//   getAdminApp();

// export const adminAuth: Auth =
//   getAuth(
//     firebaseAdminApp,
//   );

// export const adminDb: Firestore =
//   getFirestore(
//     firebaseAdminApp,
//   );











import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";

import {
  getAuth,
  type Auth,
} from "firebase-admin/auth";

import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

import {
  getStorage,
  type Storage,
} from "firebase-admin/storage";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
}

function getAdminApp(): App {
  const existing = getApps();

  if (existing.length > 0) {
    return existing[0]!;
  }

  const projectId = requiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${projectId}.appspot.com`;

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

export const firebaseAdminApp = getAdminApp();

export const adminAuth: Auth = getAuth(firebaseAdminApp);

export const adminDb: Firestore = getFirestore(firebaseAdminApp);

export const adminStorage: Storage = getStorage(firebaseAdminApp);
