import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
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
import { notificationService } from '@/lib/notifications/notificationService';
import { emailService } from '@/lib/email/emailService';

/**
 * GET /api/inquiries
 * Fetch inquiries with filters
 * Query params: propertyId, ownerId, status, page, pageSize, search, forOwner,
 *               tab (all|inbox|sent|unread|not-replied|deleted), label, sortBy, sortOrder
 */
export const GET = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    const propertyId = searchParams.get('propertyId');
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const forOwner = searchParams.get('forOwner') === 'true';
    const tab = searchParams.get('tab') || 'all';
    const labelFilter = searchParams.get('label');
    const sortBy = searchParams.get('sortBy') || 'lastMessageAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    if (ownerId || forOwner) {
      // Check if owner's active package routes inquiries to admin instead of owner
      const activePkg = await prisma.ownerPackage.findFirst({
        where: { ownerId: user.userId, status: 'ACTIVE', endDate: { gt: new Date() } },
        include: { package: { select: { directInquiryToOwner: true } } },
      });
      if (activePkg && !activePkg.package.directInquiryToOwner) {
        // fullAdminSupport package: admin handles all inquiries, owner sees none
        return NextResponse.json({
          success: true,
          message: 'Inquiries are managed by admin for your current package',
          data: { items: [], total: 0, page, pageSize, totalPages: 0 },
        });
      }
      // Owner inbox mode
      where.property = { ownerId: user.userId };
      // Tab filtering for owner
      if (tab === 'deleted') {
        where.isDeletedByOwner = true;
      } else {
        where.isDeletedByOwner = false;
        if (tab === 'unread') where.unreadByOwner = { gt: 0 };
        if (labelFilter && labelFilter !== 'all') where.ownerLabel = labelFilter;
      }
    } else {
      // User inbox mode
      where.userId = user.userId;
      if (propertyId) where.propertyId = propertyId;
      // Tab filtering for user
      if (tab === 'deleted') {
        where.isDeletedByUser = true;
      } else {
        where.isDeletedByUser = false;
        if (tab === 'unread') where.unreadByUser = { gt: 0 };
        if (tab === 'not-replied') where.unreadByUser = { gt: 0 }; // last msg not from user
        if (labelFilter && labelFilter !== 'all') where.userLabel = labelFilter;
      }
    }
    
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { property: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orderByMap: Record<string, any> = {
      lastMessageAt: { lastMessageAt: sortOrder },
      createdAt: { createdAt: sortOrder },
    };
    const orderBy = orderByMap[sortBy] || { lastMessageAt: sortOrder };

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, createdAt: true, senderRole: true },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    const mappedInquiries = inquiries.map((inquiry: any): any => {
      const lastMsg = inquiry.messages?.[0];
      const ownerUser = inquiry.property?.owner;
      return {
        id: inquiry.id,
        propertyId: inquiry.propertyId,
        propertyTitle: inquiry.property?.title || 'Unknown Property',
        guestId: inquiry.userId || '',
        guestName: inquiry.name || (inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : ''),
        guestEmail: inquiry.email,
        guestPhone: inquiry.phone || '',
        guestAvatar: inquiry.user?.avatar || null,
        ownerName: ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}` : '',
        ownerAvatar: ownerUser?.avatar || null,
        ownerId: ownerUser?.id || '',
        message: inquiry.message,
        lastMessage: lastMsg?.content || inquiry.message || '',
        lastMessageAt: inquiry.lastMessageAt?.toISOString() || inquiry.updatedAt?.toISOString() || inquiry.createdAt.toISOString(),
        lastMessageRole: lastMsg?.senderRole || 'USER',
        response: inquiry.response,
        status: inquiry.status,
        priority: inquiry.priority,
        type: inquiry.type || 'general',
        inquiryType: inquiry.type === 'long_term' ? 'LONG_RENT' : 'BUY',
        budget: inquiry.budget,
        userLabel: inquiry.userLabel || null,
        ownerLabel: inquiry.ownerLabel || null,
        unreadByUser: inquiry.unreadByUser || 0,
        unreadByOwner: inquiry.unreadByOwner || 0,
        unreadByAdmin: inquiry.unreadByAdmin || 0,
        isDeletedByUser: inquiry.isDeletedByUser || false,
        isDeletedByOwner: inquiry.isDeletedByOwner || false,
        createdAt: inquiry.createdAt.toISOString(),
        updatedAt: inquiry.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiries retrieved successfully',
      data: {
        items: mappedInquiries,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiries', data: null },
      { status: 500 }
    );
  }
});


/**
 * POST /api/inquiries
 * Create a new inquiry (long-rent or buy)
 * Body: CreateLongRentInquiryRequest | CreateBuyInquiryRequest
 */
export const POST = withAuth(async (req: NextRequest, user: JWTPayload) => {
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

    // Fetch property to verify it exists and get owner info
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        listingType: true,
        ownerId: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found', data: null },
        { status: 404 }
      );
    }

    // Check if user is trying to create an inquiry for their own property
    if (property.ownerId === user.userId) {
      return NextResponse.json(
        { success: false, message: 'You cannot create an inquiry for your own property', data: null },
        { status: 403 }
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
        duration: body.duration?.toString() || null,
        budget: body.budget || null,
        status: 'NEW',
        userId: user.userId,
        lastMessageAt: new Date(),
        lastMessageBy: user.userId,
        unreadByOwner: 1,
        unreadByAdmin: 1,
        messages: {
          create: {
            content: body.message,
            messageType: 'TEXT',
            senderRole: 'USER',
            senderId: user.userId,
            readBy: [user.userId],
          },
        },
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

    // Check owner's active package: in-app notification routing
    const ownerActivePkg = await prisma.ownerPackage.findFirst({
      where: { ownerId: property.ownerId, status: 'ACTIVE', endDate: { gt: new Date() } },
      include: { package: { select: { directInquiryToOwner: true, fullAdminSupport: true, adminCCOnInquiry: true } } },
    });
    const directToOwner = !ownerActivePkg || ownerActivePkg.package.directInquiryToOwner;
    const adminCcOnInquiry = Boolean(ownerActivePkg?.package.adminCCOnInquiry);

    // In-app notification to property owner when package allows direct inquiries
    if (directToOwner) {
      try {
        await notificationService.createInquiryNotification(
          property.ownerId,
          {
            inquiryId: inquiry.id,
            propertyTitle: property.title,
            propertyId: property.id,
            inquirerName: body.name,
            inquiryType: inquiryType,
          }
        );
      } catch (notifErr) {
        console.error('Failed to send inquiry notification (non-fatal):', notifErr);
      }
    }

    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { firstName: true, lastName: true, email: true },
    });

    // Confirmation email to tenant/guest (always)
    try {
      await emailService.sendInquiryConfirmationEmail(
        body.email,
        body.name,
        property.title,
        {
          message: body.message,
          propertyId: property.id,
          inquiryId: inquiry.id,
        }
      );
    } catch (emailErr) {
      console.error('Failed to send inquiry confirmation email (non-fatal):', emailErr);
    }

    // Alert email to property owner (always — same branded layout)
    if (owner?.email) {
      try {
        await emailService.sendNewInquiryNotificationEmail(
          owner.email,
          `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'there',
          body.name,
          property.title,
          inquiry.id,
          {
            message: body.message,
            inquirerEmail: body.email,
            inquirerPhone: body.phone || undefined,
            propertyId: property.id,
          }
        );
      } catch (emailErr) {
        console.error('Failed to send owner inquiry notification email (non-fatal):', emailErr);
      }
    }

    // Optional admin CC when package enables it
    if (adminCcOnInquiry) {
      const adminEmail =
        process.env.EMAIL_CC?.trim() ||
        process.env.EMAIL_USER?.trim() ||
        process.env.EMAIL_FROM?.replace(/.*<([^>]+)>.*/, '$1').trim();
      if (adminEmail && adminEmail !== owner?.email) {
        try {
          await emailService.sendNewInquiryNotificationEmail(
            adminEmail,
            'Admin',
            body.name,
            property.title,
            inquiry.id,
            {
              message: body.message,
              inquirerEmail: body.email,
              inquirerPhone: body.phone || undefined,
              propertyId: property.id,
            }
          );
        } catch (emailErr) {
          console.error('Failed to send admin CC inquiry email (non-fatal):', emailErr);
        }
      }
    }

    // In-app thank-you notification for the tenant
    try {
      await notificationService.createSystemNotification(
        user.userId,
        'Thank You for Your Inquiry!',
        `Your inquiry about "${property.title}" has been received. The owner will respond soon.`
      );
    } catch (notifErr) {
      console.error('Failed to send user system notification (non-fatal):', notifErr);
    }

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
        response: inquiry.response,
        status: inquiry.status as InquiryStatus,
        type: inquiry.type,
        duration: inquiry.duration,
        budget: inquiry.budget,
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
});
