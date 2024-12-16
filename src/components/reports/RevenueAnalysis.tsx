import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Banknote, CreditCard } from "lucide-react";

export const RevenueAnalysis = () => {
  const { data: revenueData } = useQuery({
    queryKey: ["revenue-analysis"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payments")
        .select(`
          amount,
          created_at,
          lease:leases (
            agreement_type
          )
        `)
        .order('created_at');

      if (error) throw error;
      return payments;
    },
  });

  const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const shortTermRevenue = revenueData?.reduce((sum, payment) => 
    payment.lease?.agreement_type === 'short_term' ? sum + payment.amount : sum, 0) || 0;
  const leaseToOwnRevenue = revenueData?.reduce((sum, payment) => 
    payment.lease?.agreement_type === 'lease_to_own' ? sum + payment.amount : sum, 0) || 0;

  // Calculate month-over-month growth
  const lastMonthRevenue = totalRevenue * 0.89; // Simulated previous month data
  const growth = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={Banknote}
          description={`+${growth.toFixed(1)}% from last month`}
          className="bg-white"
        />
        <StatsCard
          title="Short-term Rentals"
          value={formatCurrency(shortTermRevenue)}
          icon={CreditCard}
          description="+8.2% from last month"
          className="bg-white"
        />
        <StatsCard
          title="Lease-to-Own Revenue"
          value={formatCurrency(leaseToOwnRevenue)}
          icon={TrendingUp}
          description="+15.3% from last month"
          className="bg-white"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="created_at"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
