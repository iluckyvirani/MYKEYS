# Admin Dashboard - Complete Documentation

## Overview
A comprehensive admin dashboard has been created for the MYKEYS platform. It maintains consistency with the existing user and owner dashboards while providing powerful administrative controls for managing the entire platform.

## Design System Consistency

### Colors & Styling
- **Primary Color:** Green gradient (from-green-600 to-emerald-500)
- **Background:** White with gray accent (gray-100)
- **Typography:** Same font system as user/owner dashboards
- **Border Colors:** Consistent gray tones (200, 300)
- **Active States:** Green background with left border

### Layout Components
- **Sidebar:** Fixed width (w-64) on desktop, collapsible on mobile
- **Navbar:** Sticky header with logo, search, notifications, and user menu
- **Main Content:** Responsive grid layout with consistent spacing
- **Cards:** White background with subtle shadow on hover

## Directory Structure

```
src/
├── app/admin/dashboard/
│   ├── page.tsx              # Main dashboard overview
│   ├── users/
│   │   └── page.tsx          # User management
│   ├── owners/
│   │   └── page.tsx          # Owner management
│   ├── service-providers/
│   │   └── page.tsx          # Service provider management
│   ├── properties/
│   │   └── page.tsx          # Properties management
│   ├── bookings/
│   │   └── page.tsx          # Bookings management
│   ├── categories/
│   │   └── page.tsx          # Service categories
│   ├── amenities/
│   │   └── page.tsx          # Amenities management
│   ├── documents/
│   │   └── page.tsx          # Document approval system
│   ├── inquiries/
│   │   └── page.tsx          # Inquiry management
│   ├── payments/
│   │   └── page.tsx          # Payment tracking
│   └── profile/
│       └── page.tsx          # Admin profile settings
└── components/dashboard/
    ├── AdminSidebar.tsx      # Admin navigation sidebar
    ├── AdminDashboardLayout.tsx # Main admin layout wrapper
    └── AdminDashboard/
        └── AdminStatsCards.tsx  # Dashboard statistics cards

```

## Page Features

### 1. **Dashboard Overview** (`/admin/dashboard`)
- Platform statistics (users, owners, properties, bookings, revenue)
- Platform growth metrics
- Quick action buttons
- Recent activity feed
- Real-time stats cards showing:
  - Total Users
  - Total Owners
  - Service Providers
  - Total Properties
  - Total Bookings
  - Active Bookings
  - Total Revenue
  - Pending Documents

### 2. **User Management** (`/admin/dashboard/users`)
- View all users (Tenants, Owners, Service Providers)
- Filter by:
  - Role (User, Owner, Service Provider)
  - Status (Active, Inactive, Suspended)
  - Search by name/email
- User table with columns:
  - Name
  - Email & Phone
  - Role badge
  - Status indicator
  - Join date
  - Action buttons (View, Edit, Delete)
- Color-coded role badges
- Status indicators with icons

### 3. **Owner Management** (`/admin/dashboard/owners`)
- Dedicated owner tracking
- View owner details:
  - Name & Contact
  - Number of Properties
  - Total Revenue Generated
  - Status (Active/Suspended)
- Search and filter capabilities
- Quick action buttons

### 4. **Service Providers** (`/admin/dashboard/service-providers`)
- Manage service providers
- View metrics:
  - Service Type
  - Total Bookings
  - Average Rating
  - Account Status
- Performance tracking
- Quick management actions

### 5. **Properties Management** (`/admin/dashboard/properties`)
- Grid/Card view of all properties
- Property information:
  - Title & Location
  - Property Type
  - Nightly Price
  - Booking Count
  - Status (Active/Inactive/Pending)
- Status-based filtering
- Location-based search
- Quick edit/view buttons

### 6. **Bookings Management** (`/admin/dashboard/bookings`)
- Complete booking visibility
- Booking details:
  - Booking ID
  - Property Name
  - Guest Name
  - Check-in/Check-out dates
  - Total Amount
  - Status (Confirmed/Pending/Cancelled)
