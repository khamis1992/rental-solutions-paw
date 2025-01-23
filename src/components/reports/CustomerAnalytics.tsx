import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerAnalytics = () => {
  const { data: customerData, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </>
    );
  }

  const totalCustomers = customerData?.length || 0;
  const retentionRate = 85; // Simulated retention rate
  const satisfaction = 4.8; // Simulated satisfaction score
  const growth = 5.2; // Simulated growth rate

  return (
    <>
      <StatsCard
        title="Total Customers"
        value={totalCustomers.toLocaleString()}
        icon={Users}
        description={`+${growth}% from last month`}
        className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
        iconClassName="text-blue-500"
      />
      <StatsCard
        title="Customer Retention"
        value={`${Math.round(retentionRate)}%`}
        icon={TrendingUp}
        description="+2.1% from last month"
        className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
        iconClassName="text-green-500"
      />
      <StatsCard
        title="Customer Satisfaction"
        value={`${satisfaction}/5`}
        icon={Star}
        description="+0.3 from last month"
        className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
        iconClassName="text-yellow-500"
      />
    </>
  );
};