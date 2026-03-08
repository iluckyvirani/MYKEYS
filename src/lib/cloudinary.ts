// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload image to Cloudinary
 * @param file Base64 string or file buffer
 * @param folder Upload folder in Cloudinary
 * @returns Upload result with secure_url
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'mykeys'
): Promise<{ url: string; publicId: string }> {
  try {
    // Check if it's a PDF or other document
    const isPdf = file.startsWith('data:application/pdf');
    
    const uploadOptions: any = {
      folder,
      // PDFs must use 'raw' resource type to be publicly accessible
      resource_type: isPdf ? 'raw' : 'image',
      type: 'upload', // Public upload (not authenticated)
      invalidate: true, // Invalidate CDN cache
    };

    // For PDFs, set flags to enable inline viewing instead of download
    if (isPdf) {
      uploadOptions.flags = 'attachment:false';
    } else {
      // Only apply transformations for images, not PDFs
      uploadOptions.transformation = [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ];
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    // For raw files (PDFs), construct URL with inline flag
    let finalUrl = result.secure_url;
    if (isPdf && !finalUrl.includes('fl_attachment')) {
      // Insert fl_attachment:inline into the URL path
      finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment:inline/');
    }

    return {
      url: finalUrl,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId Cloudinary public ID
 * @param resourceType Resource type (image, raw, video)
 */
export async function deleteFromCloudinary(
  publicId: string, 
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Try alternate resource type if first attempt fails
    try {
      const alternateType = resourceType === 'image' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(publicId, { resource_type: alternateType });
    } catch (retryError) {
      throw new Error('Failed to delete file');
    }
  }
}
