import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PaymentReconciliationTable = () => {
  const { data: reconciliations, isLoading } = useQuery({
    queryKey: ["payment-reconciliation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_matching_logs")
        .select(`
          *,
          payment:payments (
            amount,
            payment_date,
            transaction_id
          ),
          customer:profiles (
            full_name,
            is_ai_generated
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleApproveMatch = async (id: string) => {
    const { error } = await supabase
      .from("payment_matching_logs")
      .update({
        admin_reviewed: true,
        admin_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error approving match:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Match Confidence</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reconciliations?.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.payment?.transaction_id}</TableCell>
            <TableCell>
              {record.payment?.amount?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              {record.customer?.full_name}
              {record.customer?.is_ai_generated && (
                <Badge variant="secondary">AI Generated</Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant={record.match_confidence > 0.8 ? "default" : "warning"}
              >
                {Math.round(record.match_confidence * 100)}%
              </Badge>
            </TableCell>
            <TableCell>
              {record.admin_reviewed ? (
                <Badge variant="success">Approved</Badge>
              ) : (
                <Badge variant="warning">Pending Review</Badge>
              )}
            </TableCell>
            <TableCell>
              {!record.admin_reviewed && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproveMatch(record.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};