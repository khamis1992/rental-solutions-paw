import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";

interface HealthMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down';
  recommendation?: string;
}

export const FinancialHealth = () => {
  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ["financial-health"],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      // Calculate current ratio (current assets / current liabilities)
      const currentRatio = 1.5; // Example calculation

      // Calculate debt-to-equity ratio
      const debtToEquity = 0.8; // Example calculation

      // Calculate operating margin
      const revenue = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const operatingMargin = ((revenue - expenses) / revenue) * 100;

      // Return health metrics
      return [
        {
          name: "Current Ratio",
          value: currentRatio,
          target: 2,
          status: currentRatio >= 2 ? 'good' : currentRatio >= 1 ? 'warning' : 'critical',
          trend: currentRatio > 1.8 ? 'up' : 'down',
          recommendation: currentRatio < 2 ? "Consider improving working capital management" : undefined
        },
        {
          name: "Debt-to-Equity",
          value: debtToEquity,
          target: 1,
          status: debtToEquity <= 1 ? 'good' : debtToEquity <= 1.5 ? 'warning' : 'critical',
          trend: debtToEquity < 0.9 ? 'up' : 'down',
          recommendation: debtToEquity > 1 ? "Review debt structure and consider debt reduction strategies" : undefined
        },
        {
          name: "Operating Margin",
          value: operatingMargin,
          target: 15,
          status: operatingMargin >= 15 ? 'good' : operatingMargin >= 10 ? 'warning' : 'critical',
          trend: operatingMargin > 12 ? 'up' : 'down',
          recommendation: operatingMargin < 15 ? "Focus on cost optimization and revenue growth strategies" : undefined
        }
      ] as HealthMetric[];
    }
  });

  if (isLoading) {
    return <div>Loading financial health metrics...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {healthMetrics?.map((metric) => (
            <Card key={metric.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">{metric.name}</h3>
                  {metric.status === 'good' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : metric.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {metric.name.includes("Margin") ? `${metric.value.toFixed(1)}%` : metric.value.toFixed(2)}
                  </span>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {metric.name.includes("Margin") ? `${metric.target}%` : metric.target}
                </p>
                {metric.recommendation && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {metric.recommendation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};