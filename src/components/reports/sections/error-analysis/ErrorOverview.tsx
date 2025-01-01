import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorOverviewProps {
  errorLogs: any[];
  onAnalyze: () => void;
}

export const ErrorOverview = ({ errorLogs = [], onAnalyze }: ErrorOverviewProps) => {
  const getSeverityColor = (severity: string = 'low') => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {errorLogs?.map((log) => {
            // Parse the errors JSON field
            const errorDetails = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
            return (
              <div key={log.id} className="flex items-start gap-4 border-b pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{errorDetails.error_type || 'Import Error'}</h3>
                    <Badge variant="outline" className={getSeverityColor(errorDetails.severity)}>
                      {errorDetails.severity || 'medium'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{errorDetails.message || 'Error occurred during import process'}</p>
                  {errorDetails.file_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      File: {errorDetails.file_name} {errorDetails.line_number && `(Line: ${errorDetails.line_number})`}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => onAnalyze()}>
                  Analyze
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};