import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RawPaymentImport } from "../types/transaction.types";
import { toast } from "sonner";
import { formatDate } from "@/lib/dateUtils";

export const RawDataView = () => {
  const queryClient = useQueryClient();
  const { data: rawTransactions, isLoading } = useQuery({
    queryKey: ["raw-payment-imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_payment_imports")
        .select("*")
        .eq('is_valid', true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RawPaymentImport[];
    },
  });

  const processPayments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-raw-payments', {
        body: {}
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["raw-payment-imports"] });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["accounting-transactions"] });

      toast.success(`Successfully processed ${data.processed} payments`);
    } catch (error) {
      console.error('Error processing payments:', error);
      toast.error('Failed to process payments');
    }
  };

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
        <h2 className="text-xl font-semibold">Raw Payment Import Data</h2>
        <Button 
          onClick={processPayments}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          Process Payments
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Agreement Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount (QAR)</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rawTransactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.Transaction_ID}</TableCell>
                <TableCell>{transaction.Agreement_Number}</TableCell>
                <TableCell>{transaction.Customer_Name}</TableCell>
                <TableCell>{transaction.Amount}</TableCell>
                <TableCell>{transaction.Payment_Method}</TableCell>
                <TableCell className="max-w-md truncate">{transaction.Description}</TableCell>
                <TableCell>{transaction.Payment_Date ? formatDate(new Date(transaction.Payment_Date)) : ''}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.Type === 'INCOME' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.Type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.Status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.Status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};