import { FileCheck, FileClock, FileX, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const AgreementStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value="89"
        icon={FileCheck}
        description="Currently active rentals"
      />
      <StatsCard
        title="Pending Agreements"
        value="12"
        icon={FileClock}
        description="Awaiting processing"
      />
      <StatsCard
        title="Expired Agreements"
        value="5"
        icon={FileX}
        description="Need attention"
      />
      <StatsCard
        title="Total Agreements"
        value="432"
        icon={FileText}
        description="All time"
      />
    </div>
  );
};