import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Brain, TrendingUp, TrendingDown, AlertCircle, Loader2, Scale } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ScenarioAnalysis = () => {
  const { data: scenarios, isLoading, error } = useQuery({
    queryKey: ["financial-scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_scenarios")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load scenarios");
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <div className="text-xl font-semibold">Analyzing Scenarios</div>
            <p className="text-muted-foreground">
              Our AI is processing financial data to generate insights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-xl font-semibold">Error Loading Scenarios</div>
            <p className="text-muted-foreground">
              Please try again later or contact support if the problem persists.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scenarios?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-12">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold">No Scenarios Available</div>
            <p className="text-muted-foreground">
              Click "New Scenario" to create your first financial scenario analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Financial Impact Analysis */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Financial Impact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>ROI</span>
                        <span className={scenario.projected_outcomes.roi_percentage > 0 ? "text-green-600" : "text-red-600"}>
                          {scenario.projected_outcomes.roi_percentage?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Profit</span>
                        <span>{formatCurrency(scenario.projected_outcomes.net_profit || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Risk Assessment
                    </h4>
                    <div className="space-y-2 text-sm">
                      {scenario.assumptions && Object.entries(scenario.assumptions).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Metrics Impact */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Key Metrics
                    </h4>
                    <div className="space-y-2">
                      {scenario.projected_outcomes && Object.entries(scenario.projected_outcomes)
                        .filter(([key]) => !['roi_percentage', 'net_profit'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                            <span>{typeof value === 'number' ? formatCurrency(value) : value}</span>
                          </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              scenario.recommendation && (
                <div key={scenario.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Brain className="h-5 w-5 mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold mb-1">{scenario.name}</h4>
                    <p className="text-muted-foreground text-sm">{scenario.recommendation}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};