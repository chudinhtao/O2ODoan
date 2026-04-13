/**
 * Cloudinary Service for Frontend
 * Handles direct unsigned uploads to Cloudinary
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export const cloudinaryService = {
  /**
   * Upload an image file directly to Cloudinary using Unsigned Preset
   */
  async uploadImage(file: File): Promise<CloudinaryUploadResponse> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing (Cloud Name or Upload Preset)');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    return response.json();
  },

  /**
   * Generates an optimized Cloudinary URL with transformations
   */
  getOptimizedUrl(url: string, options: { width?: number; height?: number; crop?: string } = {}): string {
    if (!url || !url.includes('cloudinary.com')) return url;

    const { width = 400, height = 400, crop = 'fill' } = options;
    
    // Insert transformation parameters after /upload/
    const transformation = `w_${width},h_${height},c_${crop},f_auto,q_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  }
};
