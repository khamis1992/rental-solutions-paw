
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetricsCard } from "./charts/FinancialMetricsCard";
import { BudgetTrackingSection } from "./budget/BudgetTrackingSection";
import { VirtualCFO } from "./virtual-cfo/VirtualCFO";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { Loader2 } from "lucide-react";
import { Transaction } from "./types/transaction.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RawTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string | number;
  transaction_date: string;
  category: {
    id: string;
    name: string;
  } | null;
}

export const FinancialDashboard = () => {
  const { data: rawData, isLoading } = useQuery({
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
      return data as RawTransaction[];
    },
  });

  // Initialize as empty array if null/undefined and ensure proper type conversion
  const financialData: Transaction[] = Array.isArray(rawData) ? rawData.map(transaction => ({
    ...transaction,
    amount: typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
  })) : [];

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

  const currentMonthTransactions = financialData.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const previousMonthTransactions = financialData.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getMonth() === (currentMonth - 1) && 
           transactionDate.getFullYear() === currentYear;
  });

  const currentMonthRevenue = currentMonthTransactions.reduce(
    (sum, transaction) => transaction.type === 'INCOME' ? sum + transaction.amount : sum, 
    0
  );

  const previousMonthRevenue = previousMonthTransactions.reduce(
    (sum, transaction) => transaction.type === 'INCOME' ? sum + transaction.amount : sum, 
    0
  );

  const currentMonthExpenses = currentMonthTransactions.reduce(
    (sum, transaction) => transaction.type === 'EXPENSE' ? sum + transaction.amount : sum, 
    0
  );

  const previousMonthExpenses = previousMonthTransactions.reduce(
    (sum, transaction) => transaction.type === 'EXPENSE' ? sum + transaction.amount : sum, 
    0
  );

  const percentageChangeRevenue = previousMonthRevenue === 0 ? 100 : 
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  const percentageChangeExpenses = previousMonthExpenses === 0 ? 100 : 
    ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="virtual-cfo">Virtual CFO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <FinancialMetricsCard
              title="Monthly Revenue"
              value={currentMonthRevenue}
              previousValue={previousMonthRevenue}
              percentageChange={percentageChangeRevenue}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-900/30"
            />
            <FinancialMetricsCard
              title="Monthly Expenses"
              value={currentMonthExpenses}
              previousValue={previousMonthExpenses}
              percentageChange={percentageChangeExpenses}
              className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-900/30"
            />
            <FinancialMetricsCard
              title="Net Profit"
              value={currentMonthRevenue - currentMonthExpenses}
              previousValue={previousMonthRevenue - previousMonthExpenses}
              percentageChange={
                ((currentMonthRevenue - currentMonthExpenses) - (previousMonthRevenue - previousMonthExpenses)) / 
                Math.abs(previousMonthRevenue - previousMonthExpenses || 1) * 100
              }
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-900/30"
            />
          </div>

          <QuickActionsPanel />

          <BudgetTrackingSection 
            transactions={financialData}
            categories={Array.from(new Set(financialData
              .map(t => t.category)
              .filter(Boolean))) as NonNullable<Transaction['category']>[]}
          />
        </TabsContent>

        <TabsContent value="virtual-cfo">
          <VirtualCFO />
        </TabsContent>
      </Tabs>
    </div>
  );
};
