import { api } from "@/lib/api";

const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.8;
const SKIP_COMPRESS_UNDER_BYTES = 350_000;

export async function compressImageFile(file: File): Promise<File> {
  if (file.type === "application/pdf" || !file.type.startsWith("image/")) {
    return file;
  }
  if (file.size < SKIP_COMPRESS_UNDER_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height)
    );
    if (scale === 1 && file.size < 800_000) {
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const name = file.name.replace(/\.\w+$/, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function finalizePdfUrl(url: string, isPdf: boolean) {
  if (isPdf && url && !url.includes("fl_attachment")) {
    return url.replace("/upload/", "/upload/fl_attachment:inline/");
  }
  return url;
}

async function uploadDirectToCloudinary(file: File, folder: string) {
  const sigRes = await api.get("/upload/signature", { params: { folder } });
  const signed = sigRes.data?.data;
  if (!signed?.signature || !signed.cloudName) {
    throw new Error("Upload signature missing");
  }

  const isPdf = file.type === "application/pdf";
  const resourceType = isPdf ? "raw" : "image";
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
    { method: "POST", body: form }
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message || "Direct upload failed");
  }

  return {
    url: finalizePdfUrl(json.secure_url as string, isPdf),
    publicId: json.public_id as string,
  };
}

async function uploadViaApi(file: File, folder: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await api.post("/upload", form, {
    timeout: 60_000,
  });

  const data = res.data?.data;
  if (!data?.url) {
    throw new Error(res.data?.message || "Upload failed");
  }
  return { url: data.url as string, publicId: data.publicId as string };
}

/** Compress (images) then upload directly to Cloudinary. Falls back to our API. */
export async function uploadFileToCloudinary(file: File, folder: string) {
  const prepared = await compressImageFile(file);
  try {
    const result = await uploadDirectToCloudinary(prepared, folder);
    return { ...result, file: prepared };
  } catch {
    const result = await uploadViaApi(prepared, folder);
    return { ...result, file: prepared };
  }
}
