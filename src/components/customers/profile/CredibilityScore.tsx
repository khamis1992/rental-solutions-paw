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
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("customer_id", customerId)
        .maybeSingle();

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

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'low':
        return "This customer has a strong payment history and presents minimal risk.";
      case 'medium':
        return "Some caution advised. Consider additional verification or deposit.";
      case 'high':
        return "High risk level. Additional guarantees or deposits may be required.";
      default:
        return "Risk level assessment pending.";
    }
  };

  const ScoreIcon = assessment ? getScoreIcon(assessment.payment_score) : Shield;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScoreIcon className={`h-5 w-5 ${assessment ? getScoreColor(assessment.payment_score) : ''}`} />
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

            <Alert variant={assessment.risk_level === 'high' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getRiskDescription(assessment.risk_level)}
              </AlertDescription>
            </Alert>

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

            {assessment.total_penalties > 0 && (
              <div className="mt-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="text-sm font-medium text-yellow-800">Total Penalties</div>
                <div className="text-xl text-yellow-900">${assessment.total_penalties.toFixed(2)}</div>
              </div>
            )}

            {assessment.notes && (
              <div className="text-sm text-muted-foreground mt-4 p-4 bg-muted rounded-lg">
                <div className="font-medium mb-1">Assessment Notes</div>
                {assessment.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No risk assessment available for this customer yet.</p>
            <p className="text-sm mt-1">Assessment will be generated after their first payment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};