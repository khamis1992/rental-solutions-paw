import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KPICardProps {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
}

export const KPICard = ({ name, currentValue, targetValue, unit, category }: KPICardProps) => {
  const progress = (currentValue / targetValue) * 100;
  const isOnTrack = currentValue >= targetValue;

  const formatValue = (value: number) => {
    if (unit === 'QAR') {
      return formatCurrency(value);
    }
    return `${value}${unit === '%' ? '%' : ` ${unit}`}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {name}
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">
            {formatValue(currentValue)}
          </span>
          {isOnTrack ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Target: {formatValue(targetValue)}
          </p>
        </div>
        <div className="mt-2">
          <span className="text-xs px-2 py-1 rounded-full bg-muted">
            {category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};