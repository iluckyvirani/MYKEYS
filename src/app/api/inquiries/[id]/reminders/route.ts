import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * GET /api/inquiries/[id]/reminders
 * Get reminders for an inquiry (owner/admin only).
 */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
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

    // Only owner can manage reminders
    if (inquiry.property.ownerId !== user.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 403 });
    }

    const reminders = await (prisma as any).inquiryReminder.findMany({
      where: { inquiryId },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Reminders retrieved',
      data: reminders.map((r: any) => ({
        id: r.id,
        title: r.title,
        scheduledAt: r.scheduledAt.toISOString(),
        note: r.note,
        remindOwner: r.remindOwner,
        remindAdmin: r.remindAdmin,
        isCompleted: r.isCompleted,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch reminders', data: null }, { status: 500 });
  }
});

/**
 * POST /api/inquiries/[id]/reminders
 * Create a reminder for an inquiry (owner only).
 * Body: { title, scheduledAt, note?, remindOwner?, remindAdmin? }
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required', data: null }, { status: 400 });
    }

    const body = await req.json();
    const { title, scheduledAt, note, remindOwner = true, remindAdmin = false } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: 'Reminder title is required', data: null }, { status: 400 });
    }

    if (!scheduledAt) {
      return NextResponse.json({ success: false, message: 'Scheduled date/time is required', data: null }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });
    }

    if (inquiry.property.ownerId !== user.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized — only the owner can set reminders', data: null }, { status: 403 });
    }

    const reminder = await (prisma as any).inquiryReminder.create({
      data: {
        title: title.trim(),
        scheduledAt: new Date(scheduledAt),
        note: note?.trim() || null,
        remindOwner,
        remindAdmin,
        inquiryId,
        createdById: user.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reminder created',
      data: {
        id: reminder.id,
        title: reminder.title,
        scheduledAt: reminder.scheduledAt.toISOString(),
        note: reminder.note,
        remindOwner: reminder.remindOwner,
        remindAdmin: reminder.remindAdmin,
        isCompleted: reminder.isCompleted,
        createdAt: reminder.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ success: false, message: 'Failed to create reminder', data: null }, { status: 500 });
  }
});
