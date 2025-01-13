import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Brain, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { UnifiedImportTracking } from "../../types/transaction.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentTableProps {
  rawTransactions: UnifiedImportTracking[];
  onAnalyzePayment: (id: string) => void;
  isAnalyzing: boolean;
  onRefresh?: () => void;
}

export const PaymentTable = ({ rawTransactions, onAnalyzePayment, isAnalyzing, onRefresh }: PaymentTableProps) => {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('unified_import_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete transaction');
    }
  };

  return (
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawTransactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.transaction_id}</TableCell>
              <TableCell>{transaction.agreement_number}</TableCell>
              <TableCell>{transaction.customer_name}</TableCell>
              <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
              <TableCell>{transaction.payment_method}</TableCell>
              <TableCell className="max-w-md truncate">{transaction.description}</TableCell>
              <TableCell>{new Date(transaction.payment_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'INCOME' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAnalyzePayment(transaction.id)}
                    disabled={transaction.validation_status || isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Analyze
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};