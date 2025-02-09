
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isPositive = percentageChange > 0;

  return (
    <Card 
      className={cn(
        className,
        "transition-all duration-300 ease-in-out",
        "hover:shadow-lg",
        isMobile ? "touch-pan-y active:scale-[0.98]" : "hover:scale-[1.02]"
      )}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-2 md:space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-xl md:text-2xl font-bold">
              {formatCurrency(value)}
            </div>
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              "rounded-full px-2 py-1",
              isPositive ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
            )}>
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
