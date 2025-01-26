import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Agreement } from "@/types/agreement.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BreakEvenAnalysisProps {
  agreements: Agreement[] | undefined;
  isLoading: boolean;
}

export const BreakEvenAnalysis = ({ agreements, isLoading }: BreakEvenAnalysisProps) => {
  const [pricePerUnit, setPricePerUnit] = useState<number>(150); // Default monthly rental rate
  const [variableCost, setVariableCost] = useState<number>(100); // Default monthly variable cost
  const [fixedCosts, setFixedCosts] = useState<number>(10000);

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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Break-Even Analysis Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="pricePerUnit">Monthly Rental Rate (QAR)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The monthly rate you charge for renting a vehicle</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="pricePerUnit"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              placeholder="Enter monthly rental rate"
            />
            <p className="text-sm text-muted-foreground">
              The monthly rate you charge for renting a vehicle
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="variableCost">Monthly Variable Cost per Vehicle (QAR)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Monthly costs that vary with each rental (maintenance, insurance, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="variableCost"
              type="number"
              value={variableCost}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              placeholder="Enter monthly variable cost per vehicle"
            />
            <p className="text-sm text-muted-foreground">
              Monthly costs that vary with each rental (maintenance, insurance, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="fixedCosts">Monthly Fixed Costs (QAR)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Monthly costs that don't change with number of rentals (rent, salaries, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="fixedCosts"
              type="number"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
              placeholder="Enter monthly fixed costs"
            />
            <p className="text-sm text-muted-foreground">
              Monthly costs that don't change with number of rentals (rent, salaries, etc.)
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
              You need to rent {units} vehicles at {formatCurrency(pricePerUnit)} per month
              to cover your monthly costs of {formatCurrency(fixedCosts)}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};