import { FileCheck, FileClock, FileX, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type LeaseStatus = Database['public']['Enums']['lease_status'];

export const AgreementStats = () => {
  const { data: agreements = [] } = useQuery({
    queryKey: ['agreements-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('status');

      if (error) throw error;
      return data;
    },
  });

  const closedAgreements = agreements.filter(agreement => 
    agreement.status === 'closed'
  ).length;

  const activeAgreements = agreements.filter(agreement => 
    agreement.status === 'active'
  ).length;

  const pendingAgreements = agreements.filter(agreement => 
    agreement.status === 'pending'
  ).length;

  const totalAgreements = agreements.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value={activeAgreements.toString()}
        icon={FileCheck}
        description="Currently active rentals"
      />
      <StatsCard
        title="Pending Agreements"
        value={pendingAgreements.toString()}
        icon={FileClock}
        description="Awaiting processing"
      />
      <StatsCard
        title="Closed Agreements"
        value={closedAgreements.toString()}
        icon={FileX}
        description="Completed rentals"
      />
      <StatsCard
        title="Total Agreements"
        value={totalAgreements.toString()}
        icon={FileText}
        description="All time"
      />
    </div>
  );
};