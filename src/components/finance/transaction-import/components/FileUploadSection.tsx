import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload } from "lucide-react";

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  isUploading: boolean;
}

export const FileUploadSection = ({
  onFileUpload,
  onDownloadTemplate,
  isUploading
}: FileUploadSectionProps) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Upload a CSV file with the following headers: Transaction_Date, Amount, Description, Category, Payment_Method, Reference_Number, Status, Notes, Tags
        </AlertDescription>
      </Alert>
      
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
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-pulse" />
          Importing transactions...
        </div>
      )}
    </div>
  );
};