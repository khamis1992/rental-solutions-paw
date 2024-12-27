import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { TransactionType } from "./accounting/types/transaction.types";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
  receipt_url: string | null;
  status: string;
  accounting_categories: {
    name: string;
    type: string;
  } | null;
}

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["recent-transactions"],
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
        .order("transaction_date", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      return data as Transaction[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading transactions">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table aria-label="Recent transactions">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.transaction_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === 'INCOME' ? "default" : "destructive"}
                  aria-label={`Transaction type: ${transaction.type}`}
                >
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>{transaction.accounting_categories?.name || "Uncategorized"}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    transaction.type === 'INCOME'
                      ? "text-green-600"
                      : "text-red-600"
                  }
                  aria-label={`Amount: ${formatCurrency(transaction.amount)}`}
                >
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  aria-label={`Status: ${transaction.status}`}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {!transactions?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No recent transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}