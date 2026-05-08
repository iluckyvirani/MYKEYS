import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/admin/settings
 * Get admin settings (admin only)
 */
export const GET = withAuth(
  async () => {
    const settings = await packageService.getAdminSettings();
    return successResponse(settings, 'Settings retrieved successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * PATCH /api/admin/settings
 * Update admin settings (admin only)
 */
export const PATCH = withAuth(
  async (req: NextRequest) => {
    const data = await req.json();

    if (data.shortRentCommissionPercent !== undefined) {
      const val = Number(data.shortRentCommissionPercent);
      if (isNaN(val) || val < 0 || val > 100) {
        return errorResponse(
          'shortRentCommissionPercent must be a number between 0 and 100',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
    }

    const settings = await packageService.updateAdminSettings({
      shortRentCommissionPercent: Number(data.shortRentCommissionPercent ?? 0),
    });
    return successResponse(settings, 'Settings updated successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);
