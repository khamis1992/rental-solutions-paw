import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetricsCard } from "./charts/FinancialMetricsCard";
import { BudgetTrackingSection } from "./budget/BudgetTrackingSection";
import { VirtualCFO } from "./virtual-cfo/VirtualCFO";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { Loader2 } from "lucide-react";
import { Transaction } from "./types/transaction.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

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
    <div className="space-y-6 md:space-y-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className={cn(
          "w-full justify-start overflow-x-auto no-scrollbar",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-b rounded-none p-0 h-auto",
          isMobile ? "sticky top-[57px] z-10" : ""
        )}>
          <div className="flex">
            <TabsTrigger 
              value="overview"
              className={cn(
                "flex items-center gap-2 px-4 py-3 min-h-[44px]",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-blue-100",
                "data-[state=active]:dark:from-blue-900/50 data-[state=active]:dark:to-blue-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out rounded-none"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="virtual-cfo"
              className={cn(
                "flex items-center gap-2 px-4 py-3 min-h-[44px]",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-purple-100",
                "data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:to-purple-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out rounded-none"
              )}
            >
              Virtual CFO
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 md:space-y-8 animate-fade-in">
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

        <TabsContent value="virtual-cfo" className="animate-fade-in">
          <VirtualCFO />
        </TabsContent>
      </Tabs>
    </div>
  );
};
