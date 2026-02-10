import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await notificationService.markAllAsRead(user.userId);

    return NextResponse.json({
      message: 'All notifications marked as read',
      count: result.count,
    });
  } catch (err: any) {
    console.error('PATCH /api/notifications/read-all error:', err);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
