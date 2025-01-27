import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ScenarioAnalysis = () => {
  const [currentScenario, setCurrentScenario] = useState({
    name: "",
    description: "",
    assumptions: {} as Record<string, number>,
  });

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

  const handleAssumptionChange = (key: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setCurrentScenario((prev) => ({
        ...prev,
        assumptions: {
          ...prev.assumptions,
          [key]: numValue,
        },
      }));
    }
  };

  const analyzeScenario = async () => {
    try {
      const { data, error } = await supabase.from("financial_scenarios").insert([
        {
          name: currentScenario.name,
          description: currentScenario.description,
          assumptions: currentScenario.assumptions,
          projected_outcomes: {
            revenue: Object.values(currentScenario.assumptions).reduce(
              (sum, val) => sum + (typeof val === "number" ? val : 0),
              0
            ),
          },
        },
      ]);

      if (error) throw error;
      toast.success("Scenario analyzed successfully");
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      toast.error("Failed to analyze scenario");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scenario Name</Label>
          <Input
            value={currentScenario.name}
            onChange={(e) =>
              setCurrentScenario((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter scenario name"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={currentScenario.description}
            onChange={(e) =>
              setCurrentScenario((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe the scenario"
          />
        </div>

        <div className="space-y-4">
          <Label>Assumptions</Label>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Label>Revenue Growth (%)</Label>
              <Input
                type="number"
                onChange={(e) =>
                  handleAssumptionChange("revenueGrowth", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label>Cost Reduction (%)</Label>
              <Input
                type="number"
                onChange={(e) =>
                  handleAssumptionChange("costReduction", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <Button onClick={analyzeScenario}>Analyze Scenario</Button>

        {scenarios && scenarios.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Previous Scenarios</h3>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id}>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{scenario.name}</h4>
                    <p className="text-sm text-gray-500">
                      {scenario.description}
                    </p>
                    {typeof scenario.projected_outcomes === "object" && (
                      <p className="mt-2">
                        Projected Revenue:{" "}
                        {(scenario.projected_outcomes as any).revenue?.toFixed(2)}{" "}
                        QAR
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};