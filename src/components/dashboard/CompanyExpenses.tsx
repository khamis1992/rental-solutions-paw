import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Database } from "@/integrations/supabase/types";

type FixedCost = Database["public"]["Tables"]["fixed_costs"]["Row"];
type VariableCost = Database["public"]["Tables"]["variable_costs"]["Row"];

export const CompanyExpenses = () => {
  const [newFixedCostName, setNewFixedCostName] = useState("");
  const [newFixedCostAmount, setNewFixedCostAmount] = useState("");
  const [newVariableCostName, setNewVariableCostName] = useState("");
  const [newVariableCostAmount, setNewVariableCostAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: fixedCosts = [], refetch: refetchFixedCosts } = useQuery({
    queryKey: ["fixed-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: variableCosts = [], refetch: refetchVariableCosts } = useQuery({
    queryKey: ["variable-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("variable_costs")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const triggerAIAnalysis = async (costType: 'fixed' | 'variable', amount: number, name: string) => {
    try {
      const { data: insights, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          type: costType,
          amount,
          name,
          totalFixedCosts,
          totalVariableCosts
        },
      });

      if (error) throw error;

      // Update financial insights
      await supabase
        .from('financial_insights')
        .insert([{
          category: 'expense_analysis',
          insight: insights.message,
          priority: insights.priority,
          data_points: {
            costType,
            amount,
            name,
            timestamp: new Date().toISOString()
          }
        }]);

      // Invalidate relevant queries to refresh AI Accountant data
      queryClient.invalidateQueries({ queryKey: ['financial-insights'] });
      queryClient.invalidateQueries({ queryKey: ['financial-forecasts'] });
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
    }
  };

  const handleAddFixedCost = async () => {
    if (!newFixedCostName || !newFixedCostAmount) {
      toast.error("Please fill in both name and amount");
      return;
    }

    const amount = parseFloat(newFixedCostAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const { error } = await supabase
      .from("fixed_costs")
      .insert([{ name: newFixedCostName, amount }]);

    if (error) {
      toast.error("Failed to add fixed cost");
      return;
    }

    toast.success("Fixed cost added successfully");
    setNewFixedCostName("");
    setNewFixedCostAmount("");
    refetchFixedCosts();
    
    // Trigger AI analysis for the new fixed cost
    await triggerAIAnalysis('fixed', amount, newFixedCostName);
  };

  const handleAddVariableCost = async () => {
    if (!newVariableCostName || !newVariableCostAmount) {
      toast.error("Please fill in both name and amount");
      return;
    }

    const amount = parseFloat(newVariableCostAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const { error } = await supabase
      .from("variable_costs")
      .insert([{ name: newVariableCostName, amount }]);

    if (error) {
      toast.error("Failed to add variable cost");
      return;
    }

    toast.success("Variable cost added successfully");
    setNewVariableCostName("");
    setNewVariableCostAmount("");
    refetchVariableCosts();
    
    // Trigger AI analysis for the new variable cost
    await triggerAIAnalysis('variable', amount, newVariableCostName);
  };

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariableCosts = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalCosts = totalFixedCosts + totalVariableCosts;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Company Expenses Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fixed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fixed">Fixed Costs</TabsTrigger>
            <TabsTrigger value="variable">Variable Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="fixed" className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Cost name (e.g., Rent)"
                value={newFixedCostName}
                onChange={(e) => setNewFixedCostName(e.target.value)}
              />
              <Input
                placeholder="Amount"
                type="number"
                value={newFixedCostAmount}
                onChange={(e) => setNewFixedCostAmount(e.target.value)}
              />
              <Button onClick={handleAddFixedCost}>Add Fixed Cost</Button>
            </div>
            
            <div className="space-y-2">
              {fixedCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{cost.name}</span>
                  <span>{formatCurrency(cost.amount)}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="variable" className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Cost name (e.g., Utilities)"
                value={newVariableCostName}
                onChange={(e) => setNewVariableCostName(e.target.value)}
              />
              <Input
                placeholder="Amount"
                type="number"
                value={newVariableCostAmount}
                onChange={(e) => setNewVariableCostAmount(e.target.value)}
              />
              <Button onClick={handleAddVariableCost}>Add Variable Cost</Button>
            </div>
            
            <div className="space-y-2">
              {variableCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{cost.name}</span>
                  <span>{formatCurrency(cost.amount)}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 space-y-4 border-t pt-4">
          <div className="flex justify-between items-center p-2">
            <span className="font-medium">Total Fixed Costs</span>
            <span className="font-medium text-destructive">
              -{formatCurrency(totalFixedCosts)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="font-medium">Total Variable Costs</span>
            <span className="font-medium text-destructive">
              -{formatCurrency(totalVariableCosts)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 border-t">
            <span className="font-bold">Total Expenses</span>
            <span className="font-bold text-destructive">
              -{formatCurrency(totalCosts)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};