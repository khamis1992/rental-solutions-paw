import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinancialMetricsCardProps {
  title: string;
  value: number;
  previousValue: number;
  percentageChange: number;
  className?: string;
}

export const FinancialMetricsCard = ({
  title,
  value,
  previousValue,
  percentageChange,
  className
}: FinancialMetricsCardProps) => {
  const isPositive = percentageChange > 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {formatCurrency(value)}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(percentageChange).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            vs. previous month ({formatCurrency(previousValue)})
          </p>
        </div>
      </CardContent>
    </Card>
  );
};