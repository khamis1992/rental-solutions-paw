import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Pencil, Trash } from "lucide-react";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { toast } from "sonner";

export const TransactionList = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          category:category_id (
            name,
            type
          )
        `)
        .order("transaction_date", { ascending: false });

      if (error) {
        toast.error("Failed to load transactions");
        throw error;
      }

      return data;
    },
  });

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.transaction_date), "PP")}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category?.name || "Uncategorized"}</TableCell>
              <TableCell>${Math.abs(transaction.amount).toFixed(2)}</TableCell>
              <TableCell>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(transaction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TransactionDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};