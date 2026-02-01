import { NextRequest, NextResponse } from 'next/server';
import { 
  CreateLongRentInquiryRequest,
  CreateBuyInquiryRequest,
  InquiryResponse,
  InquiryListResponse,
  InquiryFilters,
  LongRentInquiry,
  BuyInquiry,
  InquiryStatus,
  InquiryType,
} from '@/types/inquiry';

/**
 * GET /api/inquiries
 * Fetch inquiries with filters
 * Query params: propertyId, guestId, ownerId, status, inquiryType, page, pageSize
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters: InquiryFilters = {
      propertyId: searchParams.get('propertyId') || undefined,
      guestId: searchParams.get('guestId') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      status: searchParams.get('status') as any || undefined,
      inquiryType: searchParams.get('inquiryType') as any || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    };

    // TODO: Query database with filters
    // const inquiries = await inquiryService.getInquiries(filters);

    const response: InquiryListResponse = {
      success: true,
      message: 'Inquiries retrieved successfully',
      data: {
        items: [],
        total: 0,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
        totalPages: 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiries', data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inquiries
 * Create a new inquiry (long-rent or buy)
 * Body: CreateLongRentInquiryRequest | CreateBuyInquiryRequest
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.propertyId || !body.message) {
      return NextResponse.json(
        { success: false, message: 'propertyId and message are required', data: null },
        { status: 400 }
      );
    }

    // Determine inquiry type
    let inquiry: LongRentInquiry | BuyInquiry;

    if (body.desiredStartDate && body.desiredDurationMonths) {
      // Long-rent inquiry
      const longRentBody = body as CreateLongRentInquiryRequest;

      inquiry = {
        id: `INQ-LONG-${Date.now()}`,
        propertyId: longRentBody.propertyId,
        propertyTitle: 'Sample Property',
        guestId: 'USER-1', // TODO: From auth
        guestName: 'Guest Name',
        guestEmail: 'guest@example.com',
        guestPhone: '1234567890',
        ownerId: 'OWNER-1',
        message: longRentBody.message,
        status: InquiryStatus.PENDING,
        inquiryType: InquiryType.LONG_RENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        desiredStartDate: longRentBody.desiredStartDate,
        desiredDurationMonths: longRentBody.desiredDurationMonths,
        numberOfOccupants: longRentBody.numberOfOccupants,
        pricePerMonth: 50000, // TODO: From property
        minLeasePeriod: 12,    // TODO: From property
        maxLeasePeriod: 24,    // TODO: From property
        securityDeposit: 50000, // Usually 1 month
      } as LongRentInquiry;
    } else {
      // Buy inquiry
      const buyBody = body as CreateBuyInquiryRequest;

      inquiry = {
        id: `INQ-BUY-${Date.now()}`,
        propertyId: buyBody.propertyId,
        propertyTitle: 'Sample Property',
        propertyPrice: 2500000, // TODO: From property
        guestId: 'USER-1', // TODO: From auth
        guestName: 'Guest Name',
        guestEmail: 'guest@example.com',
        guestPhone: '1234567890',
        ownerId: 'OWNER-1',
        message: buyBody.message,
        status: InquiryStatus.PENDING,
        inquiryType: InquiryType.BUY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BuyInquiry;
    }

    // TODO:
    // 1. Fetch property details
    // 2. Save inquiry to database
    // 3. Send notification email to owner
    // 4. Send confirmation email to guest

    const response: InquiryResponse = {
      success: true,
      message: 'Inquiry created successfully',
      data: inquiry,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create inquiry', data: null },
      { status: 500 }
    );
  }
}
