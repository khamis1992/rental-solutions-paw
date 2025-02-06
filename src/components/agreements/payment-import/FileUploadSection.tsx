import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          disabled={isUploading || isAnalyzing}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          disabled={isUploading || isAnalyzing}
          className="whitespace-nowrap"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>
      
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing file...
        </div>
      )}
    </div>
  );