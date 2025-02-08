import { FileCheck, FileClock, FileX, FileText } from "lucide-react";
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
    staleTime: 30000, // Cache for 30 seconds
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value={stats?.active.toString() || "0"}
        icon={FileCheck}
        description="Currently active rentals"
      />
      <StatsCard
        title="Pending Agreements"
        value={stats?.pending.toString() || "0"}
        icon={FileClock}
        description="Awaiting processing"
      />
      <StatsCard
        title="Closed Agreements"
        value={stats?.closed.toString() || "0"}
        icon={FileX}
        description="Completed rentals"
      />
      <StatsCard
        title="Total Agreements"
        value={stats?.total.toString() || "0"}
        icon={FileText}
        description="All time"
      />
    </div>
  );
};