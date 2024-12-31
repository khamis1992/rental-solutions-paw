import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Target, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const CaseOutcomePredictions = () => {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['case-outcome-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_outcome_predictions')
        .select(`
          *,
          legal_cases (
            case_type,
            amount_owed,
            status
          )
        `)
        .order('prediction_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Case Outcome Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = predictions?.map(prediction => ({
    caseType: prediction.legal_cases?.case_type || 'Unknown',
    successProbability: Math.round(prediction.success_probability * 100),
    predictedCost: prediction.predicted_cost
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Case Outcome Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="caseType" />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'Success Probability (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Predicted Cost', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'successProbability') return `${value}%`;
                    if (name === 'predictedCost') return formatCurrency(value as number);
                    return value;
                  }}
                />
                <Bar yAxisId="left" dataKey="successProbability" fill="#8884d8" name="Success Probability" />
                <Bar yAxisId="right" dataKey="predictedCost" fill="#82ca9d" name="Predicted Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {predictions?.map((prediction) => (
              <Card key={prediction.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {prediction.legal_cases?.case_type} Case
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Predicted Duration: {prediction.predicted_duration} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {prediction.success_probability >= 0.7 ? (
                        <div className="text-green-500 font-semibold">
                          {Math.round(prediction.success_probability * 100)}% Success Rate
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-500 gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {Math.round(prediction.success_probability * 100)}% Success Rate
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      Est. Cost: {formatCurrency(prediction.predicted_cost)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};