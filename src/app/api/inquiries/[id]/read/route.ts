import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * PATCH /api/inquiries/[id]/read
 * Mark all messages as read for the current user and reset their unread counter.
 */
export const PATCH = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required', data: null }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });
    }

    const isOwner = inquiry.property.ownerId === user.userId;
    const isUser = inquiry.userId === user.userId;

    if (!isOwner && !isUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 403 });
    }

    // Reset the unread counter for the calling party
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: isOwner ? { unreadByOwner: 0 } : { unreadByUser: 0 },
    });

    // Mark all unread messages as read by this user in a single query
    await prisma.inquiryMessage.updateMany({
      where: {
        inquiryId,
        NOT: { readBy: { has: user.userId } },
      },
      data: { readBy: { push: user.userId } },
    });

    return NextResponse.json({ success: true, message: 'Marked as read', data: null });
  } catch (error) {
    console.error('Error marking as read:', error);
    return NextResponse.json({ success: false, message: 'Failed to mark as read', data: null }, { status: 500 });
  }
});
