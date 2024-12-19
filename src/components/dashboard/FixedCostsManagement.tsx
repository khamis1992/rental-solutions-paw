import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  created_at: string;
}

export const FixedCostsManagement = () => {
  const [newCostName, setNewCostName] = useState("");
  const [newCostAmount, setNewCostAmount] = useState("");

  const { data: fixedCosts = [], refetch: refetchCosts } = useQuery({
    queryKey: ["fixed-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as FixedCost[];
    },
  });

  const { data: monthlyRevenue = 0 } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", startOfMonth.toISOString())
        .eq("status", "completed");

      return (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
    },
  });

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const netIncome = monthlyRevenue - totalFixedCosts;
  const isNegativeBalance = netIncome < 0;

  const handleAddCost = async () => {
    if (!newCostName || !newCostAmount) {
      toast.error("Please fill in both name and amount");
      return;
    }

    const amount = parseFloat(newCostAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const { error } = await supabase
      .from("fixed_costs")
      .insert([{ name: newCostName, amount }]);

    if (error) {
      toast.error("Failed to add fixed cost");
      return;
    }

    toast.success("Fixed cost added successfully");
    setNewCostName("");
    setNewCostAmount("");
    refetchCosts();
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Fixed Costs & Income Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add Fixed Cost</h3>
            <div className="flex gap-4">
              <Input
                placeholder="Cost name (e.g., Rent)"
                value={newCostName}
                onChange={(e) => setNewCostName(e.target.value)}
              />
              <Input
                placeholder="Amount"
                type="number"
                value={newCostAmount}
                onChange={(e) => setNewCostAmount(e.target.value)}
              />
              <Button onClick={handleAddCost}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {fixedCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{cost.name}</span>
                  <span>{formatCurrency(cost.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Monthly Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2">
                <span>Monthly Revenue</span>
                <span className="font-medium">{formatCurrency(monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span>Total Fixed Costs</span>
                <span className="font-medium text-destructive">
                  -{formatCurrency(totalFixedCosts)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 border-t">
                <span>Net Income</span>
                <span className={`font-bold ${isNegativeBalance ? 'text-destructive' : 'text-emerald-600'}`}>
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>

            {isNegativeBalance && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-medium">Negative Balance Alert</h4>
                </div>
                <p className="text-sm text-muted-foreground">Recommendations:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                  <li>Review and optimize vehicle rental rates</li>
                  <li>Identify opportunities to reduce fixed costs</li>
                  <li>Improve vehicle utilization rates</li>
                  <li>Consider implementing seasonal pricing strategies</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};