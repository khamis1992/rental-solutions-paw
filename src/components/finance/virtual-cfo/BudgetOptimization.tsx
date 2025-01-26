import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BudgetOptimization = () => {
  const [targetBudget, setTargetBudget] = useState<number>(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { data: analysis } = useQuery({
    queryKey: ["budget-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_analysis")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data[0];
    },
    enabled: showRecommendations,
  });

  const handleAnalyze = () => {
    setShowRecommendations(true);
  };

  const calculateSavings = (current: number, recommended: number) => {
    return Math.max(0, current - recommended);
  };

  const currentTotal = analysis ? Number(analysis.amount) : 0;
  const potentialSavings = analysis ? Number(analysis.potential_savings) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Target Budget (QAR)</label>
              <Input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
                placeholder="Enter target budget"
                className="mt-1"
              />
            </div>
            <Button onClick={handleAnalyze}>Analyze Budget</Button>
          </div>
        </CardContent>
      </Card>

      {showRecommendations && analysis && (
        <div className="space-y-4">
          {currentTotal > targetBudget && (
            <Alert variant="destructive">
              <AlertDescription>
                Current spending exceeds target budget by{" "}
                {formatCurrency(currentTotal - targetBudget)}
              </AlertDescription>
            </Alert>
          )}

          {analysis.recommendation && (
            <Alert>
              <AlertDescription>{analysis.recommendation}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(potentialSavings)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};