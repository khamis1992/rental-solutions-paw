import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ExpenseAnalysis = () => {
  const { data: expenseAnalysis, isError, isLoading } = useQuery({
    queryKey: ["expense-analysis"],
    queryFn: async () => {
      // First check if table exists and has data
      const { data: existingData, error: existingError } = await supabase
        .from("expense_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (existingError) throw existingError;

      // If no data exists, let's create some sample data
      if (!existingData || existingData.length === 0) {
        const sampleData = [
          {
            category: "Vehicle Maintenance",
            amount: 25000,
            frequency: "Monthly",
            recommendation: "Consider preventive maintenance schedule to reduce costs",
            potential_savings: 5000,
            priority: "high"
          },
          {
            category: "Fuel Costs",
            amount: 15000,
            frequency: "Monthly",
            recommendation: "Implement fuel efficiency monitoring system",
            potential_savings: 3000,
            priority: "medium"
          },
          {
            category: "Insurance",
            amount: 35000,
            frequency: "Quarterly",
            recommendation: "Review insurance policies for better rates",
            potential_savings: 7000,
            priority: "low"
          }
        ];

        const { data: insertedData, error: insertError } = await supabase
          .from("expense_analysis")
          .insert(sampleData)
          .select();

        if (insertError) throw insertError;
        return insertedData;
      }

      return existingData;
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading expense analysis...</div>;
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Failed to load expense analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenseAnalysis?.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {analysis.category}
              </CardTitle>
              {analysis.priority === "high" ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : analysis.priority === "medium" ? (
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analysis.amount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.frequency}
              </p>
              {analysis.recommendation && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {analysis.recommendation}
                </p>
              )}
              {analysis.potential_savings > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  Potential savings: {formatCurrency(analysis.potential_savings)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};