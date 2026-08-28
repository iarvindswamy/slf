
// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type RateResult = {
//   serviceId: string;
//   serviceName: string;
//   total: number;
//   freight: number;
//   fuelSurcharge: number;
//   additionalCharges: number;
//   tax: number;
//   transit: string;
// };

// type RateOption = {
//   serviceId: string;
//   serviceName: string;
//   baseRatePerKg: number;
//   minimumCharge: number;
//   fuelSurchargePercent: number;
//   handlingCharges: number;
//   transit: string;
// };

// type RatePayload =
//   | Record<string, unknown>[]
//   | {
//       results?: Record<string, unknown>[];
//       rates?: Record<string, unknown>[];
//       data?: Record<string, unknown>[];
//     };

// type ApiResponse<T = unknown> =
//   | {
//       success: true;
//       data: T;
//       message?: string;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// type LogisticsServiceRow = {
//   serviceId?: string;
//   id?: string;
//   name?: string;
//   code?: string;
//   type?: string;
//   coverage?: string;
//   status?: string;
//   enabled?: boolean;
// };

// /** Fallback only when services master is empty */
// const FALLBACK_RATE_OPTIONS: RateOption[] = [
//   {
//     serviceId: "DOMESTIC_EXPRESS",
//     serviceName: "Domestic Express",
//     baseRatePerKg: 85,
//     minimumCharge: 250,
//     fuelSurchargePercent: 12,
//     handlingCharges: 40,
//     transit: "2 days",
//   },
//   {
//     serviceId: "DOMESTIC_ECONOMY",
//     serviceName: "Domestic Economy",
//     baseRatePerKg: 55,
//     minimumCharge: 180,
//     fuelSurchargePercent: 10,
//     handlingCharges: 25,
//     transit: "4 days",
//   },
//   {
//     serviceId: "CARGO_FREIGHT",
//     serviceName: "Cargo / Freight",
//     baseRatePerKg: 35,
//     minimumCharge: 500,
//     fuelSurchargePercent: 8,
//     handlingCharges: 75,
//     transit: "Variable",
//   },
// ];

// function formatCurrency(amount: number): string {
//   if (!Number.isFinite(amount)) return "—";

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// function defaultsForServiceType(type?: string): Omit<
//   RateOption,
//   "serviceId" | "serviceName"
// > {
//   const t = String(type || "").toUpperCase();

//   if (t.includes("EXPRESS") || t === "DOMESTIC") {
//     return {
//       baseRatePerKg: 85,
//       minimumCharge: 250,
//       fuelSurchargePercent: 12,
//       handlingCharges: 40,
//       transit: "2–3 days",
//     };
//   }

//   if (t.includes("ECONOMY")) {
//     return {
//       baseRatePerKg: 55,
//       minimumCharge: 180,
//       fuelSurchargePercent: 10,
//       handlingCharges: 25,
//       transit: "4–5 days",
//     };
//   }

//   if (t.includes("CARGO") || t.includes("FREIGHT")) {
//     return {
//       baseRatePerKg: 35,
//       minimumCharge: 500,
//       fuelSurchargePercent: 8,
//       handlingCharges: 75,
//       transit: "Variable",
//     };
//   }

//   if (t.includes("INTERNATIONAL")) {
//     return {
//       baseRatePerKg: 220,
//       minimumCharge: 1200,
//       fuelSurchargePercent: 15,
//       handlingCharges: 150,
//       transit: "5–10 days",
//     };
//   }

//   return {
//     baseRatePerKg: 60,
//     minimumCharge: 200,
//     fuelSurchargePercent: 10,
//     handlingCharges: 30,
//     transit: "—",
//   };
// }

// function servicesToRateOptions(
//   services: LogisticsServiceRow[],
//   fuelPercent?: number,
// ): RateOption[] {
//   const active = services.filter((s) => {
//     const status = String(s.status || "ACTIVE").toUpperCase();
//     const enabled = s.enabled === undefined ? status !== "INACTIVE" : Boolean(s.enabled);
//     return enabled && status !== "INACTIVE";
//   });

//   if (active.length === 0) return [];

//   return active.map((service) => {
//     const serviceId = String(service.serviceId || service.id || "").trim();
//     const defaults = defaultsForServiceType(service.type || service.coverage);

