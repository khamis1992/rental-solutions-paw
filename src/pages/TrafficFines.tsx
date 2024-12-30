import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFinesDashboard } from "@/components/traffic-fines/TrafficFinesDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function TrafficFines() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <ErrorBoundary>
          <TrafficFinesDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}