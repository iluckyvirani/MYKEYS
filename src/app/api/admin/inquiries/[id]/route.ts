import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * PATCH /api/admin/inquiries/[id]
 * Admin force-change status or assign actions on any inquiry thread.
 * Body: { status?, priority? }
 */
export const PATCH = withAuth<{ id: string }>(
  async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
    try {
      const { id } = context?.params || {};
      if (!id) {
        return NextResponse.json({ success: false, message: 'Inquiry ID required', data: null }, { status: 400 });
      }

      const inquiry = await prisma.inquiry.findUnique({ where: { id } });
      if (!inquiry) {
        return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });
      }

      const body = await req.json();
      const updateData: Record<string, unknown> = {};
      if (body.status) updateData.status = body.status;
      if (body.priority) updateData.priority = body.priority;

      const updated = await prisma.inquiry.update({ where: { id }, data: updateData });

      return NextResponse.json({
        success: true,
        message: 'Inquiry updated',
        data: {
          id: updated.id,
          status: updated.status,
          priority: updated.priority,
        },
      });
    } catch (error) {
      console.error('PATCH /api/admin/inquiries/[id]:', error);
      return NextResponse.json({ success: false, message: 'Internal server error', data: null }, { status: 500 });
    }
  },
  { roles: [UserRole.ADMIN] }
);
