# Owner Packages System - Frontend Implementation Guide

## Overview

This comprehensive guide covers the complete frontend implementation of the owner packages system. It includes ready-to-use React components, custom hooks, and integration patterns.

### Components Created
1. **PackageComparison.tsx** - Display all packages with detailed comparison
2. **PackageDashboard.tsx** - Show current package and usage metrics
3. **SubscriptionModal.tsx** - Handle package selection and subscription
4. **UpgradePromptModal.tsx** - Nudge users when approaching limits
5. **OwnerPackagesPage.tsx** - Main packages management page

### Custom Hooks
- **usePackageUpgrade()** - Check upgrade availability
- **usePackageUsage()** - Fetch and manage usage data

---

## Component Architecture

### 1. PackageComparison Component

**Purpose:** Display all available packages with side-by-side comparison

**Props:**
```typescript
interface Props {
  onSelectPackage?: (packageId: string, duration: string) => void;
  currentPackageTier?: string;
}
```

**Features:**
- Monthly/Yearly toggle with 10% savings display
- Package cards showing all features
- Usage indicators for each tier
- Detailed comparison table
- Current plan badge

**Usage:**
```tsx
<PackageComparison
  onSelectPackage={(id, duration) => console.log(id, duration)}
  currentPackageTier="STANDARD"
/>
```

**API Calls:**
- `GET /packages` - Fetch all active packages

---

### 2. PackageDashboard Component

**Purpose:** Display current package and real-time usage statistics

**Props:**
```typescript
interface Props {
  onUpgrade?: () => void;
  onViewDetails?: () => void;
}
```

**Features:**
- Current package header with expiration info
- Usage cards for each resource (properties, featured, storage, leads)
- Progress bars with color-coded limits (green < 70%, yellow 70-90%, red > 90%)
- Verified badge status
- Automatic suggestion to upgrade when near limits
- Refresh button with loading state

**Usage:**
```tsx
<PackageDashboard
  onUpgrade={() => setModalOpen(true)}
  onViewDetails={() => navigateTo('comparison')}
/>
```

**API Calls:**
- `GET /owner/packages/usage` - Fetch comprehensive usage statistics

**Response Shape:**
```typescript
interface PackageUsage {
  ownerId: string;
  packageName: string;
  packageTier: string;
  activeSince: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  properties: { used: number; limit: number; percentage: number };
  featured: { used: number; limit: number; percentage: number };
  storage: { usedGB: number; limitGB: number; percentage: number };
  leads: {
    usedToday: number;
    totalUsed: number;
    dailyLimit: number;
    totalLimit: number;
    dailyPercentage: number;
    totalPercentage: number;
  };
  verifiedBadge: { active: boolean; expiresAt: string | null };
}
```

---

### 3. SubscriptionModal Component

**Purpose:** Handle package selection and subscription process

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPackageTier?: string;
}
```

**Features:**
- Two-step flow: Selection → Confirmation
- Integrated PackageComparison in step 1
- Subscription details preview in step 2
- Error handling and retry logic
- Loading state during subscription

**Usage:**
```tsx
const [modalOpen, setModalOpen] = useState(false);

<SubscriptionModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onSuccess={() => {
    console.log('Subscribed successfully');
    setModalOpen(false);
  }}
/>
```

**API Calls:**
- `POST /owner/packages/subscribe` - Create subscription

**Request:**
```typescript
{
  packageId: string;
  duration: "monthly" | "yearly";
}
```

**Response:**
```typescript
{
  id: string;
  userId: string;
  packageId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  renewalDate: string;
  // ... other fields
}
```

---

### 4. UpgradePromptModal Component

**Purpose:** Display contextual upgrade prompts when limits approached

**Props:**
```typescript
export type UpgradeReason = "properties" | "featured" | "storage" | "leads";

interface Props {
  isOpen: boolean;
  reason: UpgradeReason;
  onUpgrade: () => void;
  onDismiss: () => void;
}
```

**Usage:**
```tsx
const [upgradePrompt, setUpgradePrompt] = useState({
  isOpen: false,
  reason: "leads" as UpgradeReason
});

<UpgradePromptModal
  isOpen={upgradePrompt.isOpen}
  reason={upgradePrompt.reason}
  onUpgrade={() => {
    setUpgradePrompt({ isOpen: false, reason: 'properties' });
    setSubscriptionModalOpen(true);
  }}
  onDismiss={() => setUpgradePrompt({ isOpen: false, reason: 'properties' })}
/>
```

---

### 5. OwnerPackagesPage Component

**Purpose:** Main page for package management with multiple views

**Features:**
- Dashboard view (current plan and usage)
- Comparison view (all plans side-by-side)
- FAQ view with common questions
- Integrated SubscriptionModal
- Tab navigation between views

**Routes:**
- `/owner/packages` - Main packages page

**Usage:**
```tsx
import OwnerPackagesPage from '@/app/owner/packages/page';

