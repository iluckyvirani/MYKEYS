import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
 * Query params: propertyId, userId, status, page, pageSize
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    const propertyId = searchParams.get('propertyId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (propertyId) where.propertyId = propertyId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    const mappedInquiries = inquiries.map((inquiry): any => {
      const baseInquiry = {
        id: inquiry.id,
        propertyId: inquiry.propertyId,
        propertyTitle: inquiry.property?.title || 'Unknown Property',
        guestId: inquiry.userId || '',
        guestName: inquiry.name || (inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : ''),
        guestEmail: inquiry.email,
        guestPhone: inquiry.phone || '',
        message: inquiry.message,
        status: inquiry.status,
        priority: inquiry.priority,
        createdAt: inquiry.createdAt.toISOString(),
        updatedAt: inquiry.updatedAt.toISOString(),
      };

      // Map to appropriate inquiry type
      if (inquiry.type === 'long_term') {
        return {
          ...baseInquiry,
          inquiryType: InquiryType.LONG_RENT,
          type: 'long_term',
          desiredStartDate: inquiry.createdAt.toISOString().split('T')[0],
          desiredDurationMonths: inquiry.duration ? parseInt(inquiry.duration) : 12,
          numberOfOccupants: 1,
          pricePerMonth: inquiry.budget || 0,
          minLeasePeriod: 12,
          maxLeasePeriod: 60,
          securityDeposit: (inquiry.budget || 0) * 1,
          ownerId: '',
        } as LongRentInquiry;
      } else {
        return {
          ...baseInquiry,
          inquiryType: InquiryType.BUY,
          type: 'purchase',
          propertyPrice: inquiry.budget || 0,
          ownerId: '',
        } as BuyInquiry;
      }
    });

    const response: InquiryListResponse = {
      success: true,
      message: 'Inquiries retrieved successfully',
      data: {
        items: mappedInquiries as any,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
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

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: 'name and email are required', data: null },
        { status: 400 }
      );
    }

    // Fetch property to verify it exists
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        listingType: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found', data: null },
        { status: 404 }
      );
    }

    // Determine inquiry type
    let inquiryType = 'purchase';
    if (body.desiredStartDate && body.desiredDurationMonths) {
      inquiryType = 'long_term';
    } else if (property.listingType !== 'BUY') {
      inquiryType = 'long_term';
    }

    // Create inquiry in database
    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: body.propertyId,
        message: body.message,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        type: inquiryType,
        duration: body.desiredDurationMonths?.toString() || null,
        budget: body.budget || null,
        status: 'NEW',
        userId: body.userId || null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    const response: InquiryResponse = {
      success: true,
      message: 'Inquiry created successfully',
      data: {
        id: inquiry.id,
        propertyId: inquiry.propertyId,
        propertyTitle: inquiry.property.title,
        guestId: inquiry.userId || '',
        guestName: inquiry.name,
        guestEmail: inquiry.email,
        guestPhone: inquiry.phone || '',
        message: inquiry.message,
        status: inquiry.status as InquiryStatus,
        type: inquiry.type,
        createdAt: inquiry.createdAt.toISOString(),
        updatedAt: inquiry.updatedAt.toISOString(),
      } as any,
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