//     return {
//       serviceId,
//       serviceName: String(service.name || service.code || serviceId),
//       baseRatePerKg: defaults.baseRatePerKg,
//       minimumCharge: defaults.minimumCharge,
//       fuelSurchargePercent:
//         fuelPercent !== undefined && Number.isFinite(fuelPercent)
//           ? fuelPercent
//           : defaults.fuelSurchargePercent,
//       handlingCharges: defaults.handlingCharges,
//       transit: defaults.transit,
//     };
//   });
// }

// function normalizeResults(
//   payload: RatePayload,
//   options: RateOption[],
// ): RateResult[] {
//   const list: Record<string, unknown>[] = Array.isArray(payload)
//     ? payload
//     : Array.isArray(payload.results)
//       ? payload.results
//       : Array.isArray(payload.rates)
//         ? payload.rates
//         : Array.isArray(payload.data)
//           ? payload.data
//           : [];

//   return list
//     .map((item, index) => {
//       const row = item || {};
//       const breakdown =
//         (row.breakdown as Record<string, unknown> | undefined) ||
//         (row.pricing as Record<string, unknown> | undefined) ||
//         row;

//       const serviceId = String(
//         row.serviceId || options[index]?.serviceId || `SERVICE_${index + 1}`,
//       );

//       const matched = options.find((option) => option.serviceId === serviceId);
//       const total = Number(breakdown.total ?? row.total ?? 0);

//       return {
//         serviceId,
//         serviceName: String(
//           row.serviceName || matched?.serviceName || `Service Option ${index + 1}`,
//         ),
//         total: Number.isFinite(total) ? total : 0,
//         freight: Number(breakdown.freight || row.freight || 0),
//         fuelSurcharge: Number(
//           breakdown.fuelSurcharge || row.fuelSurcharge || 0,
//         ),
//         additionalCharges: Number(
//           breakdown.additionalCharges || row.additionalCharges || 0,
//         ),
//         tax: Number(breakdown.tax || row.tax || 0),
//         transit: matched?.transit || "—",
//       };
//     })
//     .filter((item) => Boolean(item.serviceId));
// }

// export default function RateComparePage() {
//   const { user, loading: authLoading } = useAuth();

//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [weight, setWeight] = useState("");
//   const [rateOptions, setRateOptions] = useState<RateOption[]>(FALLBACK_RATE_OPTIONS);
//   const [optionsSource, setOptionsSource] = useState<"services" | "fallback">(
//     "fallback",
//   );
//   const [loadingOptions, setLoadingOptions] = useState(true);
//   const [results, setResults] = useState<RateResult[]>([]);
//   const [searched, setSearched] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;

//     async function loadOptions() {
//       try {
//         setLoadingOptions(true);

//         if (!user) {
//           if (!cancelled) {
//             setRateOptions(FALLBACK_RATE_OPTIONS);
//             setOptionsSource("fallback");
//           }
//           return;
//         }

//         const token = await user.getIdToken();
//         const headers = {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         };

//         const [servicesRes, fuelRes] = await Promise.all([
//           fetch("/api/logistics/services", {
//             method: "GET",
//             headers,
//             cache: "no-store",
//           }),
//           fetch("/api/logistics/settings/fuel-surcharge", {
//             method: "GET",
//             headers,
//             cache: "no-store",
//           }).catch(() => null),
//         ]);

//         let fuelPercent: number | undefined;

//         if (fuelRes?.ok) {
//           const fuelJson = (await fuelRes.json()) as ApiResponse<{
//             config?: { percentage?: string; status?: string };
//             fuelSurcharge?: { percentage?: string; status?: string };
//           }>;

//           if (fuelJson.success) {
//             const cfg =
//               fuelJson.data?.config || fuelJson.data?.fuelSurcharge || null;
//             if (cfg && String(cfg.status || "Active") !== "Inactive") {
//               const n = Number(cfg.percentage);
//               if (Number.isFinite(n) && n >= 0) fuelPercent = n;
//             }
//           }
//         }

//         if (servicesRes.ok) {
//           const servicesJson =
//             (await servicesRes.json()) as ApiResponse<LogisticsServiceRow[]>;

