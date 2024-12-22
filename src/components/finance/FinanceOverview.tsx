import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, DollarSign, CreditCard, TrendingUp } from "lucide-react";

export const FinanceOverview = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-overview"],
    queryFn: async () => {
      const [expenseResult, revenueResult] = await Promise.all([
        supabase
          .from("expense_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (expenseResult.error) throw expenseResult.error;
      if (revenueResult.error) throw revenueResult.error;

      return {
        expenses: expenseResult.data || [],
        revenue: revenueResult.data || []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalRevenue = financialData?.revenue.reduce((sum, payment) => 
    payment.status === "completed" ? sum + (payment.amount || 0) : sum, 0) || 0;

  const totalExpenses = financialData?.expenses.reduce((sum, expense) => 
    sum + (expense.amount || 0), 0) || 0;

  const recentTransactions = [
    ...(financialData?.expenses.slice(0, 5).map(expense => ({
      type: 'expense',
      amount: -expense.amount,
      description: expense.description || 'Unnamed Expense',
      date: new Date(expense.created_at)
    })) || []),
    ...(financialData?.revenue.slice(0, 5).map(payment => ({
      type: 'revenue',
      amount: payment.amount,
      description: `Payment ${payment.transaction_id || payment.id}`,
      date: new Date(payment.created_at)
    })) || [])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue - totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
                <div className={`font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};