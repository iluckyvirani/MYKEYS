import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/admin/packages
 * List all packages (admin only)
 */
export const GET = withAuth(
  async (_req: NextRequest) => {
    const packages = await packageService.getAll();
    return successResponse(packages, 'Packages retrieved successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * POST /api/admin/packages
 * Create a new package (admin only)
 */
export const POST = withAuth(
  async (req: NextRequest) => {
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

    const pkg = await packageService.create(data);
    return successResponse(pkg, 'Package created successfully', 201);
  },
  { roles: [UserRole.ADMIN] }
);
