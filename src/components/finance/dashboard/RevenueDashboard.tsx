import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RevenueChart } from "../charts/RevenueChart";
import { Loader2 } from "lucide-react";

export const RevenueDashboard = () => {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-analysis"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("unified_payments")
        .select(`
          amount,
          amount_paid,
          payment_date,
          lease:leases (
            agreement_type
          )
        `)
        .eq('status', 'completed')
        .gte('payment_date', '2025-01-01')
        .order('payment_date');

      if (error) throw error;
      return payments;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RevenueChart data={revenueData || []} />
    </div>
  );
};