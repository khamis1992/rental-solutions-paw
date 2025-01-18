import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const InstallmentAnalysis = () => {
  const { data: analytics } = useQuery({
    queryKey: ["installment-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history_view")
        .select("*")
        .order("actual_payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const calculateMetrics = () => {
    if (!analytics?.length) return null;

    const totalDue = analytics.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = analytics.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);
    const totalLateFees = analytics.reduce((sum, payment) => sum + (payment.late_fine_amount || 0), 0);

    return {
      totalDue,
      totalPaid,
      totalLateFees,
      collectionRate: (totalPaid / totalDue) * 100
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) return <div>No payment data available</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium">Total Due</h3>
        <p className="text-2xl font-bold">{formatCurrency(metrics.totalDue)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium">Total Paid</h3>
        <p className="text-2xl font-bold">{formatCurrency(metrics.totalPaid)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium">Late Fees</h3>
        <p className="text-2xl font-bold">{formatCurrency(metrics.totalLateFees)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium">Collection Rate</h3>
        <p className="text-2xl font-bold">{metrics.collectionRate.toFixed(1)}%</p>
      </Card>
    </div>
  );
};