- Advanced filtering
- Status indicators with icons
- View detailed booking information

### 7. **Service Categories** (`/admin/dashboard/categories`)
- Manage service categories
- Add new categories
- Category information:
  - Category Name
  - Description
  - Number of Services
  - Active/Inactive Status
- Edit/Delete functionality
- Quick category management

### 8. **Amenities Management** (`/admin/dashboard/amenities`)
- Manage property amenities
- Amenity features:
  - Amenity Name with Icon
  - Number of Properties Using
  - Status
- Easy add/edit/delete
- Grid layout for visual organization
- Quick search and filter

### 9. **Document Approval** (`/admin/dashboard/documents`)
- Document review and approval system
- Supports:
  - Aadhar Card
  - PAN Card
  - Property Registration
  - Other user documents
- Status management:
  - Pending (requires action)
  - Approved
  - Rejected
- One-click approval/rejection
- Document tracking

### 10. **Inquiries Management** (`/admin/dashboard/inquiries`)
- Track user property inquiries
- Inquiry information:
  - Inquiry ID
  - Subject
  - From (User Name)
  - Property
  - Date Posted
  - Status (Pending/Replied/Closed)
- Quick reply functionality
- Archive/Delete options
- Status-based organization

### 11. **Payments Management** (`/admin/dashboard/payments`)
- Revenue tracking and management
- Payment details:
  - Transaction ID
  - Payer Name
  - Amount Paid
  - Payment Method
  - Transaction Type
  - Date & Status
- Total revenue calculation
- Status filtering (Completed/Pending/Failed)
- Payment method tracking
- Revenue dashboard

### 12. **Admin Profile** (`/admin/dashboard/profile`)
- Personal information management
- Editable sections:
  - First & Last Name
  - Phone Number
  - Department & Role
- Security settings:
  - Change Password
  - Current Password Verification
- Notification Preferences:
  - Email Notifications
  - SMS Alerts
  - Push Notifications
  - Weekly Reports

## Navigation Structure

### Admin Sidebar Menu Items
```
Dashboard                   [Home]
├── Users                  [Users icon]
├── Owners                 [Shield icon]
├── Service Providers      [Package icon]
├── Properties             [Building icon]
├── Bookings               [Calendar icon]
├── Service Categories     [Grid icon]
├── Amenities              [BarChart3 icon]
├── Documents              [FileCheck icon]
├── Inquiries              [MessageSquare icon]
├── Payments               [CreditCard icon]
└── Profile                [Settings icon]
```

## Key Components

### AdminSidebar Component
- Desktop and mobile responsive
- Active route detection
- Logout functionality
- Navigation icons
- Smooth transitions

### AdminDashboardLayout Component
- Wraps all admin pages
- Handles sidebar open/close state
- Integrates with Header component
- Mobile backdrop for sidebar
- Responsive padding

### AdminStatsCards Component
- Displays 8 key metrics
- Color-coded cards
- Loading skeleton
- Dummy data implementation
- Responsive grid layout

## Features Implemented

✅ **User Management**
- View all users by role
- Filter by status
- Search functionality
- User profile details

✅ **Owner Tracking**
- Revenue monitoring
- Property count
- Status management

✅ **Service Provider Management**
- Performance metrics
- Rating display
- Booking statistics

✅ **Property Management**
- Visual grid layout
- Status tracking
- Quick edit/view
- Location-based search

✅ **Booking Management**
- Complete booking overview
- Status filtering
- Guest & property details
- Amount tracking

✅ **Service Categories**
- CRUD operations
- Category-wise statistics
- Status management

✅ **Amenities Management**
- Visual icon display
- Usage statistics
- Quick management

✅ **Document Approval**
- Approval/Rejection workflow
- Document tracking
- Status management
- One-click actions

