export type ServiceType =
  | "DOMESTIC"
  | "INTERNATIONAL"
  | "CARGO"
  | "FREIGHT"
  | "EXPRESS"
  | "SURFACE"
  | "AIR";

export type ShipmentType =
  | "DOCUMENT"
  | "PARCEL"
  | "CARGO"
  | "FREIGHT";

export type PaymentMode =
  | "PREPAID"
  | "COD"
  | "TO_PAY"
  | "CREDIT";

export type DimensionUnit =
  | "CM"
  | "IN";

export type WeightUnit =
  | "KG"
  | "GRAM";

export type CSBType =
  | "CSB1"
  | "CSB2"
  | "CSB3"
  | "CSB4"
  | "CSB5";

export type TermOfInvoice =
  | "EXW"
  | "FCA"
  | "FAS"
  | "FOB"
  | "CFR"
  | "CIF"
  | "CPT"
  | "CIP"
  | "DAF"
  | "DES"
  | "DEQ"
  | "DDU"
  | "DDP"
  | "DAP"
  | "DAT";

export type ExportReason =
  | "SALE"
  | "SAMPLE"
  | "GIFT"
  | "BONAFIDE_GIFT"
  | "PERSONAL_NOT_FOR_RESALE"
  | "REPAIR"
  | "REPLACEMENT"
  | "RETURN"
  | "FREE_SAMPLE_OF_NO_COMMERCIAL_VALUE"
  | "SAMPLES_NOT_FOR_SALE"
  | "UNSOLICITED_GIFT_NOT_FOR_SALE"
  | "BUYER_IF_OTHER_THAN_CONSIGNEE";

export type DocumentType =
  | "GSTIN"
  | "AADHAAR"
  | "PAN"
  | "PASSPORT"
  | "IEC"
  | "OTHER";

export type ProformaFormat =
  | "performainv1"
  | "performainv2"
  | "performainvcom"
  | "performainvGSTBill";

export type Address = {
  name?: string;
  companyName?: string;
  contactName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  mobile?: string;
  email?: string;
  gstin?: string;
  iecNo?: string;
  documentType?: DocumentType;
  documentNo?: string;
};

export type Sender = {
  id: string;
  senderId: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address: Address;
  gstin?: string;
  aadhaar?: string;
  iecNo?: string;
  createdAt: string;
  updatedAt: string;
};

