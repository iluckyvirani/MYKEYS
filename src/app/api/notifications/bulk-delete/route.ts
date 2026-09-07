import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * POST /api/notifications/bulk-delete
 * Bulk delete notifications
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds array is required' },
        { status: 400 }
      );
    }

    const result = await notificationService.bulkDelete(notificationIds, user.userId);

    return NextResponse.json({
      message: 'Notifications deleted successfully',
      count: result.count,
    });
  } catch (err: any) {
    console.error('POST /api/notifications/bulk-delete error:', err);
    return NextResponse.json(
      { error: 'Failed to bulk delete notifications' },
      { status: 500 }
    );
  }
}
