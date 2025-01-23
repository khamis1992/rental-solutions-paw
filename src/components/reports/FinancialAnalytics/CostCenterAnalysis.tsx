import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CostCenterAnalysis = () => {
  const { data: costs, isLoading } = useQuery({
    queryKey: ["accounting-transactions-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          amount,
          category:accounting_categories (
            name,
            type
          )
        `)
        .eq("type", "EXPENSE");

      if (error) throw error;

      // Aggregate costs by category
      const aggregated = data.reduce((acc: Record<string, number>, curr) => {
        const categoryName = curr.category?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + Number(curr.amount);
        return acc;
      }, {});

      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Center Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Center Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costs}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.name}
              >
                {costs?.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};