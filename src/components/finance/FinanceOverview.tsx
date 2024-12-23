import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FinancialCards } from "./components/FinancialCards";
import { RecentTransactionsList } from "./components/RecentTransactionsList";

export const FinanceOverview = () => {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ["financial-overview"],
    queryFn: async () => {
      console.log("Fetching financial data...");
      
      // Fetch expenses and completed payments in parallel
      const [expenseResult, revenueResult] = await Promise.all([
        supabase
          .from("expense_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
      ]);

      if (expenseResult.error) {
        console.error("Error fetching expenses:", expenseResult.error);
        throw expenseResult.error;
      }
      if (revenueResult.error) {
        console.error("Error fetching revenue:", revenueResult.error);
        throw revenueResult.error;
      }

      // Log detailed payment information
      console.log("Completed payments:", revenueResult.data?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        date: payment.created_at,
        lease_id: payment.lease_id,
        payment_method: payment.payment_method
      })));

      const totalRevenue = revenueResult.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      console.log("Total Revenue calculation:", {
        numberOfPayments: revenueResult.data?.length || 0,
        totalRevenue: totalRevenue,
        averagePayment: totalRevenue / (revenueResult.data?.length || 1)
      });

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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-red-600">
        Failed to load financial data. Please try again later.
      </div>
    );
  }

  const totalRevenue = financialData?.revenue.reduce((sum, payment) => 
    sum + (payment.amount || 0), 0) || 0;

  const totalExpenses = financialData?.expenses.reduce((sum, expense) => 
    sum + (expense.amount || 0), 0) || 0;

  const recentTransactions = [
    ...(financialData?.expenses.slice(0, 5).map(expense => ({
      type: 'expense' as const,
      amount: -expense.amount,
      description: expense.description || 'Unnamed Expense',
      date: new Date(expense.created_at)
    })) || []),
    ...(financialData?.revenue.slice(0, 5).map(payment => ({
      type: 'revenue' as const,
      amount: payment.amount,
      description: `Payment ${payment.transaction_id || payment.id}`,
      date: new Date(payment.created_at)
    })) || [])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Financial Overview</h2>
      </div>

      <FinancialCards 
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        isLoading={isLoading}
        error={error}
      />

      <RecentTransactionsList transactions={recentTransactions} />
    </div>
  );
};