import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { FinancialCards } from "./components/FinancialCards";
import { RecentTransactionsList } from "./components/RecentTransactionsList";
import { DeleteTransactionsDialog } from "./components/DeleteTransactionsDialog";

export const FinanceOverview = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-overview"],
    queryFn: async () => {
      const [expenseResult, revenueResult] = await Promise.all([
        supabase
          .from("expense_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (expenseResult.error) throw expenseResult.error;
      if (revenueResult.error) throw revenueResult.error;

      return {
        expenses: expenseResult.data || [],
        revenue: revenueResult.data || []
      };
    }
  });

  const handleDeleteAllTransactions = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.rpc('delete_all_transactions');
      
      if (error) throw error;

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      
      toast.success("All transactions have been deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      toast.error("Failed to delete transactions. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalRevenue = financialData?.revenue.reduce((sum, payment) => 
    payment.status === "completed" ? sum + (payment.amount || 0) : sum, 0) || 0;

  const totalExpenses = financialData?.expenses.reduce((sum, expense) => 
    sum + (expense.amount || 0), 0) || 0;

  const recentTransactions = [
    ...(financialData?.expenses.slice(0, 5).map(expense => ({
      type: 'expense' as const,
      amount: -expense.amount,
      description: expense.description || 'Unnamed Expense',
      date: new Date(expense.created_at)
    })) || []),
    ...(financialData?.revenue.slice(0, 5).map(payment => ({
      type: 'revenue' as const,
      amount: payment.amount,
      description: `Payment ${payment.transaction_id || payment.id}`,
      date: new Date(payment.created_at)
    })) || [])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Financial Overview</h2>
        <Button 
          variant="destructive" 
          onClick={() => setIsDeleteDialogOpen(true)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete All Transactions
        </Button>
      </div>

      <FinancialCards 
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
      />

      <RecentTransactionsList transactions={recentTransactions} />

      <DeleteTransactionsDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAllTransactions}
      />
    </div>
  );
};