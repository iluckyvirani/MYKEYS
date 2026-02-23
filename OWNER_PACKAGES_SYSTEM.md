# Owner Packages System - Complete Implementation

## Overview

The owner packages system provides flexible subscription tiers with dynamic features tracking. Owners can subscribe to different packages with varying limits on properties, leads, storage, and features.

## Package Tiers

### 1. **BASIC Tier** (Free/Entry Level)
- **Price:** Free
- **Duration:** Monthly
- **Features:**
  - 1 Property
  - 0 Featured Properties
  - 5 GB Storage
  - 2 Leads per Day
  - 10 Leads Total
  - No Verified Badge
  - Standard Support (Email)
  - No Additional Features

### 2. **STANDARD Tier** (Growing)
- **Price:** $99/month
- **Duration:** Monthly or Yearly
- **Features:**
  - 5 Properties
  - 2 Featured Properties
  - 50 GB Storage
  - 10 Leads per Day
  - 100 Leads Total
  - Verified Badge ✓
  - Priority Support
  - Advanced Analytics
  - Bulk Upload
  - Lead Capture

### 3. **PREMIUM Tier** (Professional)
- **Price:** $299/month
- **Duration:** Monthly or Yearly
- **Features:**
  - 20 Properties
  - 10 Featured Properties
  - 500 GB Storage
  - 50 Leads per Day
  - 500 Leads Total
  - Verified Badge ✓
  - VIP Support
  - All Features:
    - API Access
    - Custom Domain
    - Advanced Analytics
    - Bulk Upload
    - Priority Support
    - Verified Badge
    - Featured Listings
    - Lead Capture

## Database Schema

### Package Model
```prisma
model Package {
  // Core
  id              String
  name            String
  tier            PackageTier      // BASIC, STANDARD, PREMIUM
  description     String?
  
  // Pricing
  price           Float
  duration        String           // monthly, yearly
  isActive        Boolean
  
  // Limits
  propertyLimit   Int              // Max properties
  featuredLimit   Int              // Max featured properties
  storageLimit    Int              // GB
  dailyLeadsLimit Int              // Leads per day
  totalLeadsLimit Int              // Total leads allowed
  
  // Features
  hasVerifiedBadge Boolean
  supportLevel    String           // standard, priority, vip
  featuresIncluded String[]        // API_ACCESS, etc
  features        Json             // Custom features
  
  // Relations
  ownerPackages   OwnerPackage[]
}
```

### OwnerPackage Model
```prisma
model OwnerPackage {
  // Core
  id              String
  packageId       String           // FK to Package
  ownerId         String           // FK to User
  
  // Status
  status          SubscriptionStatus // ACTIVE, EXPIRED, CANCELLED, PENDING
  autoRenew       Boolean
  
  // Dates
  startDate       DateTime
  endDate         DateTime
  nextBilling     DateTime?
  cancelledAt     DateTime?
  
  // Usage Tracking
  propertiesUsed  Int              // Current usage
  featuredUsed    Int
  storageUsed     Float            // GB
  leadsUsedToday  Int
  leadsUsedTotal  Int
  verifiedBadgeActive Boolean
  
  // Relations
  package         Package
  owner           User
  payments        Payment[]
}
```

## API Endpoints

### Get All Available Packages
```
GET /api/packages
Response: Package[]
```

**Example:**
```json
[
  {
    "id": "pkg_1",
    "name": "Basic",
    "tier": "BASIC",
    "price": 0,
    "propertyLimit": 1,
    "dailyLeadsLimit": 2,
    "totalLeadsLimit": 10,
    "hasVerifiedBadge": false,
    "featuresIncluded": []
  },
  {
    "id": "pkg_2",
    "name": "Standard",
    "tier": "STANDARD",
    "price": 99,
    "propertyLimit": 5,
    "dailyLeadsLimit": 10,
    "totalLeadsLimit": 100,
    "hasVerifiedBadge": true,
    "featuresIncluded": ["ADVANCED_ANALYTICS", "BULK_UPLOAD", "PRIORITY_SUPPORT", "VERIFIED_BADGE"]
  }
]
```

### Get Single Package
```
GET /api/packages/:id
Response: Package
```

### Create Package (Admin)
```
POST /api/packages
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Premium",
  "tier": "PREMIUM",
  "price": 299,
  "duration": "monthly",
  "propertyLimit": 20,
  "featuredLimit": 10,
  "storageLimit": 500,
  "dailyLeadsLimit": 50,
  "totalLeadsLimit": 500,
  "hasVerifiedBadge": true,
  "supportLevel": "vip",
  "featuresIncluded": ["API_ACCESS", "CUSTOM_DOMAIN", "ADVANCED_ANALYTICS", "BULK_UPLOAD", "PRIORITY_SUPPORT", "VERIFIED_BADGE", "FEATURED_LISTINGS", "LEAD_CAPTURE"]
}

Response: Package (201)
```

