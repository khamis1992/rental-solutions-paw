
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GaugeCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (!paymentHistory?.length) return { score: 100, trend: 'neutral' };

    let score = 100;
    let totalPayments = 0;
    let latePayments = 0;
    let missedPayments = 0;
    let recentPerformance = 0;

    paymentHistory.forEach((payment, index) => {
      totalPayments++;
      
      if (payment.days_overdue > 0) {
        latePayments++;
        score -= Math.min(payment.days_overdue * 2, 20);
      }
      
      if (payment.status === "pending") {
        missedPayments++;
        score -= 10;
      }

      // Calculate trend based on recent payments (last 3)
      if (index < 3) {
        recentPerformance += payment.days_overdue > 0 ? -1 : 1;
      }
    });

    const trend = recentPerformance > 0 ? 'up' : recentPerformance < 0 ? 'down' : 'neutral';

    // Calculate percentages
    const latePaymentRate = (latePayments / totalPayments) * 100;
    const missedPaymentRate = (missedPayments / totalPayments) * 100;

    // Additional deductions based on rates
    if (latePaymentRate > 30) score -= 10;
    if (missedPaymentRate > 20) score -= 15;

    return {
      score: Math.max(0, Math.min(100, score)),
      trend
    };
  };

  const { score, trend } = calculateScore();
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";
  const progressCircleStyle = {
    background: `conic-gradient(${score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'} ${score * 3.6}deg, #f3f4f6 0deg)`
  };

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <GaugeCircle className="h-5 w-5" />
            Credibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center pt-4">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={progressCircleStyle}
              >
                <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className={cn("text-4xl font-bold", scoreColor)}>
                      {score}
                    </div>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 text-sm text-muted-foreground">
                        {trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Based on recent payment history
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Score is calculated based on payment history and reliability
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
