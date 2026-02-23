# Database Migration & Setup Instructions

## Overview

This guide walks through deploying the complete packages system database schema and initializing the platform.

---

## Prerequisites

- ✅ Prisma ORM installed (`npm install @prisma/client`)
- ✅ PostgreSQL database running and accessible
- ✅ DATABASE_URL environment variable configured
- ✅ Prisma schema updated with Package and OwnerPackage models

---

## Migration Steps

### Step 1: Validate Schema

```bash
# Validate that the Prisma schema is correct
npx prisma validate

# Expected output:
# ✓ Schema is valid
```

If validation fails, check:
- Syntax errors in `prisma/schema.prisma`
- Correct field types and names
- Proper relationships between models

---

### Step 2: Deploy Migrations

```bash
# Apply all pending migrations to your database
npx prisma migrate deploy

# Expected output:
# ✓ Successfully applied migrations
# ✓ Generated Prisma Client
```

**What this does:**
- Creates Document table with schema
- Creates/Updates Package table with new fields
- Creates/Updates OwnerPackage table with usage tracking
- Creates indexes for performance
- Generates updated Prisma Client

**Important Notes:**
- This is safe to run multiple times (idempotent)
- Always backup database before migrations on production
- Run during low-traffic period if possible

---

### Step 3: Regenerate Prisma Client

```bash
# Regenerate Prisma Client with new models
npx prisma generate

# Expected output:
# ✓ Generated Prisma Client v7.4.0 to .prisma/client
```

This updates TypeScript types for:
- `prisma.document`
- Enhanced `prisma.package`
- Enhanced `prisma.ownerPackage`

---

### Step 4: Verify Schema in Database

```bash
# Open Prisma Studio to inspect database
npx prisma studio

# This opens a web UI at http://localhost:5555
# Navigate to each model to verify structure
```

Or using psql:

```sql
-- Check if Document table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see:
-- - Document
-- - Package
-- - OwnerPackage
-- - User
-- - (other existing tables)

-- Check Document columns
\d "Document";

-- Check Package columns
\d "Package";

-- Check OwnerPackage columns
\d "OwnerPackage";
```

---

## Initialization Steps

### Step 1: Initialize Default Packages

Create a script file `scripts/init-packages.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { packageService } from "@/lib/packages/packageService";

async function main() {
  try {
    console.log("🚀 Initializing default packages...");
    
    // Check if packages already exist
    const existingPackages = await prisma.package.findMany();
    
    if (existingPackages.length > 0) {
      console.log(`✓ ${existingPackages.length} packages already exist. Skipping initialization.`);
      return;
    }
    
    // Initialize default packages
    await packageService.initializeDefaultPackages();
    
    console.log("✓ Packages initialized successfully!");
    
    // Verify creation
    const packages = await prisma.package.findMany({
      select: {
        tier: true,
        name: true,
        price: true,
        propertyLimit: true,
        featuredLimit: true,
        dailyLeadsLimit: true,
        totalLeadsLimit: true,
      },
    });
    
    console.log("\n📦 Created Packages:");
    packages.forEach((pkg) => {
      console.log(`  - ${pkg.name} (${pkg.tier}): $${pkg.price}/month`);
      console.log(`    Properties: ${pkg.propertyLimit}, Featured: ${pkg.featuredLimit}`);
      console.log(`    Leads: ${pkg.dailyLeadsLimit}/day, ${pkg.totalLeadsLimit} total`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize packages:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Run the initialization script:

```bash
# Using ts-node
npx ts-node scripts/init-packages.ts

# Or if using Next.js, create an API route
# POST /api/admin/init-packages

