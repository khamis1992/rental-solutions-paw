
import { FileCheck, Clock, Archive, ChartBar } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AgreementStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['agreements-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const counts = {
        active: 0,
        closed: 0,
        pending: 0,
        total: 0
      };

      if (data) {
        data.forEach((item) => {
          counts.total++;
          switch (item.status) {
            case 'active':
              counts.active++;
              break;
            case 'closed':
              counts.closed++;
              break;
            case 'pending_deposit':
            case 'pending_payment':
              counts.pending++;
              break;
          }
        });
      }

      return counts;
    },
    staleTime: 30000,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value={stats?.active.toString() || "0"}
        icon={FileCheck}
        description="Currently active rentals"
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-md transition-shadow"
        iconClassName="text-emerald-600 dark:text-emerald-400"
      />
      <StatsCard
        title="Pending Agreements"
        value={stats?.pending.toString() || "0"}
        icon={Clock}
        description="Awaiting processing"
        className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:shadow-md transition-shadow"
        iconClassName="text-amber-600 dark:text-amber-400"
      />
      <StatsCard
        title="Closed Agreements"
        value={stats?.closed.toString() || "0"}
        icon={Archive}
        description="Completed rentals"
        className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 hover:shadow-md transition-shadow"
        iconClassName="text-blue-600 dark:text-blue-400"
      />
      <StatsCard
        title="Total Agreements"
        value={stats?.total.toString() || "0"}
        icon={ChartBar}
        description="All time"
        className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:shadow-md transition-shadow"
        iconClassName="text-purple-600 dark:text-purple-400"
      />
    </div>
  );
};
