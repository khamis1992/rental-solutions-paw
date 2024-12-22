import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";
import { formatCurrency } from "@/lib/utils";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

export function AccountingOverview() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["accounting-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          accounting_categories (
            name,
            type
          )
        `)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      
      // Ensure the type field is correctly typed
      return data.map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense'
      }));
    },
  });

  const totalIncome = transactions?.reduce((sum, transaction) => {
    if (transaction.type === "income") {
      return sum + transaction.amount;
    }
    return sum;
  }, 0) || 0;

  const totalExpenses = transactions?.reduce((sum, transaction) => {
    if (transaction.type === "expense") {
      return sum + transaction.amount;
    }
    return sum;
  }, 0) || 0;

  const netIncome = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="new">New Transaction</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <TransactionList transactions={transactions || []} />
        </TabsContent>
        <TabsContent value="new">
          <TransactionForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}