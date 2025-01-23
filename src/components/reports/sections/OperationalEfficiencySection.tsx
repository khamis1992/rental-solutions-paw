import { Card, CardContent } from "@/components/ui/card";
import { FleetOptimizationMetrics } from "../operational/FleetOptimizationMetrics";
import { MaintenanceCostAnalysis } from "../operational/MaintenanceCostAnalysis";
import { ResourceUtilization } from "../operational/ResourceUtilization";
import { ServiceLevelTracking } from "../operational/ServiceLevelTracking";

export const OperationalEfficiencySection = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FleetOptimizationMetrics />
        <MaintenanceCostAnalysis />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ResourceUtilization />
        <ServiceLevelTracking />
      </div>
    </div>
  );
};