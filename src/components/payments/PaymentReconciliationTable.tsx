import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface PaymentReconciliationTableProps {
  payments: any[];
}

export const PaymentReconciliationTable = ({ payments }: PaymentReconciliationTableProps) => {
  const queryClient = useQueryClient();

  const handleReconcile = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("unified_payments")
        .update({ 
          reconciliation_status: "completed",
          reconciliation_date: new Date().toISOString()
        })
        .eq("id", paymentId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["unreconciled-payments"] });
      toast.success("Payment reconciled successfully");
    } catch (error) {
      console.error("Error reconciling payment:", error);
      toast.error("Failed to reconcile payment");
    }
  };

  if (!payments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No payments need reconciliation
      </div>
    );
  }

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
                onClick={() => handleReconcile(payment.id)}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Reconcile
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};