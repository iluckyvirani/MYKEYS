import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';
import { STRIPE_MIN_AMOUNT_GBP } from '@/lib/stripe';

function validatePackagePrice(price: number): string | null {
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    return 'Price must be a number of £0 or more';
  }
  // Paid packages must meet Stripe's GBP minimum (£0.30)
  if (price > 0 && price < STRIPE_MIN_AMOUNT_GBP) {
    return `Paid package price must be at least £${STRIPE_MIN_AMOUNT_GBP.toFixed(2)} (Stripe card payment minimum). Use £0 for a free package.`;
  }
  return null;
}

/**
 * GET /api/admin/packages
 * List all packages (admin only)
 */
export const GET = withAuth(
  async (_req: NextRequest) => {
    try {
      const packages = await packageService.getAll();
      return successResponse(packages, 'Packages retrieved successfully', 200);
    } catch (error) {
      console.error('Get packages error:', error);
      return errorResponse(
        'Failed to retrieve packages',
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * POST /api/admin/packages
 * Create a new package (admin only)
 */
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const data = await req.json();

      if (!data.name || data.price === undefined || !data.durationValue || !data.durationUnit) {
        return errorResponse(
          'name, price, durationValue, and durationUnit are required',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      if (!['days', 'months', 'years'].includes(data.durationUnit)) {
        return errorResponse('durationUnit must be days, months, or years', 400, ErrorCode.VALIDATION_ERROR);
      }

      if (data.category && !['SALE', 'RENT'].includes(data.category)) {
        return errorResponse('category must be SALE or RENT', 400, ErrorCode.VALIDATION_ERROR);
      }

      const priceError = validatePackagePrice(Number(data.price));
      if (priceError) {
        return errorResponse(priceError, 400, ErrorCode.VALIDATION_ERROR);
      }

      const pkg = await packageService.create(data);
      return successResponse(pkg, 'Package created successfully', 201);
    } catch (error) {
      console.error('Create package error:', error);
      return errorResponse(
        'Failed to create package',
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
