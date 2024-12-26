import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const FinancialReports = () => {
  const { data: financialData } = useQuery({
    queryKey: ["financial-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      // Group data by month
      const monthlyData = data.reduce((acc: any, transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { month, income: 0, expenses: 0 };
        }
        if (transaction.type === "income") {
          acc[month].income += transaction.amount;
        } else {
          acc[month].expenses += transaction.amount;
        }
        return acc;
      }, {});

      return Object.values(monthlyData);
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#4ade80" />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};