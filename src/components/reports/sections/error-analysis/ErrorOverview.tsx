import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ErrorOverviewProps {
  errorLogs: any[];
  onAnalyze: () => void;
}

export const ErrorOverview = ({ errorLogs = [], onAnalyze }: ErrorOverviewProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [implementedIds, setImplementedIds] = useState<string[]>([]);

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

  const generatePrompt = (error: any) => {
    return `Please help improve my code based on this error:
Problem: ${error.error_type || 'Error Analysis Required'}
Category: ${error.category || 'General'}
Description: ${error.message || 'Error occurred during process'}
Priority: ${error.severity || 'medium'}
${error.stack_trace ? `Stack Trace:\n${error.stack_trace}` : ''}
Please provide the necessary code changes to fix this error.`;
  };

  const copyPrompt = async (error: any) => {
    const prompt = generatePrompt(error);
    await navigator.clipboard.writeText(prompt);
    setCopiedId(error.id);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImplement = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('import_logs')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', errorId);

      if (error) throw error;

      setImplementedIds(prev => [...prev, errorId]);
      toast.success("Error marked as implemented");
    } catch (error) {
      console.error('Failed to mark error as implemented:', error);
      toast.error("Failed to mark error as implemented");
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
            const errorDetails = typeof log.errors === 'string' ? 
              JSON.parse(log.errors) : log.errors || {};
            
            return (
              <div key={log.id} className="flex flex-col gap-4 border-b pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">
                        {errorDetails.error_type || 'Unknown Error'}
                      </h3>
                      <Badge variant="outline" className={getSeverityColor(errorDetails.severity)}>
                        {errorDetails.severity || 'medium'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {errorDetails.message || 'Error occurred during process'}
                    </p>
                    {errorDetails.file_name && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        File: {errorDetails.file_name} 
                        {errorDetails.line_number && ` (Line: ${errorDetails.line_number})`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(errorDetails)}
                      className="flex items-center gap-1"
                    >
                      {copiedId === log.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedId === log.id ? "Copied!" : "Copy Prompt"}
                    </Button>
                    {implementedIds.includes(log.id) ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Implemented
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImplement(log.id)}
                      >
                        Mark Implemented
                      </Button>
                    )}
                  </div>
                </div>
                {errorDetails.stack_trace && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-mono whitespace-pre-wrap">
                      {errorDetails.stack_trace}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};