# Package Feature Gating Implementation Guide

## Quick Reference for Feature Limits Enforcement

This guide shows how to implement feature gating in your application to enforce package limits across create/update operations.

---

## 1. Property Creation Gating

### Pattern: Check limit before creating property

**File:** `src/app/api/properties/route.ts` (POST handler)

```typescript
import { requireAuth } from '@/lib/auth';
import { packageService } from '@/lib/packages/packageService';
import { errorResponse, successResponse } from '@/lib/response';
import { ErrorCode } from '@/types/error';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // Get owner's current package usage
    const usage = await packageService.getOwnerPackageUsage(user.id);
    
    // CHECK: Can owner create more properties?
    if (usage.properties.percentage >= 100) {
      return errorResponse(
        'Property limit reached. Upgrade your plan to add more properties.',
        ErrorCode.RESOURCE_LIMIT_EXCEEDED,
        402 // Payment Required
      );
    }
    
    // WARN: Near limit?
    if (usage.properties.percentage > 80) {
      console.warn(`User ${user.id} near property limit: ${usage.properties.percentage}%`);
      // Optional: Add warning to response
    }
    
    // Parse request and create property
    const propertyData = await request.json();
    // ... create property logic
    
    return successResponse(property, 'Property created successfully', 201);
  } catch (error) {
    // ... error handling
  }
}
```

---

## 2. Featured Listing Gating

### Pattern: Check featured limit before activating feature

**File:** `src/app/api/properties/[id]/featured/route.ts` (PATCH handler)

```typescript
import { requireAuth } from '@/lib/auth';
import { packageService } from '@/lib/packages/packageService';
import { errorResponse, successResponse } from '@/lib/response';
import { ErrorCode } from '@/types/error';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const propertyId = params.id;
    
    // Check if user owns this property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, isFeatured: true }
    });
    
    if (!property || property.ownerId !== user.id) {
      return errorResponse('Property not found', ErrorCode.UNAUTHORIZED, 403);
    }
    
    // If already featured, allow to unfeature
    if (property.isFeatured) {
      return updateFeatured(propertyId, false);
    }
    
    // Check if can add as featured
    const usage = await packageService.getOwnerPackageUsage(user.id);
    
    if (usage.featured.percentage >= 100) {
      return errorResponse(
        'Featured listing limit reached. Upgrade your plan to feature more properties.',
        ErrorCode.RESOURCE_LIMIT_EXCEEDED,
        402
      );
    }
    
    // Make featured
    const updated = await updateFeatured(propertyId, true);
    
    // Track usage
    await packageService.incrementFeaturedUsage(user.id);
    
    return successResponse(updated, 'Property featured successfully');
  } catch (error) {
    // ... error handling
  }
}

async function updateFeatured(propertyId: string, isFeatured: boolean) {
  return prisma.property.update({
    where: { id: propertyId },
    data: { isFeatured },
  });
}
```

---

## 3. Lead Capture Gating

### Pattern: Check daily & total lead limits

**File:** `src/app/api/inquiries/route.ts` (POST handler)

```typescript
import { requireAuth } from '@/lib/auth';
import { packageService } from '@/lib/packages/packageService';
import { errorResponse, successResponse } from '@/lib/response';
import { ErrorCode } from '@/types/error';

export async function POST(request: NextRequest) {
  try {
    // Get inquiry data (not necessarily authenticated user)
    const inquiryData = await request.json();
    const { propertyId, inquirerEmail, message } = inquiryData;
    
    // Find property owner
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true }
    });
    
    if (!property) {
      return errorResponse('Property not found', ErrorCode.RESOURCE_NOT_FOUND, 404);
    }
    
    // Check owner's package
    const usage = await packageService.getOwnerPackageUsage(property.ownerId);
    
    // CHECK: Daily limit
    if (usage.leads.dailyPercentage >= 100) {
      return errorResponse(
        'Daily lead limit reached. Leads queue for next period or upgrade your plan.',
        ErrorCode.RESOURCE_LIMIT_EXCEEDED,
        402,
        { queued: true } // Optional: indicate inquiry is queued
      );
    }
    
    // CHECK: Total limit
    if (usage.leads.totalPercentage >= 100) {
      return errorResponse(
        'Total lead limit reached for this billing period. Upgrade your plan.',
        ErrorCode.RESOURCE_LIMIT_EXCEEDED,
        402,
        { queued: true }
      );
    }
    
    // WARN: Near limit?
    let queued = false;
    if (usage.leads.dailyPercentage > 90) {
      console.warn(`Owner ${property.ownerId} nearing daily lead limit`);
    }
    if (usage.leads.totalPercentage > 90) {
      console.warn(`Owner ${property.ownerId} nearing total lead limit`);
    }
    
    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        inquirerEmail,
        message,
        status: queued ? 'QUEUED' : 'NEW',
      }
    });
    
    // Increment lead count
    await packageService.incrementLeadsUsage(property.ownerId);
    
    // Notify owner
    await sendNewLeadEmail(property.ownerId, inquiry);
    
    return successResponse(inquiry, 'Inquiry submitted successfully', 201);
  } catch (error) {
    // ... error handling
  }
}
```

