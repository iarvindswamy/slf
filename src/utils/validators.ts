// export type ValidationResult = {
//   valid: boolean;
//   errors: Record<
//     string,
//     string
//   >;
// };

// export function isValidEmail(
//   email: string,
// ): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//     email.trim(),
//   );
// }

// export function isValidPhone(
//   phone: string,
// ): boolean {
//   const digits =
//     phone.replace(
//       /\D/g,
//       "",
//     );

//   return (
//     digits.length === 10 ||
//     (
//       digits.length === 12 &&
//       digits.startsWith("91")
//     )
//   );
// }

// export function isValidIndianPinCode(
//   pinCode: string,
// ): boolean {
//   return /^[1-9][0-9]{5}$/.test(
//     pinCode.trim(),
//   );
// }

// export function isValidGSTIN(
//   gstin: string,
// ): boolean {
//   return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(
//     gstin.trim(),
//   );
// }

// export function isValidAWB(
//   awb: string,
// ): boolean {
//   const normalized =
//     awb.trim();

//   if (!normalized) {
//     return false;
//   }

//   /*
//    * The MDS defines the canonical identifier
//    * as `awb`, but does not prescribe an exact
//    * carrier-specific AWB pattern.
//    *
//    * Therefore we validate it generically
//    * rather than inventing a carrier format.
//    */
//   return /^[A-Z0-9][A-Z0-9-]{3,49}$/i.test(
//     normalized,
//   );
// }

// export function required(
//   value:
//     | string
//     | number
//     | null
//     | undefined,
//   fieldName: string,
// ): string | null {
//   if (
//     value === null ||
//     value === undefined ||
//     (
//       typeof value ===
//         "string" &&
//       !value.trim()
//     )
//   ) {
//     return `${fieldName} is required.`;
//   }

//   return null;
// }

// export function validateRequiredFields(
//   values: Record<
//     string,
//     unknown
//   >,
//   fields: Record<
//     string,
//     string
//   >,
// ): ValidationResult {
//   const errors: Record<
//     string,
//     string
//   > = {};

//   for (const [
//     key,
//     label,
//   ] of Object.entries(fields)) {
//     const value =
//       values[key];

//     if (
//       value === undefined ||
//       value === null ||
//       (
//         typeof value ===
//           "string" &&
//         !value.trim()
//       )
//     ) {
//       errors[key] =
//         `${label} is required.`;
//     }
//   }

//   return {
//     valid:
//       Object.keys(
//         errors,
//       ).length === 0,
//     errors,
//   };
// }

// export function validateEmailField(
//   email: string,
// ): string | null {
//   if (!email.trim()) {
//     return "Email is required.";
//   }

//   if (!isValidEmail(email)) {
//     return "Please enter a valid email address.";
//   }

//   return null;
// }

// export function validatePhoneField(
//   phone: string,
// ): string | null {
//   if (!phone.trim()) {
//     return "Phone number is required.";
//   }

//   if (!isValidPhone(phone)) {
//     return "Please enter a valid Indian phone number.";
//   }

//   return null;
// }

// export function validateGSTINField(
//   gstin?: string,
// ): string | null {
//   if (!gstin?.trim()) {
//     return null;
//   }

//   if (!isValidGSTIN(gstin)) {
//     return "Please enter a valid GSTIN.";
//   }

//   return null;
// }

// export function validatePINField(
//   pinCode: string,
// ): string | null {
//   if (!pinCode.trim()) {
//     return "PIN code is required.";
//   }

//   if (!isValidIndianPinCode(pinCode)) {
//     return "Please enter a valid 6-digit PIN code.";
//   }

//   return null;
// }

// export function validateAWBField(
//   awb: string,
// ): string | null {
//   if (!awb.trim()) {
//     return "AWB is required.";
//   }

//   if (!isValidAWB(awb)) {
//     return "Please enter a valid AWB.";
//   }

//   return null;
// }

// export function validatePositiveNumber(
//   value: number,
//   fieldName: string,
// ): string | null {
//   if (!Number.isFinite(value)) {
//     return `${fieldName} must be a valid number.`;
//   }

//   if (value <= 0) {
//     return `${fieldName} must be greater than zero.`;
//   }

//   return null;
// }

// export function validateNonNegativeNumber(
//   value: number,
//   fieldName: string,
// ): string | null {
//   if (!Number.isFinite(value)) {
//     return `${fieldName} must be a valid number.`;
//   }

//   if (value < 0) {
//     return `${fieldName} cannot be negative.`;
//   }

//   return null;
// }

// export type ProductVariantValidationInput = {
//   name?: string;
//   weight: number;
//   price: number;
// };

