import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Collision-safe sequential invoice numbers.
 * Format: INV-YYYYMMDD-000001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}${mm}${dd}`;

  const counterRef = adminDb
    .collection("settings")
    .doc("invoiceCounters");

  const next = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.exists ? snap.data() ?? {} : {};
    const current = Number(data[dateKey] ?? 0);
    const value = current + 1;

    tx.set(
      counterRef,
      {
        [dateKey]: value,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return value;
  });

  return `INV-${dateKey}-${String(next).padStart(6, "0")}`;
}
