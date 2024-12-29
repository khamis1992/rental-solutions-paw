import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFinesDashboard } from "@/components/traffic-fines/TrafficFinesDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function TrafficFines() {
  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Traffic Fines Management</h1>
        </div>
        <ErrorBoundary>
          <TrafficFinesDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}