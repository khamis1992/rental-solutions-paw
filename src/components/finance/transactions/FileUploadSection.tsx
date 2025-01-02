import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  isUploading: boolean;
  isAnalyzing: boolean;
}

export const FileUploadSection = ({
  onFileUpload,
  onDownloadTemplate,
  isUploading,
  isAnalyzing
}: FileUploadSectionProps) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          disabled={isUploading || isAnalyzing}
        />
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          disabled={isUploading || isAnalyzing}
        >
          Download Template
        </Button>
      </div>
      
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing file with AI...
        </div>
      )}
    </>
  );
};