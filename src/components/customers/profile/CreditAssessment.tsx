import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, DollarSign, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditAssessmentProps {
  customerId: string;
}

export const CreditAssessment = ({ customerId }: CreditAssessmentProps) => {
  const { data: assessment, isLoading } = useQuery({
    queryKey: ["credit-assessment", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_assessments")
        .select("*")
        .eq("customer_id", customerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No credit assessment available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Credit Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Monthly Income</div>
            </div>
            <div className="text-2xl mt-1">
              ${assessment.monthly_income.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Employment</div>
            </div>
            <div className="text-2xl mt-1 capitalize">
              {assessment.employment_status.replace("_", " ")}
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Debt Ratio</div>
            </div>
            <div className="text-2xl mt-1">
              {assessment.debt_to_income_ratio
                ? `${(assessment.debt_to_income_ratio * 100).toFixed(1)}%`
                : "N/A"}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Credit Score</div>
          <div className="text-3xl font-bold">{assessment.credit_score}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(assessment.assessment_date).toLocaleDateString()}
          </div>
        </div>

        {assessment.notes && (
          <div className="mt-4 p-4 rounded-lg bg-muted">
            <div className="text-sm font-medium mb-1">Notes</div>
            <div className="text-sm text-muted-foreground">{assessment.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};