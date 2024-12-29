import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const DashboardStats = lazy(() => 
  import("@/components/dashboard/DashboardStats").then(module => ({ default: module.DashboardStats }))
);

const WelcomeHeader = lazy(() => 
  import("@/components/dashboard/WelcomeHeader").then(module => ({ default: module.WelcomeHeader }))
);

const Index = () => {
  usePerformanceMonitoring();

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 py-6 max-w-7xl mx-auto">
        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
            <WelcomeHeader />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
            <DashboardStats />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

const ComponentLoader = ({ componentName }: { componentName: string }) => (
  <div className="w-full h-[200px] space-y-4 p-4">
    <div className="h-4 w-1/4">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
    <div className="h-[160px]">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
    <div className="text-sm text-muted-foreground text-center">
      Loading {componentName}...
    </div>
  </div>
);

export default Index;