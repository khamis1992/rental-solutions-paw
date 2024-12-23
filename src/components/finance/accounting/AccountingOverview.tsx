import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";
import { formatCurrency } from "@/lib/utils";
import { Loader2, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteTransactionsDialog } from "../components/DeleteTransactionsDialog";

export function AccountingOverview() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

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
      
      return data.map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense'
      }));
    },
  });

  const handleDeleteAllTransactions = async () => {
    try {
      console.log("Starting delete all transactions process...");
      setIsDeleting(true);
      
      const { data, error } = await supabase.functions.invoke('delete-all-transactions');
      
      if (error) {
        console.error("Error in delete-all-transactions function:", error);
        throw error;
      }

      console.log("Delete all transactions successful:", data);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["financial-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["transaction-history"] }),
        queryClient.invalidateQueries({ queryKey: ["accounting-transactions"] })
      ]);
      
      toast.success("Successfully deleted all transactions");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting transactions:', error);
      toast.error(error.message || "Failed to delete transactions. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Accounting Overview</h2>
        <Button 
          variant="destructive" 
          onClick={() => {
            console.log("Delete button clicked");
            setIsDeleteDialogOpen(true);
          }}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete All Transactions
        </Button>
      </div>

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

      <DeleteTransactionsDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAllTransactions}
      />
    </div>
  );
}