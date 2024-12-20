import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star, TrendingUp } from "lucide-react";

export const CustomerAnalytics = () => {
  const { data: customerData } = useQuery({
    queryKey: ["customer-analytics"],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from("profiles")
        .select(`
          *,
          leases (
            id,
            start_date
          )
        `);

      if (error) throw error;
      return customers;
    },
  });

  const totalCustomers = customerData?.length || 0;
  const retentionRate = 85; // Simulated retention rate
  const satisfaction = 4.8; // Simulated satisfaction score

  // Calculate month-over-month growth
  const growth = 5.2; // Simulated growth rate

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={Users}
          description={`+${growth}% from last month`}
          className="bg-white"
        />
        <StatsCard
          title="Customer Retention"
          value={`${retentionRate}%`}
          icon={TrendingUp}
          description="+2.1% from last month"
          className="bg-white"
        />
        <StatsCard
          title="Customer Satisfaction"
          value={`${satisfaction}/5`}
          icon={Star}
          description="+0.3 from last month"
          className="bg-white"
        />
      </div>
    </div>
  );
};