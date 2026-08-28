// import {
//   getApp,
//   getApps,
//   initializeApp,
//   type FirebaseApp,
// } from "firebase/app";

// import {
//   getAuth,
//   type Auth,
// } from "firebase/auth";

// import {
//   getFirestore,
//   type Firestore,
// } from "firebase/firestore";

// import {
//   getStorage,
//   type FirebaseStorage,
// } from "firebase/storage";

// const firebaseConfig = {
//   apiKey:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId:
//     process.env
//       .NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// function validateConfig() {
//   const required = [
//     "NEXT_PUBLIC_FIREBASE_API_KEY",
//     "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
//     "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
//     "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
//     "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
//     "NEXT_PUBLIC_FIREBASE_APP_ID",
//   ] as const;

//   const missing =
//     required.filter(
//       (key) =>
//         !process.env[key],
//     );

//   if (missing.length > 0) {
//     throw new Error(
//       `Missing Firebase client environment variables: ${missing.join(
//         ", ",
//       )}`,
//     );
//   }
// }

// validateConfig();

// export const firebaseApp: FirebaseApp =
//   getApps().length > 0
//     ? getApp()
//     : initializeApp(
//         firebaseConfig,
//       );

// export const firebaseAuth: Auth =
//   getAuth(firebaseApp);

// export const firestore: Firestore =
//   getFirestore(firebaseApp);

// export const firebaseStorage: FirebaseStorage =
//   getStorage(firebaseApp);








import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";

import {
  getAuth,
  type Auth,
} from "firebase/auth";

import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";

import {
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function validateConfig() {
  const missing: string[] = [];

  if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!firebaseConfig.storageBucket) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!firebaseConfig.messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!firebaseConfig.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase client environment variables: ${missing.join(", ")}`,
    );
  }
}

validateConfig();

export const firebaseApp: FirebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);

export const firestore: Firestore = getFirestore(firebaseApp);

export const firebaseStorage: FirebaseStorage = getStorage(firebaseApp);