import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const InstallmentAnalysis = () => {
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history_view')
        .select(`
          *,
          lease:lease_id (
            agreement_number,
            customer_id,
            profiles:customer_id (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const totals = paymentHistory?.reduce((acc, payment) => {
    const amountDue = payment.amount || 0;
    const amountPaid = payment.amount_paid || 0;
    const lateFees = payment.late_fine_amount || 0;

    return {
      amountPaid: acc.amountPaid + amountPaid,
      lateFees: acc.lateFees + lateFees,
    };
  }, { amountPaid: 0, lateFees: 0 }) || 
  { amountPaid: 0, lateFees: 0 };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Amount Due</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.amountPaid)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Amount Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.amountPaid)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Late Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.lateFees)}</div>
        </CardContent>
      </Card>
    </div>
  );
};