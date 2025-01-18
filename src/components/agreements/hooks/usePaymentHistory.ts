import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentHistory = (agreementId: string) => {
  return useQuery({
    queryKey: ['payment-history', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history_view')
        .select(`
          id,
          lease_id,
          amount,
          amount_paid,
          balance,
          actual_payment_date,
          original_due_date,
          days_overdue,
          late_fine_amount,
          status,
          payment_method,
          description,
          type,
          created_at,
          updated_at,
          agreement_number,
          customer_id,
          customer_name,
          customer_phone
        `)
        .eq('lease_id', agreementId)
        .order('actual_payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 30000,
  });
};