export type Receiver = {
  id: string;
  receiverId: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address: Address;
  gstin?: string;
  iecNo?: string;
  destinationCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCenter = {
  id: string;
  serviceCenterId: string;
  name: string;
  code?: string;
  city: string;
  state?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Destination = {
  id: string;
  destinationId: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  postalCodes?: string[];
  code?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Vendor = {
  id: string;
  vendorId: string;
  name: string;
  code?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CoLoader = {
  id: string;
  coLoaderId: string;
  name: string;
  code?: string; // e.g. WF439 / WH439 / S0047
  contactPerson?: string;
  phone?: string;
  email?: string;
  loginUserId?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LogisticsService = {
  id: string;
  serviceId: string;
  name: string;
  code?: string;
  type: ServiceType;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PackageDimension = {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  boxCount?: number;
};

export type ShipmentPiece = {
  pieceId: string;
  childAwb?: string;
  description?: string;
  quantity: number;
  actualWeight: number;
  volumetricWeight?: number;
  chargeableWeight?: number;
  weightUnit: WeightUnit;
  dimensions?: PackageDimension;
  declaredValue?: number;
  division?: number; // default 5000
};

/**
 * Line item that appears on the Proforma / Commercial Invoice.
 * Matches the sample PDF structure (HS code, shop name/address, qty, rate, amount).
 */
export type InvoiceLineItem = {
  id: string;
  boxNo?: number;
  packages?: number;
  description: string;
  shopName?: string;
  shopAddress?: string;
  hsCode: string;
  quantity: number;
  weight?: number;
  unit: "PCS" | "KG" | "SET" | "BOX";
  unitRate: number;
  amount: number;
  igstPercent?: number;
  igstAmount?: number;
};

export type GSTDetails = {
  applicable: boolean;
  gstin?: string;
  csbType?: CSBType;
  termOfInvoice?: TermOfInvoice;
  exportReason?: ExportReason;
  invoiceNo?: string;
  invoiceDate?: string;
  departmentNo?: string;
  format?: ProformaFormat;
  gstInvoice?: boolean;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax?: number;
};

export type ChargeLine = {
  id: string;
  description: string;
  rate?: number;
  amount: number;
  fuelApply?: boolean;
  fuelAmt?: number;
  taxApply?: boolean;
  taxOnFuel?: number;
  igst?: number;
  sgst?: number;
  cgst?: number;
  total?: number;
};

export type ChargeDetails = {
  freight: number;
  fuelSurcharge?: number;
  contractCharges?: number;
  otherCharges?: number;
  additionalCharges?: ChargeLine[];
  discount?: number;
  surcharge?: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tax?: number;
  total: number;
  currency: "INR";
};

export type AWB = {
  id: string;
  awb: string;

  // Account / Co-loader
  accountCode?: string; // e.g. WH439 / WF439 / S0047
  customerId: string;
  customerCode?: string;
  customerName?: string;

  // Parties
  senderId: string;
  receiverId: string;
  shipper?: Address;
  consignee?: Address;

  // Routing
  origin: string;
  originCode?: string;
  destination: string;
  destinationCode?: string;
  serviceCenterId?: string;
  destinationId?: string;
  vendorId?: string;
  coLoaderId?: string;
  serviceId?: string;
  preCarriageBy?: string; // FDX, DHL, ARAMEX, SELF, etc.
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin?: string;
  countryOfDestination?: string;

  // Service
  serviceType: ServiceType;
  shipmentType: ShipmentType;
  product?: string;
  vendor?: string;
  service?: string; // SELF / etc.
  paymentMode: PaymentMode;
  paymentType?: string;
  referenceNo?: string;
  content?: string;
  instruction?: string;

  shipmentDate: string;
  bookDate?: string;

  // Pieces & weight
  pieces: ShipmentPiece[];
  totalPieces: number;
  actualWeight: number;
  volumetricWeight?: number;
  chargeableWeight: number;
  weightUnit: WeightUnit;
  declaredValue?: number;
  declaredValueCurrency?: "INR" | "USD";

  // Proforma / Customs
  gst?: GSTDetails;
  items?: InvoiceLineItem[];
  termOfDelivery?: string;
  otherReference?: string; // e.g. "UNSOLICITED GIFT - NOT FOR SALE"

  // Financials
  charges: ChargeDetails;

  // Status
  currentStatus:
    | "BOOKED"
    | "PICKUP_REQUESTED"
    | "PICKED_UP"
    | "AT_ORIGIN"
    | "IN_TRANSIT"
    | "ARRIVED_DESTINATION"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "ON_HOLD"
    | "EXCEPTION"
    | "CANCELLED";

  trackingStageId?: string;
  remarks?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  manifestNo?: string;
  commercial?: boolean;
  oda?: boolean;
  medicalCharges?: boolean;

  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type AWBCreateInput = {
  customerId: string;
  accountCode?: string;
  customerCode?: string;
  customerName?: string;

  senderId?: string;
  receiverId?: string;
  shipper?: Address;
  consignee?: Address;

  origin: string;
  originCode?: string;
  destination: string;
  destinationCode?: string;
  serviceCenterId?: string;
  destinationId?: string;
  vendorId?: string;
  coLoaderId?: string;
  serviceId?: string;
  preCarriageBy?: string;
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin?: string;
  countryOfDestination?: string;

  serviceType: ServiceType;
  shipmentType: ShipmentType;
  product?: string;
  vendor?: string;
  service?: string;
  paymentMode: PaymentMode;
  paymentType?: string;
  referenceNo?: string;
  content?: string;
  instruction?: string;

  shipmentDate: string;
  bookDate?: string;

  pieces: ShipmentPiece[];
  declaredValue?: number;
  declaredValueCurrency?: "INR" | "USD";

  gst?: GSTDetails;
  items?: InvoiceLineItem[];
  termOfDelivery?: string;
  otherReference?: string;

  charges: ChargeDetails;
  remarks?: string;
  commercial?: boolean;
  oda?: boolean;
  medicalCharges?: boolean;
};

export type AWBUpdateInput = Partial<AWBCreateInput> & {
  awb: string;
};

export type AWBSearchFilters = {
  awb?: string;
  customerId?: string;
  customerCode?: string;
  accountCode?: string;
  origin?: string;
  destination?: string;
  status?: AWB["currentStatus"];
  fromDate?: string;
  toDate?: string;
  vendorId?: string;
  coLoaderId?: string;
  page?: number;
  pageSize?: number;
};

export type Rate = {
  id: string;
  serviceId?: string;
  origin: string;
  destination: string;
  serviceType: ServiceType;
  baseRate: number;
  perKgRate?: number;
  minimumCharge?: number;
  currency: "INR";
  enabled: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
};

export type FuelSurcharge = {
  id: string;
  name: string; // e.g. "DHL", "FedEx", "Aramex"
  percentage?: number;
  amount?: number; // fixed cost option
  enabled: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
};

export type DayEndRecord = {
  id: string;
  date: string;
  processedBy: string;
  shipmentCount: number;
  deliveredCount: number;
  exceptionCount: number;
  warehousePendingCount?: number;
  deliveryPendingCount?: number;
  bookingPendingCount?: number;
  totalFreight: number;
  totalTax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
};

/** Helper used by PDF generators and booking form */
export type ProformaInvoiceData = {
  awb: string;
  invoiceNumber: string;
  invoiceDate: string;
  accountCode?: string;
  shipper: Address;
  consignee: Address;
  preCarriageBy?: string;
  placeOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  countryOfOrigin: string;
  countryOfDestination: string;
  termOfDelivery?: string;
  otherReference?: string;
  csbType?: CSBType;
  exportReason?: ExportReason;
  items: InvoiceLineItem[];
  totalAmount: number;
  amountInWords: string;
  totalPieces: number;
  actualWeight: number;
  chargeableWeight: number;
  declaredValue: number;
};