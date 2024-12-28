import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinancialMetricsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  percentageChange?: number;
}

export const FinancialMetricsCard = ({
  title,
  value,
  previousValue,
  percentageChange,
}: FinancialMetricsCardProps) => {
  const isPositive = percentageChange && percentageChange > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {percentageChange && (
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-xs">{Math.abs(percentageChange).toFixed(1)}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        {previousValue && (
          <p className="text-xs text-muted-foreground">
            Previous: {formatCurrency(previousValue)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};