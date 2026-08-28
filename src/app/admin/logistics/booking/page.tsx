"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import AWBBookingForm, {
  AWBBookingData,
} from "@/components/logistics/AWBBookingForm";

type ApiResponse =
  | {
      success: true;
      data?: {
        awb?: string;
        orderId?: string;
        documentId?: string;
        [key: string]: unknown;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function deriveServiceType(
  product: string,
  destination: string,
): string {
  const p = (product || "").toUpperCase();
  const d = (destination || "").toUpperCase();

  if (
    p.includes("INTERNATIONAL") ||
    d.includes("USA") ||
    d.includes("UK") ||
    d.includes("UAE") ||
    d.includes("CANADA") ||
    d.includes("AUSTRALIA")
  ) {
    return "INTERNATIONAL";
  }
  if (p.includes("CARGO") || p.includes("FREIGHT")) {
    return "CARGO";
  }
  if (p.includes("EXPRESS")) {
    return "EXPRESS";
  }
  return "DOMESTIC";
}

export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [createdAwb, setCreatedAwb] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Temporary: while Firebase auth is deferred, treat any logged-in demo user as allowed
  const role =
    (user as { role?: string } | null)?.role ||
    (typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("sreshta-demo-auth") || "{}")
          ?.role
      : null);

  const accountCode =
    (user as { accountCode?: string; coLoaderCode?: string } | null)
      ?.accountCode ||
    (user as { coLoaderCode?: string } | null)?.coLoaderCode ||
    (typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("sreshta-demo-auth") || "{}")
          ?.accountCode
      : "") ||
    "";

  const canManageFuelSurcharge =
    role === "SUPER_ADMIN" || role === "ADMIN";

  async function handleSubmit(data: AWBBookingData) {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      setCreatedAwb("");

      // Soft auth check while Firebase is deferred
      if (!user && typeof window !== "undefined") {
        const demo = localStorage.getItem("sreshta-demo-auth");
        if (!demo) {
          throw new Error(
            "Authentication is required to create an AWB.",
          );
        }
      }

      const serviceType = deriveServiceType(
        data.product,
        data.destination,
      );

      const payload = {
        customerId: data.customerId || data.customerCode || "WALKIN",
        customerCode: data.customerCode,
        customerName: data.customerName,
        accountCode: data.accountCode || accountCode,

        shipper: {
          name: data.shipper.name,
          company: data.shipper.company,
          contactName: data.shipper.contactName,
          phone: data.shipper.phone,
          mobile: data.shipper.mobile,
          email: data.shipper.email,
          addressLine1: data.shipper.addressLine1,
          addressLine2: data.shipper.addressLine2,
          city: data.shipper.city,
          state: data.shipper.state,
          pincode: data.shipper.pincode,
          country: data.shipper.country || "India",
          gstin: data.shipper.gstin,
          iecNo: data.shipper.iecNo,
          documentType: data.shipper.documentType,
          documentNo: data.shipper.documentNo,
          origin: data.shipper.origin || data.origin,
          originCode: data.shipper.originCode || data.originCode,
        },
        consignee: {
          name: data.consignee.name,
          company: data.consignee.company,
          contactName: data.consignee.contactName,
          phone: data.consignee.phone,
          mobile: data.consignee.mobile,
          email: data.consignee.email,
          addressLine1: data.consignee.addressLine1,
          addressLine2: data.consignee.addressLine2,
          city: data.consignee.city,
          state: data.consignee.state,
          pincode: data.consignee.pincode,
          country: data.consignee.country || "USA",
          gstin: data.consignee.gstin,
          iecNo: data.consignee.iecNo,
          documentType: data.consignee.documentType,
          documentNo: data.consignee.documentNo,
        },

        origin: data.origin || data.shipper.origin || data.shipper.city || "",
        originCode: data.originCode || data.shipper.originCode,
        destination: data.destination,
        destinationCode: data.destinationCode,
        product: data.product,
        vendor: data.vendor,
        service: data.service,
        serviceType,
        preCarriageBy: data.vendor || data.service,
        bookDate: data.bookDate,
        shipmentDate: data.bookDate,

        pieces: data.pieces.map((p) => ({
          quantity: p.quantity,
          actualWeightKg: p.weightKg,
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
          division: p.division ?? 5000,
          volumetricWeight: p.volumetricWeight,
          chargeableWeight: p.chargeableWeight,
          description: p.description,
        })),
        totalPieces: data.totalPieces,
        actualWeight: data.actualWeight,
        volumetricWeight: data.volumetricWeight,
        chargeableWeight: data.chargeableWeight,
        packageType: data.packageType,
        declaredValue: data.shipmentValue,
        currency: data.currency,

        csbType: data.csbType,
        termOfInvoice: data.termOfInvoice,
        exportReason: data.exportReason,
        gstInvoice: data.gstInvoice,
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        departmentNo: data.departmentNo,
        format: data.format,
        items: data.items,

        charges: {
          freight: data.charges.freight,
          fuelSurcharge: data.charges.fuelSurcharge,
          contractCharges: data.charges.contractCharges,
          otherCharges: data.charges.otherCharges,
          surcharge: data.charges.surcharge,
          discount: data.charges.discount,
          cgst: data.charges.cgst,
          sgst: data.charges.sgst,
          igst: data.charges.igst,
          additionalCharges: data.charges.additionalCharges,
        },

        paymentType: data.paymentType,
        referenceNo: data.referenceNo,
        content: data.content,
        instruction: data.instruction,
        commercial: data.commercial,
        oda: data.oda,
        medicalCharges: data.medicalCharges,
      };

      // Prefer Firebase token when available; otherwise send demo header
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      if (user && typeof (user as { getIdToken?: () => Promise<string> }).getIdToken === "function") {
        const token = await (user as { getIdToken: () => Promise<string> }).getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } else if (typeof window !== "undefined") {
        headers["X-Demo-Auth"] = localStorage.getItem("sreshta-demo-auth") || "";
      }

      const res = await fetch("/api/logistics/awb/create", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error?.message || "Failed to create AWB."
            : "Failed to create AWB.",
        );
      }

      const awb = String(
        json.data?.awb ||
          json.data?.documentId ||
          "",
      );

      if (!awb) {
        setMessage(
          json.message ||
            "AWB created successfully, but no AWB number was returned.",
        );
        return;
      }

      setCreatedAwb(awb);
      setMessage(`AWB ${awb} created successfully.`);

      // Best-effort PDF generation (does not block navigation)
      try {
        const totalAmount =
          Number(data.charges.freight || 0) +
          Number(data.charges.fuelSurcharge || 0) +
          Number(data.charges.contractCharges || 0) +
          Number(data.charges.otherCharges || 0) +
          Number(data.charges.surcharge || 0) +
          Number(data.charges.cgst || 0) +
          Number(data.charges.sgst || 0) +
          Number(data.charges.igst || 0) -
          Number(data.charges.discount || 0);

        await fetch("/api/admin/logistics/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "both",
            awb,
            accountCode: data.accountCode || accountCode,
            bookDate: data.bookDate,
            invoiceNo: data.invoiceNo || `INV-${awb}`,
            invoiceDate: data.invoiceDate,
            shipperName:
              data.shipper.name || data.shipper.company || "",
            shipperAddress: [
              data.shipper.addressLine1,
              data.shipper.addressLine2,
              data.shipper.city,
              data.shipper.state,
              data.shipper.pincode,
            ]
              .filter(Boolean)
              .join(", "),
            shipperPhone: data.shipper.phone,
            shipperTaxId:
              data.shipper.gstin || data.shipper.documentNo,
            consigneeName:
              data.consignee.name || data.consignee.company || "",
            consigneeAddress: [
              data.consignee.addressLine1,
              data.consignee.addressLine2,
            ]
              .filter(Boolean)
              .join(", "),
            consigneeCity: data.consignee.city,
            consigneeState: data.consignee.state,
            consigneePincode: data.consignee.pincode,
            consigneeCountry: data.consignee.country,
            consigneePhone: data.consignee.phone,
            product: data.product,
            vendor: data.vendor,
            pieces: data.totalPieces,
            actualWeight: data.actualWeight,
            chargeableWeight: data.chargeableWeight,
            declaredValue: data.shipmentValue,
            currency: data.currency,
            content: data.content || data.exportReason,
            csbType: data.csbType,
            exportReason: data.exportReason,
            items: data.items.map((i) => ({
              description: i.description,
              shopName: i.shopName,
              shopAddress: i.shopAddress,
              hsCode: i.hsCode,
              quantity: i.quantity,
              weight: i.weight,
              unitRate: i.unitRate,
              amount: i.amount,
            })),
            totalAmount,
          }),
        });
      } catch {
        // PDF is best-effort
      }

      router.push(
        `/admin/logistics/awb/${encodeURIComponent(awb)}`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create AWB.",
      );
      throw e;
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            AWB Entry / Booking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Xpression-style single-page booking with performa, pieces
            &amp; charges.
          </p>
        </div>

        <Link
          href="/admin/logistics/awb"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Back to AWB List
        </Link>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
          {createdAwb && (
            <Link
              href={`/admin/logistics/awb/${encodeURIComponent(createdAwb)}`}
              className="ml-2 font-bold underline"
            >
              Open AWB
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <AWBBookingForm
        onSubmit={handleSubmit}
        defaultAccountCode={accountCode}
        canManageFuelSurcharge={canManageFuelSurcharge}
      />
    </div>
  );
}