import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";

interface PaymentHistoryTableProps {
  payments: any[];
  isLoading: boolean;
}

export const PaymentHistoryTable = ({ payments, isLoading }: PaymentHistoryTableProps) => {
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const handleDeleteClick = async (paymentId: string) => {
    try {
      // First delete audit logs
      const { error: auditError } = await supabase
        .from('payment_audit_logs')
        .delete()
        .eq('payment_id', paymentId);

      if (auditError) throw auditError;

      // Then delete the payment
      const { error } = await supabase
        .from("unified_payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;

      toast.success("Payment deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Agreement #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.payment_date ? 
                format(new Date(payment.payment_date), "dd/MM/yyyy") : 
                format(new Date(payment.created_at), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>{payment.leases?.agreement_number || "N/A"}</TableCell>
            <TableCell>{payment.leases?.profiles?.full_name || "Unknown"}</TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {payment.payment_method || "Not specified"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={payment.status === "completed" ? "success" : "secondary"}>
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(payment.id)}
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Check className="h-4 w-4" />
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
