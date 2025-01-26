import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Agreement } from "@/types/agreement.types";

interface BreakEvenAnalysisProps {
  agreements: Agreement[] | undefined;
  isLoading: boolean;
}

export const BreakEvenAnalysis = ({ agreements, isLoading }: BreakEvenAnalysisProps) => {
  const [pricePerUnit, setPricePerUnit] = useState<number>(150); // Default daily rental rate
  const [variableCost, setVariableCost] = useState<number>(100); // Default variable cost per vehicle
  const [fixedCosts, setFixedCosts] = useState<number>(10000); // Default monthly fixed costs

  const calculateBreakEven = useCallback(() => {
    if (pricePerUnit === variableCost) return { units: 0, revenue: 0 };
    const breakEvenUnits = fixedCosts / (pricePerUnit - variableCost);
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    return {
      units: Math.ceil(breakEvenUnits),
      revenue: breakEvenRevenue
    };
  }, [pricePerUnit, variableCost, fixedCosts]);

  const { units, revenue } = calculateBreakEven();

  const handleInputChange = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setter(value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Break-Even Analysis Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Daily Rental Rate (QAR)</Label>
            <Input
              id="pricePerUnit"
              type="number"
              value={pricePerUnit}
              onChange={handleInputChange(setPricePerUnit)}
              placeholder="Enter daily rental rate"
            />
            <p className="text-sm text-muted-foreground">
              The daily rate you charge for renting a vehicle
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variableCost">Variable Cost per Vehicle (QAR)</Label>
            <Input
              id="variableCost"
              type="number"
              value={variableCost}
              onChange={handleInputChange(setVariableCost)}
              placeholder="Enter variable cost per vehicle"
            />
            <p className="text-sm text-muted-foreground">
              Daily costs that vary with each rental (maintenance, insurance, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedCosts">Monthly Fixed Costs (QAR)</Label>
            <Input
              id="fixedCosts"
              type="number"
              value={fixedCosts}
              onChange={handleInputChange(setFixedCosts)}
              placeholder="Enter monthly fixed costs"
            />
            <p className="text-sm text-muted-foreground">
              Monthly costs that don't change with rentals (rent, salaries, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Break-Even Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Break-Even Point (Rentals)</p>
            <p className="text-2xl font-bold">{units} rentals</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Break-Even Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              You need to rent {units} vehicles at {formatCurrency(pricePerUnit)} per day
              to cover your monthly costs of {formatCurrency(fixedCosts)}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};