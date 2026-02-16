// src/app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/upload
 * Upload an image to Cloudinary and return the URL
 * Accepts base64 encoded image in request body
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const { image, folder = 'mykeys/avatars' } = body;

    if (!image) {
      return errorResponse('Image data is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Validate base64 format
    if (!image.startsWith('data:image/')) {
      return errorResponse('Invalid image format. Must be base64 encoded', 400, ErrorCode.INVALID_INPUT);
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(image, folder);

    return successResponse(
      {
        url: result.url,
        publicId: result.publicId,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return errorResponse(
      error.message || 'Failed to upload image',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
