import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetricsCard } from "./charts/FinancialMetricsCard";
import { RevenueChart } from "./charts/RevenueChart";
import { ExpenseBreakdownChart } from "./charts/ExpenseBreakdownChart";
import { ProfitLossChart } from "./charts/ProfitLossChart";
import { BudgetTrackingSection } from "./budget/BudgetTrackingSection";
import { Loader2 } from "lucide-react";
import { AccountingTransaction } from "./types/transaction.types";

export const FinancialDashboard = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          category:accounting_categories(*)
        `)
        .order("transaction_date", { ascending: true });

      if (error) throw error;
      return data as AccountingTransaction[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Process data for different visualizations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = financialData?.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date || '');
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const previousMonthTransactions = financialData?.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date || '');
    return transactionDate.getMonth() === (currentMonth - 1) && 
           transactionDate.getFullYear() === currentYear;
  });

  const currentMonthRevenue = currentMonthTransactions?.reduce(
    (sum, transaction) => transaction.type === 'INCOME' ? sum + (parseFloat(transaction.amount || '0')) : sum, 
    0
  ) || 0;

  const previousMonthRevenue = previousMonthTransactions?.reduce(
    (sum, transaction) => transaction.type === 'INCOME' ? sum + (parseFloat(transaction.amount || '0')) : sum, 
    0
  ) || 0;

  const currentMonthExpenses = currentMonthTransactions?.reduce(
    (sum, transaction) => transaction.type === 'EXPENSE' ? sum + (parseFloat(transaction.amount || '0')) : sum, 
    0
  ) || 0;

  const previousMonthExpenses = previousMonthTransactions?.reduce(
    (sum, transaction) => transaction.type === 'EXPENSE' ? sum + (parseFloat(transaction.amount || '0')) : sum, 
    0
  ) || 0;

  const percentageChangeRevenue = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  const percentageChangeExpenses = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;

  const revenueData = financialData
    ?.filter(t => t.type === 'INCOME')
    ?.reduce((acc, transaction) => {
      const date = transaction.transaction_date?.split('T')[0] || '';
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += parseFloat(transaction.amount || '0');
      } else {
        acc.push({ date, revenue: parseFloat(transaction.amount || '0') });
      }
      return acc;
    }, [] as { date: string; revenue: number }[]) || [];

  const expenseData = financialData
    ?.filter(t => t.type === 'EXPENSE')
    ?.reduce((acc, transaction) => {
      const category = transaction.category?.name || 'Uncategorized';
      const existing = acc.find(item => item.category === category);
      if (existing) {
        existing.amount += parseFloat(transaction.amount || '0');
      } else {
        acc.push({ category, amount: parseFloat(transaction.amount || '0') });
      }
      return acc;
    }, [] as { category: string; amount: number }[]) || [];

  const profitLossData = financialData?.reduce((acc, transaction) => {
    const date = new Date(transaction.transaction_date || '');
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = acc.find(item => item.period === period);
    if (existing) {
      if (transaction.type === 'INCOME') {
        existing.revenue += parseFloat(transaction.amount || '0');
      } else {
        existing.expenses += parseFloat(transaction.amount || '0');
      }
      existing.profit = existing.revenue - existing.expenses;
    } else {
      acc.push({
        period,
        revenue: transaction.type === 'INCOME' ? parseFloat(transaction.amount || '0') : 0,
        expenses: transaction.type === 'EXPENSE' ? parseFloat(transaction.amount || '0') : 0,
        profit: transaction.type === 'INCOME' ? parseFloat(transaction.amount || '0') : -parseFloat(transaction.amount || '0')
      });
    }
    return acc;
  }, [] as { period: string; revenue: number; expenses: number; profit: number }[]) || [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <FinancialMetricsCard
          title="Monthly Revenue"
          value={currentMonthRevenue}
          previousValue={previousMonthRevenue}
          percentageChange={percentageChangeRevenue}
        />
        <FinancialMetricsCard
          title="Monthly Expenses"
          value={currentMonthExpenses}
          previousValue={previousMonthExpenses}
          percentageChange={percentageChangeExpenses}
        />
        <FinancialMetricsCard
          title="Net Profit"
          value={currentMonthRevenue - currentMonthExpenses}
          previousValue={previousMonthRevenue - previousMonthExpenses}
          percentageChange={
            ((currentMonthRevenue - currentMonthExpenses) - (previousMonthRevenue - previousMonthExpenses)) / 
            Math.abs(previousMonthRevenue - previousMonthExpenses) * 100
          }
        />
      </div>

      <BudgetTrackingSection 
        transactions={financialData || []}
        categories={Array.from(new Set(financialData?.map(t => t.category)
          .filter(Boolean))) as any[]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={revenueData} onExport={() => {}} />
        <ExpenseBreakdownChart data={expenseData} />
      </div>

      <ProfitLossChart data={profitLossData} />
    </div>
  );
};