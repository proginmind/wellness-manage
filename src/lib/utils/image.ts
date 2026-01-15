import imageCompression from "browser-image-compression";

/**
 * Compress an image file before upload
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Max 1MB after compression
    maxWidthOrHeight: 800, // Max dimension 800px
    useWebWorker: true,
    fileType: "image/webp", // Convert to WebP for better compression
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    throw new Error("Failed to compress image");
  }
}

/**
 * Validate image file type and size
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a valid image file (JPG, PNG, or WebP)",
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be less than 5MB" };
  }

  return { valid: true };
}
