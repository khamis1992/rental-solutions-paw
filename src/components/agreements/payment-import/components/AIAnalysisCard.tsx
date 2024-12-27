import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AIAnalysisCardProps {
  analysisResult: any;
  onImplementChanges: () => void;
  isUploading: boolean;
}

export const AIAnalysisCard = ({
  analysisResult,
  onImplementChanges,
  isUploading,
}: AIAnalysisCardProps) => {
  if (!analysisResult) return null;

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
        </div>

        {analysisResult.issues?.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {analysisResult.issues.map((issue: string, index: number) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {analysisResult.suggestions?.length > 0 && (
          <Alert>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {analysisResult.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={onImplementChanges}
          disabled={isUploading || analysisResult.invalidRows === analysisResult.totalRows}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed with Import'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};