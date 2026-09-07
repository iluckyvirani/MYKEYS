import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * DELETE /api/inquiries/[id]/notes/[noteId]
 * Delete a note
 */
export const DELETE = withAuth<{ id: string; noteId: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string; noteId: string } }) => {
  try {
    const { id: inquiryId, noteId } = context?.params || {};

    if (!inquiryId || !noteId) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID and Note ID are required', data: null },
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

    // Only owner can delete notes
    if (inquiry.property.ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 403 }
      );
    }

    // Verify note exists and belongs to this inquiry
    const note = await (prisma as any).inquiryNote.findUnique({
      where: { id: noteId },
    });

    if (!note || note.inquiryId !== inquiryId) {
      return NextResponse.json(
        { success: false, message: 'Note not found', data: null },
        { status: 404 }
      );
    }

    await (prisma as any).inquiryNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json(
      { success: true, message: 'Note deleted successfully', data: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete note', data: null },
      { status: 500 }
    );
  }
});
