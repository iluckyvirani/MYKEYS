/**
 * Inquiry Types and Enums
 * Supports two inquiry types: LONG_RENT and BUY
 */

// ============= ENUMS =============

export enum InquiryStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  INTERESTED = 'INTERESTED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum InquiryType {
  LONG_RENT = 'LONG_RENT',
  BUY = 'BUY',
}

// ============= BASE INTERFACE =============

/**
 * BaseInquiry - Common fields for all inquiry types
 */
export interface BaseInquiry {
  // Identifiers
  id: string;
  propertyId: string;

  // Guest/Inquirer Information
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;

  // Inquiry Details
  message: string;
  status: InquiryStatus;

  // Owner Response
  ownerId: string;
  ownerResponse?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============= SPECIFIC INQUIRY TYPES =============

/**
 * LongRentInquiry - For long-term rental inquiries (months-based)
 */
export interface LongRentInquiry extends BaseInquiry {
  inquiryType: InquiryType.LONG_RENT;
  desiredStartDate: string; // ISO date string
  desiredDurationMonths: number;
  numberOfOccupants: number;
  
  // Pricing Information
  pricePerMonth?: number;
  minLeasePeriod?: number;
  maxLeasePeriod?: number;
  securityDeposit?: number;
  estimatedMonthlyTotal?: number; // pricePerMonth + utilities estimate
}

/**
 * BuyInquiry - For property purchase inquiries
 */
export interface BuyInquiry extends BaseInquiry {
  inquiryType: InquiryType.BUY;
  propertyPrice: number; // Total purchase price
}

// Type union for all inquiry types
export type Inquiry = LongRentInquiry | BuyInquiry;

// ============= REQUEST/RESPONSE TYPES =============

/**
 * Request to create a long-rent inquiry
 */
export interface CreateLongRentInquiryRequest {
  propertyId: string;
  desiredStartDate: string;
  desiredDurationMonths: number;
  numberOfOccupants: number;
  message?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

/**
 * Request to create a buy inquiry
 */
export interface CreateBuyInquiryRequest {
  propertyId: string;
  message?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

/**
 * Generic inquiry creation request (auto-detects type)
 */
export interface CreateInquiryRequest {
  propertyId: string;
  desiredStartDate?: string;
  desiredDurationMonths?: number;
  numberOfOccupants?: number;
  message?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

/**
 * Request to update inquiry status
 */
export interface UpdateInquiryStatusRequest {
  status: InquiryStatus;
  ownerResponse?: string;
}

/**
 * Single inquiry response
 */
export interface InquiryResponse {
  success: boolean;
  message: string;
  data: Inquiry | null;
}

/**
 * Paginated inquiry list response
 */
export interface InquiryListResponse {
  success: boolean;
  message: string;
  data: {
    items: Inquiry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Query filters for fetching inquiries
 */
export interface InquiryFilters {
  propertyId?: string;
  guestId?: string;
  ownerId?: string;
  status?: InquiryStatus;
  inquiryType?: InquiryType;
  page?: number;
  pageSize?: number;
}

// ============= LEGACY TYPE (for compatibility) =============

export type InquiryInput = {
  message: string;
}

// ============= BUY INQUIRY =============
export interface BuyInquiry extends BaseInquiry {
  inquiryType: InquiryType.BUY;
  propertyPrice: number;
}

export interface CreateBuyInquiryRequest {
  propertyId: string;
  userId?: string;
  assignedTo?: string;
};
