import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RawPaymentImport } from "@/components/finance/types/transaction.types";

interface PaymentTableProps {
  rawTransactions: RawPaymentImport[];
  onAnalyzePayment: (id: string) => void;
  isAnalyzing: boolean;
}

export const PaymentTable = ({ rawTransactions, onAnalyzePayment, isAnalyzing }: PaymentTableProps) => {
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
              <TableCell>{transaction.Transaction_ID}</TableCell>
              <TableCell>{transaction.Agreement_Number}</TableCell>
              <TableCell>{transaction.Customer_Name}</TableCell>
              <TableCell>{formatCurrency(Number(transaction.Amount))}</TableCell>
              <TableCell>{transaction.Payment_Method}</TableCell>
              <TableCell className="max-w-md truncate">{transaction.Description}</TableCell>
              <TableCell>{new Date(transaction.Payment_Date).toLocaleDateString()}</TableCell>
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
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnalyzePayment(transaction.id)}
                  disabled={transaction.is_valid || isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Analyze
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};