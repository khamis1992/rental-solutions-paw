import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CredibilityScoreProps {
  customerId: string;
}

export const CredibilityScore = ({ customerId }: CredibilityScoreProps) => {
  const { data: assessment, isLoading } = useQuery({
    queryKey: ["customer-risk-assessment", customerId],
    queryFn: async () => {
      // Get payment history
      const { data: paymentHistory, error: paymentError } = await supabase
        .from("payment_history")
        .select(`
          *,
          lease:leases(
            customer_id
          )
        `)
        .eq("lease.customer_id", customerId);

      if (paymentError) throw paymentError;

      // Get traffic fines
      const { data: trafficFines, error: finesError } = await supabase
        .from("traffic_fines")
        .select(`
          *,
          lease:leases(
            customer_id
          )
        `)
        .eq("lease.customer_id", customerId);

      if (finesError) throw finesError;

      // Calculate base score (starts at 100)
      let score = 100;
      let latePayments = 0;
      let trafficFineCount = 0;
      let fullPaymentsMade = 0;

      // Deduct points for late payments
      if (paymentHistory) {
        paymentHistory.forEach(payment => {
          if (payment.actual_payment_date && payment.original_due_date) {
            const actualDate = new Date(payment.actual_payment_date);
            const dueDate = new Date(payment.original_due_date);
            if (actualDate > dueDate) {
              latePayments++;
              // Deduct 5 points for each late payment
              score -= 5;
            }
          }
          // Add points for full payments
          if (payment.amount_due === payment.amount_paid) {
            fullPaymentsMade++;
            // Add 2 points for each full payment
            score += 2;
          }
        });
      }

      // Deduct points for traffic fines
      if (trafficFines) {
        trafficFineCount = trafficFines.length;
        // Deduct 3 points for each traffic fine
        score -= (trafficFineCount * 3);
      }

      // Ensure score stays within 0-100 range
      score = Math.max(0, Math.min(100, score));

      const riskLevel = score >= 80 ? "low" : score >= 60 ? "medium" : "high";

      return {
        score,
        riskLevel,
        metrics: {
          latePayments,
          trafficFineCount,
          fullPaymentsMade
        }
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return ShieldCheck;
    if (score >= 60) return Shield;
    return ShieldAlert;
  };

  const ScoreIcon = assessment ? getScoreIcon(assessment.score) : Shield;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScoreIcon className={`h-5 w-5 ${assessment ? getScoreColor(assessment.score) : ''}`} />
          Credibility Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assessment ? (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  assessment.score
                )}`}
              >
                {assessment.score}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Risk Level: {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)}
              </div>
            </div>

            <Progress
              value={assessment.score}
              className="h-2"
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-medium">Late Payments</div>
                <div className="text-2xl text-red-500">{assessment.metrics.latePayments}</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-medium">Traffic Fines</div>
                <div className="text-2xl text-yellow-500">{assessment.metrics.trafficFineCount}</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-medium">Full Payments</div>
                <div className="text-2xl text-green-500">{assessment.metrics.fullPaymentsMade}</div>
              </div>
            </div>

            {assessment.riskLevel === 'high' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  High risk level detected. Consider reviewing payment history and traffic violations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No credibility assessment available for this customer yet.</p>
            <p className="text-sm mt-1">Assessment will be generated after their first payment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};