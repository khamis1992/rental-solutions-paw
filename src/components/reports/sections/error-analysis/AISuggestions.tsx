import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AISuggestionsProps {
  errorLogs: any[];
}

export const AISuggestions = ({ errorLogs = [] }: AISuggestionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {errorLogs?.map((log) => {
            const errorDetails = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
            return (
              <div key={log.id} className="mb-6 border-b pb-4">
                <h4 className="font-medium mb-2">{errorDetails.error_type || 'Import Error'}</h4>
                <div className="space-y-2">
                  {errorDetails.suggestions?.map((suggestion: string, index: number) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                  {!errorDetails.suggestions?.length && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">No AI suggestions available for this error.</p>
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