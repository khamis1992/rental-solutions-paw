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
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Remaining</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalRemaining || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalPaid || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue || 0)}</div>
        </CardContent>
      </Card>
      
      <Card className="p-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Agreements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{stats?.count || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}