//           if (servicesJson.success && Array.isArray(servicesJson.data)) {
//             const mapped = servicesToRateOptions(
//               servicesJson.data,
//               fuelPercent,
//             );

//             if (mapped.length > 0 && !cancelled) {
//               setRateOptions(mapped);
//               setOptionsSource("services");
//               return;
//             }
//           }
//         }

//         if (!cancelled) {
//           const fallback = FALLBACK_RATE_OPTIONS.map((opt) => ({
//             ...opt,
//             fuelSurchargePercent:
//               fuelPercent !== undefined
//                 ? fuelPercent
//                 : opt.fuelSurchargePercent,
//           }));
//           setRateOptions(fallback);
//           setOptionsSource("fallback");
//         }
//       } catch {
//         if (!cancelled) {
//           setRateOptions(FALLBACK_RATE_OPTIONS);
//           setOptionsSource("fallback");
//         }
//       } finally {
//         if (!cancelled) setLoadingOptions(false);
//       }
//     }

//     loadOptions();

//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, user]);

//   const bookingQuery = useMemo(() => {
//     const params = new URLSearchParams();

//     if (origin.trim()) params.set("origin", origin.trim());
//     if (destination.trim()) params.set("destination", destination.trim());
//     if (weight.trim()) params.set("weight", weight.trim());

//     const query = params.toString();
//     return query ? `?${query}` : "";
//   }, [origin, destination, weight]);

//   async function compareRates() {
//     try {
//       setLoading(true);
//       setError(null);
//       setSearched(true);
//       setResults([]);

//       if (!user) {
//         throw new Error("Authentication is required to compare rates.");
//       }

//       const chargeableWeightKg = Number(weight);

//       if (!Number.isFinite(chargeableWeightKg) || chargeableWeightKg <= 0) {
//         throw new Error("Chargeable weight must be greater than zero.");
//       }

//       if (!origin.trim() || !destination.trim()) {
//         throw new Error("Origin and destination are required.");
//       }

//       if (rateOptions.length === 0) {
//         throw new Error(
//           "No rate options available. Add active services in Masters → Services.",
//         );
//       }

//       const token = await user.getIdToken();

//       const res = await fetch("/api/logistics/rate", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           chargeableWeightKg,
//           origin: origin.trim(),
//           destination: destination.trim(),
//           rates: rateOptions.map((option) => ({
//             serviceId: option.serviceId,
//             serviceName: option.serviceName,
//             baseRatePerKg: option.baseRatePerKg,
//             minimumCharge: option.minimumCharge,
//             fuelSurchargePercent: option.fuelSurchargePercent,
//             handlingCharges: option.handlingCharges,
//           })),
//         }),
//       });

//       const json = (await res.json()) as ApiResponse<RatePayload>;

//       if (!res.ok || !json.success) {
//         throw new Error(
//           !json.success
//             ? json.error.message
//             : "Failed to calculate rates.",
//         );
//       }

//       setResults(normalizeResults(json.data, rateOptions));
//     } catch (e) {
//       setError(
//         e instanceof Error ? e.message : "Failed to calculate rates.",
//       );
//       setResults([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1200px]">
//       <div className="mb-6">
//         <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//           Logistics
//         </p>
//         <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//           Rate Compare
//         </h2>
//         <p className="mt-1 text-sm text-slate-500">
//           Compare applicable shipment service rates using live services master
//           data when available.
//         </p>
//       </div>

//       <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="flex flex-wrap items-center justify-between gap-2">
//           <h3 className="font-bold text-[#06284c]">Compare Available Rates</h3>
//           <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
//             {loadingOptions
//               ? "Loading options…"
//               : optionsSource === "services"
//                 ? `${rateOptions.length} services from master`
//                 : "Fallback rate cards"}
//           </span>
//         </div>

//         <div className="mt-5 grid gap-4 md:grid-cols-4">
//           <Input
//             label="Origin"
//             value={origin}
//             onChange={setOrigin}
//             placeholder="Vijayawada"
//           />
//           <Input
//             label="Destination"
//             value={destination}
//             onChange={setDestination}
//             placeholder="Hyderabad"
//           />
//           <Input
//             label="Weight (kg)"
//             value={weight}
//             onChange={setWeight}
//             placeholder="10"
//           />
//           <div className="flex items-end">
//             <button
//               type="button"
//               onClick={compareRates}
//               disabled={loading || authLoading || loadingOptions}
//               className="w-full rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//             >
//               {loading ? "Calculating…" : "Compare Rates"}
//             </button>
//           </div>
//         </div>
//       </section>

