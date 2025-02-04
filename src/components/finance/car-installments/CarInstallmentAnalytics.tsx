import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Loader2, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

interface AnalyticsSummary {
  total_paid: number;
  total_pending: number;
  payment_completion_rate: number;
}

export const CarInstallmentAnalytics = ({ contractId }: { contractId: string }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["car-installment-analytics", contractId],
    queryFn: async () => {
      if (!contractId) throw new Error("Contract ID is required");

      const { data: payments, error } = await supabase
        .from("car_installment_payments")
        .select("amount, paid_amount, status")
        .eq("contract_id", contractId);

      if (error) throw error;

      const total_paid = payments.reduce((sum, payment) => sum + (payment.paid_amount || 0), 0);
      const total_pending = payments.reduce((sum, payment) => sum + payment.amount - (payment.paid_amount || 0), 0);
      const total_payments = payments.length;
      const completed_payments = payments.filter(p => p.status === 'completed').length;
      
      return {
        total_paid,
        total_pending,
        payment_completion_rate: total_payments ? (completed_payments / total_payments) * 100 : 0
      };
    },
    enabled: !!contractId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analytics?.total_paid || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Amount Pending</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(analytics?.total_pending || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {analytics?.payment_completion_rate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};