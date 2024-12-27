import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetricsCard } from "./charts/FinancialMetricsCard";
import { RevenueChart } from "./charts/RevenueChart";
import { ExpenseBreakdownChart } from "./charts/ExpenseBreakdownChart";
import { ProfitLossChart } from "./charts/ProfitLossChart";
import { Loader2 } from "lucide-react";

export const FinancialDashboard = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("transaction_date", { ascending: true });

      if (error) throw error;
      return data;
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
  const currentMonthRevenue = 50000; // Example value - replace with actual calculation
  const previousMonthRevenue = 45000; // Example value - replace with actual calculation
  const percentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  const revenueData = [
    { date: "2024-01-01", revenue: 45000 },
    { date: "2024-02-01", revenue: 50000 },
    // Add more data points
  ];

  const expenseData = [
    { category: "Maintenance", amount: 15000 },
    { category: "Salaries", amount: 25000 },
    // Add more categories
  ];

  const profitLossData = [
    { period: "Jan", revenue: 45000, expenses: 35000, profit: 10000 },
    { period: "Feb", revenue: 50000, expenses: 38000, profit: 12000 },
    // Add more periods
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <FinancialMetricsCard
          title="Monthly Revenue"
          value={currentMonthRevenue}
          previousValue={previousMonthRevenue}
          percentageChange={percentageChange}
        />
        <FinancialMetricsCard
          title="Monthly Expenses"
          value={38000}
          previousValue={35000}
          percentageChange={8.57}
        />
        <FinancialMetricsCard
          title="Net Profit"
          value={12000}
          previousValue={10000}
          percentageChange={20}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={revenueData} />
        <ExpenseBreakdownChart data={expenseData} />
      </div>

      <ProfitLossChart data={profitLossData} />
    </div>
  );
};