//       {error && (
//         <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {searched && !loading && !error && (
//         <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-5 py-4">
//             <h3 className="font-bold text-[#06284c]">Rate Comparison</h3>
//             <p className="mt-1 text-xs text-slate-500">
//               {origin} → {destination} · {weight} kg chargeable
//             </p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Option</th>
//                   <th className="px-5 py-3">Service</th>
//                   <th className="px-5 py-3">Rate</th>
//                   <th className="px-5 py-3">Indicative Transit</th>
//                   <th className="px-5 py-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {results.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-5 py-12 text-center text-slate-500"
//                     >
//                       No rate options returned.
//                     </td>
//                   </tr>
//                 ) : (
//                   results.map((rate, index) => (
//                     <tr key={rate.serviceId}>
//                       <td className="px-5 py-4 font-bold">
//                         Service Option {String.fromCharCode(65 + index)}
//                       </td>
//                       <td className="px-5 py-4">{rate.serviceName}</td>
//                       <td className="px-5 py-4 font-bold text-[#087f87]">
//                         {formatCurrency(rate.total)}
//                       </td>
//                       <td className="px-5 py-4">{rate.transit}</td>
//                       <td className="px-5 py-4">
//                         <Link
//                           href={`/admin/logistics/booking${bookingQuery}${
//                             bookingQuery ? "&" : "?"
//                           }serviceId=${encodeURIComponent(rate.serviceId)}`}
//                           className="text-xs font-bold text-[#087f87]"
//                         >
//                           Select →
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       )}

//       <div className="mt-5 rounded-lg bg-amber-50 p-4 text-xs text-amber-800">
//         Service list comes from{" "}
//         <code className="font-mono">/api/logistics/services</code>. Fuel %
//         prefers{" "}
//         <code className="font-mono">/api/logistics/settings/fuel-surcharge</code>
//         . Base ₹/kg still uses type-based defaults until a tariff master is
//         added. Calculation runs via{" "}
//         <code className="font-mono">POST /api/logistics/rate</code>.
//       </div>
//     </div>
//   );
// }

// function Input({
//   label,
//   value,
//   onChange,
//   placeholder,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-xs font-bold text-slate-600">
//         {label}
//       </label>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//       />
//     </div>
//   );
// }












"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calculator, RefreshCw } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RateResult = {
  serviceId: string;
  serviceName: string;
  total: number;
  freight: number;
  fuelSurcharge: number;
  additionalCharges: number;
  tax: number;
  transit: string;
  fuelPercent?: number;
};

type RateOption = {
  serviceId: string;
  serviceName: string;
  baseRatePerKg: number;
  minimumCharge: number;
  fuelSurchargePercent: number;
  handlingCharges: number;
  transit: string;
};

