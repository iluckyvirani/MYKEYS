export type DocumentType = 
  | "PAN_CARD"
  | "AADHAR_CARD"
  | "DRIVING_LICENSE"
  | "PASSPORT"
  | "VOTER_ID"
  | "PROPERTY_LICENSE"
  | "BUSINESS_LICENSE"
  | "GST_CERTIFICATE"
  | "TAX_IDENTIFICATION"
  | "RENTAL_AGREEMENT_TEMPLATE";

export type DocumentStatus = 
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export interface Document {
  id: string;
  documentType: DocumentType;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  status: DocumentStatus;
  verifiedNotes?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  documentType: DocumentType;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  documentUrl: string; // URL from Cloudinary (not base64)
  expiresAt?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PAN_CARD: "PAN Card",
  AADHAR_CARD: "Aadhar Card",
  DRIVING_LICENSE: "Driving License",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  PROPERTY_LICENSE: "Property License",
  BUSINESS_LICENSE: "Business License",
  GST_CERTIFICATE: "GST Certificate",
  TAX_IDENTIFICATION: "Tax ID",
  RENTAL_AGREEMENT_TEMPLATE: "Rental Agreement",
};

export const USER_REQUIRED_DOCUMENTS: DocumentType[] = [
  "PAN_CARD",
  "AADHAR_CARD",
];

export const USER_OPTIONAL_DOCUMENTS: DocumentType[] = [
  "DRIVING_LICENSE",
  "PASSPORT",
  "VOTER_ID",
];

export const OWNER_REQUIRED_DOCUMENTS: DocumentType[] = [
  "PROPERTY_LICENSE",
  "TAX_IDENTIFICATION",
];

export const OWNER_OPTIONAL_DOCUMENTS: DocumentType[] = [
  "BUSINESS_LICENSE",
  "GST_CERTIFICATE",
  "RENTAL_AGREEMENT_TEMPLATE",
];
