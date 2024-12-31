import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { CategoryDialog } from "../categories/CategoryDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_id: string | null;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export const TransactionCategorization = () => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["uncategorized-transactions"],
    queryFn: async () => {
      console.log("Fetching uncategorized transactions");
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .is("category_id", null)
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
        throw error;
      }
      
      console.log("Fetched uncategorized transactions:", data);
      return data as Transaction[];
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        throw error;
      }
      return data as Category[];
    },
  });

  const handleCategoryAssignment = async (transactionId: string, categoryId: string) => {
    try {
      console.log("Assigning category:", categoryId, "to transaction:", transactionId);
      
      const { error } = await supabase
        .from("accounting_transactions")
        .update({ category_id: categoryId })
        .eq("id", transactionId);

      if (error) throw error;
      
      // Invalidate both queries to refresh the data
      await queryClient.invalidateQuery({ queryKey: ["uncategorized-transactions"] });
      await queryClient.invalidateQuery({ queryKey: ["transactions"] });
      
      toast.success("Transaction categorized successfully");
    } catch (error) {
      console.error("Error categorizing transaction:", error);
      toast.error("Failed to categorize transaction");
    }
  };

  if (isLoadingTransactions || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Categorization</h2>
        <Button onClick={() => setShowCategoryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>${Math.abs(transaction.amount).toFixed(2)}</TableCell>
                <TableCell>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </TableCell>
                <TableCell>
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleCategoryAssignment(transaction.id, e.target.value)}
                    value={transaction.category_id || ""}
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
            {!transactions?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No uncategorized transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
};