type FuelSurcharge = {
  id: string;
  name: string;
  percentage?: number;
  amount?: number;
  enabled: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const FALLBACK_OPTIONS: RateOption[] = [
  {
    serviceId: "DOMESTIC_EXPRESS",
    serviceName: "Domestic Express",
    baseRatePerKg: 85,
    minimumCharge: 250,
    fuelSurchargePercent: 12,
    handlingCharges: 40,
    transit: "2–3 days",
  },
  {
    serviceId: "DOMESTIC_ECONOMY",
    serviceName: "Domestic Economy",
    baseRatePerKg: 55,
    minimumCharge: 180,
    fuelSurchargePercent: 10,
    handlingCharges: 25,
    transit: "4–5 days",
  },
  {
    serviceId: "INTERNATIONAL_EXPRESS",
    serviceName: "International Express (SPX)",
    baseRatePerKg: 220,
    minimumCharge: 1200,
    fuelSurchargePercent: 15,
    handlingCharges: 150,
    transit: "5–10 days",
  },
  {
    serviceId: "CARGO_FREIGHT",
    serviceName: "Cargo / Freight",
    baseRatePerKg: 35,
    minimumCharge: 500,
    fuelSurchargePercent: 8,
    handlingCharges: 75,
    transit: "Variable",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RateComparePage() {
  const { user, loading: authLoading } = useAuth();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedFuelId, setSelectedFuelId] = useState("");

  const [rateOptions, setRateOptions] = useState<RateOption[]>(FALLBACK_OPTIONS);
  const [fuelSurcharges, setFuelSurcharges] = useState<FuelSurcharge[]>([]);
  const [results, setResults] = useState<RateResult[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Load Services + Fuel Surcharges -------------------- */
  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function load() {
      try {
        setLoadingOptions(true);
        const token = await user.getIdToken();
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [servicesRes, fuelRes] = await Promise.all([
          fetch("/api/logistics/services", { headers, cache: "no-store" }),
          fetch("/api/logistics/settings/fuel-surcharge", {
            headers,
            cache: "no-store",
          }).catch(() => null),
        ]);

        // Fuel surcharges
        if (fuelRes?.ok) {
          const fuelJson = await fuelRes.json();
          if (fuelJson.success) {
            const list = Array.isArray(fuelJson.data)
              ? fuelJson.data
              : fuelJson.data?.items || [];
            const active = list.filter((f: any) => f.enabled !== false);
            if (!cancelled) {
              setFuelSurcharges(active);
              if (active.length > 0 && !selectedFuelId) {
                setSelectedFuelId(active[0].id);
              }
            }
          }
        }

        // Services
        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          if (servicesJson.success && Array.isArray(servicesJson.data)) {
            const active = servicesJson.data.filter(
              (s: any) => s.enabled !== false && s.status !== "INACTIVE",
            );

            if (active.length > 0 && !cancelled) {
              const mapped: RateOption[] = active.map((s: any) => {
                const type = String(s.type || s.coverage || "").toUpperCase();
                let base = 60;
                let min = 200;
                let fuel = 10;
                let handling = 30;
                let transit = "—";

                if (type.includes("EXPRESS") || type === "DOMESTIC") {
                  base = 85; min = 250; fuel = 12; handling = 40; transit = "2–3 days";
                } else if (type.includes("ECONOMY")) {
                  base = 55; min = 180; fuel = 10; handling = 25; transit = "4–5 days";
                } else if (type.includes("INTERNATIONAL")) {
                  base = 220; min = 1200; fuel = 15; handling = 150; transit = "5–10 days";
                } else if (type.includes("CARGO") || type.includes("FREIGHT")) {
                  base = 35; min = 500; fuel = 8; handling = 75; transit = "Variable";
                }

                return {
                  serviceId: s.serviceId || s.id,
                  serviceName: s.name || s.code || s.serviceId,
                  baseRatePerKg: base,
                  minimumCharge: min,
                  fuelSurchargePercent: fuel,
                  handlingCharges: handling,
                  transit,
                };
              });

              setRateOptions(mapped);
              return;
            }
          }
        }

        if (!cancelled) setRateOptions(FALLBACK_OPTIONS);
      } catch {
        if (!cancelled) setRateOptions(FALLBACK_OPTIONS);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  /* -------------------- Selected Fuel -------------------- */
  const selectedFuel = useMemo(
    () => fuelSurcharges.find((f) => f.id === selectedFuelId),
    [fuelSurcharges, selectedFuelId],
  );

  /* -------------------- Compare -------------------- */
  async function compareRates() {
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      setResults([]);

      if (!user) throw new Error("Authentication is required.");

      const chargeableWeightKg = Number(weight);
      if (!Number.isFinite(chargeableWeightKg) || chargeableWeightKg <= 0) {
        throw new Error("Chargeable weight must be greater than zero.");
      }
      if (!origin.trim() || !destination.trim()) {
        throw new Error("Origin and destination are required.");
      }

      // Apply selected fuel surcharge percentage if available
      const fuelPercent = selectedFuel?.percentage;

      const optionsWithFuel = rateOptions.map((opt) => ({
        ...opt,
        fuelSurchargePercent:
          fuelPercent !== undefined ? fuelPercent : opt.fuelSurchargePercent,
      }));

      const token = await user.getIdToken();

      const res = await fetch("/api/logistics/rate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chargeableWeightKg,
          origin: origin.trim(),
          destination: destination.trim(),
          rates: optionsWithFuel.map((opt) => ({
            serviceId: opt.serviceId,
            serviceName: opt.serviceName,
            baseRatePerKg: opt.baseRatePerKg,
            minimumCharge: opt.minimumCharge,
            fuelSurchargePercent: opt.fuelSurchargePercent,
            handlingCharges: opt.handlingCharges,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to calculate rates");
      }

      const list = Array.isArray(json.data)
        ? json.data
        : json.data?.results || json.data?.rates || json.data?.data || [];

      const mapped: RateResult[] = list.map((item: any, index: number) => {
        const matched = optionsWithFuel[index];
        const breakdown = item.breakdown || item.pricing || item;

        return {
          serviceId: item.serviceId || matched?.serviceId || `OPT_${index}`,
          serviceName: item.serviceName || matched?.serviceName || "Service",
          total: Number(breakdown.total ?? item.total ?? 0),
          freight: Number(breakdown.freight || 0),
          fuelSurcharge: Number(breakdown.fuelSurcharge || 0),
          additionalCharges: Number(breakdown.additionalCharges || 0),
          tax: Number(breakdown.tax || 0),
          transit: matched?.transit || "—",
          fuelPercent: matched?.fuelSurchargePercent,
        };
      });

      setResults(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to calculate rates");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const bookingQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (origin.trim()) params.set("origin", origin.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (weight.trim()) params.set("weight", weight.trim());
    return params.toString() ? `?${params.toString()}` : "";
  }, [origin, destination, weight]);

  /* -------------------- Render -------------------- */
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
          Logistics
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
          Rate Compare
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare service rates. Fuel surcharge is pulled from the Fuel Surcharges master.
        </p>
      </div>

      {/* Input Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Origin *
            </label>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Guntur / Hyderabad"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Destination *
            </label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="USA / Hyderabad"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Chargeable Weight (kg) *
            </label>
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="11"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Fuel Surcharge
            </label>
            <select
              value={selectedFuelId}
              onChange={(e) => setSelectedFuelId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="">Default per service</option>
              {fuelSurcharges.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                  {f.percentage != null ? ` (${f.percentage}%)` : ""}
                  {f.amount != null ? ` + ₹${f.amount}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={compareRates}
              disabled={loading || authLoading || loadingOptions}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#087f87] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <Calculator className="h-4 w-4" />
              {loading ? "Calculating…" : "Compare Rates"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && !error && (
        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-[#06284c]">Rate Comparison Results</h3>
            <p className="mt-1 text-xs text-slate-500">
              {origin} → {destination} · {weight} kg
              {selectedFuel
                ? ` · Fuel: ${selectedFuel.name} (${selectedFuel.percentage ?? 0}%)`
                : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Freight</th>
                  <th className="px-5 py-3">Fuel</th>
                  <th className="px-5 py-3">Other</th>
                  <th className="px-5 py-3">Tax</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Transit</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      No rate options returned.
                    </td>
                  </tr>
                ) : (
                  results.map((rate) => (
                    <tr key={rate.serviceId} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-semibold">
                        {rate.serviceName}
                      </td>
                      <td className="px-5 py-4">
                        {formatCurrency(rate.freight)}
                      </td>
                      <td className="px-5 py-4">
                        {formatCurrency(rate.fuelSurcharge)}
                        {rate.fuelPercent != null && (
                          <span className="ml-1 text-[10px] text-slate-400">
                            ({rate.fuelPercent}%)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {formatCurrency(rate.additionalCharges)}
                      </td>
                      <td className="px-5 py-4">
                        {formatCurrency(rate.tax)}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#087f87]">
                        {formatCurrency(rate.total)}
                      </td>
                      <td className="px-5 py-4 text-xs">{rate.transit}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/logistics/booking${bookingQuery}${
                            bookingQuery ? "&" : "?"
                          }serviceId=${encodeURIComponent(rate.serviceId)}`}
                          className="text-xs font-bold text-[#087f87] hover:underline"
                        >
                          Select →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
        Fuel surcharge list comes from the <strong>Fuel Surcharges</strong> master.
        Base rates currently use type-based defaults until a full tariff master is added.
      </div>
    </div>
  );
}