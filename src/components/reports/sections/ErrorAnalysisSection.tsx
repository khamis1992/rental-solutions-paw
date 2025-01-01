import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bug, Code, FileSearch, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ErrorLog {
  id: string;
  timestamp: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  file_name?: string;
  line_number?: number;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

export const ErrorAnalysisSection = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: errorLogs, isLoading, refetch } = useQuery({
    queryKey: ["error-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-errors', {
        body: { logs: errorLogs }
      });

      if (error) throw error;
      await refetch();
      toast.success("Error analysis completed");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze errors");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Advanced Error Analysis Dashboard</h2>
        </div>
        <Button 
          onClick={handleAnalyze} 
          variant="outline" 
          className="gap-2"
          disabled={isAnalyzing}
        >
          <Zap className="h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Deep Analysis"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold">
                {errorLogs?.filter(log => log.severity === 'high').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Code Quality Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-amber-500" />
              <p className="text-2xl font-bold">
                {errorLogs?.filter(log => log.error_type === 'code_quality').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold">
                {errorLogs ? 
                  `${Math.round((errorLogs.filter(log => log.status === 'resolved').length / errorLogs.length) * 100)}%` 
                  : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Files Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold">
                {new Set(errorLogs?.map(log => log.file_name)).size || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="log-analysis">Log Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="code-review">Code Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {errorLogs?.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{log.error_type}</h3>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{log.message}</p>
                      {log.file_name && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          File: {log.file_name} {log.line_number && `(Line: ${log.line_number})`}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAnalyze()}>
                      Analyze
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Log Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {errorLogs?.map((log) => (
                  <div key={log.id} className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{log.error_type}</h4>
                      <Badge>{new Date(log.timestamp).toLocaleString()}</Badge>
                    </div>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                      {log.stack_trace}
                    </pre>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {errorLogs?.map((log) => (
                  <div key={log.id} className="mb-6 border-b pb-4">
                    <h4 className="font-medium mb-2">{log.error_type}</h4>
                    <div className="space-y-2">
                      {log.suggestions?.map((suggestion, index) => (
                        <div key={index} className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code-review">
          <Card>
            <CardHeader>
              <CardTitle>Automated Code Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {errorLogs?.filter(log => log.error_type === 'code_quality').map((log) => (
                  <div key={log.id} className="mb-6 border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{log.file_name}</h4>
                      <Badge variant="outline">Line {log.line_number}</Badge>
                    </div>
                    <pre className="bg-muted p-2 rounded-md text-xs mb-2">
                      {log.message}
                    </pre>
                    <div className="space-y-2">
                      {log.suggestions?.map((suggestion, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};