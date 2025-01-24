import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";

export const ExpenseAnalysis = () => {
  const { data: expenseAnalysis } = useQuery({
    queryKey: ["expense-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenseAnalysis?.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {analysis.category}
              </CardTitle>
              {analysis.priority === "high" ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : analysis.priority === "medium" ? (
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analysis.amount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.frequency}
              </p>
              {analysis.recommendation && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {analysis.recommendation}
                </p>
              )}
              {analysis.potential_savings > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  Potential savings: {formatCurrency(analysis.potential_savings)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};