import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useOverduePayments = () => {
  const queryClient = useQueryClient();

  const { data: overduePayments, isLoading } = useQuery({
    queryKey: ["overdue-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select(`
          id,
          amount,
          due_date,
          status,
          lease_id,
          leases (
            id,
            agreement_number,
            customer_id,
            profiles:customer_id (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .eq("status", "pending")
        .lt("due_date", new Date().toISOString())
        .order("due_date", { ascending: false });

      if (error) throw error;

      // Group by customer and calculate total overdue amount
      const customerOverdueMap = data.reduce((acc, payment) => {
        const customerId = payment.leases?.customer_id;
        if (!customerId) return acc;

        if (!acc[customerId]) {
          acc[customerId] = {
            customerId,
            customerName: payment.leases?.profiles?.full_name || "Unknown",
            phoneNumber: payment.leases?.profiles?.phone_number || "",
            totalOverdue: 0,
            payments: []
          };
        }

        acc[customerId].totalOverdue += payment.amount;
        acc[customerId].payments.push({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.due_date,
          agreementNumber: payment.leases?.agreement_number
        });

        return acc;
      }, {});

      return Object.values(customerOverdueMap);
    },
  });

  // Set up real-time subscription for payment schedule changes
  useEffect(() => {
    const channel = supabase
      .channel('overdue-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_schedules'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["overdue-payments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { overduePayments, isLoading };
};