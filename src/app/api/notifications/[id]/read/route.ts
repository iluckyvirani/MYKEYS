import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read
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
    const notification = await notificationService.markAsRead(id, user.userId);

    return NextResponse.json(notification);
  } catch (err: any) {
    console.error('PATCH /api/notifications/[id]/read error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to mark notification as read' },
      { status: err.message ? 400 : 500 }
    );
  }
}
