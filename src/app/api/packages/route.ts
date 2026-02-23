import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/packages
 * Get all active packages
 */
export async function GET() {
  try {
    const packages = await packageService.getAll();
    return successResponse(packages, "Packages retrieved successfully", 200);
  } catch (err: any) {
    console.error('Error fetching packages:', err);
    return errorResponse(
      'Failed to fetch packages',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/packages
 * Create a new package (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    
    // TODO: Add admin role check
    // if (authUser.role !== 'ADMIN') {
    //   return errorResponse('Unauthorized', 403, ErrorCode.FORBIDDEN);
    // }

    const data = await req.json();
    const pkg = await packageService.create(data);
    
    return successResponse(
      pkg,
      "Package created successfully",
      201
    );
  } catch (err: any) {
    console.error('Error creating package:', err);
    return errorResponse(
      err.message || 'Failed to create package',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

