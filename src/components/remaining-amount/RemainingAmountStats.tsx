import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function RemainingAmountStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['remaining-amounts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remaining_amounts')
        .select('rent_amount, final_price, amount_paid, remaining_amount');

      if (error) throw error;

      const totalRentAmount = data.reduce((sum, item) => sum + (item.rent_amount || 0), 0);
      const totalFinalPrice = data.reduce((sum, item) => sum + (item.final_price || 0), 0);
      const totalAmountPaid = data.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
      const totalRemainingAmount = data.reduce((sum, item) => sum + (item.remaining_amount || 0), 0);

      return {
        totalRentAmount,
        totalFinalPrice,
        totalAmountPaid,
        totalRemainingAmount,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Rent Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalRentAmount || 0)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Final Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalFinalPrice || 0)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Amount Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.totalAmountPaid || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Remaining Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats?.totalRemainingAmount || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}