// In your router
<Route path="/owner/packages" element={<OwnerPackagesPage />} />
```

---

## Custom Hooks

### usePackageUpgrade Hook

**Purpose:** Check if owner can upgrade to higher tiers

```typescript
const {
  checkUpgradeOptions,  // async () => Promise<UpgradeOption>
  hasAvailableUpgrades, // async () => Promise<boolean>
  loading,              // boolean
  error,                // string | null
} = usePackageUpgrade();
```

**Example:**
```tsx
import { usePackageUpgrade } from "@/lib/hooks/usePackage";

export default function MyComponent() {
  const { checkUpgradeOptions, loading } = usePackageUpgrade();

  const handleCheckUpgrades = async () => {
    const options = await checkUpgradeOptions();
    if (options?.canUpgrade) {
      console.log('Available packages:', options.availablePackages);
    }
  };

  return (
    <button onClick={handleCheckUpgrades} disabled={loading}>
      Check Upgrades
    </button>
  );
}
```

---

### usePackageUsage Hook

**Purpose:** Fetch and manage package usage data with helper methods

```typescript
const {
  usage,                      // PackageUsage | null
  loading,                    // boolean
  error,                      // string | null
  fetchUsage,                 // () => Promise<void>
  isNearLimit,                // (resource) => boolean
  canCreateProperty,          // () => boolean
  canMakeFeatured,           // () => boolean
  canCaptureLeads,           // () => boolean
  getRemainingResources,     // (resource) => number
} = usePackageUsage();
```

**Example:**
```tsx
import { usePackageUsage } from "@/lib/hooks/usePackage";
import UpgradePromptModal from "@/components/owner/UpgradePromptModal";

export default function CreatePropertyPage() {
  const { usage, canCreateProperty, isNearLimit, fetchUsage } = usePackageUsage();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleCreateProperty = async () => {
    if (!canCreateProperty()) {
      setShowUpgradePrompt(true);
      return;
    }

    if (isNearLimit("properties")) {
      alert("⚠️ You're nearing your property limit. Consider upgrading.");
    }

    // Proceed with creating property
    console.log("Remaining properties:", getRemainingResources("properties"));
  };

  return (
    <>
      <button onClick={handleCreateProperty}>Create Property</button>
      <UpgradePromptModal
        isOpen={showUpgradePrompt}
        reason="properties"
        onUpgrade={() => {/* open subscription modal */}}
        onDismiss={() => setShowUpgradePrompt(false)}
      />
    </>
  );
}
```

---

## Integration Patterns

### 1. Feature Gating in Create Operations

**Pattern:** Check limits before allowing resource creation

```typescript
// In your property creation handler
import { usePackageUsage } from "@/lib/hooks/usePackage";