# Expected output:
# 🚀 Initializing default packages...
# ✓ Packages initialized successfully!
# 
# 📦 Created Packages:
#   - Basic Plan (BASIC): $0/month
#     Properties: 1, Featured: 0
#     Leads: 2/day, 10 total
#   - Standard Plan (STANDARD): $99/month
#     Properties: 5, Featured: 2
#     Leads: 10/day, 100 total
#   - Premium Plan (PREMIUM): $299/month
#     Properties: 20, Featured: 10
#     Leads: 50/day, 500 total
```

---

### Step 2: Create Test Owner

Create a test owner with a package subscription:

```typescript
import { prisma } from "@/lib/prisma";

async function createTestOwner() {
  const owner = await prisma.user.create({
    data: {
      email: "owner@example.com",
      name: "Test Owner",
      role: "OWNER",
      password: "hashed_password", // Use hashed password in production
    },
  });
  
  // Get STANDARD package
  const standardPackage = await prisma.package.findUnique({
    where: { tier: "STANDARD" },
  });
  
  if (!standardPackage) {
    throw new Error("STANDARD package not found");
  }
  
  // Subscribe owner to STANDARD package
  const subscription = await prisma.ownerPackage.create({
    data: {
      userId: owner.id,
      packageId: standardPackage.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      propertiesUsed: 0,
      featuredUsed: 0,
      storageUsed: 0,
      leadsUsedToday: 0,
      leadsUsedTotal: 0,
      verifiedBadgeActive: true,
    },
  });
  
  console.log("✓ Test owner created");
  console.log(`  Email: ${owner.email}`);
  console.log(`  Subscription: ${standardPackage.name}`);
  
  return { owner, subscription };
}

createTestOwner();
```

---

## Verification Checklist

After migration and initialization, verify everything is working:

### Database Level
```bash
# Check total record counts
npx prisma studio

# Or via SQL
SELECT COUNT(*) as total_packages FROM "Package";
SELECT COUNT(*) as total_owner_packages FROM "OwnerPackage";
SELECT COUNT(*) as total_documents FROM "Document";
```

### API Level
```bash
# Test 1: Fetch all packages
curl -X GET http://localhost:3000/api/packages

# Expected response:
# {
#   "success": true,
#   "data": [
#     { "tier": "BASIC", "name": "Basic Plan", "price": 0, ... },
#     { "tier": "STANDARD", "name": "Standard Plan", "price": 99, ... },
#     { "tier": "PREMIUM", "name": "Premium Plan", "price": 299, ... }
#   ]
# }

# Test 2: Get owner's package usage (requires auth token)
curl -X GET http://localhost:3000/api/owner/packages/usage \
  -H "Authorization: Bearer <your_jwt_token>"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "ownerId": "user_123",
#     "packageName": "Standard Plan",
#     "activeSince": "2025-02-26T00:00:00Z",
#     "status": "ACTIVE",
#     "properties": { "used": 0, "limit": 5, "percentage": 0 },
#     "featured": { "used": 0, "limit": 2, "percentage": 0 },
#     ...
#   }
# }
```

### Application Level
```bash
# Start dev server
npm run dev

# Navigate to: http://localhost:3000/owner/packages

# Verify you can:
# ✓ See package comparison page
# ✓ Click on packages without errors
# ✓ View current package info (if subscribed)
# ✓ See usage statistics
```

---

## Troubleshooting

### Issue: "Prisma Client does not include model Document"

**Cause:** Prisma Client not regenerated after schema changes

**Solution:**
```bash
npx prisma generate
```

### Issue: Migration fails with "table already exists"

**Cause:** Schema was already partially applied

**Solution:**
```bash
# View migration history
npx prisma migrate status

# Resolve by creating new migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Issue: Type errors when importing Package types

**Cause:** TypeScript cache not updated

**Solution:**
```bash
# Clear TypeScript cache and rebuild
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### Issue: Foreign key constraint error on OwnerPackage creation

**Cause:** Package doesn't exist or User doesn't exist

**Solution:**
```typescript
// Verify packages exist
const packages = await prisma.package.findMany();
console.log('Packages:', packages.length);

// Verify user exists
const user = await prisma.user.findUnique({
  where: { id: 'user_id' }
});
console.log('User:', user);

