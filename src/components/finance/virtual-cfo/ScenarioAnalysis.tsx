import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      {scenarios?.map((scenario) => (
        <Card key={scenario.id}>
          <CardHeader>
            <CardTitle>{scenario.name}</CardTitle>
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
                  {Object.entries(scenario.assumptions).map(([key, value]) => (
                    <li key={key} className="text-muted-foreground">
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Projected Outcomes</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(scenario.projected_outcomes).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg bg-muted">
                      <p className="text-sm font-medium">{key}</p>
                      <p className="text-2xl font-bold">
                        {typeof value === "number" ? formatCurrency(value) : value}
                      </p>
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
      {!scenarios?.length && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No financial scenarios available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};