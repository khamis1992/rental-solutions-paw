import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogAnalysisProps {
  errorLogs: any[];
}

export const LogAnalysis = ({ errorLogs = [] }: LogAnalysisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Log Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {errorLogs?.map((log) => {
            const errorDetails = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
            return (
              <div key={log.id} className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{errorDetails.error_type || 'Import Error'}</h4>
                  <Badge>{new Date(log.created_at).toLocaleString()}</Badge>
                </div>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  {errorDetails.stack_trace || errorDetails.message || 'No error details available'}
                </pre>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};