import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ClipboardList, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export const LeaseToOwn = () => {
  const { data: leaseData } = useQuery({
    queryKey: ["lease-to-own-analysis"],
    queryFn: async () => {
      const { data: leases, error } = await supabase
        .from("leases")
        .select("*")
        .eq("agreement_type", "lease_to_own");

      if (error) throw error;
      return leases;
    },
  });

  const activeLeases = leaseData?.filter(lease => lease.status === 'active').length || 0;
  const closedLeases = leaseData?.filter(lease => lease.status === 'closed').length || 0;
  const cancelledLeases = leaseData?.filter(lease => lease.status === 'cancelled').length || 0;
  const totalValue = leaseData?.reduce((sum, lease) => sum + lease.total_amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Active Leases"
          value={activeLeases.toString()}
          icon={ClipboardList}
          className="bg-white"
        />
        <StatsCard
          title="Closed"
          value={closedLeases.toString()}
          icon={CheckCircle}
          className="bg-white"
        />
        <StatsCard
          title="Cancelled"
          value={cancelledLeases.toString()}
          icon={AlertTriangle}
          className="bg-white"
        />
        <StatsCard
          title="Total Value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          className="bg-white"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lease Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaseData?.map(lease => ({
                date: new Date(lease.created_at).toLocaleDateString(),
                value: lease.total_amount
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  name="Lease Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};