import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/packages
 * Public list of active packages (for owner purchase page)
 */
export async function GET() {
  try {
    const packages = await packageService.getAll(true); // activeOnly
    return successResponse(packages, 'Packages retrieved successfully', 200);
  } catch (err: any) {
    console.error('Error fetching packages:', err);
    return errorResponse('Failed to fetch packages', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

