import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Transaction } from "../types/transaction.types";

export const TransactionList = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          category:accounting_categories (
            id,
            name,
            type,
            budget_limit,
            budget_period
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount) || 0
      })) as Transaction[];
    },
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {transaction.created_at && format(new Date(transaction.created_at), "PP")}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category?.name}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{transaction.status || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};