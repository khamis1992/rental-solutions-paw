import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const InstallmentAnalysis = () => {
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history')
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

  const totalAmountDue = paymentHistory?.reduce((sum, payment) => sum + payment.amount_due, 0) || 0;
  const totalAmountPaid = paymentHistory?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
  const totalLateFees = paymentHistory?.reduce((sum, payment) => sum + payment.late_fee_applied, 0) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Amount Due</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmountDue)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Amount Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmountPaid)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Late Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalLateFees)}</div>
        </CardContent>
      </Card>
    </div>
  );
};