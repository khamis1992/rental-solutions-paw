import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, CheckCircle } from "lucide-react";
import { aiAnalysis } from "@/services/performanceMonitoring";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AIInsight = Database["public"]["Tables"]["ai_insights"]["Row"];

export const PerformanceInsights = () => {
  const { toast } = useToast();
  
  const { data: insights, isLoading, refetch } = useQuery<AIInsight[]>({
    queryKey: ['ai-insights'],
    queryFn: () => aiAnalysis.getInsights(),
  });

  const triggerAnalysis = async () => {
    try {
      toast({
        title: "Analysis Started",
        description: "The AI is analyzing system performance. This may take a few moments.",
      });

      const result = await aiAnalysis.triggerAnalysis();
      
      if (result.error) {
        throw new Error(result.error);
      }

      await refetch();
      
      toast({
        title: "Analysis Complete",
        description: "New insights have been generated and are ready for review.",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to trigger performance analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markImplemented = async (insightId: string) => {
    try {
      await aiAnalysis.markInsightImplemented(insightId);
      toast({
        title: "Success",
        description: "Insight marked as implemented.",
      });
      refetch();
    } catch (error) {
      console.error('Failed to mark insight as implemented:', error);
      toast({
        title: "Error",
        description: "Failed to update insight status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Performance Insights
          </div>
        </CardTitle>
        <Button onClick={triggerAnalysis} disabled={isLoading}>
          <TrendingUp className="mr-2 h-4 w-4" />
          {isLoading ? "Analyzing..." : "Analyze Now"}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : insights?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No insights available. Click "Analyze Now" to generate new insights.
            </div>
          ) : (
            <div className="space-y-4">
              {insights?.map((insight) => (
                <Card key={insight.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={insight.priority === 1 ? "destructive" : "secondary"}>
                      {insight.priority === 1 ? "High Priority" : "Normal Priority"}
                    </Badge>
                    {insight.status === 'implemented' ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Implemented
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markImplemented(insight.id)}
                      >
                        Mark Implemented
                      </Button>
                    )}
                  </div>
                  <h4 className="font-semibold mb-2">{insight.category}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.insight}</p>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm font-medium">Recommendation:</p>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};