import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusDistribution } from "./CaseStatusDistribution";
import { CaseTypeBreakdown } from "./CaseTypeBreakdown";
import { SettlementMetrics } from "./SettlementMetrics";
import { CaseTimeline } from "./CaseTimeline";
import { CaseOutcomePredictions } from "./CaseOutcomePredictions";
import { TrendAnalysis } from "./TrendAnalysis";

export const LegalAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Legal Analytics Dashboard</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <CaseStatusDistribution />
        <CaseTypeBreakdown />
      </div>
      
      <TrendAnalysis />
      
      <CaseOutcomePredictions />
      
      <div className="grid gap-6 md:grid-cols-2">
        <SettlementMetrics />
        <CaseTimeline />
      </div>
    </div>
  );
};