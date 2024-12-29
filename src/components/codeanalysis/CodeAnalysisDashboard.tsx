import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CodeQualityMetrics } from "./CodeQualityMetrics";
import { SecurityVulnerabilities } from "./SecurityVulnerabilities";
import { RecommendationsList } from "./RecommendationsList";
import { toast } from "sonner";
import { Brain } from "lucide-react";

interface AnalyticsDataPoints {
  quality_score: number;
  security_score: number;
  performance_score: number;
  total_issues: number;
  quality_metrics: Array<{ name: string; value: number }>;
  security_issues: Array<{
    title: string;
    severity: string;
    description: string;
    location: string;
  }>;
  performance_metrics: Array<{
    timestamp: string;
    value: number;
  }>;
  recommendations: Array<{
    title: string;
    priority: string;
    description: string;
    example?: string;
  }>;
}

interface AnalyticsInsight {
  id: string;
  category: string;
  data_points: AnalyticsDataPoints;
  created_at: string;
  analyzed_at: string;
  confidence_score: number;
  insight: string;
  priority: number;
  status: string;
  action_taken: boolean;
}

export const CodeAnalysisDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("quality");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysisData, isLoading, refetch } = useQuery({
    queryKey: ["code-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("category", "code_analysis")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching analysis data:", error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        data_points: item.data_points as unknown as AnalyticsDataPoints
      })) as AnalyticsInsight[];
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { includePerformance: true }
      });

      if (error) throw error;

      await refetch();
      toast.success("Code analysis completed successfully");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze code. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div>Loading analysis data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Code Analysis Dashboard</h1>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze Now"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Code Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData?.[0]?.data_points?.quality_score || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData?.[0]?.data_points?.security_score || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData?.[0]?.data_points?.performance_score || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData?.[0]?.data_points?.total_issues || "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quality" className="w-full" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="quality">
          <CodeQualityMetrics data={analysisData} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityVulnerabilities data={analysisData} />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsList data={analysisData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
