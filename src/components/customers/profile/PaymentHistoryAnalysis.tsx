import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface PaymentHistoryAnalysisProps {
  customerId: string;
}

export const PaymentHistoryAnalysis = ({ customerId }: PaymentHistoryAnalysisProps) => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["customer-payments", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select(`
          *,
          lease:leases(
            id,
            customer_id
          )
        `)
        .eq("lease.customer_id", customerId)
        .order("original_due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading payment history...</div>;

  const totalPayments = payments?.length || 0;
  const latePayments = payments?.filter(
    (payment) => 
      payment.actual_payment_date && 
      new Date(payment.actual_payment_date) > new Date(payment.original_due_date)
  ).length || 0;
  const missedPayments = payments?.filter(
    (payment) => payment.status === "pending" && new Date(payment.original_due_date) < new Date()
  ).length || 0;

  const paymentScore = Math.max(
    100 - (latePayments * 5) - (missedPayments * 10),
    0
  );

  const getPaymentStatus = (payment: any) => {
    if (payment.status === "completed") {
      return {
        label: "Paid",
        color: "bg-green-500/10 text-green-500",
        icon: CheckCircle2,
      };
    }
    if (new Date(payment.original_due_date) < new Date()) {
      return {
        label: "Overdue",
        color: "bg-red-500/10 text-red-500",
        icon: AlertCircle,
      };
    }
    return {
      label: "Pending",
      color: "bg-yellow-500/10 text-yellow-500",
      icon: Clock,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Payment Score</div>
              <div className="text-2xl font-semibold">{paymentScore}%</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Late Payments</div>
              <div className="text-2xl font-semibold">{latePayments}/{totalPayments}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Missed Payments</div>
              <div className="text-2xl font-semibold">{missedPayments}</div>
            </div>
          </div>

          <div className="space-y-4">
            {payments?.map((payment) => {
              const status = getPaymentStatus(payment);
              const StatusIcon = status.icon;
              const daysLate = payment.actual_payment_date && 
                differenceInDays(new Date(payment.actual_payment_date), new Date(payment.original_due_date));

              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      Due: {format(new Date(payment.original_due_date), "PP")}
                    </div>
                    {payment.actual_payment_date && (
                      <div className="text-sm text-muted-foreground">
                        Paid: {format(new Date(payment.actual_payment_date), "PP")}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div>{formatCurrency(payment.amount_due)}</div>
                    <Badge variant="secondary" className={status.color}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {status.label}
                      {daysLate > 0 && ` (${daysLate} days late)`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};