import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface RawTransaction {
  id: string;
  raw_data: any;
  created_at: string;
  is_valid: boolean;
  error_description?: string;
}

export const RawDataView = () => {
  const { data: rawTransactions, isLoading } = useQuery({
    queryKey: ["raw-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_transaction_imports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RawTransaction[];
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Raw Transaction Data</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created At</TableHead>
              <TableHead>Raw Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rawTransactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <pre className="max-w-md overflow-x-auto text-sm">
                    {JSON.stringify(transaction.raw_data, null, 2)}
                  </pre>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.is_valid 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.is_valid ? 'Valid' : 'Invalid'}
                  </span>
                </TableCell>
                <TableCell className="text-red-600">
                  {transaction.error_description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};