### Update Package (Admin)
```
PATCH /api/packages/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "price": 319,
  "propertyLimit": 25
}

Response: Package (200)
```

### Delete Package (Admin)
```
DELETE /api/packages/:id
Authorization: Bearer <JWT_TOKEN>

Response: Package (200)
```

---

## Owner Package Endpoints

### Get Owner's Current Package
```
GET /api/owner/packages
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "id": "ownerpkg_1",
  "packageId": "pkg_2",
  "ownerId": "user_123",
  "status": "ACTIVE",
  "startDate": "2026-01-23T00:00:00Z",
  "endDate": "2026-02-23T00:00:00Z",
  "package": {
    "id": "pkg_2",
    "name": "Standard",
    "tier": "STANDARD",
    "price": 99
  }
}
```

### Get Package Usage Statistics
```
GET /api/owner/packages/usage
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "id": "ownerpkg_1",
  "packageName": "Standard",
  "tier": "STANDARD",
  "status": "ACTIVE",
  "startDate": "2026-01-23T00:00:00Z",
  "endDate": "2026-02-23T00:00:00Z",
  
  "propertiesUsed": 3,
  "propertiesLimit": 5,
  "propertiesRemaining": 2,
  
  "featuredUsed": 1,
  "featuredLimit": 2,
  "featuredRemaining": 1,
  
  "storageUsed": 25.5,
  "storageLimit": 50,
  "storageRemaining": 24.5,
  "storagePercentage": 51,
  
  "leadsUsedToday": 5,
  "leadsUsedTotal": 45,
  "dailyLeadsLimit": 10,
  "totalLeadsLimit": 100,
  "leadsRemaining": 55,
  "leadsRemainingToday": 5,
  
  "hasVerifiedBadge": true,
  "verifiedBadgeActive": true,
  "supportLevel": "priority",
  "featuresIncluded": ["ADVANCED_ANALYTICS", "BULK_UPLOAD", "PRIORITY_SUPPORT", "VERIFIED_BADGE"]
}
```

### Subscribe to Package
```
POST /api/owner/packages/subscribe
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "packageId": "pkg_2",
  "duration": "monthly"  // or "yearly"
}

Response: OwnerPackage (201)
```

### Get Upgrade Options
```
GET /api/owner/packages/upgrade-options
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "canUpgrade": true,
  "availablePackages": [
    {
      "id": "pkg_2",
      "name": "Standard",
      "price": 99,
      ...
    },
    {
      "id": "pkg_3",
      "name": "Premium",
      "price": 299,
      ...
    }
  ]
}
```

---

## Usage Tracking Methods

### Increment Property Usage
```typescript
await packageService.incrementPropertyUsage(ownerId, count)
```

### Increment Featured Usage
```typescript
await packageService.incrementFeaturedUsage(ownerId, count)
```

### Update Storage Usage
```typescript
await packageService.updateStorageUsage(ownerId, storageUsedInGB)
```

### Increment Leads Usage
```typescript
await packageService.incrementLeadsUsage(ownerId)
```

### Reset Daily Leads (Cron Job)
```typescript
// Should run at midnight daily
await packageService.resetDailyLeads()
```

### Activate/Deactivate Verified Badge
```typescript
await packageService.activateVerifiedBadge(ownerId)
await packageService.deactivateVerifiedBadge(ownerId)
```

---

## Integration Examples

### When Adding a Property
```typescript
// In property creation API
const ownerPackage = await packageService.getOwnerActivePackage(ownerId);

// Check if owner can add more properties
if (!ownerPackage || ownerPackage.package.propertyLimit <= ownerPackage.propertiesUsed) {
  return errorResponse("Property limit reached. Please upgrade your package.", 400);
}

// Create property...
await prisma.property.create({ ... });

// Track usage
await packageService.incrementPropertyUsage(ownerId);
```

### When Making Property Featured
```typescript
const ownerPackage = await packageService.getOwnerActivePackage(ownerId);

if (!ownerPackage.package.featuredLimit || ownerPackage.featuredUsed >= ownerPackage.package.featuredLimit) {
  return errorResponse("Featured listing limit reached.", 400);
}

// Make featured...
await prisma.property.update({ isFeatured: true });

// Track usage
await packageService.incrementFeaturedUsage(ownerId);
```

### When Capturing a Lead
```typescript
const ownerPackage = await packageService.getOwnerActivePackage(ownerId);

// Check daily limit
if (ownerPackage.leadsUsedToday >= ownerPackage.package.dailyLeadsLimit) {
  return errorResponse("Daily lead limit reached.", 400);
}

// Check total limit
if (ownerPackage.leadsUsedTotal >= ownerPackage.package.totalLeadsLimit) {
  return errorResponse("Total lead limit reached.", 400);
}

// Create lead...
await prisma.inquiry.create({ ... });

// Track usage
await packageService.incrementLeadsUsage(ownerId);
```

