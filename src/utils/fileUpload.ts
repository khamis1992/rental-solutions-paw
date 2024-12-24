import { supabase } from "@/integrations/supabase/client";

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

interface UploadResult {
  path?: string;
  url: string;
  error?: Error;
}

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const filePath = options.path 
      ? `${options.path}/${Date.now()}-${file.name}`
      : `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = await supabase.storage
      .from(options.bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      url: '',
      error: error as Error
    };
  }
};