import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

const VALID_LABELS = [
  'Viewing arranged',
  'Viewing completed',
  'Suitable',
  'Maybe',
  'Rejected',
  'Waiting for paperwork',
  'No Label',
];

/**
 * PATCH /api/inquiries/[id]/label
 * Set or clear a label on an inquiry (owner sets ownerLabel, user sets userLabel).
 * Body: { label: string | null }
 */
export const PATCH = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required', data: null }, { status: 400 });
    }

    const body = await req.json();
    const label: string | null = body.label ?? null;

    if (label !== null && !VALID_LABELS.includes(label)) {
      return NextResponse.json(
        { success: false, message: `Invalid label. Must be one of: ${VALID_LABELS.join(', ')}`, data: null },
        { status: 400 }
      );
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

    const updated = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: isOwner ? { ownerLabel: label } : { userLabel: label },
    });

    return NextResponse.json({
      success: true,
      message: 'Label updated',
      data: { ownerLabel: updated.ownerLabel, userLabel: updated.userLabel },
    });
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json({ success: false, message: 'Failed to update label', data: null }, { status: 500 });
  }
});
