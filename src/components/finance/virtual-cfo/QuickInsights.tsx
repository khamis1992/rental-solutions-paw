
import { Card, CardContent } from "@/components/ui/card";
import { Agreement } from "@/types/agreement.types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface QuickInsightsProps {
  agreements: Agreement[] | null;
  isLoading: boolean;
}

export const QuickInsights = ({ agreements, isLoading }: QuickInsightsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalRevenue = agreements?.reduce((sum, agreement) => sum + (agreement.rent_amount || 0), 0) || 0;
  const totalValue = agreements?.reduce((sum, agreement) => sum + (agreement.total_amount || 0), 0) || 0;
  const averageRent = agreements?.length ? totalRevenue / agreements.length : 0;

  const insights = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: totalRevenue > 0 ? "up" : "down",
      percentage: "12.5%",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-900/30"
    },
    {
      title: "Total Contract Value",
      value: formatCurrency(totalValue),
      icon: TrendingUp,
      trend: "up",
      percentage: "8.2%",
      gradient: "from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-900/30"
    },
    {
      title: "Average Rent",
      value: formatCurrency(averageRent),
      icon: AlertTriangle,
      trend: "down",
      percentage: "3.1%",
      gradient: "from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-900/30"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {insights.map((insight, index) => (
        <Card 
          key={index}
          className="overflow-hidden transition-all duration-200 hover:shadow-lg"
        >
          <CardContent className={`p-6 bg-gradient-to-br ${insight.gradient}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">
                {insight.title}
              </div>
              <insight.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {insight.value}
              </div>
              <div className="flex items-center text-sm">
                {insight.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={insight.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {insight.percentage}
                </span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
