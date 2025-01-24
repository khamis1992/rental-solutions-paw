import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentHistoryList } from "./PaymentHistoryList";
import type { Payment } from "@/types/agreement.types";

export const RecurringPayments = () => {
  const { data: recurringPayments, isLoading } = useQuery({
    queryKey: ["recurring-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unified_payments")
        .select(`
          *,
          leases (
            agreement_number,
            customer:profiles (
              full_name,
              phone_number
            )
          )
        `)
        .eq("is_recurring", true)
        .order("next_payment_date", { ascending: true });

      if (error) throw error;

      return data as Payment[];
    },
  });

  if (isLoading) {
    return <div>Loading recurring payments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {recurringPayments && recurringPayments.length > 0 ? (
          <PaymentHistoryList payments={recurringPayments} />
        ) : (
          <p className="text-center text-muted-foreground">
            No recurring payments found
          </p>
        )}
      </CardContent>
    </Card>
  );
};