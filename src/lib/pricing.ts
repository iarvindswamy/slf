// import "server-only";

// export type PricingCurrency =
//   | "INR";

// export type PricingInput = {
//   baseFreight: number;

//   fuelSurcharge?: number;

//   additionalCharges?: number;

//   discount?: number;

//   taxableAmount?: number;

//   taxRate?: number;

//   currency?: PricingCurrency;
// };

// export type PricingBreakdown = {
//   currency: PricingCurrency;

//   freight: number;
//   fuelSurcharge: number;
//   additionalCharges: number;
//   discount: number;

//   taxableAmount: number;

//   taxRate: number;
//   tax: number;

//   total: number;
// };

// function amount(
//   value: number | undefined,
// ): number {
//   if (
//     value === undefined ||
//     !Number.isFinite(value)
//   ) {
//     return 0;
//   }

//   return Math.max(0, value);
// }

// function round(
//   value: number,
// ): number {
//   return Math.round(
//     (value + Number.EPSILON) *
//       100,
//   ) / 100;
// }

// /**
//  * Central pricing calculator.
//  *
//  * IMPORTANT:
//  * This function intentionally does not invent
//  * the client's freight/fuel business formula.
//  *
//  * The API should supply the authoritative
//  * calculated freight and surcharge values.
//  */
// export function calculatePricing(
//   input: PricingInput,
// ): PricingBreakdown {
//   const freight =
//     amount(
//       input.baseFreight,
//     );

//   const fuelSurcharge =
//     amount(
//       input.fuelSurcharge,
//     );

//   const additionalCharges =
//     amount(
//       input.additionalCharges,
//     );

//   const discount =
//     Math.min(
//       amount(input.discount),
//       freight +
//         fuelSurcharge +
//         additionalCharges,
//     );

//   const subtotal =
//     Math.max(
//       0,
//       freight +
//         fuelSurcharge +
//         additionalCharges -
//         discount,
//     );

//   const taxableAmount =
//     input.taxableAmount ===
//     undefined
//       ? subtotal
//       : Math.max(
//           0,
//           input.taxableAmount,
//         );

//   const taxRate =
//     amount(input.taxRate);

//   const tax =
//     taxableAmount *
//     (taxRate / 100);

//   const total =
//     subtotal + tax;

//   return {
//     currency:
//       input.currency ?? "INR",

//     freight: round(
//       freight,
//     ),

//     fuelSurcharge: round(
//       fuelSurcharge,
//     ),

//     additionalCharges:
//       round(
//         additionalCharges,
//       ),

//     discount: round(
//       discount,
//     ),

//     taxableAmount: round(
//       taxableAmount,
//     ),

//     taxRate,

//     tax: round(tax),

//     total: round(total),
//   };
// }

// export function calculateTax(
//   taxableAmount: number,
//   taxRate: number,
// ): number {
//   return round(
//     amount(taxableAmount) *
//       (amount(taxRate) /
//         100),
//   );
// }

// export function calculateFuelSurcharge(
//   baseFreight: number,
//   fuelRatePercent: number,
// ): number {
//   /*
//    * This is a pure mathematical helper.
//    *
//    * The actual client's fuel-surcharge rule
//    * should be supplied/configured here once
//    * finalized.
//    */
//   return round(
//     amount(baseFreight) *
//       (amount(
//         fuelRatePercent,
//       ) /
//         100),
//   );
// }

// export function calculateFinalTotal(
//   breakdown: PricingBreakdown,
// ): number {
//   return round(
//     breakdown.total,
//   );
// }







import "server-only";

export type PricingCurrency = "INR";

export type PricingInput = {
  baseFreight: number;
  fuelSurcharge?: number;
  additionalCharges?: number;
  discount?: number;
  taxableAmount?: number;
  taxRate?: number;
  currency?: PricingCurrency;
};

export type PricingBreakdown = {
  currency: PricingCurrency;
  freight: number;
  fuelSurcharge: number;
  additionalCharges: number;
  discount: number;
  taxableAmount: number;
  taxRate: number;
  tax: number;
  total: number;
};

export type FreightRateInput = {
  baseRate: number;
  perKgRate?: number;
  weightKg: number;
  minimumCharge?: number;
  fuelPercent?: number;
};

export type FreightRateResult = {
  freight: number;
  fuelSurcharge: number;
  total: number;
};

function amount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Central pricing calculator.
 *
 * Does not invent the client's freight/fuel business formula.
 * The API should supply authoritative freight and surcharge values.
 */
export function calculatePricing(input: PricingInput): PricingBreakdown {
  const freight = amount(input.baseFreight);
  const fuelSurcharge = amount(input.fuelSurcharge);
  const additionalCharges = amount(input.additionalCharges);

  const discount = Math.min(
    amount(input.discount),
    freight + fuelSurcharge + additionalCharges,
  );

  const subtotal = Math.max(
    0,
    freight + fuelSurcharge + additionalCharges - discount,
  );

  const taxableAmount =
    input.taxableAmount === undefined
      ? subtotal
      : Math.max(0, input.taxableAmount);

  const taxRate = amount(input.taxRate);
  const tax = taxableAmount * (taxRate / 100);
  const total = subtotal + tax;

  return {
    currency: input.currency ?? "INR",
    freight: round(freight),
    fuelSurcharge: round(fuelSurcharge),
    additionalCharges: round(additionalCharges),
    discount: round(discount),
    taxableAmount: round(taxableAmount),
    taxRate,
    tax: round(tax),
    total: round(total),
  };
}

export function calculateTax(
  taxableAmount: number,
  taxRate: number,
): number {
  return round(amount(taxableAmount) * (amount(taxRate) / 100));
}

export function calculateFuelSurcharge(
  baseFreight: number,
  fuelRatePercent: number,
): number {
  /*
   * Pure mathematical helper.
   * Replace with client-configured rule when finalized.
   */
  return round(amount(baseFreight) * (amount(fuelRatePercent) / 100));
}

export function calculateFinalTotal(breakdown: PricingBreakdown): number {
  return round(breakdown.total);
}

/**
 * Used by /api/logistics/rate
 * freight = max(base + perKg * weight, minimumCharge)
 * fuel = freight * fuelPercent / 100
 */
export function calculateFreightRate(
  input: FreightRateInput,
): FreightRateResult {
  const weight = amount(input.weightKg);
  const base = amount(input.baseRate);
  const perKg = amount(input.perKgRate);
  const minCharge = amount(input.minimumCharge);

  let freight = base + perKg * weight;

  if (minCharge > 0) {
    freight = Math.max(freight, minCharge);
  }

  freight = round(freight);

  const fuelSurcharge = round(
    freight * (amount(input.fuelPercent) / 100),
  );

  return {
    freight,
    fuelSurcharge,
    total: round(freight + fuelSurcharge),
  };
}
