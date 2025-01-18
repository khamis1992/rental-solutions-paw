import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInstallmentData = (agreementId: string) => {
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ["payment-history", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history_view")
        .select("*")
        .eq("lease_id", agreementId);

      if (error) {
        console.error("Error fetching payment history:", error);
        throw error;
      }

      return data || [];
    },
  });

  const calculateMetrics = (payments: any[]) => {
    const totalDue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
    const totalLateFees = payments.reduce((sum, payment) => sum + (payment.late_fine_amount || 0), 0);
    const onTimePayments = payments.filter(p => p.days_overdue === 0).length;
    const latePayments = payments.filter(p => p.days_overdue > 0).length;

    return {
      totalDue,
      totalPaid,
      totalLateFees,
      onTimePayments,
      latePayments,
      paymentRate: payments.length > 0 ? (onTimePayments / payments.length) * 100 : 0,
    };
  };

  const metrics = paymentData ? calculateMetrics(paymentData) : null;

  return {
    paymentData,
    metrics,
    isLoading,
  };
};