---

## 4. Storage Gating

### Pattern: Check storage quota before uploading files

**File:** `src/app/api/upload/route.ts` (POST handler)

```typescript
import { requireAuth } from '@/lib/auth';
import { packageService } from '@/lib/packages/packageService';
import { errorResponse, successResponse } from '@/lib/response';
import { ErrorCode } from '@/types/error';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse('No file provided', ErrorCode.VALIDATION_ERROR, 400);
    }
    
    // Get file size in GB
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    
    // Check package storage
    const usage = await packageService.getOwnerPackageUsage(user.id);
    const storageAfterUpload = usage.storage.usedGB + fileSizeGB;
    
    if (storageAfterUpload > usage.storage.limitGB) {
      return errorResponse(
        `Insufficient storage. Upload would exceed limit. (Have: ${usage.storage.usedGB}GB, Need: ${storageAfterUpload}GB)`,
        ErrorCode.RESOURCE_LIMIT_EXCEEDED,
        402
      );
    }
    
    // If near limit, add warning header
    const percentageAfter = (storageAfterUpload / usage.storage.limitGB) * 100;
    const headers: Record<string, string> = {};
    if (percentageAfter > 80) {
      headers['X-Storage-Warning'] = `Storage nearly full: ${Math.round(percentageAfter)}%`;
    }
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file);
    
    // Update storage usage
    await packageService.updateStorageUsage(user.id, fileSizeGB);
    
    return successResponse(
      { url: cloudinaryUrl, size: fileSizeGB },
      'File uploaded successfully',
      201,
      headers
    );
  } catch (error) {
    // ... error handling
  }
}
```

---

## 5. Verified Badge Gating

### Pattern: Only show/use verified badge if package includes it

**File:** Component example

```typescript
// In profile component
export default function OwnerProfile({ ownerId }: { ownerId: string }) {
  const [usage, setUsage] = useState<PackageUsage | null>(null);
  
  useEffect(() => {
    fetchUsage();
  }, []);
  
  const fetchUsage = async () => {
    const response = await api.get(`/owner/packages/usage?ownerId=${ownerId}`);
    setUsage(response.data);
  };
  
  return (
    <div>
      <h1>{ownerName}</h1>
      
      {/* Show verified badge only if active */}
      {usage?.verifiedBadge?.active && (
        <div className="flex items-center gap-2 text-sky-600">
          <BadgeIcon className="w-5 h-5" />
          <span>Verified Owner</span>
        </div>
      )}
      
      {/* Show limited badge if not verified */}
      {!usage?.verifiedBadge?.active && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span>Unverified - Upgrade to get verified badge</span>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Frontend Feature Gating (Using Hook)

### Pattern: Disable UI elements based on limits

**File:** Any component using `usePackageUsage` hook

```typescript
import { usePackageUsage } from "@/lib/hooks/usePackage";

export default function PropertyListingForm() {
  const { canCreateProperty, canMakeFeatured, isNearLimit, getRemainingResources } = usePackageUsage();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>("properties");
  
  const handleAddProperty = () => {
    if (!canCreateProperty()) {
      setUpgradeReason("properties");
      setShowUpgradePrompt(true);
      return;
    }
    
    if (isNearLimit("properties")) {
      const remaining = getRemainingResources("properties");
      console.warn(`Only ${remaining} properties remaining`);
    }
    
    // Open property creation form
  };
  
  const handleMakeFeatured = (propertyId: string) => {
    if (!canMakeFeatured()) {
      setUpgradeReason("featured");
      setShowUpgradePrompt(true);
      return;
    }
    
    // Make featured
    updateProperty(propertyId, { isFeatured: true });
  };
  
  return (
    <>
      {/* Add property button - disabled if limit reached */}
      <Button
        onClick={handleAddProperty}
        disabled={!canCreateProperty()}
        title={!canCreateProperty() ? "Property limit reached" : ""}
      >
        Add Property {!canCreateProperty() && " (Limit Reached)"}
      </Button>
      
      {/* Featured toggle - disabled if limit reached */}
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              handleMakeFeatured(propertyId);
            } else {
              updateProperty(propertyId, { isFeatured: false });
            }
          }}
          disabled={!canMakeFeatured()}
        />
        Make Featured
      </label>
      
      {/* Upgrade prompt modal */}
      <UpgradePromptModal
        isOpen={showUpgradePrompt}
        reason={upgradeReason}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          openSubscriptionModal();
        }}
        onDismiss={() => setShowUpgradePrompt(false)}
      />
    </>
  );
}
```

---

## 7. Error Code Enums

### Reference: Error codes for limit exceeded responses

```typescript
// src/types/error.ts
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_LIMIT_EXCEEDED = "RESOURCE_LIMIT_EXCEEDED", // ← Use this for packag limits
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SUBSCRIPTION_ALREADY_EXISTS = "SUBSCRIPTION_ALREADY_EXISTS",
  INVALID_DURATION = "INVALID_DURATION",
  PACKAGE_NOT_FOUND = "PACKAGE_NOT_FOUND",
}
```

---

## 8. Response Format with Limits

### Standard error response for limit exceeded

```typescript
// Example error response when property limit reached
{
  "success": false,
  "code": "RESOURCE_LIMIT_EXCEEDED",
  "message": "Property limit reached. Upgrade your plan to add more properties.",
  "statusCode": 402,
  "data": {
    "current": 5,
    "limit": 5,
    "percentage": 100,
    "suggestedPlan": "STANDARD" // Optional
  }
}

