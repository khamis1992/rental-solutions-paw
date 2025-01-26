import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const ScenarioAnalysis = () => {
  const [scenario, setScenario] = useState({
    roi: 0,
    profit: 0,
    investment: 0,
    description: ""
  });

  const { data: insights, refetch } = useQuery({
    queryKey: ["analytics-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("category", "scenario_analysis")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const analyzeScenario = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("analyze-financial-scenario", {
        body: { scenario }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scenario analysis completed");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to analyze scenario: " + error.message);
    }
  });

  const chartData = insights?.map(insight => ({
    name: new Date(insight.created_at).toLocaleDateString(),
    roi: insight.data_points?.roi_percentage || 0,
    profit: insight.data_points?.net_profit || 0
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="investment">Investment Amount (QAR)</Label>
            <Input
              id="investment"
              type="number"
              value={scenario.investment}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                investment: parseFloat(e.target.value)
              }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Scenario Description</Label>
            <Input
              id="description"
              value={scenario.description}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi">Expected ROI (%)</Label>
            <Input
              id="roi"
              type="number"
              value={scenario.roi}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                roi: parseFloat(e.target.value)
              }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profit">Expected Profit (QAR)</Label>
            <Input
              id="profit"
              type="number"
              value={scenario.profit}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                profit: parseFloat(e.target.value)
              }))}
            />
          </div>
        </div>

        <Button 
          onClick={() => analyzeScenario.mutate()}
          disabled={analyzeScenario.isPending}
        >
          {analyzeScenario.isPending ? "Analyzing..." : "Analyze Scenario"}
        </Button>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="roi"
                name="ROI %"
                stroke="#4ade80"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profit"
                name="Net Profit (QAR)"
                stroke="#60a5fa"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 mt-4">
          {insights?.map((insight) => (
            <Card key={insight.id} className="p-4">
              <p className="text-sm text-gray-600">
                {insight.insight}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(insight.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};