import { KPIDashboard } from "../KPIDashboard/KPIDashboard";
import { AutomatedInsights } from "../BusinessIntelligence/AutomatedInsights";
import { PerformanceBenchmarks } from "../BusinessIntelligence/PerformanceBenchmarks";

export const BusinessIntelligenceSection = () => {
  return (
    <div className="space-y-6">
      <KPIDashboard />
      <div className="grid gap-6 lg:grid-cols-2">
        <AutomatedInsights />
        <PerformanceBenchmarks />
      </div>
    </div>
  );
};