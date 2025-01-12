import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentHistory = (agreementId: string) => {
  return useQuery({
    queryKey: ['unified-payments', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_payments')
        .select(`
          *,
          leases (
            agreement_number,
            customer_id,
            profiles:customer_id (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .eq('lease_id', agreementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 30000,
  });
};