import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CodeReviewProps {
  errorLogs: any[];
}

export const CodeReview = ({ errorLogs = [] }: CodeReviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Code Review</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {errorLogs?.filter(log => {
            const errorDetails = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
            return errorDetails.error_type === 'code_quality';
          }).map((log) => {
            const errorDetails = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
            return (
              <div key={log.id} className="mb-6 border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{errorDetails.file_name || 'Unknown File'}</h4>
                  <Badge variant="outline">Line {errorDetails.line_number || 'N/A'}</Badge>
                </div>
                <pre className="bg-muted p-2 rounded-md text-xs mb-2">
                  {errorDetails.message || 'No message available'}
                </pre>
                <div className="space-y-2">
                  {errorDetails.suggestions?.map((suggestion: string, index: number) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">{suggestion}</p>
                    </div>
                  ))}
                  {!errorDetails.suggestions?.length && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">No code review suggestions available.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};