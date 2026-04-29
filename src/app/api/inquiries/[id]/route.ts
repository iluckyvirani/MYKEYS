import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { UpdateInquiryStatusRequest, InquiryResponse, InquiryType, LongRentInquiry, InquiryStatus } from '@/types/inquiry';
import { notificationService } from '@/lib/notifications/notificationService';
import { emailService } from '@/lib/email/emailService';

/**
 * GET /api/inquiries/{id}
 * Fetch a specific inquiry by ID
 */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id } = context?.params!

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found', data: null },
        { status: 404 }
      );
    }

    // Verify user is either the inquirer or the property owner
    if (inquiry.userId !== user.userId && inquiry.property?.ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 403 }
      );
    }

    const mappedInquiry = {
      id: inquiry.id,
      propertyId: inquiry.propertyId,
      propertyTitle: inquiry.property?.title || 'Unknown Property',
      guestId: inquiry.userId || '',
      guestName: inquiry.name || (inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : ''),
      guestEmail: inquiry.email,
      guestPhone: inquiry.phone || '',
      message: inquiry.message,
      ownerResponse: (inquiry as any).response,
      status: inquiry.status as InquiryStatus,
      priority: inquiry.priority,
      type: inquiry.type,
      duration: inquiry.duration,
      budget: inquiry.budget,
      createdAt: inquiry.createdAt.toISOString(),
      updatedAt: inquiry.updatedAt.toISOString(),
    };

    const response: InquiryResponse = {
      success: true,
      message: 'Inquiry retrieved successfully',
      data: mappedInquiry as any,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiry', data: null },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/inquiries/{id}
 * Update inquiry status with owner response (owner action)
 * Only owner can update inquiry status
 * Body: UpdateInquiryRequest
 */
export const PATCH = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id } = context?.params!
    const body: any = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    if (!body.status && !body.priority && !body.response) {
      return NextResponse.json(
        { success: false, message: 'status, priority, or response is required', data: null },
        { status: 400 }
      );
    }

    // Fetch inquiry from database
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            ownerId: true,
            title: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found', data: null },
        { status: 404 }
      );
    }

    // Verify user is the property owner
    if (inquiry.property?.ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only property owner can update inquiry status', data: null },
        { status: 403 }
      );
    }

    // Update inquiry status, priority, and response
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.priority) {
      updateData.priority = body.priority;
    }

    if (body.response) {
      updateData.response = body.response;
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            title: true,
            ownerId: true,
          },
        },
      },
    });

    // Send notification and email to guest when owner responds
    if (body.response && inquiry.user) {
      // Create notification for the guest
      await notificationService.createSystemNotification(
        inquiry.userId || '',
        'Response to Your Inquiry!',
        `The property owner has responded to your inquiry about "${updatedInquiry.property?.title || 'the property'}"`,
      );

      // Get owner info to send in email
      const owner = await prisma.user.findUnique({
        where: { id: inquiry.property?.ownerId },
        select: { firstName: true, lastName: true },
      });

      // Send response email to guest
      await emailService.sendInquiryResponseEmail(
        inquiry.user.email,
        `${inquiry.user.firstName} ${inquiry.user.lastName}`,
        owner ? `${owner.firstName} ${owner.lastName}` : 'Property Owner',
        updatedInquiry.property?.title || 'the property',
        body.response,
        id
      );
    }

    const mappedInquiry = {
      id: updatedInquiry.id,
      propertyId: updatedInquiry.propertyId,
      propertyTitle: updatedInquiry.property?.title || 'Unknown Property',
      guestId: updatedInquiry.userId || '',
      guestName: updatedInquiry.name || (inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : ''),
      guestEmail: updatedInquiry.email,
      guestPhone: updatedInquiry.phone || '',
      message: updatedInquiry.message,
      response: updatedInquiry.response,
      status: updatedInquiry.status as InquiryStatus,
      priority: updatedInquiry.priority,
      createdAt: updatedInquiry.createdAt.toISOString(),
      updatedAt: updatedInquiry.updatedAt.toISOString(),
    };

    const response: InquiryResponse = {
      success: true,
      message: `Inquiry status updated to ${body.status}`,
      data: mappedInquiry as any,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update inquiry', data: null },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/inquiries/{id}
 * Close/delete an inquiry
 * Can be done by guest (original inquirer) or owner
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    // TODO:
    // 1. Verify user is either the guest or owner
    // 2. Mark inquiry as CLOSED instead of actually deleting
    // 3. Send notification email to both parties

    return NextResponse.json(
      { success: true, message: 'Inquiry closed successfully', data: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error closing inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to close inquiry', data: null },
      { status: 500 }
    );
  }
}
