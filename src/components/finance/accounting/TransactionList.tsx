import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
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

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const viewReceipt = (url: string) => {
    window.open(url, '_blank');
  };

  // Get unique categories from transactions
  const categories = Array.from(new Set(transactions.map(t => t.accounting_categories?.name || 'Uncategorized')));

  // Filter transactions based on selected category
  const filteredTransactions = selectedCategory === 'all' 
    ? transactions 
    : transactions.filter(t => 
        (t.accounting_categories?.name || 'Uncategorized') === selectedCategory
      );

  console.log("Selected category:", selectedCategory);
  console.log("Filtered transactions:", filteredTransactions);

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Select 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table aria-label="Transactions list">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      aria-label={`Transaction type: ${transaction.type}`}
                    >
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.accounting_categories?.name || 'Uncategorized'}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
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
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.receipt_url ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewReceipt(transaction.receipt_url!)}
                        aria-label="View receipt"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground" aria-label="No receipt available">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="text-center py-4 text-muted-foreground"
                  aria-label="No transactions found"
                >
                  {selectedCategory === 'all' 
                    ? "No transactions found" 
                    : `No transactions found for category: ${selectedCategory}`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}