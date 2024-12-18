import { FileCheck, FileClock, FileX, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AgreementStats = () => {
  const { data: stats = { active: 0, pending: 0, expired: 0, total: 0 } } = useQuery({
    queryKey: ['agreement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('status');

      if (error) {
        console.error('Error fetching agreement stats:', error);
        throw error;
      }

      const counts = {
        active: 0,
        pending: 0,
        expired: 0,
        total: data.length
      };

      data.forEach((lease) => {
        if (lease.status === 'open') {
          counts.active++;
        } else if (lease.status === 'closed') {
          counts.expired++;
        } else if (['pending_payment', 'pending_deposit'].includes(lease.status)) {
          counts.pending++;
        }
      });

      return counts;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value={stats.active.toString()}
        icon={FileCheck}
        description="Currently active rentals"
      />
      <StatsCard
        title="Pending Agreements"
        value={stats.pending.toString()}
        icon={FileClock}
        description="Awaiting processing"
      />
      <StatsCard
        title="Expired Agreements"
        value={stats.expired.toString()}
        icon={FileX}
        description="Need attention"
      />
      <StatsCard
        title="Total Agreements"
        value={stats.total.toString()}
        icon={FileText}
        description="All time"
      />
    </div>
  );
};