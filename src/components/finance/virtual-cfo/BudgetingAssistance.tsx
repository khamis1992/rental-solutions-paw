import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";

export const BudgetingAssistance = () => {
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

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return { icon: AlertTriangle, color: "text-destructive" };
    if (percentage >= 75) return { icon: TrendingDown, color: "text-yellow-500" };
    return { icon: CheckCircle, color: "text-green-500" };
  };

  return (
    <div className="space-y-6">
      {categories?.map((category) => {
        const spent = transactions
          ?.filter(t => t.category_id === category.id)
          ?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        const budgetLimit = category.budget_limit || 0;
        const percentage = budgetLimit ? (spent / budgetLimit) * 100 : 0;
        const status = getBudgetStatus(spent, budgetLimit);
        const StatusIcon = status.icon;

        return (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {formatCurrency(spent)} / {formatCurrency(budgetLimit)}
                  </span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <Progress value={percentage} />
                
                {percentage > 90 && (
                  <div className="text-sm text-destructive mt-2">
                    Warning: Budget nearly depleted
                  </div>
                )}
                {percentage > 75 && percentage <= 90 && (
                  <div className="text-sm text-yellow-500 mt-2">
                    Caution: Approaching budget limit
                  </div>
                )}
                {percentage <= 75 && (
                  <div className="text-sm text-green-500 mt-2">
                    Budget utilization healthy
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};