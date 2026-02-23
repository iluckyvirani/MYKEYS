import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/packages/:id
 * Get a specific package
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pkg = await packageService.getById(id);
    
    if (!pkg) {
      return errorResponse(
        'Package not found',
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    
    return successResponse(pkg, "Package retrieved successfully", 200);
  } catch (err: any) {
    console.error('Error fetching package:', err);
    return errorResponse(
      'Failed to fetch package',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PATCH /api/packages/:id
 * Update a package (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await requireAuth(req);
    
    // TODO: Add admin role check
    // if (authUser.role !== 'ADMIN') {
    //   return errorResponse('Unauthorized', 403, ErrorCode.FORBIDDEN);
    // }

    const { id } = await params;
    const data = await req.json();
    const pkg = await packageService.update(id, data);
    
    return successResponse(pkg, "Package updated successfully", 200);
  } catch (err: any) {
    console.error('Error updating package:', err);
    return errorResponse(
      err.message || 'Failed to update package',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/packages/:id
 * Delete a package (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await requireAuth(req);
    
    // TODO: Add admin role check
    // if (authUser.role !== 'ADMIN') {
    //   return errorResponse('Unauthorized', 403, ErrorCode.FORBIDDEN);
    // }

    const { id } = await params;
    const pkg = await packageService.delete(id);
    
    return successResponse(pkg, "Package deleted successfully", 200);
  } catch (err: any) {
    console.error('Error deleting package:', err);
    return errorResponse(
      err.message || 'Failed to delete package',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

