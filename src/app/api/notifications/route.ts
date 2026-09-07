import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { getUserFromToken } from '@/lib/auth';
import { NotificationFilter } from '@/types/notification';
import { isDatabaseConnectionError } from '@/lib/prisma';

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const filters: NotificationFilter = {
      userId: user.userId,
      type: searchParams.get('type')?.split(',') || undefined,
      isRead: searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined,
      priority: searchParams.get('priority')?.split(',') || undefined,
      category: searchParams.get('category') || undefined,
      fromDate: searchParams.get('fromDate') ? new Date(searchParams.get('fromDate')!) : undefined,
      toDate: searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'priority') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await notificationService.getAll(filters);
    return NextResponse.json(result);
  } catch (err: any) {
    if (isDatabaseConnectionError(err)) {
      console.warn('GET /api/notifications: database unreachable, returning empty list');
      const limit = parseInt(new URL(req.url).searchParams.get('limit') || '20');
      return NextResponse.json({
        notifications: [],
        pagination: { total: 0, page: 1, limit, totalPages: 0 },
      });
    }
    console.error('GET /api/notifications error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Ensure userId matches authenticated user (unless admin)
    data.userId = user.userId;

    const notification = await notificationService.create(data);
    return NextResponse.json(notification, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/notifications error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete all notifications for the authenticated user
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await notificationService.deleteAll(user.userId);
    return NextResponse.json({
      message: 'All notifications deleted successfully',
      count: result.count,
    });
  } catch (err: any) {
    console.error('DELETE /api/notifications error:', err);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
