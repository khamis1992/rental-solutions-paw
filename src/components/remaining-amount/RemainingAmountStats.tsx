import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export function RemainingAmountStats() {
  const { data: stats } = useQuery({
    queryKey: ['remaining-amounts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remaining_amounts')
        .select('remaining_amount, amount_paid, final_price');

      if (error) throw error;

      const totalRemaining = data.reduce((sum, item) => sum + (item.remaining_amount || 0), 0);
      const totalPaid = data.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
      const totalValue = data.reduce((sum, item) => sum + (item.final_price || 0), 0);

      return {
        totalRemaining,
        totalPaid,
        totalValue,
        count: data.length
      };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(stats?.totalRemaining || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(stats?.totalPaid || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(stats?.totalValue || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{stats?.count || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}