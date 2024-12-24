import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFinesList } from "./TrafficFinesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function TrafficFinesDashboard() {
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <TrafficFineStats />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <TrafficFineImport />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <TrafficFinesList />
      </ErrorBoundary>
    </div>
  );
}