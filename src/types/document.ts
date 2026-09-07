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
  | "RENTAL_AGREEMENT_TEMPLATE"
  // Service provider documents
  | "SERVICE_CERTIFICATE"
  | "SERVICE_LICENSE"
  | "SERVICE_SKILL_CERTIFICATE"
  | "SERVICE_EXPERIENCE_LETTER"
  | "SERVICE_TRAINING_CERTIFICATE";

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
  // Service provider documents
  SERVICE_CERTIFICATE: "Service Certificate",
  SERVICE_LICENSE: "Service/Trade License",
  SERVICE_SKILL_CERTIFICATE: "Skill Certificate",
  SERVICE_EXPERIENCE_LETTER: "Experience Letter",
  SERVICE_TRAINING_CERTIFICATE: "Training Certificate",
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

export const SERVICE_REQUIRED_DOCUMENTS: DocumentType[] = [
  "SERVICE_CERTIFICATE",
  "AADHAR_CARD",
];

export const SERVICE_OPTIONAL_DOCUMENTS: DocumentType[] = [
  "SERVICE_LICENSE",
  "SERVICE_SKILL_CERTIFICATE",
  "SERVICE_EXPERIENCE_LETTER",
  "SERVICE_TRAINING_CERTIFICATE",
];
