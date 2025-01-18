import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CredibilityScoreProps {
  customerId: string;
}

export const CredibilityScore = ({ customerId }: CredibilityScoreProps) => {
  const { data: paymentHistory } = useQuery({
    queryKey: ["payment-history", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history_view")
        .select("*")
        .eq("customer_id", customerId);

      if (error) throw error;
      return data;
    },
  });

  const calculateScore = () => {
    if (!paymentHistory?.length) return 100;

    let score = 100;
    let totalPayments = 0;
    let latePayments = 0;
    let missedPayments = 0;

    paymentHistory.forEach((payment) => {
      totalPayments++;
      
      if (payment.days_overdue > 0) {
        latePayments++;
        score -= Math.min(payment.days_overdue * 2, 20);
      }
      
      if (payment.status === "pending") {
        missedPayments++;
        score -= 10;
      }
    });

    // Calculate percentages
    const latePaymentRate = (latePayments / totalPayments) * 100;
    const missedPaymentRate = (missedPayments / totalPayments) * 100;

    // Additional deductions based on rates
    if (latePaymentRate > 30) score -= 10;
    if (missedPaymentRate > 20) score -= 15;

    return Math.max(0, Math.min(100, score));
  };

  const score = calculateScore();
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credibility Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className={`text-4xl font-bold ${scoreColor}`}>
            {score}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};