import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  isUploading: boolean;
}

export const FileUpload = ({
  onFileUpload,
  onDownloadTemplate,
  isUploading
}: FileUploadProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing data...
        </div>
      )}
    </div>
  );
};