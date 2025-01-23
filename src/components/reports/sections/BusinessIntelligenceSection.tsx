import { KPIDashboard } from "../KPIDashboard/KPIDashboard";
import { AutomatedInsights } from "../BusinessIntelligence/AutomatedInsights";

export const BusinessIntelligenceSection = () => {
  return (
    <div className="space-y-6">
      <KPIDashboard />
      <AutomatedInsights />
    </div>
  );
};