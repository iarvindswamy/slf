export function formatCurrency(
  amount: number,
  currency = "INR",
): string {
  if (!Number.isFinite(amount)) {
    amount = 0;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    },
  ).format(amount);
}

export function formatNumber(
  value: number,
  maximumFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits,
    },
  ).format(value);
}

export function formatWeight(
  value: number,
  unit:
    | "KG"
    | "GRAM" = "KG",
): string {
  if (!Number.isFinite(value)) {
    return "0 kg";
  }

  if (unit === "GRAM") {
    return `${formatNumber(
      value,
      0,
    )} g`;
  }

  return `${formatNumber(
    value,
    2,
  )} kg`;
}

export function formatDate(
  value:
    | string
    | Date
    | null
    | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function formatDateTime(
  value:
    | string
    | Date
    | null
    | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function formatPhone(
  phone:
    | string
    | null
    | undefined,
): string {
  if (!phone) {
    return "—";
  }

  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  if (
    digits.length === 10
  ) {
    return `${digits.slice(
      0,
      5,
    )} ${digits.slice(5)}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return `+91 ${digits.slice(
      2,
      7,
    )} ${digits.slice(7)}`;
  }

  return phone;
}

export function normalizePhone(
  phone: string,
): string {
  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  if (
    digits.length === 10
  ) {
    return `91${digits}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits;
  }

  return digits;
}

export function formatAWB(
  awb:
    | string
    | null
    | undefined,
): string {
  if (!awb) {
    return "—";
  }

  return awb
    .trim()
    .toUpperCase();
}

export function formatInvoiceNumber(
  invoiceNumber:
    | string
    | null
    | undefined,
): string {
  if (!invoiceNumber) {
    return "—";
  }

  return invoiceNumber
    .trim()
    .toUpperCase();
}

export function formatPercent(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${value.toFixed(
    2,
  )}%`;
}

export function formatAddress(
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  },
): string {
  if (!address) {
    return "";
  }

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatStatus(
  status: string,
): string {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}