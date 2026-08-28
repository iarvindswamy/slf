"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;

  signIn: (
    email: string,
    password: string,
  ) => Promise<User>;

  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<User>;

  logout: () => Promise<void>;

  clearError: () => void;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

function getAuthError(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error
  ) {
    const code = String(
      (error as { code: unknown }).code,
    );

    const messages: Record<
      string,
      string
    > = {
      "auth/invalid-credential":
        "Invalid email or password.",
      "auth/invalid-email":
        "Please enter a valid email address.",
      "auth/user-disabled":
        "This account has been disabled.",
      "auth/user-not-found":
        "No account was found with this email.",
      "auth/wrong-password":
        "Invalid email or password.",
      "auth/email-already-in-use":
        "An account already exists with this email.",
      "auth/weak-password":
        "Password is too weak.",
      "auth/too-many-requests":
        "Too many attempts. Please try again later.",
    };

    return (
      messages[code] ??
      "Authentication failed. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "Authentication failed.";
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        firebaseAuth,
        (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,

      async signIn(
        email,
        password,
      ) {
        try {
          setError(null);

          const credential =
            await signInWithEmailAndPassword(
              firebaseAuth,
              email.trim(),
              password,
            );

          return credential.user;
        } catch (error) {
          const message =
            getAuthError(error);

          setError(message);
          throw new Error(message);
        }
      },

      async signUp(
        email,
        password,
        displayName,
      ) {
        try {
          setError(null);

          const credential =
            await createUserWithEmailAndPassword(
              firebaseAuth,
              email.trim(),
              password,
            );

          if (displayName?.trim()) {
            await updateProfile(
              credential.user,
              {
                displayName:
                  displayName.trim(),
              },
            );
          }

          return credential.user;
        } catch (error) {
          const message =
            getAuthError(error);

          setError(message);
          throw new Error(message);
        }
      },

      async logout() {
        try {
          setError(null);
          await signOut(
            firebaseAuth,
          );
        } catch (error) {
          const message =
            getAuthError(error);

          setError(message);
          throw new Error(message);
        }
      },

      clearError() {
        setError(null);
      },
    }),
    [
      user,
      loading,
      error,
    ],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}