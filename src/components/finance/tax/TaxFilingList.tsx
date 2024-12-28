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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function TaxFilingList() {
  const { data: filings, isLoading } = useQuery({
    queryKey: ["tax-filings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filing Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Submission Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings?.map((filing) => (
            <TableRow key={filing.id}>
              <TableCell>{filing.filing_type}</TableCell>
              <TableCell>
                {format(new Date(filing.tax_period_start), "MMM d, yyyy")} -{" "}
                {format(new Date(filing.tax_period_end), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{format(new Date(filing.due_date), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    filing.status === "accepted"
                      ? "default"
                      : filing.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {filing.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(filing.total_tax_amount || 0)}
              </TableCell>
              <TableCell>
                {filing.submission_date
                  ? format(new Date(filing.submission_date), "MMM d, yyyy")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
          {!filings?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No tax filings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}