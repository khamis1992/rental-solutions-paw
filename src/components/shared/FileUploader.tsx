import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface UploadOptions {
  allowedTypes?: string[];
  onUploadComplete: (data: { path: string; url: string }) => void;
  onError: (error: Error) => void;
}

export const FileUploader = ({ allowedTypes, onUploadComplete, onError }: UploadOptions) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (allowedTypes && !allowedTypes.includes(selectedFile.type)) {
        onError(new Error("File type not allowed"));
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const bucket = "your-bucket-name"; // Replace with your actual bucket name
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${file.name}`, file, {
          cacheControl: '3600',
          contentType: file.type
        });

      if (error) throw error;

      if (data) {
        onUploadComplete({
          path: data.path,
          url: data.path
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onError(error as Error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!file}>
        Upload
      </Button>
    </div>
  );
};
