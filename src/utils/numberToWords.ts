/**
 * Convert a number to Indian-style currency words.
 * Example: 3200 → "INR Three Thousand Two Hundred Only"
 */
export function numberToWords(
  amount: number,
  currency = "INR",
): string {
  if (!Number.isFinite(amount)) {
    return `${currency} Zero Only`;
  }

  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);

  const words = convertToWords(rupees);

  let result = `${currency} ${words}`;

  if (paise > 0) {
    result += ` and ${convertToWords(paise)} Paise`;
  }

  result += " Only";

  // Capitalize first letter of each major word for formal invoices
  return result.replace(/\b\w/g, (c) => c.toUpperCase());
}

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertToWords(num: number): string {
  if (num === 0) return "Zero";

  if (num < 20) return ones[num];

  if (num < 100) {
    return (
      tens[Math.floor(num / 10)] +
      (num % 10 !== 0 ? " " + ones[num % 10] : "")
    );
  }

  if (num < 1000) {
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 !== 0 ? " " + convertToWords(num % 100) : "")
    );
  }

  if (num < 100000) {
    return (
      convertToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 !== 0 ? " " + convertToWords(num % 1000) : "")
    );
  }

  if (num < 10000000) {
    return (
      convertToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 !== 0 ? " " + convertToWords(num % 100000) : "")
    );
  }

  return (
    convertToWords(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 !== 0 ? " " + convertToWords(num % 10000000) : "")
  );
}