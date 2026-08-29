import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * PATCH /api/inquiries/[id]/reminders/[rid]
 * Update a reminder (mark complete, edit details). Owner or admin only.
 */
export const PATCH = withAuth<{ id: string; rid: string }>(
  async (req: NextRequest, user: JWTPayload, context?: { params: { id: string; rid: string } }) => {
    try {
      const { id: inquiryId, rid } = context?.params || {};
      if (!inquiryId || !rid) {
        return NextResponse.json({ success: false, message: 'Missing params', data: null }, { status: 400 });
      }

      const reminder = await (prisma as any).inquiryReminder.findUnique({
        where: { id: rid },
        include: { inquiry: { include: { property: { select: { ownerId: true } } } } },
      });

      if (!reminder || reminder.inquiryId !== inquiryId) {
        return NextResponse.json({ success: false, message: 'Reminder not found', data: null }, { status: 404 });
      }

      const isOwner = reminder.inquiry.property.ownerId === user.userId;
      const isAdmin = user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 403 });
      }

      const body = await req.json();
      const updateData: Record<string, unknown> = {};
      if (typeof body.isCompleted === 'boolean') updateData.isCompleted = body.isCompleted;
      if (typeof body.title === 'string') updateData.title = body.title;
      if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
      if (typeof body.note === 'string') updateData.note = body.note;

      const updated = await (prisma as any).inquiryReminder.update({
        where: { id: rid },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: 'Reminder updated',
        data: {
          id: updated.id,
          title: updated.title,
          scheduledAt: updated.scheduledAt.toISOString(),
          note: updated.note,
          remindOwner: updated.remindOwner,
          remindAdmin: updated.remindAdmin,
          isCompleted: updated.isCompleted,
          createdAt: updated.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('PATCH /inquiries/[id]/reminders/[rid]:', error);
      return NextResponse.json({ success: false, message: 'Internal server error', data: null }, { status: 500 });
    }
  },
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);
