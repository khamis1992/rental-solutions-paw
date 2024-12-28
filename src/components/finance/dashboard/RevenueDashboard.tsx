import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, DollarSign, ArrowUpRight, CreditCard } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const RevenueDashboard = () => {
  const { data: revenueStats, isLoading } = useQuery({
    queryKey: ["revenue-stats"],
    queryFn: async () => {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get current month's revenue
      const { data: currentMonthData, error: currentError } = await supabase
        .from("accounting_transactions")
        .select("amount")
        .eq("type", "INCOME")  // Changed from lowercase to uppercase
        .gte("transaction_date", firstDayOfMonth.toISOString())
        .lte("transaction_date", lastDayOfMonth.toISOString());

      if (currentError) throw currentError;

      // Get last month's revenue for comparison
      const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      const { data: lastMonthData, error: lastError } = await supabase
        .from("accounting_transactions")
        .select("amount")
        .eq("type", "INCOME")  // Changed from lowercase to uppercase
        .gte("transaction_date", lastMonthStart.toISOString())
        .lte("transaction_date", lastMonthEnd.toISOString());

      if (lastError) throw lastError;

      // Get revenue trend data for the chart
      const { data: trendData, error: trendError } = await supabase
        .from("accounting_transactions")
        .select("amount, transaction_date")
        .eq("type", "INCOME")  // Changed from lowercase to uppercase
        .order("transaction_date", { ascending: true })
        .limit(30);

      if (trendError) throw trendError;

      const currentMonthRevenue = currentMonthData.reduce((sum, transaction) => sum + transaction.amount, 0);
      const lastMonthRevenue = lastMonthData.reduce((sum, transaction) => sum + transaction.amount, 0);
      const percentageChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      // Process trend data for the chart
      const chartData = trendData.map(transaction => ({
        date: new Date(transaction.transaction_date).toLocaleDateString(),
        amount: transaction.amount
      }));

      return {
        currentMonthRevenue,
        lastMonthRevenue,
        percentageChange,
        chartData
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(revenueStats?.currentMonthRevenue || 0)}
          icon={DollarSign}
          description={
            <span className="flex items-center text-emerald-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              {revenueStats?.percentageChange.toFixed(1)}% from last month
            </span>
          }
        />
        <StatsCard
          title="Last Month Revenue"
          value={formatCurrency(revenueStats?.lastMonthRevenue || 0)}
          icon={CreditCard}
          description="Previous month total"
        />
        <StatsCard
          title="Average Transaction"
          value={formatCurrency(
            revenueStats?.chartData.reduce((sum, item) => sum + item.amount, 0) / 
            (revenueStats?.chartData.length || 1)
          )}
          icon={ArrowUpRight}
          description="30-day average"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueStats?.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
