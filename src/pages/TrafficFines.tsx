import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFinesDashboard } from "@/components/traffic-fines/TrafficFinesDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ManualTrafficFineDialog } from "@/components/traffic-fines/ManualTrafficFineDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function TrafficFines() {
  const queryClient = useQueryClient();

  const handleFineAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["traffic-fines-count"] });
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Traffic Fines Management</h1>
            <ManualTrafficFineDialog onFineAdded={handleFineAdded} />
          </div>
        </div>
        <ErrorBoundary>
          <TrafficFinesDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}