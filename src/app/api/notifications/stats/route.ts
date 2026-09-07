import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/notifications/stats
 * Get notification statistics for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await notificationService.getStats(user.userId);
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('GET /api/notifications/stats error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch notification statistics' },
      { status: 500 }
    );
  }
}
