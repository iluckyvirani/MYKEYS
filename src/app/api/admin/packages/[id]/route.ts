import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/admin/packages/[id]
 */
export const GET = withAuth<{ id: string }>(
  async (_req, _user, ctx) => {
    const pkg = await packageService.getById(ctx!.params.id);
    if (!pkg) return errorResponse('Package not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    return successResponse(pkg, 'Package retrieved successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * PATCH /api/admin/packages/[id]
 */
export const PATCH = withAuth<{ id: string }>(
  async (req, _user, ctx) => {
    const data = await req.json();
    if (data.durationUnit && !['days', 'months', 'years'].includes(data.durationUnit)) {
      return errorResponse('durationUnit must be days, months, or years', 400, ErrorCode.VALIDATION_ERROR);
    }
    const pkg = await packageService.update(ctx!.params.id, data);
    return successResponse(pkg, 'Package updated successfully', 200);
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * DELETE /api/admin/packages/[id]
 */
export const DELETE = withAuth<{ id: string }>(
  async (_req, _user, ctx) => {
    try {
      await packageService.delete(ctx!.params.id);
      return successResponse(null, 'Package deleted successfully', 200);
    } catch (err: any) {
      return errorResponse(err.message, 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
