import { useState } from "react";
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
import { Eye, Download } from "lucide-react";
import { ReceiptViewer } from "./ReceiptViewer";

export const ReceiptList = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions-with-receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          category:category_id (
            name
          )
        `)
        .not('receipt_url', 'is', null)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading receipts...</div>;
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
              <TableCell>{transaction.category?.name}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedReceipt(transaction.receipt_url)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={transaction.receipt_url} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReceiptViewer
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receiptUrl={selectedReceipt || ''}
      />
    </div>
  );
};