import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/notifications/[id]
 * Get a single notification by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const notification = await notificationService.getById(id);

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Ensure user owns this notification
    if (notification.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(notification);
  } catch (err: any) {
    console.error('GET /api/notifications/[id] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a specific notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await notificationService.delete(id, user.userId);

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/notifications/[id] error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete notification' },
      { status: err.message ? 400 : 500 }
    );
  }
}
