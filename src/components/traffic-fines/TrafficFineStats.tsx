import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const TrafficFineStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["traffic-fines-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('fine_amount');

      if (error) throw error;

      const totalAmount = data.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
      const totalFines = data.length;

      return {
        totalAmount,
        totalFines
      };
    },
  });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
          <p className="text-2xl font-bold">{stats?.totalFines || 0}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
        </div>
      </Card>
    </div>
  );
};