import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface PaymentHistoryAnalysisProps {
  customerId: string;
}

export const PaymentHistoryAnalysis = ({ customerId }: PaymentHistoryAnalysisProps) => {
  const { data: payments } = useQuery({
    queryKey: ["payment-history-view", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history_view")
        .select("*")
        .eq("customer_id", customerId);

      if (error) throw error;
      return data;
    },
  });

  const calculateMetrics = () => {
    if (!payments?.length) return null;

    let totalPayments = payments.length;
    let onTimePayments = 0;
    let latePayments = 0;
    let totalLateDays = 0;
    let totalAmount = 0;
    let totalPaid = 0;

    payments.forEach((payment) => {
      if (payment.days_overdue > 0) {
        latePayments++;
        totalLateDays += payment.days_overdue;
      } else {
        onTimePayments++;
      }

      totalAmount += payment.amount;
      totalPaid += payment.amount_paid;
    });

    return {
      totalPayments,
      onTimePayments,
      latePayments,
      averageLateDays: latePayments > 0 ? Math.round(totalLateDays / latePayments) : 0,
      paymentRate: Math.round((onTimePayments / totalPayments) * 100),
      totalAmount,
      totalPaid,
      collectionRate: Math.round((totalPaid / totalAmount) * 100)
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Payments</div>
            <div className="text-2xl font-bold">{metrics.totalPayments}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">On-Time Payment Rate</div>
            <div className="text-2xl font-bold">{metrics.paymentRate}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Average Late Days</div>
            <div className="text-2xl font-bold">{metrics.averageLateDays}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Collection Rate</div>
            <div className="text-2xl font-bold">{metrics.collectionRate}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};