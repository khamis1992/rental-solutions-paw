import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ImportAnalysisCardProps {
  analysis: {
    isValid: boolean;
    totalRows: number;
    validRows: number;
    errorRows: number;
    repairedRows: any[];
  };
}

export const ImportAnalysisCard = ({ analysis }: ImportAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {analysis.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          CSV Analysis Report
        </CardTitle>
        <CardDescription>
          {analysis.isValid
            ? "File structure is valid and ready for import"
            : "Issues were found in the file structure"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Total Rows</div>
            <div className="mt-1 text-2xl font-bold">{analysis.totalRows}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Valid Rows</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {analysis.validRows}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Error Rows</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {analysis.errorRows}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Repaired Rows</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {analysis.repairedRows.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};