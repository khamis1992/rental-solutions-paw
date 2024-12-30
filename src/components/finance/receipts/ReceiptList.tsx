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
import { format } from "date-fns";
import { ReceiptViewer } from "./ReceiptViewer";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const ReceiptList = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions-with-receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .not("receipt_url", "is", null)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[100px]">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.transaction_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>
                <ReceiptViewer
                  url={transaction.receipt_url}
                  fileName={transaction.receipt_url.split("/").pop() || ""}
                />
              </TableCell>
            </TableRow>
          ))}
          {!transactions?.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No receipts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};