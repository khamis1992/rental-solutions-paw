import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface BudgetRecommendation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  reasoning: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

interface CostSavingOpportunity {
  category: string;
  potentialSavings: number;
  implementation: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

export const BudgetOptimization = () => {
  const [targetBudget, setTargetBudget] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["accounting-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["accounting-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .gte("transaction_date", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      if (error) throw error;
      return data;
    },
  });

  const { data: aiInsights, refetch: refetchInsights } = useQuery({
    queryKey: ["ai-budget-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_analytics_insights")
        .select("*")
        .eq('category', 'budget_optimization')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const handleAnalyzeRequest = async () => {
    if (!targetBudget || isNaN(Number(targetBudget))) {
      toast.error("Please enter a valid target budget");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-financial-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyze current spending and provide budget recommendations for target budget of ${targetBudget} QAR`
          }],
          context: {
            currentSpending: transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
            categories: categories?.map(c => ({
              name: c.name,
              currentBudget: c.budget_limit,
              currentSpending: transactions?.filter(t => t.category_id === c.id)
                .reduce((sum, t) => sum + (t.amount || 0), 0) || 0
            }))
          }
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      await refetchInsights();
      toast.success("Budget analysis completed");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze budget");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Budget Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Target Monthly Budget (QAR)
              </label>
              <Input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="Enter target budget"
              />
            </div>
            <Button 
              onClick={handleAnalyzeRequest}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Budget"}
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            {aiInsights?.map((insight) => (
              <Alert 
                key={insight.id} 
                className={
                  insight.priority === 1 ? 'border-red-200 bg-red-50' :
                  insight.priority === 2 ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }
              >
                <AlertDescription className="flex items-start gap-2">
                  {insight.priority === 1 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : insight.priority === 2 ? (
                    <TrendingDown className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">{insight.insight}</p>
                    {insight.data_points && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.data_points.recommendation}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Recommendations content goes here */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Saving Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cost saving opportunities content goes here */}
        </CardContent>
      </Card>
    </div>
  );
};
