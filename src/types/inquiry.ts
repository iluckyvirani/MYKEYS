// Inquiry Type Definitions - Complete Schema
// Covers: Long Rent Inquiries and Buy Property Inquiries

// ============= ENUMS =============
export enum InquiryStatus {
  PENDING = "PENDING",        // Just received
  REVIEWED = "REVIEWED",      // Owner read it
  INTERESTED = "INTERESTED",  // Owner interested
  REJECTED = "REJECTED",      // Owner declined
  CLOSED = "CLOSED",          // Inquiry concluded
}

export enum InquiryType {
  LONG_RENT = "LONG_RENT",
  BUY = "BUY",
}

// ============= UNIFIED INQUIRY BASE =============
export interface BaseInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number;     // For buy inquiries
  
  // User Details
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  
  // Owner Details
  ownerId: string;
  
  // Message Thread
  message: string;            // Initial inquiry
  ownerResponse?: string;     // Owner's response
  
  // Status & Metadata
  status: InquiryStatus;
  inquiryType: InquiryType;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  
  // Additional
  priority?: "HIGH" | "MEDIUM" | "LOW";
  tags?: string[];
  followUpDate?: string;
}

// ============= LONG RENT INQUIRY =============
export interface LongRentInquiry extends BaseInquiry {
  inquiryType: InquiryType.LONG_RENT;
  desiredStartDate: string;
  desiredDurationMonths: number;
  numberOfOccupants: number;
  pricePerMonth: number;
  minLeasePeriod: number;
  maxLeasePeriod?: number;
  securityDeposit: number;
}

export interface CreateLongRentInquiryRequest {
  propertyId: string;
  desiredStartDate: string;
  desiredDurationMonths: number;
  numberOfOccupants: number;
  message: string;
}

// ============= BUY INQUIRY =============
export interface BuyInquiry extends BaseInquiry {
  inquiryType: InquiryType.BUY;
  propertyPrice: number;
}

export interface CreateBuyInquiryRequest {
  propertyId: string;
  message: string;
}

// ============= UPDATE INQUIRIES =============
export interface UpdateInquiryRequest {
  status?: string;
  ownerResponse?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  tags?: string[];
  followUpDate?: string;
}

// ============= RESPONSE TYPES =============
export interface InquiryResponse<T extends BaseInquiry = BaseInquiry> {
  success: boolean;
  message: string;
  data: T;
}

export interface InquiryListResponse<T extends BaseInquiry = BaseInquiry> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============= FILTERS =============
export interface InquiryFilters {
  propertyId?: string;
  guestId?: string;
  ownerId?: string;
  status?: InquiryStatus;
  inquiryType?: InquiryType;
  page?: number;
  pageSize?: number;
}
