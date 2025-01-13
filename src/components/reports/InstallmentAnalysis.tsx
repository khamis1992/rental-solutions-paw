import { useQuery } from "@tanstack/react-query";
import { PaymentHistory } from "@/components/finance/types/transaction.types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface InstallmentAnalysisProps {
  agreementId: string;
}

export const InstallmentAnalysis = ({ agreementId }: InstallmentAnalysisProps) => {
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ['payment-history', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          lease:leases (
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
        .order('original_due_date', { ascending: true });

      if (error) throw error;
      return data as PaymentHistory[];
    }
  });

  if (isLoading) {
    return <div>Loading analysis...</div>;
  }

  const totalDue = paymentHistory?.reduce((sum, payment) => sum + payment.amount_due, 0) || 0;
  const totalPaid = paymentHistory?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
  const totalLateFees = paymentHistory?.reduce((sum, payment) => sum + payment.late_fee_applied, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Amount Due</div>
            <div className="text-2xl font-bold">{formatCurrency(totalDue)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Total Amount Paid</div>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Total Late Fees</div>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalLateFees)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Payment Completion</div>
            <div className="text-2xl font-bold">
              {totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};