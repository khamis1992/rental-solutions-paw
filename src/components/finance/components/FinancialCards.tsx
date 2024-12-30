import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type FinancialCardsProps = {
  totalRevenue: number;
  totalExpenses: number;
  isLoading?: boolean;
  error?: Error | null;
};

export const FinancialCards = ({ 
  totalRevenue, 
  totalExpenses, 
  isLoading, 
  error 
}: FinancialCardsProps) => {
  const renderCardContent = (value: number, isLoading?: boolean, error?: Error | null) => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (error) {
      return <span className="text-red-600">Error loading data</span>;
    }
    return <div className="text-2xl font-bold">{formatCurrency(value)}</div>;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {renderCardContent(totalRevenue, isLoading, error)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {renderCardContent(totalExpenses, isLoading, error)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {renderCardContent(totalRevenue - totalExpenses, isLoading, error)}
        </CardContent>
      </Card>
    </div>
  );
};