// // import "server-only";

// // import {
// //   cert,
// //   getApps,
// //   initializeApp,
// //   type App,
// // } from "firebase-admin/app";

// // import {
// //   getAuth,
// //   type Auth,
// // } from "firebase-admin/auth";

// // import {
// //   getFirestore,
// //   type Firestore,
// // } from "firebase-admin/firestore";

// // function requiredEnv(
// //   name: string,
// // ): string {
// //   const value =
// //     process.env[name];

// //   if (!value) {
// //     throw new Error(
// //       `Missing server environment variable: ${name}`,
// //     );
// //   }

// //   return value;
// // }

// // function getAdminApp(): App {
// //   const existing =
// //     getApps();

// //   if (existing.length > 0) {
// //     return existing[0]!;
// //   }

// //   const projectId =
// //     requiredEnv(
// //       "FIREBASE_PROJECT_ID",
// //     );

// //   const clientEmail =
// //     requiredEnv(
// //       "FIREBASE_CLIENT_EMAIL",
// //     );

// //   const privateKey =
// //     requiredEnv(
// //       "FIREBASE_PRIVATE_KEY",
// //     ).replace(
// //       /\\n/g,
// //       "\n",
// //     );

// //   return initializeApp({
// //     credential: cert({
// //       projectId,
// //       clientEmail,
// //       privateKey,
// //     }),
// //   });
// // }

// // export const firebaseAdminApp =
// //   getAdminApp();

// // export const adminAuth: Auth =
// //   getAuth(
// //     firebaseAdminApp,
// //   );

// // export const adminDb: Firestore =
// //   getFirestore(
// //     firebaseAdminApp,
// //   );











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

// import {
//   getStorage,
//   type Storage,
// } from "firebase-admin/storage";

// function requiredEnv(name: string): string {
//   const value = process.env[name];

//   if (!value) {
//     throw new Error(`Missing server environment variable: ${name}`);
//   }

//   return value;
// }

// function getAdminApp(): App {
//   const existing = getApps();

//   if (existing.length > 0) {
//     return existing[0]!;
//   }

//   const projectId = requiredEnv("FIREBASE_PROJECT_ID");
//   const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
//   const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY").replace(
//     /\\n/g,
//     "\n",
//   );

//   const storageBucket =
//     process.env.FIREBASE_STORAGE_BUCKET ||
//     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
//     `${projectId}.appspot.com`;

//   return initializeApp({
//     credential: cert({
//       projectId,
//       clientEmail,
//       privateKey,
//     }),
//     storageBucket,
//   });
// }

// export const firebaseAdminApp = getAdminApp();

// export const adminAuth: Auth = getAuth(firebaseAdminApp);

// export const adminDb: Firestore = getFirestore(firebaseAdminApp);

// export const adminStorage: Storage = getStorage(firebaseAdminApp);









import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0]!;
  }

  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getEnv("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

  // During frontend-only / Cloudflare build, secrets may be missing.
  // Initialize a lightweight app so "Collecting page data" does not crash.
  if (!projectId || !clientEmail || !privateKey) {
    return initializeApp({
      projectId: projectId || "sreshta-frontend-build",
    });
  }

  const storageBucket =
    getEnv("FIREBASE_STORAGE_BUCKET") ||
    getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
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

function app(): App {
  return getAdminApp();
}

export const firebaseAdminApp = new Proxy({} as App, {
  get(_target, prop, receiver) {
    return Reflect.get(app(), prop, receiver);
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth(app()), prop, receiver);
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirestore(app()), prop, receiver);
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop, receiver) {
    return Reflect.get(getStorage(app()), prop, receiver);
  },
});
