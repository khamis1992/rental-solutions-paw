import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { YearOverYearData } from "@/types/finance.types";

export const YearOverYearComparison = () => {
  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ["year-over-year"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const startOfLastYear = new Date(currentYear - 1, 0, 1);
      
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          amount,
          type,
          transaction_date
        `)
        .gte('transaction_date', startOfLastYear.toISOString());

      if (error) throw error;

      // Process data for year-over-year comparison
      const monthlyData = data.reduce((acc: Record<string, YearOverYearData>, transaction) => {
        const date = new Date(transaction.transaction_date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        const key = month;

        if (!acc[key]) {
          acc[key] = {
            month: key,
            currentYear: { revenue: 0, expenses: 0 },
            previousYear: { revenue: 0, expenses: 0 },
            percentageChange: { revenue: 0, expenses: 0 }
          };
        }

        const yearData = year === currentYear ? 'currentYear' : 'previousYear';
        if (transaction.type === 'INCOME') {
          acc[key][yearData].revenue += transaction.amount;
        } else {
          acc[key][yearData].expenses += transaction.amount;
        }

        return acc;
      }, {});

      // Calculate percentage changes
      return Object.values(monthlyData).map(month => ({
        ...month,
        percentageChange: {
          revenue: month.previousYear.revenue ? 
            ((month.currentYear.revenue - month.previousYear.revenue) / month.previousYear.revenue) * 100 : 0,
          expenses: month.previousYear.expenses ? 
            ((month.currentYear.expenses - month.previousYear.expenses) / month.previousYear.expenses) * 100 : 0
        }
      }));
    },
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
        <CardTitle>Year-over-Year Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar 
                dataKey="currentYear.revenue" 
                name="Current Year Revenue" 
                fill="#4ade80" 
              />
              <Bar 
                dataKey="previousYear.revenue" 
                name="Previous Year Revenue" 
                fill="#60a5fa" 
              />
              <Bar 
                dataKey="currentYear.expenses" 
                name="Current Year Expenses" 
                fill="#f43f5e" 
              />
              <Bar 
                dataKey="previousYear.expenses" 
                name="Previous Year Expenses" 
                fill="#fb923c" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};