// Ensure both exist before creating OwnerPackage
```

### Issue: API returns 500 error when fetching usage

**Cause:** Database query timeout or connection issue

**Solution:**
```bash
# Check database connection
node -e "
  const prisma = require('@prisma/client').PrismaClient;
  const p = new prisma();
  p.\$queryRaw\`SELECT 1\`
    .then(() => console.log('✓ Connected'))
    .catch(e => console.log('✗ Error:', e.message))
    .finally(() => p.\$disconnect());
"

# Check for slow queries
# Enable Prisma logging
# Add to .env:
# DATABASE_LOG=query
```

---

## Rollback Instructions

If you need to rollback migrations:

```bash
# View all migrations
npx prisma migrate status

# Rollback last migration (be careful!)
npx prisma migrate resolve --rolled-back 20250226_add_packages

# Or completely reset database (CAUTION: loses all data)
npx prisma migrate reset
```

---

## Performance Optimization

### Indexes Created
The migration automatically creates indexes on:
- `OwnerPackage.userId` (fast owner lookup)
- `Package.tier` (fast tier lookup)
- `Document.userId` (fast document lookup)

### Query Optimization Tips
```typescript
// ✓ GOOD: Select only needed fields
const usage = await prisma.ownerPackage.findUnique({
  where: { userId: id },
  select: {
    propertiesUsed: true,
    featuredUsed: true,
    leadsUsedToday: true,
  }
});

// ✗ BAD: Select everything
const usage = await prisma.ownerPackage.findUnique({
  where: { userId: id }
});

// ✓ GOOD: Use include with select
const package = await prisma.package.findUnique({
  where: { tier: 'STANDARD' },
  include: {
    ownerPackages: { select: { userId: true } }
  }
});
```

---

## Backup & Recovery

Before running migrations on production:

```bash
# 1. Backup database
pg_dump -U postgres mykeys_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on backup
# (skip if using read replicas)
psql -U postgres mykeys_db_test < backup.sql
npx prisma migrate deploy

# 3. If successful, run on production
npx prisma migrate deploy

# 4. Verify production
npx prisma studio
```

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify all APIs responding correctly
- [ ] Test package selection flow
- [ ] Confirm usage tracking working
- [ ] Monitor error logs for issues

### Short-term (Week 1)
- [ ] Setup monitoring/alerts
- [ ] Configure email notifications
- [ ] Test with real user data
- [ ] Document any custom changes

### Medium-term (Month 1)
- [ ] Implement payment processing
- [ ] Setup cron jobs for maintenance
- [ ] Analyze usage patterns
- [ ] Optimize based on real data

---

## Environment Setup

### .env Configuration
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mykeys_db"

# Prisma
PRISMA_LOG=error

# Optional: Enable SQL logging
DATABASE_LOG=query,warn

# Application
APP_ENV=development
```

### .env.production
```env
# Database (Production)
DATABASE_URL="postgresql://prod_user:prod_password@prod-host:5432/mykeys_db"

# Disable logging in production
PRISMA_LOG=error

# Other production settings
APP_ENV=production
```

---

## Next Steps

After successful deployment:

1. **Test Feature Gating**
   - Implement checks in property creation endpoints
   - Test limit enforcement
   - See: `FEATURE_GATING_IMPLEMENTATION.md`

2. **Setup Cron Jobs**
   - Daily lead reset at midnight UTC
   - Subscription expiration check
   - Email notifications

3. **Integrate Payments**
   - Setup Stripe/Razorpay
   - Create payment webhooks
   - See: `PAYMENT_INTEGRATION_GUIDE.md`

4. **Monitor Production**
   - Setup error tracking (Sentry)
   - Add performance monitoring
   - Create admin dashboard

---

## Support

For migration issues:
- Check `PACKAGES_SYSTEM_COMPLETE_SUMMARY.md` for overview
- Review Prisma docs: https://www.prisma.io/docs/
- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql.log`

