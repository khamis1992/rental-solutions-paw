import { FileCheck, FileClock, FileX, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type LeaseStatus = Database['public']['Enums']['lease_status'];

export const AgreementStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['agreements-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('status, count', { count: 'exact', head: true })
        .in('status', ['active', 'closed', 'pending_deposit', 'pending_payment']);

      if (error) throw error;

      const counts = {
        active: 0,
        closed: 0,
        pending: 0,
        total: 0
      };

      data?.forEach((item: any) => {
        const status = item.status?.toLowerCase();
        if (status === 'active') counts.active++;
        else if (status === 'closed') counts.closed++;
        else if (status === 'pending_deposit' || status === 'pending_payment') {
          counts.pending++;
        }
        counts.total++;
      });

      return counts;
    },
    staleTime: 30000, // Cache for 30 seconds
    cacheTime: 60000, // Keep in cache for 1 minute
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