✅ **Inquiry Management**
- Quick reply system
- Status tracking
- Archive functionality

✅ **Payment Tracking**
- Transaction management
- Revenue calculation
- Payment method tracking
- Status filtering

✅ **Profile Management**
- Personal information editing
- Password security
- Notification preferences

## Styling & Theme

### Color Scheme
- Primary: Green (#16a34a to #10b981)
- Secondary: Blue (#2563eb)
- Accent: Purple (#a855f7)
- Neutral: Gray (100-900)
- Alert: Red (#dc2626)
- Warning: Yellow (#f59e0b)

### Responsive Design
- Mobile first approach
- Breakpoints: sm, md, lg
- Sidebar collapses on mobile
- Tables scroll horizontally on small screens
- Grid layouts adapt to screen size

## Authentication & Authorization

### Required Setup
The admin dashboard should be protected by:
1. Authentication middleware
2. Role-based access control (Admin/Super Admin)
3. JWT token validation
4. Session management

### Logout Feature
- Clears all stored tokens
- Removes user data from localStorage
- Redirects to login page
- Handles API call failures gracefully

## Data Management

### Current Implementation
- Mock data is used for demonstration
- Sample data includes realistic information
- Collections, filtering, and search work with mock data

### Integration Points (For API Connection)
- `/api/dashboard/stats` - Platform statistics
- `/api/users` - User management
- `/api/owners` - Owner management
- `/api/services/providers` - Service providers
- `/api/properties` - Properties
- `/api/bookings` - Bookings
- `/api/services/categories` - Categories
- `/api/amenities` - Amenities
- `/api/documents` - Document approvals
- `/api/inquiries` - Inquiries
- `/api/payments` - Payments
- `/api/auth/me` - Admin profile

## UI/UX Highlights

### Consistency Features
- Same color hierarchy as user/owner dashboards
- Uniform typography
- Consistent button styles
- Matching sidebar design
- Identical header layout

### User Experience
- Intuitive navigation
- Clear status indicators
- Quick action buttons
- Search & filter on all pages
- Real-time updates ready
- Modal dialogs for actions
- Confirmation feedback

### Accessibility
- Semantic HTML
- Icon labels with text
- Color-coded status indicators
- Clear form labels
- Keyboard navigation ready

## Future Enhancements

### Planned Features
1. Advanced analytics & charts
2. Email/SMS notification system
3. Batch operations (bulk approve/reject)
4. Export functionality (CSV/PDF)
5. Advanced reporting
6. Admin activity logs
7. Role-based access levels
8. Two-factor authentication
9. API rate limits management
10. System configuration panel

### API Integration
- Connect all pages to backend APIs
- Real-time data updates
- WebSocket for live notifications
- Pagination for large datasets
- Caching strategies

## Getting Started

### Accessing the Admin Dashboard
1. Login with admin credentials
2. Navigate to `/admin/dashboard`
3. Use sidebar to access different sections
4. All features are ready for backend integration

### Common Tasks

**View User Statistics:**
- Dashboard → See stats cards

**Manage Users:**
- Users → Search/Filter → View/Edit/Delete

**Approve Documents:**
- Documents → Click Approve/Reject

**Track Revenue:**
- Payments → View total revenue card

**Monitor Bookings:**
- Bookings → Filter by status → View details

## Technical Stack

- **Frontend Framework:** Next.js 16.1.1
- **UI Components:** React 19.2.3
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (562.0)
- **Forms:** React Hook Form
- **State Management:** React State
- **API Client:** Axios
- **Date Handling:** date-fns

## Notes

- The design perfectly matches the existing user and owner dashboards
- All pages are fully responsive
- Mock data can be easily replaced with API calls
- Components follow the same patterns as existing dashboards
- Sidebar and header are reusable across the admin platform
- All styling uses the same color system and typography
- Ready for real-time updates and WebSocket integration
