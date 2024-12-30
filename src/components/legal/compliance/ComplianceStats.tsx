import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ComplianceStatsProps {
  items: any[];
}

export const ComplianceStats = ({ items }: ComplianceStatsProps) => {
  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === 'completed').length;
  const overdueItems = items.filter(
    item => item.status === 'pending' && new Date(item.due_date) < new Date()
  ).length;
  const pendingItems = totalItems - completedItems - overdueItems;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Pending Items"
        value={pendingItems.toString()}
        icon={Clock}
        description="Upcoming compliance tasks"
        className="bg-white"
      />
      <StatsCard
        title="Completed Items"
        value={completedItems.toString()}
        icon={CheckCircle}
        description="Successfully completed"
        className="bg-white"
      />
      <StatsCard
        title="Overdue Items"
        value={overdueItems.toString()}
        icon={AlertTriangle}
        description="Require immediate attention"
        className="bg-white text-red-500"
      />
    </div>
  );
};