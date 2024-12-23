import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadProgress {
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
}

interface UploadOptions {
  bucket: string;
  path?: string;
  onProgress?: (progress: UploadProgress) => void;
}

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const { bucket, path = '', onProgress } = options;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL if upload successful
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file');
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file');
    return { success: false, error: error as Error };
  }
};