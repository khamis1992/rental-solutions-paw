import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";

interface ValidationSummaryProps {
  skippedRows: {
    index: number;
    content: string;
    reason: string;
  }[];
  onDownloadLog?: () => void;
}

export const ValidationSummary = ({ skippedRows, onDownloadLog }: ValidationSummaryProps) => {
  if (!skippedRows.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Validation Results</h3>
        {onDownloadLog && (
          <Button variant="outline" onClick={onDownloadLog} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Error Log
          </Button>
        )}
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {skippedRows.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTitle>Row {error.index}</AlertTitle>
              <AlertDescription className="mt-2">
                <div>{error.reason}</div>
                {error.content && (
                  <div className="mt-2 text-sm font-mono bg-secondary/50 p-2 rounded">
                    {error.content}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};