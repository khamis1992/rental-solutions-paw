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
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionTableProps {
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

export const TransactionTable = ({
  searchQuery,
  statusFilter,
  sortField,
  sortDirection,
  onSort,
}: TransactionTableProps) => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", sortField, sortDirection, statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("financial_imports")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.or(
          `customer_name.ilike.%${searchQuery}%,license_plate.ilike.%${searchQuery}%,transaction_id.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-8 font-semibold"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortableHeader field="lease_id">Lease ID</SortableHeader></TableHead>
            <TableHead><SortableHeader field="customer_name">Customer Name</SortableHeader></TableHead>
            <TableHead><SortableHeader field="amount">Amount</SortableHeader></TableHead>
            <TableHead><SortableHeader field="license_plate">License Plate</SortableHeader></TableHead>
            <TableHead><SortableHeader field="vehicle">Vehicle</SortableHeader></TableHead>
            <TableHead><SortableHeader field="payment_date">Payment Date</SortableHeader></TableHead>
            <TableHead><SortableHeader field="payment_method">Payment Method</SortableHeader></TableHead>
            <TableHead><SortableHeader field="transaction_id">Transaction ID</SortableHeader></TableHead>
            <TableHead><SortableHeader field="description">Description</SortableHeader></TableHead>
            <TableHead><SortableHeader field="type">Type</SortableHeader></TableHead>
            <TableHead><SortableHeader field="status">Status</SortableHeader></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.lease_id}</TableCell>
              <TableCell>{transaction.customer_name}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{transaction.license_plate}</TableCell>
              <TableCell>{transaction.vehicle}</TableCell>
              <TableCell>{format(new Date(transaction.payment_date), "PPP")}</TableCell>
              <TableCell>{transaction.payment_method}</TableCell>
              <TableCell>{transaction.transaction_id}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>
                <Badge variant={transaction.status === "completed" ? "success" : "secondary"}>
                  {transaction.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {!transactions?.length && (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};