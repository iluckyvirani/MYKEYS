import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * PATCH /api/notifications/[id]/unread
 * Mark a notification as unread
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const notification = await notificationService.markAsUnread(id, user.userId);

    return NextResponse.json(notification);
  } catch (err: any) {
    console.error('PATCH /api/notifications/[id]/unread error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to mark notification as unread' },
      { status: err.message ? 400 : 500 }
    );
  }
}
