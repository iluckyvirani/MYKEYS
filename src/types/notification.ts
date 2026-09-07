import { Notification } from '@prisma/client';

// Notification Types
export enum NotificationType {
  BOOKING = 'booking',
  INQUIRY = 'inquiry',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  REVIEW = 'review',
  PROPERTY = 'property',
  MESSAGE = 'message',
  REMINDER = 'reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  INFORMATIONAL = 'informational',
  ACTION_REQUIRED = 'action_required',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Input type for creating notifications
export type NotificationInput = {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  priority?: NotificationPriority | string;
  category?: NotificationCategory | string;
  actionUrl?: string;
  imageUrl?: string;
  data?: Record<string, any>;
  expiresAt?: Date;
};

// Response type for notifications
export type NotificationResponse = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  category?: string | null;
  actionUrl?: string | null;
  imageUrl?: string | null;
  data?: Record<string, any> | null;
  expiresAt?: Date | null;
  createdAt: Date;
  readAt?: Date | null;
};

// Filter options for querying notifications
export type NotificationFilter = {
  userId?: string;
  type?: string | string[];
  isRead?: boolean;
  priority?: string | string[];
  category?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'readAt';
  sortOrder?: 'asc' | 'desc';
};

// Bulk operations
export type BulkMarkReadInput = {
  notificationIds: string[];
};

export type BulkDeleteInput = {
  notificationIds: string[];
};

// Statistics
export type NotificationStats = {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: number; // Count of notifications in last 24 hours
};

// Notification templates for common scenarios
export type BookingNotificationData = {
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guestName?: string;
  amount?: number;
};

export type InquiryNotificationData = {
  inquiryId: string;
  propertyId: string;
  propertyTitle: string;
  inquirerName: string;
  inquiryType: string;
};

export type PaymentNotificationData = {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  bookingId?: string;
  transactionId?: string;
};

export type ReviewNotificationData = {
  reviewId: string;
  propertyId: string;
  propertyTitle: string;
  rating: number;
  reviewerName: string;
};

export type PropertyNotificationData = {
  propertyId: string;
  propertyTitle: string;
  status?: string;
  action?: string;
};

// Notification preferences (for future implementation)
export type NotificationPreferences = {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    [key in NotificationType]?: boolean;
  };
};
