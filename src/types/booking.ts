// Booking Type Definitions
// Covers: Short Rent (nights), Long Rent (months), Buy (inquiry only)

// ============= ENUMS =============
export enum BookingStatus {
  PENDING = "PENDING",      // Initial state, awaiting confirmation
  CONFIRMED = "CONFIRMED",  // Owner accepted
  COMPLETED = "COMPLETED",  // Check-out completed
  CANCELLED = "CANCELLED",  // Cancelled by guest or owner
}

export enum PaymentStatus {
  PENDING = "PENDING",       // Payment not received
  PARTIAL = "PARTIAL",       // Partial payment received
  PAID = "PAID",            // Full payment received
  REFUNDED = "REFUNDED",    // Refund issued
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  UPI = "UPI",
  BANK_TRANSFER = "BANK_TRANSFER",
  WALLET = "WALLET",
}

export enum BookingType {
  SHORT_TERM = "SHORT_TERM",  // Night-based booking (vacation rental)
  LONG_TERM = "LONG_TERM",    // Month-based booking (rental)
}

// ============= SHORT STAY BOOKING (NIGHTS) =============
export interface CreateShortBookingRequest {
  propertyId: string;
  checkInDate: string;           // ISO date format
  checkOutDate: string;          // ISO date format
  numberOfGuests: number;        // Must not exceed property.maxGuests
  specialRequests?: string;      // Optional guest requests
  paymentMethod: PaymentMethod;
}

export interface ShortBookingDTO {
  id: string;
  bookingType: BookingType.SHORT_TERM;
  propertyId: string;
  propertyTitle: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  
  // Dates & Duration
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;       // Calculated from dates
  numberOfGuests: number;
  
  // Pricing (per night)
  pricePerNight: number;
  totalNights: number;
  subtotal: number;             // pricePerNight * totalNights
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  balanceAmount: number;
  
  // Status & Management
  status: BookingStatus;
  specialRequests?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  checkInStatus?: "pending" | "checked_in" | "checked_out";
}

// ============= LONG RENT BOOKING (MONTHS) =============
export interface CreateLongRentInquiryRequest {
  propertyId: string;
  desiredStartDate: string;      // ISO date format
  desiredDurationMonths: number; // Must be within property minLease to maxLease
  numberOfOccupants: number;
  message: string;               // Inquiry message
}

export interface LongRentInquiryDTO {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  
  // Inquiry Details
  desiredStartDate: string;
  desiredDurationMonths: number;
  numberOfOccupants: number;
  
  // Pricing (per month)
  pricePerMonth: number;
  minLeasePeriod: number;        // Property's minLease in months
  maxLeasePeriod?: number;       // Property's maxLease in months
  securityDeposit: number;       // Usually 1-1.5 months rent
  estimatedMonthlyTotal: number; // pricePerMonth * desiredDurationMonths
  
  // Status
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" | "CLOSED";
  
  // Messages
  message: string;               // Initial inquiry message
  ownerResponse?: string;        // Owner's response message
  
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============= BUY PROPERTY INQUIRY =============
export interface CreateBuyInquiryRequest {
  propertyId: string;
  message: string;
}

export interface BuyInquiryDTO {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  
  // Property Details
  propertyPrice: number;
  
  // Status
  status: "PENDING" | "REVIEWED" | "INTERESTED" | "REJECTED" | "CLOSED";
  
  // Messages
  message: string;
  ownerResponse?: string;
  
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============= UNIFIED RESPONSE TYPES =============
export interface BookingResponse {
  success: boolean;
  message: string;
  data: ShortBookingDTO;
}

export interface InquiryResponse<T = LongRentInquiryDTO | BuyInquiryDTO> {
  success: boolean;
  message: string;
  data: T;
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    items: ShortBookingDTO[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface InquiryListResponse<T = LongRentInquiryDTO | BuyInquiryDTO> {
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

// ============= OWNER ACTIONS =============
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  notes?: string;
}

export interface UpdateBookingStatusResponse {
  success: boolean;
  message: string;
  data: ShortBookingDTO;
}

export interface UpdateInquiryRequest {
  status: "REVIEWED" | "ACCEPTED" | "REJECTED" | "CLOSED";
  ownerResponse: string;
}

export interface UpdateInquiryResponse<T = LongRentInquiryDTO | BuyInquiryDTO> {
  success: boolean;
  message: string;
  data: T;
}

// ============= QUERY FILTERS =============
export interface BookingFilters {
  propertyId?: string;
  guestId?: string;
  ownerId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  from?: string;  // ISO date
  to?: string;    // ISO date
  page?: number;
  pageSize?: number;
}

export interface InquiryFilters {
  propertyId?: string;
  guestId?: string;
  ownerId?: string;
  status?: string;
  inquiryType?: "long_rent" | "buy";
  page?: number;
  pageSize?: number;
}
