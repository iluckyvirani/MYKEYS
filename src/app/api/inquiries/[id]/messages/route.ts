import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * GET /api/inquiries/[id]/messages
 * List messages for an inquiry thread.
 * Optional query param: ?after=<messageId> — return only messages newer than that message (for polling).
 */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required', data: null }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const afterId = searchParams.get('after');

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });
    }

    const isOwner = inquiry.property.ownerId === user.userId;
    const isUser = inquiry.userId === user.userId;

    if (!isOwner && !isUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 403 });
    }

    let afterCreatedAt: Date | undefined;
    if (afterId) {
      const afterMsg = await (prisma as any).inquiryMessage.findUnique({ where: { id: afterId }, select: { createdAt: true } });
      if (afterMsg) afterCreatedAt = afterMsg.createdAt;
    }

    const messages = await (prisma as any).inquiryMessage.findMany({
      where: {
        inquiryId,
        ...(afterCreatedAt ? { createdAt: { gt: afterCreatedAt } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Messages retrieved',
      data: messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        messageType: m.messageType,
        senderRole: m.senderRole,
        senderId: m.senderId,
        senderName: m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : 'System',
        senderAvatar: m.sender?.avatar || null,
        readBy: m.readBy,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch messages', data: null }, { status: 500 });
  }
});

/**
 * POST /api/inquiries/[id]/messages
 * Send a message in an inquiry thread.
 * Body: { content: string }
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
  try {
    const { id: inquiryId } = context?.params || {};
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'Inquiry ID is required', data: null }, { status: 400 });
    }

    const body = await req.json();
    const content = body.content?.trim();
    if (!content) {
      return NextResponse.json({ success: false, message: 'Message content is required', data: null }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });
    }

    const isOwner = inquiry.property.ownerId === user.userId;
    const isUser = inquiry.userId === user.userId;

    if (!isOwner && !isUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 403 });
    }

    const senderRole = isOwner ? 'OWNER' : 'USER';

    const message = await (prisma as any).inquiryMessage.create({
      data: {
        content,
        messageType: 'TEXT',
        senderRole,
        inquiryId,
        senderId: user.userId,
        readBy: [user.userId],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Update inquiry thread metadata and unread counters
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        lastMessageAt: new Date(),
        lastMessageBy: user.userId,
        status: 'REPLIED' as any,
        respondedAt: inquiry.respondedAt ?? new Date(),
        ...(isOwner
          ? { unreadByUser: { increment: 1 } }
          : { unreadByOwner: { increment: 1 } }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      data: {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        senderRole: message.senderRole,
        senderId: message.senderId,
        senderName: message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown',
        senderAvatar: message.sender?.avatar || null,
        readBy: message.readBy,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message', data: null }, { status: 500 });
  }
});
