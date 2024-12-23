import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
        <CardDescription>
          Upload a CSV file containing transaction details. Download the template to ensure correct format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="w-[200px]"
            disabled={isUploading || isAnalyzing}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={onFileUpload}
                className="hidden"
              />
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Upload CSV"}
            </label>
          </Button>

          <Button
            variant="outline"
            onClick={onDownloadTemplate}
            disabled={isUploading || isAnalyzing}
          >
            Download Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};