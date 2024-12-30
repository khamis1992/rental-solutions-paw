import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AIAnalysisCardProps {
  analysisResult: any;
  onImplementChanges: () => void;
  isUploading: boolean;
}

export const AIAnalysisCard = ({ analysisResult, onImplementChanges, isUploading }: AIAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p>Total Rows: {analysisResult.totalRows}</p>
          <p>Valid Rows: {analysisResult.validRows}</p>
          <p>Invalid Rows: {analysisResult.invalidRows}</p>
          <p>Total Amount: {formatCurrency(analysisResult.totalAmount || 0)}</p>
        </div>

        {analysisResult.issues?.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Issues Found:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {analysisResult.issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.suggestions?.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Suggestions:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={onImplementChanges}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};