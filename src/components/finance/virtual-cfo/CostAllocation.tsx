import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CostAllocation = () => {
  const { data: costData, isLoading } = useQuery({
    queryKey: ["cost-allocation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          amount,
          category:accounting_categories(
            name,
            type
          )
        `)
        .eq('type', 'EXPENSE');

      if (error) throw error;

      const categoryTotals = data.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + (parseFloat(transaction.amount) || 0);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value
      }));
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
    <Card>
      <CardHeader>
        <CardTitle>Cost Allocation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {costData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};