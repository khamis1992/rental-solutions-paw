import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

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
  const { data: budgetData, isLoading: isBudgetLoading } = useQuery({
    queryKey: ["budget-analysis"],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("accounting_transactions")
        .select(`
          amount,
          type,
          category:accounting_categories(
            id,
            name,
            budget_limit,
            type
          )
        `)
        .gte('transaction_date', new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString());

      if (error) throw error;
      return transactions;
    },
  });

  const { data: aiInsights } = useQuery({
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

  const recommendations: BudgetRecommendation[] = [
    {
      category: "Vehicle Maintenance",
      currentAmount: 25000,
      recommendedAmount: 20000,
      reasoning: "Historical data shows maintenance costs can be optimized through preventive measures",
      impact: "Potential 20% cost reduction without compromising quality",
      priority: "high"
    },
    {
      category: "Administrative Expenses",
      currentAmount: 15000,
      recommendedAmount: 12000,
      reasoning: "Digital transformation opportunities identified",
      impact: "Improved efficiency and reduced overhead",
      priority: "medium"
    }
  ];

  const costSavings: CostSavingOpportunity[] = [
    {
      category: "Fuel Costs",
      potentialSavings: 5000,
      implementation: "Implement route optimization and fuel monitoring systems",
      timeframe: "3 months",
      priority: "high"
    },
    {
      category: "Insurance",
      potentialSavings: 3000,
      implementation: "Negotiate bulk insurance rates and improve vehicle security",
      timeframe: "6 months",
      priority: "medium"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Budget Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{rec.category}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current: {formatCurrency(rec.currentAmount)}</span>
                  <span>Recommended: {formatCurrency(rec.recommendedAmount)}</span>
                </div>
                <Progress 
                  value={(rec.recommendedAmount / rec.currentAmount) * 100} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                <p className="text-sm text-blue-600">{rec.impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Cost-Saving Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {costSavings.map((saving, index) => (
              <div key={index} className="space-y-2 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{saving.category}</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(saving.potentialSavings)}
                  </span>
                </div>
                <p className="text-sm">{saving.implementation}</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Timeframe: {saving.timeframe}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    saving.priority === 'high' ? 'bg-red-100 text-red-800' :
                    saving.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {saving.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Budget Variance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights?.map((insight, index) => (
              <Alert key={index} className={
                insight.priority === 1 ? 'border-red-200 bg-red-50' :
                insight.priority === 2 ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }>
                <AlertDescription className="flex items-start gap-2">
                  {insight.priority === 1 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : insight.priority === 2 ? (
                    <TrendingDown className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">{insight.insight}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.recommendation}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};