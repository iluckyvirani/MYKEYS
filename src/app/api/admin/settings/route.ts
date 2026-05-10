import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { getAdminSettings, updateAdminBidSettings } from '@/lib/bids/bidService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/admin/settings
 * Get admin settings (admin only) — includes commission + bid config.
 */
export const GET = withAuth(
  async () => {
    const [base, bidSettings] = await Promise.all([
      packageService.getAdminSettings(),
      getAdminSettings(),
    ]);
    return successResponse({ ...base, ...bidSettings }, 'Settings retrieved successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * PATCH /api/admin/settings
 * Update admin settings (admin only)
 * Accepts: shortRentCommissionPercent, minBidAmountPerDay, maxBidDurationDays, maxBoostedSlotsPerZip
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
      await packageService.updateAdminSettings({
        shortRentCommissionPercent: val,
      });
    }

    // Bid config fields
    const bidUpdate: Parameters<typeof updateAdminBidSettings>[0] = {};
    if (data.minBidAmountPerDay !== undefined) {
      const val = Number(data.minBidAmountPerDay);
      if (isNaN(val) || val < 0) return errorResponse('minBidAmountPerDay must be >= 0', 400, ErrorCode.VALIDATION_ERROR);
      bidUpdate.minBidAmountPerDay = val;
    }
    if (data.maxBidDurationDays !== undefined) {
      const val = parseInt(data.maxBidDurationDays);
      if (isNaN(val) || val < 1) return errorResponse('maxBidDurationDays must be >= 1', 400, ErrorCode.VALIDATION_ERROR);
      bidUpdate.maxBidDurationDays = val;
    }
    if (data.maxBoostedSlotsPerZip !== undefined) {
      const val = parseInt(data.maxBoostedSlotsPerZip);
      if (isNaN(val) || val < 1) return errorResponse('maxBoostedSlotsPerZip must be >= 1', 400, ErrorCode.VALIDATION_ERROR);
      bidUpdate.maxBoostedSlotsPerZip = val;
    }
    if (Object.keys(bidUpdate).length > 0) {
      await updateAdminBidSettings(bidUpdate);
    }

    const settings = await getAdminSettings();
    return successResponse(settings, 'Settings updated successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);
