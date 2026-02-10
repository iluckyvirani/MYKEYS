import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(user.userId);
    return NextResponse.json({ unreadCount: count });
  } catch (err: any) {
    console.error('GET /api/notifications/unread-count error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
