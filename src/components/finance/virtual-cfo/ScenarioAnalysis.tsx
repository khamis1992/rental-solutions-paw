import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Brain, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export const ScenarioAnalysis = () => {
  const { data: scenarios } = useQuery({
    queryKey: ["financial-scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!scenarios?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold">No Scenarios Available</div>
            <p className="text-muted-foreground">
              Financial scenarios will appear here once they are created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {scenarios?.map((scenario) => (
        <Card key={scenario.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scenario.name}
              {scenario.recommendation && (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{scenario.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Assumptions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(scenario.assumptions || {}).map(([key, value]) => (
                    <li key={key} className="text-muted-foreground">
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Projected Outcomes</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(scenario.projected_outcomes || {}).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg bg-muted">
                      <p className="text-sm font-medium">{key}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                          {typeof value === "number" ? formatCurrency(value) : value}
                        </p>
                        {typeof value === "number" && value > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {scenario.recommendation && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-muted-foreground">{scenario.recommendation}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};