import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFineImport } from "@/components/traffic-fines/TrafficFineImport";
import { RawTrafficFinesList } from "@/components/traffic-fines/RawTrafficFinesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function TrafficFines() {
  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Traffic Fines Management</h1>
        </div>
        <ErrorBoundary>
          <TrafficFineImport />
          <RawTrafficFinesList />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}