// Example error response when daily lead limit reached
{
  "success": false,
  "code": "RESOURCE_LIMIT_EXCEEDED", 
  "message": "Daily lead limit reached. Leads queue for next period or upgrade your plan.",
  "statusCode": 402,
  "data": {
    "resource": "leads",
    "limit_type": "daily",
    "used_today": 10,
    "daily_limit": 10,
    "total_used": 45,
    "total_limit": 100,
    "queued": true // Inquiry was queued instead of rejected
  }
}
```

---

## 9. Database Updates During Gated Operations

### Pattern: Log resource usage

**In your resource creation handlers:**

```typescript
// After successful property creation
await packageService.incrementPropertyUsage(ownerId);

// After successful featured update
await packageService.incrementFeaturedUsage(ownerId);

// After successful lead capture
await packageService.incrementLeadsUsage(ownerId);

// After successful file upload
await packageService.updateStorageUsage(ownerId, fileSizeGB);
```

---

## 10. Testing Feature Gating

### Test scenarios

```typescript
describe("Property Creation Gating", () => {
  it("should reject property creation when limit reached", async () => {
    // Setup: User at property limit
    await setUserPackageUsage(userId, { properties: { used: 5, limit: 5 } });
    
    // Action: Try to create property
    const response = await POST(request);
    
    // Assert: Should reject with 402 status
    expect(response.status).toBe(402);
    expect(response.code).toBe("RESOURCE_LIMIT_EXCEEDED");
  });
  
  it("should warn when approaching limit", async () => {
    // Setup: User at 85% property usage
    await setUserPackageUsage(userId, { properties: { used: 4, limit: 5 } });
    
    // Action: Create property
    const response = await POST(request);
    
    // Assert: Should succeed but warn
    expect(response.status).toBe(201);
    expect(response.headers['X-Limit-Warning']).toBeDefined();
  });
  
  it("should allow creation when under limit", async () => {
    // Setup: User with available properties
    await setUserPackageUsage(userId, { properties: { used: 2, limit: 5 } });
    
    // Action: Create property
    const response = await POST(request);
    
    // Assert: Should succeed
    expect(response.status).toBe(201);
    
    // Verify: Usage incremented
    const updated = await getPackageUsage(userId);
    expect(updated.properties.used).toBe(3);
  });
});
```

---

## Deployment Checklist

- [ ] All feature gating logic implemented in POST/PATCH handlers
- [ ] Error responses return correct status codes (402 for limits)
- [ ] Usage tracking increments after successful operations
- [ ] Frontend uses hooks to disable UI when limits reached
- [ ] Upgrade prompts shown appropriately
- [ ] Tests verify gating behavior
- [ ] Database indexes built for fast usage queries
- [ ] Response headers include limit warnings
- [ ] Email notifications sent when limits reached

---

## Common Issues & Solutions

### Issue: Property created despite limit exceeded
- **Cause:** Limit check not implemented in POST handler
- **Solution:** Add `if (usage.properties.percentage >= 100) { return errorResponse(...) }`

### Issue: Frontend still allows creation after limit reached
- **Cause:** usePackageUsage hook not called or canCreateProperty() not checked
- **Solution:** Call `fetchUsage()` in useEffect and check `canCreateProperty()` before enabling button

### Issue: Usage not incremented after creation
- **Cause:** `packageService.incrementPropertyUsage()` not called
- **Solution:** Add call after successful creation: `await packageService.incrementPropertyUsage(userId)`

### Issue: Users see outdated limits on frontend
- **Cause:** Usage data cached without refresh
- **Solution:** Call `fetchUsage()` after operations or add `refetch()` button

---

## Next Steps

1. Implement feature gating in all resource creation APIs
2. Add frontend hook usage in create/update components
3. Setup upgrade prompt modals
4. Add analytics tracking for limit-exceeded events
5. Create admin dashboard to monitor usage patterns
6. Consider implementing lead queueing system for BASIC tier

