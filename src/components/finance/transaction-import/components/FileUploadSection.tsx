import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const FileUploadSection = ({ onFileUpload, isUploading }: FileUploadSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            disabled={isUploading}
            className="flex-1"
          />
          {isUploading && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </Button>
          )}
          {!isUploading && (
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};