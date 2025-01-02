import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountingTransaction } from "../types/transaction.types";
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
import { Loader2 } from "lucide-react";

export const TransactionList = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as AccountingTransaction[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Agreement Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.transaction_date ? format(new Date(transaction.transaction_date), "PP") : "N/A"}
                </TableCell>
                <TableCell>{transaction.transaction_id}</TableCell>
                <TableCell>{transaction.agreement_number}</TableCell>
                <TableCell>{transaction.customer_name}</TableCell>
                <TableCell>{transaction.license_plate}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.payment_method}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell className="text-right">
                  {transaction.amount ? formatCurrency(parseFloat(transaction.amount)) : "N/A"}
                </TableCell>
              </TableRow>
            ))}
            {!transactions?.length && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};