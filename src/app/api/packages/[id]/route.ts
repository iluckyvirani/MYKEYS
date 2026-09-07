import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/packages/:id
 * Public endpoint — get a single active package by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pkg = await packageService.getById(id);

    if (!pkg) {
      return errorResponse('Package not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    return successResponse(pkg, "Package retrieved successfully", 200);
  } catch (err: any) {
    console.error('Error fetching package:', err);
    return errorResponse('Failed to fetch package', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

