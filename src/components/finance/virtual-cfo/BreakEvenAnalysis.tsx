import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export const BreakEvenAnalysis = () => {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(100);
  const [pricePerUnit, setPricePerUnit] = useState(150);

  const { data: breakEvenData, isLoading } = useQuery({
    queryKey: ["break-even", fixedCosts, variableCostPerUnit, pricePerUnit],
    queryFn: async () => {
      // Generate break-even analysis data points
      const dataPoints = [];
      const contributionMargin = pricePerUnit - variableCostPerUnit;
      const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);

      for (let units = 0; units <= breakEvenUnits * 2; units += Math.ceil(breakEvenUnits / 10)) {
        const revenue = units * pricePerUnit;
        const totalCosts = fixedCosts + (units * variableCostPerUnit);
        const profit = revenue - totalCosts;

        dataPoints.push({
          units,
          revenue,
          totalCosts,
          profit
        });
      }

      return {
        breakEvenUnits,
        breakEvenRevenue: breakEvenUnits * pricePerUnit,
        dataPoints
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break-Even Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="fixedCosts">Fixed Costs (QAR)</Label>
            <Input
              id="fixedCosts"
              type="number"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="variableCosts">Variable Cost per Unit (QAR)</Label>
            <Input
              id="variableCosts"
              type="number"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="price">Price per Unit (QAR)</Label>
            <Input
              id="price"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm">
            Break-even Point: {breakEvenData?.breakEvenUnits.toLocaleString()} units
          </p>
          <p className="text-sm">
            Break-even Revenue: {formatCurrency(breakEvenData?.breakEvenRevenue || 0)}
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breakEvenData?.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="units"
                label={{ value: 'Units', position: 'insideBottom', offset: -5 }}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4ade80" />
              <Line type="monotone" dataKey="totalCosts" name="Total Costs" stroke="#f43f5e" />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#60a5fa" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};