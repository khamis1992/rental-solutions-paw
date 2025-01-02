import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/components/finance/types/transaction.types";

export const PayrollManagement = () => {
  const { data: transactions } = useQuery({
    queryKey: ["payroll-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .eq("type", "PAYROLL")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount)
      })) as Transaction[];
    }
  });

  const calculatePayrollStats = () => {
    if (!transactions) return { total: 0, average: 0, min: 0, max: 0 };

    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    
    return {
      total,
      average: total / amounts.length,
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    };
  };

  const stats = calculatePayrollStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.average)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Minimum Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.min)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maximum Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.max)}</div>
        </CardContent>
      </Card>
    </div>
  );
};