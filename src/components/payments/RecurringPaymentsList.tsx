import { formatCurrency } from "@/lib/utils";
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
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface RecurringPaymentsListProps {
  payments: any[];
}

export function RecurringPaymentsList({ payments }: RecurringPaymentsListProps) {
  const queryClient = useQueryClient();

  const handleCancelRecurring = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          is_recurring: false,
          recurring_interval: null,
          next_payment_date: null
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast.success("Recurring payment cancelled");
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
    } catch (error) {
      console.error("Error cancelling recurring payment:", error);
      toast.error("Failed to cancel recurring payment");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Agreement</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Interval</TableHead>
          <TableHead>Next Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.leases?.profiles?.full_name}</TableCell>
            <TableCell>{payment.leases?.agreement_number}</TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.recurring_interval}</TableCell>
            <TableCell>
              {new Date(payment.next_payment_date).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge
                variant={payment.status === "completed" ? "success" : "pending_payment"}
              >
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelRecurring(payment.id)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {payments.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No recurring payments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}