// export function validateProductVariant(
//   variant: ProductVariantValidationInput,
// ): ValidationResult {
//   const errors: Record<
//     string,
//     string
//   > = {};

//   if (
//     !variant.name?.trim()
//   ) {
//     errors.name =
//       "Variant name is required.";
//   }

//   if (
//     !Number.isFinite(
//       variant.weight,
//     ) ||
//     variant.weight <= 0
//   ) {
//     errors.weight =
//       "Variant weight must be greater than zero.";
//   }

//   if (
//     !Number.isFinite(
//       variant.price,
//     ) ||
//     variant.price < 0
//   ) {
//     errors.price =
//       "Variant price cannot be negative.";
//   }

//   return {
//     valid:
//       Object.keys(
//         errors,
//       ).length === 0,
//     errors,
//   };
// }












export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");

  return (
    digits.length === 10 ||
    (digits.length === 12 && digits.startsWith("91"))
  );
}

export function isValidIndianPinCode(pinCode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pinCode.trim());
}

export function isValidGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(
    gstin.trim(),
  );
}

export function isValidAWB(awb: string): boolean {
  const normalized = awb.trim();

  if (!normalized) {
    return false;
  }

  /*
   * The MDS defines the canonical identifier as `awb`,
   * but does not prescribe an exact carrier-specific pattern.
   * Validate generically rather than inventing a carrier format.
   */
  return /^[A-Z0-9][A-Z0-9-]{3,49}$/i.test(normalized);
}

export function required(
  value: string | number | null | undefined,
  fieldName: string,
): string | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  ) {
    return `${fieldName} is required.`;
  }

  return null;
}

/**
 * Throws if value is missing / blank. Returns trimmed string.
 * Used by API routes that expect fail-fast validation.
 */
export function requiredString(
  value: unknown,
  fieldName = "Field",
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

/**
 * Throws if value is not a finite number > 0.
 */
export function positiveNumber(
  value: unknown,
  fieldName = "Value",
): number {
  const n = Number(value);

  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }

  return n;
}

/**
 * Throws if value is not a positive integer.
 */
export function positiveInteger(
  value: unknown,
  fieldName = "Value",
): number {
  const n = positiveNumber(value, fieldName);

  if (!Number.isInteger(n)) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }

  return n;
}

export function validateRequiredFields(
  values: Record<string, unknown>,
  fields: Record<string, string>,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [key, label] of Object.entries(fields)) {
    const value = values[key];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      errors[key] = `${label} is required.`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateEmailField(email: string): string | null {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function validatePhoneField(phone: string): string | null {
  if (!phone.trim()) {
    return "Phone number is required.";
  }

  if (!isValidPhone(phone)) {
    return "Please enter a valid Indian phone number.";
  }

  return null;
}

export function validateGSTINField(gstin?: string): string | null {
  if (!gstin?.trim()) {
    return null;
  }

  if (!isValidGSTIN(gstin)) {
    return "Please enter a valid GSTIN.";
  }

  return null;
}

export function validatePINField(pinCode: string): string | null {
  if (!pinCode.trim()) {
    return "PIN code is required.";
  }

  if (!isValidIndianPinCode(pinCode)) {
    return "Please enter a valid 6-digit PIN code.";
  }

  return null;
}

export function validateAWBField(awb: string): string | null {
  if (!awb.trim()) {
    return "AWB is required.";
  }

  if (!isValidAWB(awb)) {
    return "Please enter a valid AWB.";
  }

  return null;
}

export function validatePositiveNumber(
  value: number,
  fieldName: string,
): string | null {
  if (!Number.isFinite(value)) {
    return `${fieldName} must be a valid number.`;
  }

  if (value <= 0) {
    return `${fieldName} must be greater than zero.`;
  }

  return null;
}

export function validateNonNegativeNumber(
  value: number,
  fieldName: string,
): string | null {
  if (!Number.isFinite(value)) {
    return `${fieldName} must be a valid number.`;
  }

  if (value < 0) {
    return `${fieldName} cannot be negative.`;
  }

  return null;
}

export type ProductVariantValidationInput = {
  name?: string;
  weight: number;
  price: number;
};

export function validateProductVariant(
  variant: ProductVariantValidationInput,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!variant.name?.trim()) {
    errors.name = "Variant name is required.";
  }

  if (!Number.isFinite(variant.weight) || variant.weight <= 0) {
    errors.weight = "Variant weight must be greater than zero.";
  }

  if (!Number.isFinite(variant.price) || variant.price < 0) {
    errors.price = "Variant price cannot be negative.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
