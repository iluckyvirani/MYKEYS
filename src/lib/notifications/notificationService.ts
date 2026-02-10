import { prisma } from '../prisma';
import {
  NotificationInput,
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  BookingNotificationData,
  InquiryNotificationData,
  PaymentNotificationData,
  ReviewNotificationData,
  PropertyNotificationData,
} from '@/types/notification';
import { Prisma } from '@prisma/client';

export const notificationService = {
  /**
   * Create a new notification
   */
  async create(data: NotificationInput) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || NotificationPriority.NORMAL,
        category: data.category,
        actionUrl: data.actionUrl,
        imageUrl: data.imageUrl,
        data: data.data || {},
        expiresAt: data.expiresAt,
      } as any, // Type assertion until migration is applied
    });
  },

  /**
   * Get all notifications for a user with filtering
   */
  async getAll(filters: NotificationFilter = {}) {
    const {
      userId,
      type,
      isRead,
      priority,
      category,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.NotificationWhereInput = {};

    if (userId) where.userId = userId;
    if (type) {
      where.type = Array.isArray(type) ? { in: type } : type;
    }
    if (isRead !== undefined) where.isRead = isRead;
    if (priority) {
      (where as any).priority = Array.isArray(priority) ? { in: priority } : priority;
    }
    if (category) (where as any).category = category;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    // Filter out expired notifications
    where.OR = [
      { expiresAt: null } as any,
      { expiresAt: { gt: new Date() } } as any,
    ];

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single notification by ID
   */
  async getById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized to mark this notification as read');
    }

    return prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      } as any,
    });
  },

  /**
   * Mark notification as unread
   */
  async markAsUnread(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized to mark this notification as unread');
    }

    return prisma.notification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      } as any,
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      } as any,
    });
  },

  /**
   * Bulk mark notifications as read
   */
  async bulkMarkAsRead(notificationIds: string[], userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user owns these notifications
      },
      data: {
        isRead: true,
        readAt: new Date(),
      } as any,
    });
  },

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized to delete this notification');
    }

    return prisma.notification.delete({
      where: { id },
    });
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },

  /**
   * Bulk delete notifications
   */
  async bulkDelete(notificationIds: string[], userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user owns these notifications
      },
    });
  },

  /**
   * Delete read notifications for a user
   */
  async deleteRead(userId: string) {
    return prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  },

  /**
   * Get notification statistics for a user
   */
  async getStats(userId: string): Promise<NotificationStats> {
    const [total, unread, byType, byPriority, recentCount] = await Promise.all([
      // Total notifications
      prisma.notification.count({
        where: { userId },
      }),
      // Unread notifications
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      // By type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
      // By priority
      prisma.$queryRaw`
        SELECT priority, COUNT(*)::int as count
        FROM "Notification"
        WHERE "userId" = ${userId}
        GROUP BY priority
      ` as Promise<Array<{ priority: string; count: number }>>,
      // Recent (last 24 hours)
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const byTypeMap: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeMap[item.type] = item._count.type;
    });

    const byPriorityMap: Record<string, number> = {};
    byPriority.forEach((item) => {
      byPriorityMap[item.priority] = item.count;
    });

    return {
      total,
      unread,
      read: total - unread,
      byType: byTypeMap,
      byPriority: byPriorityMap,
      recent: recentCount,
    };
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  /**
   * Clean up expired notifications
   */
  async cleanupExpired() {
    return prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  },

  // ====== Helper methods for creating specific notification types ======

  /**
   * Create a booking notification
   */
  async createBookingNotification(
    userId: string,
    data: BookingNotificationData,
    action: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'reminder'
  ) {
    const titles = {
      created: 'New Booking Received',
      confirmed: 'Booking Confirmed',
      cancelled: 'Booking Cancelled',
      completed: 'Booking Completed',
      reminder: 'Upcoming Booking Reminder',
    };

    const messages = {
      created: `New booking for ${data.propertyTitle} from ${data.guestName || 'a guest'}`,
      confirmed: `Your booking for ${data.propertyTitle} has been confirmed`,
      cancelled: `Booking for ${data.propertyTitle} has been cancelled`,
      completed: `Your stay at ${data.propertyTitle} is complete. Please leave a review!`,
      reminder: `Reminder: You have an upcoming booking at ${data.propertyTitle} on ${data.checkIn}`,
    };

    const categories = {
      created: NotificationCategory.ACTION_REQUIRED,
      confirmed: NotificationCategory.SUCCESS,
      cancelled: NotificationCategory.WARNING,
      completed: NotificationCategory.INFORMATIONAL,
      reminder: NotificationCategory.INFORMATIONAL,
    };

    return this.create({
      userId,
      type: NotificationType.BOOKING,
      title: titles[action],
      message: messages[action],
      category: categories[action],
      priority: action === 'reminder' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      actionUrl: `/bookings/${data.bookingId}`,
      data,
    });
  },

  /**
   * Create an inquiry notification
   */
  async createInquiryNotification(userId: string, data: InquiryNotificationData) {
    return this.create({
      userId,
      type: NotificationType.INQUIRY,
      title: 'New Property Inquiry',
      message: `${data.inquirerName} sent an inquiry about ${data.propertyTitle}`,
      category: NotificationCategory.ACTION_REQUIRED,
      priority: NotificationPriority.HIGH,
      actionUrl: `/inquiries/${data.inquiryId}`,
      data,
    });
  },

  /**
   * Create a payment notification
   */
  async createPaymentNotification(
    userId: string,
    data: PaymentNotificationData,
    status: 'success' | 'failed' | 'pending' | 'refunded'
  ) {
    const titles = {
      success: 'Payment Successful',
      failed: 'Payment Failed',
      pending: 'Payment Pending',
      refunded: 'Payment Refunded',
    };

    const messages = {
      success: `Payment of ${data.currency} ${data.amount} received successfully`,
      failed: `Payment of ${data.currency} ${data.amount} failed`,
      pending: `Payment of ${data.currency} ${data.amount} is pending`,
      refunded: `Payment of ${data.currency} ${data.amount} has been refunded`,
    };

    const categories = {
      success: NotificationCategory.SUCCESS,
      failed: NotificationCategory.ERROR,
      pending: NotificationCategory.WARNING,
      refunded: NotificationCategory.INFORMATIONAL,
    };

    return this.create({
      userId,
      type: NotificationType.PAYMENT,
      title: titles[status],
      message: messages[status],
      category: categories[status],
      priority: status === 'failed' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      actionUrl: data.bookingId ? `/bookings/${data.bookingId}` : `/payments/${data.paymentId}`,
      data,
    });
  },

  /**
   * Create a review notification
   */
  async createReviewNotification(userId: string, data: ReviewNotificationData) {
    return this.create({
      userId,
      type: NotificationType.REVIEW,
      title: 'New Review Received',
      message: `${data.reviewerName} left a ${data.rating}-star review for ${data.propertyTitle}`,
      category: NotificationCategory.INFORMATIONAL,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/properties/${data.propertyId}#reviews`,
      data,
    });
  },

  /**
   * Create a property notification
   */
  async createPropertyNotification(
    userId: string,
    data: PropertyNotificationData,
    action: 'approved' | 'rejected' | 'updated' | 'deleted'
  ) {
    const titles = {
      approved: 'Property Approved',
      rejected: 'Property Rejected',
      updated: 'Property Updated',
      deleted: 'Property Deleted',
    };

    const messages = {
      approved: `Your property "${data.propertyTitle}" has been approved and is now live`,
      rejected: `Your property "${data.propertyTitle}" was rejected. Please review and resubmit`,
      updated: `Property "${data.propertyTitle}" has been updated successfully`,
      deleted: `Property "${data.propertyTitle}" has been deleted`,
    };

    const categories = {
      approved: NotificationCategory.SUCCESS,
      rejected: NotificationCategory.ERROR,
      updated: NotificationCategory.INFORMATIONAL,
      deleted: NotificationCategory.WARNING,
    };

    return this.create({
      userId,
      type: NotificationType.PROPERTY,
      title: titles[action],
      message: messages[action],
      category: categories[action],
      priority: action === 'rejected' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      actionUrl: action !== 'deleted' ? `/properties/${data.propertyId}` : undefined,
      data,
    });
  },

  /**
   * Create a system notification
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) {
    return this.create({
      userId,
      type: NotificationType.SYSTEM,
      title,
      message,
      category: NotificationCategory.INFORMATIONAL,
      priority,
    });
  },
};
