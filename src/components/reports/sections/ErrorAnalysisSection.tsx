import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorMetricsCards } from "./error-analysis/ErrorMetricsCards";
import { ErrorOverview } from "./error-analysis/ErrorOverview";
import { LogAnalysis } from "./error-analysis/LogAnalysis";
import { AISuggestions } from "./error-analysis/AISuggestions";
import { CodeReview } from "./error-analysis/CodeReview";
import { Button } from "@/components/ui/button";

export const ErrorAnalysisSection = () => {
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

      <ErrorMetricsCards errorLogs={errorLogs || []} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="log-analysis">Log Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="code-review">Code Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ErrorOverview errorLogs={errorLogs || []} onAnalyze={handleAnalyze} />
        </TabsContent>

        <TabsContent value="log-analysis">
          <LogAnalysis errorLogs={errorLogs || []} />
        </TabsContent>

        <TabsContent value="suggestions">
          <AISuggestions errorLogs={errorLogs || []} />
        </TabsContent>

        <TabsContent value="code-review">
          <CodeReview errorLogs={errorLogs || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};