import { StatsCard } from "./StatsCard";
import { Car, Wrench, AlertTriangle } from "lucide-react";
import { AccidentStats } from "./AccidentStats";

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Available Vehicles"
        value="24"
        icon={Car}
        iconClassName="text-[#9b87f5]"
        className="bg-[#9b87f5]/10"
      />
      <StatsCard
        title="In Maintenance"
        value="7"
        icon={Wrench}
        iconClassName="text-[#F97316]"
        className="bg-[#F97316]/10"
      />
      <StatsCard
        title="Needs Attention"
        value="3"
        icon={AlertTriangle}
        iconClassName="text-[#ea384c]"
        className="bg-[#ea384c]/10"
      />
      <AccidentStats />
    </div>
  );
};