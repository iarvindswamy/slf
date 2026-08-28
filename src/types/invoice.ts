import type {
  Address,
  CSBType,
  ExportReason,
  InvoiceLineItem,
  TermOfInvoice,
  ProformaFormat,
} from "./logistics";

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

export type InvoiceType =
  | "LOGISTICS"
  | "FOOD";

/**
 * Simple line item (food invoices + backward compatibility).
 * Logistics proforma prefers the richer InvoiceLineItem from logistics.ts.
 */
export type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  taxableAmount: number;
  taxRate?: number;
  taxAmount?: number;
  amount: number;

  // Optional extensions for logistics parity
  hsCode?: string;
  shopName?: string;
  shopAddress?: string;
  boxNo?: number;
  packages?: number;
  weight?: number;
  unit?: "PCS" | "KG" | "SET" | "BOX";
  igstPercent?: number;
  igstAmount?: number;
};

export type InvoiceTax = {
  cgst?: number;
  sgst?: number;
  igst?: number;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  type: InvoiceType;

  // Links
  customerId?: string;
  orderId?: string;
  awb?: string;
  accountCode?: string; // WH439 / WF439 / S0047

  // Seller
  sellerName: string;
  sellerAddress?: string;
  sellerGstin?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerLogo?: "LOGISTICS" | "FOOD";

  // Buyer
  customerName: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Full address blocks (used by PDF generators)
  shipper?: Address;
  consignee?: Address;

  // Line items
  items: InvoiceItem[] | InvoiceLineItem[];

  // Totals
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: InvoiceTax;
  total: number;
  currency: "INR";
  amountInWords?: string;

  // Logistics / Customs
  csbType?: CSBType;
  termOfInvoice?: TermOfInvoice;
  exportReason?: ExportReason;
  proformaFormat?: ProformaFormat;
  preCarriageBy?: string;
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin?: string;
  countryOfDestination?: string;
  otherReference?: string;
  termOfDelivery?: string;

  // Package summary
  totalPieces?: number;
  actualWeight?: number;
  chargeableWeight?: number;
  declaredValue?: number;

  // Status & meta
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceCreateInput = {
  type: InvoiceType;

  customerId?: string;
  orderId?: string;
  awb?: string;
  accountCode?: string;

  sellerName?: string;
  sellerAddress?: string;
  sellerGstin?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerLogo?: "LOGISTICS" | "FOOD";

  customerName: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPhone?: string;
  customerEmail?: string;

  shipper?: Address;
  consignee?: Address;

  items: InvoiceItem[] | InvoiceLineItem[];

  subtotal: number;
  discount?: number;
  taxableAmount: number;
  tax: InvoiceTax;
  total: number;
  amountInWords?: string;

  csbType?: CSBType;
  termOfInvoice?: TermOfInvoice;
  exportReason?: ExportReason;
  proformaFormat?: ProformaFormat;
  preCarriageBy?: string;
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin?: string;
  countryOfDestination?: string;
  otherReference?: string;
  termOfDelivery?: string;

  totalPieces?: number;
  actualWeight?: number;
  chargeableWeight?: number;
  declaredValue?: number;

  dueDate?: string;
};

export type InvoiceUpdateInput = Partial<InvoiceCreateInput> & {
  invoiceId: string;
  status?: InvoiceStatus;
};