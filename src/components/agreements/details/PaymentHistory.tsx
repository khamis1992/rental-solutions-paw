import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useOverduePayments } from "../hooks/useOverduePayments";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payment-history', agreementId],
    queryFn: async () => {
      console.log('Fetching payment history for agreement:', agreementId);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_date,
          status,
          payment_method,
          description
        `)
        .eq('lease_id', agreementId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        throw error;
      }

      console.log('Fetched payment history:', data);
      return data;
    },
  });

  const { overduePayment, isLoading: isLoadingOverdue } = useOverduePayments(agreementId);

  if (isLoadingPayments || isLoadingOverdue) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {overduePayment && overduePayment.balance > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Overdue Payment Alert</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Days Overdue: {overduePayment.days_overdue}</p>
              <p>Outstanding Balance: {formatCurrency(overduePayment.balance)}</p>
              <p>Last Payment: {overduePayment.last_payment_date ? 
                format(new Date(overduePayment.last_payment_date), 'PP') : 
                'No payments recorded'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {payment.payment_date && format(new Date(payment.payment_date), 'PP')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.payment_method} - {payment.description || 'Payment'}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div>{formatCurrency(payment.amount)}</div>
                  <Badge 
                    variant="outline" 
                    className={payment.status === 'completed' ? 
                      'bg-green-50 text-green-600 border-green-200' : 
                      'bg-yellow-50 text-yellow-600 border-yellow-200'
                    }
                  >
                    {payment.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No payment history found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};