export default function PropertyForm() {
  const { canCreateProperty, isNearLimit, getRemainingResources } = usePackageUsage();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSubmit = async (data: PropertyFormData) => {
    // Check if user can create property
    if (!canCreateProperty()) {
      setShowUpgradeModal(true);
      return;
    }

    // Warn if near limit (but allow creation)
    if (isNearLimit("properties")) {
      const remaining = getRemainingResources("properties");
      if (!confirm(`Only ${remaining} properties remaining. Continue?`)) {
        return;
      }
    }

    // Proceed with creation
    await createProperty(data);
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

---

### 2. Dashboard Integration

**Pattern:** Show package info and usage in owner dashboard

```typescript
import { useState } from "react";
import PackageDashboard from "@/components/owner/PackageDashboard";
import SubscriptionModal from "@/components/owner/SubscriptionModal";

export default function OwnerDashboard() {
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Other dashboard sections */}

      {/* Package Dashboard */}
      <PackageDashboard
        onUpgrade={() => setSubscriptionModalOpen(true)}
        onViewDetails={() => navigateTo("/owner/packages")}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSuccess={() => {
          // Refresh dashboard or navigate
          window.location.reload();
        }}
      />
    </div>
  );
}
```

---

### 3. Leads Management Integration

**Pattern:** Check daily lead limits before capturing inquiries

```typescript
import { usePackageUsage } from "@/lib/hooks/usePackage";

export default function InquiryHandler() {
  const { canCaptureLeads, isNearLimit } = usePackageUsage();

  const handleNewInquiry = async (inquiry: InquiryData) => {
    if (!canCaptureLeads()) {
      // Queue inquiry and show upgrade prompt
      showUpgradePrompt("leads");
      return;
    }

    if (isNearLimit("leads")) {
      console.warn("User nearing daily lead limit");
      // Optional: notify user
    }

    // Process inquiry normally
    await createInquiry(inquiry);
  };
}
```

---

### 4. Navigation Menu Integration

**Pattern:** Add link to packages page in owner navigation

```typescript
// In your owner navigation component
<nav>
  <ul>
    <li><a href="/owner/dashboard">Dashboard</a></li>
    <li><a href="/owner/properties">Properties</a></li>
    <li><a href="/owner/packages">📊 Packages & Billing</a></li>
    <li><a href="/owner/inquiries">Inquiries</a></li>
  </ul>
</nav>
```

---

## Color Coding Strategy

### Usage Percentage Colors
- **Green** (< 70%): Safe, plenty of resources available
- **Yellow** (70-90%): Caution, consider upgrading soon
- **Red** (≥ 90%): Warning, upgrade recommended

### Status Badges
- **ACTIVE** (Green): Subscription is active
- **EXPIRED** (Gray): Subscription has ended
- **CANCELLED** (Red): Subscription was cancelled

---

## Error Handling

### Common Error Scenarios

```typescript
// Subscription already exists
{
  "code": "SUBSCRIPTION_ALREADY_EXISTS",
  "message": "Previous subscription must be cancelled first"
}

// Package not found
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Package not found"
}

// Unauthorized
{
  "code": "UNAUTHORIZED",
  "message": "Only package owners can view this resource"
}
```

### Error Handling Pattern

```typescript
const handleSubscribe = async () => {
  try {
    const response = await api.post("/owner/packages/subscribe", {
      packageId,
      duration,
    });
    onSuccess();
  } catch (error: any) {
    const message = error.response?.data?.message;

    if (error.response?.data?.code === "SUBSCRIPTION_ALREADY_EXISTS") {
      // Handle existing subscription
      setError("Please cancel your current plan before upgrading");
    } else if (error.response?.status === 401) {
      // Handle auth error
      redirectToLogin();
    } else {
      // Generic error
      setError(message || "Failed to subscribe");
    }
  }
};
```

---

## Styling & Customization

### Tailwind Configuration

All components use Tailwind CSS. Ensure these color classes are available:
- `bg-green-{50,100,600,700}`
- `text-green-{600,800,900}`
- `border-green-{200,600}`
- `bg-yellow-{50,500,600}`
- `bg-red-{50,600}`
- `bg-blue-{50,600,900}`
- `border-blue-{200}`

### Custom Theming

To customize colors, modify the component classes:

```tsx
// Change primary color from green to blue
className="bg-blue-600 hover:bg-blue-700"

// Change status badge colors
className={`
  ${status === "ACTIVE" ? "bg-blue-500" : "bg-gray-500"}
  text-white px-4 py-2 rounded
`}
```

---

## Performance Optimization

### Data Fetching

```typescript
// Avoid refetching on every render
const { usage, fetchUsage } = usePackageUsage();

useEffect(() => {
  fetchUsage(); // Called only once on mount
}, [fetchUsage]); // Safe dependency
```

### Memoization

```typescript
import { useMemo } from "react";

// Expensive calculations
const upgradeOptions = useMemo(() => {
  return packages.filter((p) => p.propertyLimit > currentLimit);
}, [packages, currentLimit]);
```

---

## Testing

### Component Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import PackageDashboard from "@/components/owner/PackageDashboard";

describe("PackageDashboard", () => {
  it("should display current package name", async () => {
    render(<PackageDashboard />);
    expect(await screen.findByText(/Standard Plan/i)).toBeInTheDocument();
  });

  it("should call onUpgrade when upgrade button clicked", () => {
    const onUpgrade = jest.fn();
    render(<PackageDashboard onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByText(/Upgrade Plan/i));
    expect(onUpgrade).toHaveBeenCalled();
  });
});
```

---

## Deployment Checklist

- [ ] All API endpoints running and tested
- [ ] Database migrations deployed
- [ ] Components styled and responsive
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Mobile responsive tested
- [ ] Accessibility audit passed
- [ ] Performance tested (no unnecessary re-renders)
- [ ] Analytics tracking added
- [ ] Email notifications configured for subscription changes

---

## Next Steps

1. **Payment Integration:** Connect Stripe/Razorpay for package payments
2. **Cron Jobs:** Set up daily lead reset and subscription expiration checks
3. **Email Notifications:** Send confirmation and renewal emails
4. **Analytics:** Track package conversions and upgrades
5. **A/B Testing:** Test different pricing and messaging variations

---

## Support & Resources

- API Documentation: See `OWNER_PACKAGES_SYSTEM.md`
- Type Definitions: See `src/types/package.ts`
- Backend Services: See `src/lib/packages/packageService.ts`
- Example Implementations: See component files

