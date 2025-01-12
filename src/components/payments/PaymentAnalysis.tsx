import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface PaymentAnalysisProps {
  paymentId: string;
}

interface AnomalyDetails {
  description: string;
  [key: string]: any;
}

export const PaymentAnalysis = ({ paymentId }: PaymentAnalysisProps) => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["payment-analysis", paymentId],
    queryFn: async () => {
      const { data: aiAnalysis, error: aiError } = await supabase
        .from("ai_payment_analysis")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (aiError) throw aiError;

      const { data: payment, error: paymentError } = await supabase
        .from("unified_payments")
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
        .eq("id", paymentId)
        .maybeSingle();

      if (paymentError) throw paymentError;

      return {
        aiAnalysis,
        payment
      };
    },
    enabled: !!paymentId
  });

  if (isLoading) {
    return <div>Loading analysis...</div>;
  }

  if (!analysis?.payment) {
    return <div>No payment data found</div>;
  }

  const { payment, aiAnalysis } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge 
              variant={payment.status === 'completed' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {payment.status === 'completed' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : payment.status === 'pending' ? (
                <Clock className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {payment.status}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount Paid</span>
            <span>{formatCurrency(payment.amount_paid)}</span>
          </div>

          {payment.balance > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-red-500">{formatCurrency(payment.balance)}</span>
            </div>
          )}

          {payment.payment_date && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Date</span>
              <span>{format(new Date(payment.payment_date), "dd/MM/yyyy")}</span>
            </div>
          )}

          {payment.due_date && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span>{format(new Date(payment.due_date), "dd/MM/yyyy")}</span>
            </div>
          )}

          {payment.late_fine_amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Late Fine</span>
              <span className="text-red-500">{formatCurrency(payment.late_fine_amount)}</span>
            </div>
          )}
        </div>

        {aiAnalysis && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="font-medium">AI Analysis</h4>
            
            {aiAnalysis.anomaly_detected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Anomaly Detected
                </div>
                <p className="mt-1">
                  {typeof aiAnalysis.anomaly_details === 'string' 
                    ? aiAnalysis.anomaly_details 
                    : (aiAnalysis.anomaly_details as AnomalyDetails)?.description}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Confidence Score</span>
              <Badge variant={aiAnalysis.confidence_score > 0.8 ? 'default' : 'secondary'}>
                {Math.round(aiAnalysis.confidence_score * 100)}%
              </Badge>
            </div>

            {aiAnalysis.suggested_corrections && (
              <div className="text-sm space-y-1">
                <span className="text-muted-foreground">Suggested Corrections:</span>
                <ul className="list-disc list-inside">
                  {Object.entries(aiAnalysis.suggested_corrections).map(([field, value]) => (
                    <li key={field}>
                      {field}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};