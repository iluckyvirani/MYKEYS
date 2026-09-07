import { NextRequest } from 'next/server';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';
import { PackageAudience } from '@/types/package';

/**
 * GET /api/packages?audience=OWNER|AGENT|ALL
 * Public list of active packages. Defaults to OWNER. ALL returns owner + agent.
 */
export async function GET(request: NextRequest) {
  try {
    const audienceParam = request.nextUrl.searchParams.get('audience');
    const audience =
      audienceParam === 'AGENT' || audienceParam === 'OWNER'
        ? (audienceParam as PackageAudience)
        : audienceParam === 'ALL'
          ? undefined
          : 'OWNER';
    const packages = await packageService.getAll(true, undefined, audience);
    return successResponse(packages, 'Packages retrieved successfully', 200);
  } catch (err: any) {
    console.error('Error fetching packages:', err);
    return errorResponse('Failed to fetch packages', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

