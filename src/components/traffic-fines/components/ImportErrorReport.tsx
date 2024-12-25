import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";
import { generateErrorReport } from "../utils/csvAnalyzer";

interface ImportErrorReportProps {
  analysis: any;
}

export const ImportErrorReport = ({ analysis }: ImportErrorReportProps) => {
  if (!analysis.errors.length) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Validation Report</AlertTitle>
      <AlertDescription>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <pre className="text-sm whitespace-pre-wrap">
            {generateErrorReport(analysis)}
          </pre>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  );
};