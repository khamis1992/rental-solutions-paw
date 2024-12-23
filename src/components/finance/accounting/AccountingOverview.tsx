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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AccountingOverview() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["accounting-transactions", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("accounting_transactions")
        .select(`
          *,
          accounting_categories (
            name,
            type
          )
        `)
        .order("transaction_date", { ascending: false });

      // Apply category filter if a specific category is selected
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      
      return data.map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense'
      }));
    },
  });

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["accounting-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleCategoryChange = (value: string) => {
    console.log("Selected category:", value);
    setSelectedCategory(value);
  };

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
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading transactions">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" tabIndex={0}>Accounting Overview</h1>
        <div className="flex gap-4 items-center">
          <Select 
            value={selectedCategory} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2"
            aria-label="Delete all transactions"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete All Transactions
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3" role="region" aria-label="Financial summary">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" tabIndex={0} aria-label={`Total income: ${formatCurrency(totalIncome)}`}>
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" tabIndex={0} aria-label={`Total expenses: ${formatCurrency(totalExpenses)}`}>
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div 
              className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
              tabIndex={0}
              aria-label={`Net income: ${formatCurrency(netIncome)}`}
            >
              {formatCurrency(netIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList aria-label="Accounting sections">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="new">New Transaction</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" role="tabpanel">
          <TransactionList transactions={transactions || []} />
        </TabsContent>
        <TabsContent value="new" role="tabpanel">
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