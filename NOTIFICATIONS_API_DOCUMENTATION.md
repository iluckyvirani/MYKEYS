# Notifications API Documentation

## Overview
Comprehensive notification system with real-time updates, filtering, bulk operations, and rich notification types.

---

## API Endpoints

### 1. Get All Notifications
**GET** `/api/notifications`

Get all notifications for the authenticated user with filtering and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): Filter by notification type (comma-separated: booking,inquiry,payment,system,review,property)
- `isRead` (optional): Filter by read status (true/false)
- `priority` (optional): Filter by priority (comma-separated: low,normal,high,urgent)
- `category` (optional): Filter by category (informational, action_required, warning, success, error)
- `fromDate` (optional): Start date (ISO format)
- `toDate` (optional): End date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): createdAt | priority (default: createdAt)
- `sortOrder` (optional): asc | desc (default: desc)

**Example:**
```
GET /api/notifications?isRead=false&priority=high,urgent&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "userId": "user_abc",
      "type": "booking",
      "title": "New Booking Received",
      "message": "New booking for Beautiful Villa from John Doe",
      "isRead": false,
      "priority": "high",
      "category": "action_required",
      "actionUrl": "/bookings/booking_456",
      "imageUrl": null,
      "data": {
        "bookingId": "booking_456",
        "propertyId": "prop_789",
        "propertyTitle": "Beautiful Villa"
      },
      "expiresAt": null,
      "createdAt": "2026-02-10T10:00:00Z",
      "readAt": null
    }
  ],
  "pagination": {
    "total": 145,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 2. Get Single Notification
**GET** `/api/notifications/:id`

Get a specific notification by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "notif_123",
  "userId": "user_abc",
  "type": "booking",
  "title": "New Booking Received",
  "message": "New booking for Beautiful Villa from John Doe",
  "isRead": false,
  "priority": "high",
  "category": "action_required",
  "actionUrl": "/bookings/booking_456",
  "data": {...},
  "createdAt": "2026-02-10T10:00:00Z"
}
```

---

### 3. Create Notification
**POST** `/api/notifications`

Create a new notification (authenticated users can only create for themselves).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "system",
  "title": "Welcome to MyKeys!",
  "message": "Thank you for joining our platform",
  "priority": "normal",
  "category": "informational",
  "actionUrl": "/dashboard",
  "data": {
    "customField": "customValue"
  }
}
```

**Response:** `201 Created`

---

### 4. Mark Notification as Read
**PATCH** `/api/notifications/:id/read`

Mark a specific notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "notif_123",
  "isRead": true,
  "readAt": "2026-02-10T10:30:00Z",
  ...
}
```

---

### 5. Mark Notification as Unread
**PATCH** `/api/notifications/:id/unread`

Mark a specific notification as unread.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### 6. Mark All as Read
**PATCH** `/api/notifications/read-all`

Mark all notifications as read for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read",
  "count": 45
}
```

---

### 7. Bulk Mark as Read
**POST** `/api/notifications/bulk-read`

Mark multiple notifications as read.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationIds": ["notif_123", "notif_456", "notif_789"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Notifications marked as read",
  "count": 3
}
```

---

### 8. Delete Notification
**DELETE** `/api/notifications/:id`

Delete a specific notification.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Notification deleted successfully"
}
```

---

### 9. Delete All Notifications
**DELETE** `/api/notifications`

Delete all notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "All notifications deleted successfully",
  "count": 145
}
```

---

### 10. Delete Read Notifications
**DELETE** `/api/notifications/read`

Delete all read notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Read notifications deleted successfully",
  "count": 32
}
```

---

### 11. Bulk Delete Notifications
**POST** `/api/notifications/bulk-delete`

Delete multiple notifications at once.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationIds": ["notif_123", "notif_456", "notif_789"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Notifications deleted successfully",
  "count": 3
}
```

---

### 12. Get Notification Statistics
**GET** `/api/notifications/stats`

Get comprehensive statistics about user's notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "total": 145,
  "unread": 23,
  "read": 122,
  "byType": {
    "booking": 45,
    "inquiry": 32,
    "payment": 28,
    "system": 15,
    "review": 20,
    "property": 5
  },
  "byPriority": {
    "low": 20,
    "normal": 95,
    "high": 25,
    "urgent": 5
  },
  "recent": 12
}
```

---

### 13. Get Unread Count
**GET** `/api/notifications/unread-count`

Get the count of unread notifications (useful for badge display).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "unreadCount": 23
}
```

---

## Notification Types

### Supported Types
- **booking**: Booking-related notifications
- **inquiry**: Property inquiry notifications
- **payment**: Payment and transaction notifications
- **system**: System announcements and updates
- **review**: Review-related notifications
- **property**: Property status updates
- **message**: Direct messages (future)
- **reminder**: Reminders and alerts

### Priority Levels
- **low**: Non-urgent information
- **normal**: Standard notifications (default)
- **high**: Important notifications requiring attention
- **urgent**: Critical notifications requiring immediate action

### Categories
- **informational**: General information
- **action_required**: User action needed
- **warning**: Warning messages
- **success**: Success confirmations
- **error**: Error notifications

---

## Service Helper Methods

The notification service includes helper methods for creating specific notification types:

### Booking Notifications
```typescript
await notificationService.createBookingNotification(
  userId,
  {
    bookingId: 'booking_123',
    propertyId: 'prop_456',
    propertyTitle: 'Beautiful Villa',
    checkIn: '2026-03-15',
    checkOut: '2026-03-20',
    guestName: 'John Doe',
    amount: 500
  },
  'created' // 'created' | 'confirmed' | 'cancelled' | 'completed' | 'reminder'
);
```

