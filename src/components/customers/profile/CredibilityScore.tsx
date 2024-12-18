import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface CredibilityScoreProps {
  customerId: string;
}

export const CredibilityScore = ({ customerId }: CredibilityScoreProps) => {
  const { data: assessment, isLoading } = useQuery({
    queryKey: ["customer-risk-assessment", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("customer_id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading credibility score...</div>;

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

  const ScoreIcon = assessment ? getScoreIcon(assessment.payment_score) : Shield;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScoreIcon className="h-5 w-5" />
          Credibility Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assessment ? (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  assessment.payment_score
                )}`}
              >
                {assessment.payment_score}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Risk Level: {assessment.risk_level.charAt(0).toUpperCase() + assessment.risk_level.slice(1)}
              </div>
            </div>

            <Progress
              value={assessment.payment_score}
              className="h-2"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-medium">Late Payments</div>
                <div className="text-2xl">{assessment.late_payment_count}</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-medium">Missed Payments</div>
                <div className="text-2xl">{assessment.missed_payment_count}</div>
              </div>
            </div>

            {assessment.notes && (
              <div className="text-sm text-muted-foreground">
                Notes: {assessment.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No risk assessment available
          </div>
        )}
      </CardContent>
    </Card>
  );
};