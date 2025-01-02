import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const IncomeExpenseTracking = () => {
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const totalIncome = transactions?.reduce((acc, curr) => {
    return curr.type === 'INCOME' ? acc + Number(curr.amount) : acc;
  }, 0) || 0;

  const totalExpenses = transactions?.reduce((acc, curr) => {
    return curr.type === 'EXPENSE' ? acc + Number(curr.amount) : acc;
  }, 0) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>
    </div>
  );
};