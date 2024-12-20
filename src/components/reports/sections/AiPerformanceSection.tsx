import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { AiAnalyticsInsights } from "@/components/analytics/AiAnalyticsInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export const AiPerformanceSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AiAnalyticsInsights />
          <PerformanceInsights />
        </CardContent>
      </Card>
    </div>
  );
};