### Inquiry Notifications
```typescript
await notificationService.createInquiryNotification(userId, {
  inquiryId: 'inq_123',
  propertyId: 'prop_456',
  propertyTitle: 'Beautiful Villa',
  inquirerName: 'Jane Smith',
  inquiryType: 'rental'
});
```

### Payment Notifications
```typescript
await notificationService.createPaymentNotification(
  userId,
  {
    paymentId: 'pay_123',
    amount: 500,
    currency: 'GBP',
    status: 'paid',
    bookingId: 'booking_456'
  },
  'success' // 'success' | 'failed' | 'pending' | 'refunded'
);
```

### Review Notifications
```typescript
await notificationService.createReviewNotification(userId, {
  reviewId: 'rev_123',
  propertyId: 'prop_456',
  propertyTitle: 'Beautiful Villa',
  rating: 5,
  reviewerName: 'John Doe'
});
```

### Property Notifications
```typescript
await notificationService.createPropertyNotification(
  userId,
  {
    propertyId: 'prop_456',
    propertyTitle: 'Beautiful Villa',
    status: 'active'
  },
  'approved' // 'approved' | 'rejected' | 'updated' | 'deleted'
);
```

### System Notifications
```typescript
await notificationService.createSystemNotification(
  userId,
  'System Maintenance',
  'Platform will be under maintenance on March 15th from 2-4 AM',
  NotificationPriority.HIGH
);
```

---

## Schema

```prisma
model Notification {
  id      String  @id @default(cuid())
  type    String
  title   String
  message String
  isRead  Boolean @default(false)
  data    Json?
  
  priority  String  @default("normal")
  category  String?
  actionUrl String?
  imageUrl  String?
  expiresAt DateTime?

  userId String
  user   User   @relation(...)

  createdAt DateTime @default(now())
  readAt    DateTime?

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@index([type])
  @@index([priority])
}
```

---

## Usage Examples

### Example 1: Fetch Unread Notifications
```javascript
const response = await fetch('/api/notifications?isRead=false&sortBy=priority&sortOrder=desc', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { notifications, pagination } = await response.json();
```

### Example 2: Display Notification Badge
```javascript
const response = await fetch('/api/notifications/unread-count', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { unreadCount } = await response.json();
// Display badge with unreadCount
```

### Example 3: Mark Notification as Read When Clicked
```javascript
const markAsRead = async (notificationId) => {
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  // Navigate to actionUrl
};
```

### Example 4: Mark All as Read
```javascript
const markAllAsRead = async () => {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const { count } = await response.json();
  console.log(`${count} notifications marked as read`);
};
```

### Example 5: Delete Read Notifications
```javascript
const clearReadNotifications = async () => {
  const response = await fetch('/api/notifications/read', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const { count } = await response.json();
  console.log(`${count} read notifications deleted`);
};
```

### Example 6: Get Notification Statistics
```javascript
const response = await fetch('/api/notifications/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const stats = await response.json();

console.log(`Total: ${stats.total}`);
console.log(`Unread: ${stats.unread}`);
console.log(`Bookings: ${stats.byType.booking}`);
console.log(`Urgent: ${stats.byPriority.urgent}`);
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized to access this notification"
}
```

### 404 Not Found
```json
{
  "error": "Notification not found"
}
```

### 400 Bad Request
```json
{
  "error": "notificationIds array is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch notifications"
}
```

---

## Real-Time Updates (WebSocket/SSE)

For real-time notification updates, you can implement:

1. **Polling**: Periodically call `/api/notifications/unread-count`
2. **WebSocket**: Connect to a WebSocket server for instant updates
3. **Server-Sent Events (SSE)**: Subscribe to notification stream

### Polling Example
```javascript
// Poll every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/notifications/unread-count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { unreadCount } = await response.json();
  updateBadge(unreadCount);
}, 30000);
```

---

## Best Practices

1. **Pagination**: Always use pagination for large notification lists
2. **Filtering**: Filter by `isRead=false` for notification center
3. **Priority**: Display urgent and high priority notifications prominently
4. **Action URLs**: Use `actionUrl` to navigate users to relevant pages
5. **Bulk Operations**: Use bulk APIs for better performance
6. **Cleanup**: Periodically delete old read notifications
7. **Expiration**: Set `expiresAt` for time-sensitive notifications
8. **Categories**: Use categories to style notifications differently
9. **Data Field**: Store additional context in the `data` JSON field
10. **Real-time**: Implement polling or WebSocket for live updates

---

## Database Migration

When database is ready, apply the migration:

```bash
npx prisma migrate dev --name add_notification_enhancements
```

This will add:
- `priority`, `category`, `actionUrl`, `imageUrl` fields
- `expiresAt` and `readAt` timestamps
- Additional indexes for better query performance

---

## Features Implemented

✅ Full CRUD operations for notifications
✅ Advanced filtering by type, priority, read status, dates
✅ Bulk operations (mark as read, delete)
✅ Notification statistics and analytics
✅ Unread count for badge display
✅ Helper methods for common notification types
✅ Priority and category support
✅ Action URLs for navigation
✅ Expiration support for time-sensitive notifications
✅ Pagination for efficient data loading
✅ Authentication and authorization
✅ JSON data field for flexible metadata
