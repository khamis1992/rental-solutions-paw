import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadOptions {
  /**
   * The storage bucket to upload to
   */
  bucket: 'agreement_documents' | 'customer_documents' | 'maintenance_documents' | 'accounting_receipts';
  /**
   * Optional folder path within the bucket
   */
  folderPath?: string;
  /**
   * Maximum file size in MB
   */
  maxSize?: number;
  /**
   * Allowed file types
   */
  allowedTypes?: string[];
  /**
   * Progress callback
   */
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  path: string;
  url: string;
}

/**
 * Uploads a file to Supabase Storage with progress tracking and validation
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    // Validate file size
    const maxSize = (options.maxSize || 5) * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${options.maxSize || 5}MB`);
    }

    // Validate file type if specified
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileType = file.type || '';
      if (!options.allowedTypes.includes(fileType)) {
        throw new Error(`File type ${fileType} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = options.folderPath 
      ? `${options.folderPath}/${fileName}`
      : fileName;

    // Upload file with progress tracking
    const { error: uploadError, data } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          options.onProgress?.(percentage);
        },
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl
    };

  } catch (error: any) {
    console.error('File upload error:', error);
    toast.error(error.message || 'Failed to upload file');
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage
 */
export const deleteFile = async (
  bucket: UploadOptions['bucket'],
  filePath: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error('File deletion error:', error);
    toast.error(error.message || 'Failed to delete file');
    throw error;
  }
};