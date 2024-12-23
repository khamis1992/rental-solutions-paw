import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadFile } from "@/utils/fileUpload";
import { Loader2 } from "lucide-react";

interface FileUploaderProps {
  bucket: Parameters<typeof uploadFile>[1]['bucket'];
  onUploadComplete: (result: { path: string; url: string }) => void;
  allowedTypes?: string[];
  maxSize?: number;
  folderPath?: string;
}

export const FileUploader = ({
  bucket,
  onUploadComplete,
  allowedTypes,
  maxSize,
  folderPath
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(file, {
        bucket,
        allowedTypes,
        maxSize,
        folderPath,
        onProgress: setProgress
      });

      onUploadComplete(result);
      event.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button asChild disabled={uploading}>
        <label className="cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Select File'
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={allowedTypes?.join(',')}
            disabled={uploading}
          />
        </label>
      </Button>

      {uploading && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  );
};