import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText } from "lucide-react";

interface ImportActionsProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  requiredHeaders: string[];
}

export const ImportActions = ({ onFileUpload, isUploading, requiredHeaders }: ImportActionsProps) => {
  const downloadTemplate = () => {
    const headers = requiredHeaders.join(",");
    const sampleData = [
      "A123,V456,2024-03-20,ABC123,Dubai Marina,Speeding,500,2",
      "B234,V789,2024-03-21,XYZ789,JBR,Parking,200,1"
    ].join("\n");

    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traffic_fines_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button disabled={isUploading} asChild>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFileUpload}
              disabled={isUploading}
            />
            <div className="flex items-center gap-2">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Importing..." : "Import CSV"}
            </div>
          </label>
        </Button>

        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing file...
        </div>
      )}
    </div>
  );
};