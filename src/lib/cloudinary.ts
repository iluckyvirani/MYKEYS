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
    } else if (!folder.includes("document")) {
      // Photos only — skip eager transforms on ID/certs (slow + makes docs unreadable)
      uploadOptions.transformation = [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ];
    } else {
      uploadOptions.quality = "auto:good";
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

const ALLOWED_UPLOAD_PREFIX = "mykeys/";

export function createSignedUploadParams(folder: string) {
  const safeFolder = folder.startsWith(ALLOWED_UPLOAD_PREFIX)
    ? folder
    : `${ALLOWED_UPLOAD_PREFIX}${folder.replace(/^\/+/, "")}`;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: safeFolder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    signature,
    folder: safeFolder,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  };
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const isPdf = mimeType === "application/pdf";
  const options: Record<string, unknown> = {
    folder,
    resource_type: isPdf ? "raw" : "image",
    type: "upload",
    invalidate: true,
  };
  if (isPdf) {
    options.flags = "attachment:false";
  } else if (!folder.includes("document")) {
    options.transformation = [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ];
  } else {
    options.quality = "auto:good";
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error || new Error("Failed to upload file"));
        return;
      }
      let finalUrl = result.secure_url;
      if (isPdf && !finalUrl.includes("fl_attachment")) {
        finalUrl = finalUrl.replace("/upload/", "/upload/fl_attachment:inline/");
      }
      resolve({ url: finalUrl, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

/** Delete file from Cloudinary (image, raw, or video). */
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
