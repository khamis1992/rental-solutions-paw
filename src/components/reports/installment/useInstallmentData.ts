import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInstallmentData = () => {
  return useQuery({
    queryKey: ["installment-analysis"],
    queryFn: async () => {
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment_history")
        .select(`
          *,
          lease:leases (
            customer_id,
            agreement_type,
            total_amount,
            monthly_payment
          )
        `)
        .eq("lease.agreement_type", "lease_to_own")
        .order("created_at");

      if (paymentError) throw paymentError;

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("installment_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (analyticsError) throw analyticsError;

      // Calculate summary data
      const summary = paymentData.reduce((acc, payment) => {
        acc.totalChecks++;
        acc.totalAmount += Number(payment.amount_due || 0);
        
        if (payment.status === 'completed') {
          acc.paidChecks++;
          acc.paidAmount += Number(payment.amount_paid || 0);
        } else {
          acc.pendingChecks++;
          acc.pendingAmount += Number(payment.amount_due || 0);
        }
        
        return acc;
      }, {
        totalChecks: 0,
        paidChecks: 0,
        pendingChecks: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0
      });

      return {
        payments: paymentData,
        analytics: analyticsData?.[0],
        summary
      };
    },
  });
};