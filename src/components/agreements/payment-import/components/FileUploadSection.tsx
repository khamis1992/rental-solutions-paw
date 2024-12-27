import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  isAnalyzing,
}: FileUploadSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button disabled={isUploading || isAnalyzing} asChild>
            <label className="cursor-pointer">
              {isAnalyzing ? "Analyzing..." : isUploading ? "Importing..." : "Upload CSV"}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onFileUpload}
                disabled={isUploading || isAnalyzing}
              />
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