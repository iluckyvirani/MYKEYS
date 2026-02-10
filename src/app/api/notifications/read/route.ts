import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * DELETE /api/notifications/read
 * Delete all read notifications for the authenticated user
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await notificationService.deleteRead(user.userId);

    return NextResponse.json({
      message: 'Read notifications deleted successfully',
      count: result.count,
    });
  } catch (err: any) {
    console.error('DELETE /api/notifications/read error:', err);
    return NextResponse.json(
      { error: 'Failed to delete read notifications' },
      { status: 500 }
    );
  }
}