---

## Default Package Configuration

The system comes with predefined packages in `PACKAGE_CONFIGS`:

```typescript
export const PACKAGE_CONFIGS = {
  BASIC: { /* ... */ },
  STANDARD: { /* ... */ },
  PREMIUM: { /* ... */ }
}
```

To initialize default packages:
```typescript
await packageService.initializeDefaultPackages();
```

---

## Verification Badge Feature

When a package includes a verified badge:
1. Owner can activate it: `await packageService.activateVerifiedBadge(ownerId)`
2. It shows on their profile and properties
3. Builds trust with potential renters/buyers

---

## Cron Jobs Required

### Daily Leads Reset (Midnight UTC)
```typescript
// pages/api/cron/reset-daily-leads.ts
await packageService.resetDailyLeads();
```

### Check & Update Expired Subscriptions (Daily)
```typescript
await prisma.ownerPackage.updateMany({
  where: {
    status: 'ACTIVE',
    endDate: { lt: new Date() }
  },
  data: { status: 'EXPIRED' }
});
```

---

## Frontend Integration Points

1. **Package Selection Component**
   - Display all packages with comparison
   - Show current owner package
   - Allow subscription/upgrade

2. **Dashboard Widget**
   - Show current package tier
   - Display usage bars (properties, storage, leads)
   - Quick upgrade button

3. **Feature Gating**
   - Check package limits before allowing actions
   - Show "upgrade to" messages
   - Display feature badges

4. **Settings Page**
   - Current package details
   - Billing information
   - Upgrade options
   - Cancel subscription

---

## Security Considerations

1. **Authentication**: All endpoint require JWT
2. **Ownership**: Users can only see/modify their own packages
3. **Admin Only**: Package creation/modification (marked with TODO)
4. **Rate Limiting**: Consider rate limits on lead capture
5. **Verification**: Validate subscription status before granting features

---

## Types Definition

Located in `src/types/package.ts`:

```typescript
export type PackageInput { }
export type PackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type OwnerPackageWithUsage { }
export type PackageFeature = 'API_ACCESS' | 'CUSTOM_DOMAIN' | ...;
export const PACKAGE_CONFIGS { }
```

---

## Files Modified/Created

### Schema Changes
- `prisma/schema.prisma` - Updated Package and OwnerPackage models
- `prisma/migrations/20260223130000_update_packages_features/` - Migration file

### Backend
- `src/lib/packages/packageService.ts` - Comprehensive service with 20+ methods
- `src/app/api/packages/route.ts` - Package CRUD endpoints
- `src/app/api/packages/[id]/route.ts` - Individual package endpoints
- `src/app/api/owner/packages/route.ts` - Owner's current package
- `src/app/api/owner/packages/usage/route.ts` - Usage statistics
- `src/app/api/owner/packages/subscribe/route.ts` - Subscribe endpoint
- `src/app/api/owner/packages/upgrade-options/route.ts` - Upgrade options

### Types
- `src/types/package.ts` - Updated with comprehensive types

---

## Next Steps

1. **Run Migration:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Initialize Default Packages:**
   ```typescript
   // In a setup endpoint or migration
   await packageService.initializeDefaultPackages();
   ```

3. **Create Frontend Components:**
   - PackageSelector
   - PackageDashboard
   - UpgradeModal
   - UsageCard

4. **Add Cron Jobs:**
   - Daily leads reset
   - Subscription expiration check

5. **Implement Feature Gating:**
   - Check limits before operations
   - Show upgrade prompts

---

## Example: Complete Owner Upgrade Flow

```typescript
// 1. Get available packages
const packages = await api.get('/packages');

// 2. Check upgrade options
const upgradeOptions = await api.get('/owner/packages/upgrade-options');

// 3. User selects package and duration
// 4. Subscribe to new package
const response = await api.post('/owner/packages/subscribe', {
  packageId: 'pkg_3',
  duration: 'yearly'
});

// 5. Get updated usage
const usage = await api.get('/owner/packages/usage');

// 6. Display new limits and features
// 7. Update UI accordingly
```

---

## Production Checklist

- [ ] Update schema and run migrations
- [ ] Initialize default packages
- [ ] Add admin role checks (commented with TODO)
- [ ] Setup Stripe/Payment integration
- [ ] Create cron jobs for daily reset and expiration
- [ ] Add feature gating to all operations
- [ ] Create frontend components
- [ ] Test upgrade flows
- [ ] Document rates/pricing
- [ ] Add logging for usage tracking
- [ ] Implement email notifications
- [ ] Add usage alerts (90% storage, etc.)
