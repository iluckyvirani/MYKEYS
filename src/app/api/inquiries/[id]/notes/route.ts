import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * GET /api/inquiries/[id]/notes
 * Fetch notes for an inquiry
 */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    // Verify inquiry exists and user has access
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found', data: null },
        { status: 404 }
      );
    }

    // Only owner or admin can view notes
    const isOwner = inquiry.property.ownerId === user.userId;
    const isAdmin = (user as any).role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 403 }
      );
    }

    // Return the single note for this owner (most recent)
    const note: any = await (prisma as any).inquiryNote.findFirst({
      where: { inquiryId, createdBy: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Note retrieved successfully',
        data: note ? { id: note.id, content: note.content, createdAt: note.createdAt.toISOString() } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notes', data: null },
      { status: 500 }
    );
  }
});

/**
 * POST /api/inquiries/[id]/notes
 * Create a note for an inquiry
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const { id: inquiryId } = context?.params || {};

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Note content is required', data: null },
        { status: 400 }
      );
    }

    // Verify inquiry exists and user has access
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found', data: null },
        { status: 404 }
      );
    }

    // Only owner or admin can create notes
    const isOwnerPost = inquiry.property.ownerId === user.userId;
    const isAdminPost = (user as any).role === 'ADMIN';
    if (!isOwnerPost && !isAdminPost) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 403 }
      );
    }

    // Upsert: update existing note or create a new one
    const existing: any = await (prisma as any).inquiryNote.findFirst({
      where: { inquiryId, createdBy: user.userId },
    });

    const note = existing
      ? await (prisma as any).inquiryNote.update({
          where: { id: existing.id },
          data: { content: body.content },
        })
      : await (prisma as any).inquiryNote.create({
          data: { inquiryId, content: body.content, createdBy: user.userId },
        });

    return NextResponse.json(
      {
        success: true,
        message: 'Note saved successfully',
        data: {
          id: note.id,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create note', data: null },
      { status: 500 }
    );
  }
});
