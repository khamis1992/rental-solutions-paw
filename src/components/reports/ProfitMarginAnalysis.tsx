import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ProfitMarginData } from "@/types/finance.types";

export const ProfitMarginAnalysis = () => {
  const { data: profitData, isLoading } = useQuery({
    queryKey: ["profit-margin-analysis"],
    queryFn: async () => {
      // Fetch revenue data
      const { data: revenue, error: revenueError } = await supabase
        .from("payments")
        .select(`
          amount,
          created_at
        `)
        .eq('status', 'completed');

      if (revenueError) throw revenueError;

      // Fetch cost data (maintenance + fixed costs + variable costs)
      const { data: costs, error: costsError } = await supabase
        .from("maintenance")
        .select(`
          cost,
          completed_date
        `)
        .eq('status', 'completed');

      if (costsError) throw costsError;

      // Process data by month
      const monthlyData: Record<string, ProfitMarginData> = {};

      // Process revenue
      revenue?.forEach(payment => {
        const date = new Date(payment.created_at);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            period: monthYear,
            revenue: 0,
            costs: 0,
            profitMargin: 0,
            profitAmount: 0
          };
        }
        
        monthlyData[monthYear].revenue += payment.amount || 0;
      });

      // Process costs
      costs?.forEach(cost => {
        const date = new Date(cost.completed_date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            period: monthYear,
            revenue: 0,
            costs: 0,
            profitMargin: 0,
            profitAmount: 0
          };
        }
        
        monthlyData[monthYear].costs += cost.cost || 0;
      });

      // Calculate profit margins
      return Object.values(monthlyData).map(month => ({
        ...month,
        profitAmount: month.revenue - month.costs,
        profitMargin: month.revenue > 0 
          ? ((month.revenue - month.costs) / month.revenue) * 100 
          : 0
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(profitData?.reduce((sum, data) => sum + data.revenue, 0) || 0)}
              </div>
              <p className="text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(profitData?.reduce((sum, data) => sum + data.costs, 0) || 0)}
              </div>
              <p className="text-muted-foreground">Total Costs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {((profitData?.reduce((sum, data) => sum + data.profitAmount, 0) || 0) / 
                  (profitData?.reduce((sum, data) => sum + data.revenue, 0) || 1) * 100).toFixed(1)}%
              </div>
              <p className="text-muted-foreground">Average Profit Margin</p>
            </CardContent>
          </Card>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Profit Margin") return `${value.toFixed(1)}%`;
                  return formatCurrency(value);
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#4ade80"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="costs"
                name="Costs"
                stroke="#f43f5e"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profitMargin"
                name="Profit Margin"
                stroke="#60a5fa"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};