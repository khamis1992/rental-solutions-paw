import { TrafficFinesList } from "./TrafficFinesList";
import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineAuditLogs } from "./TrafficFineAuditLogs";

export const TrafficFinesDashboard = () => {
  return (
    <div className="space-y-6">
      <TrafficFineStats />
      <TrafficFinesList />
      <TrafficFineAuditLogs />
    </div>
  );
};