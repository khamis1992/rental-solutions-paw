import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

const lazyLoadComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => 
    importFn().catch(error => {
      console.error(`Error loading ${componentName}:`, error);
      toast.error(`Failed to load ${componentName}. Please refresh the page.`);
      return Promise.reject(error);
    })
  );
};

const DashboardStats = lazyLoadComponent(
  () => import("@/components/dashboard/DashboardStats").then(module => ({ default: module.DashboardStats })),
  "DashboardStats"
);
const DashboardAlerts = lazyLoadComponent(
  () => import("@/components/dashboard/DashboardAlerts").then(module => ({ default: module.DashboardAlerts })),
  "DashboardAlerts"
);
const WelcomeHeader = lazyLoadComponent(
  () => import("@/components/dashboard/WelcomeHeader").then(module => ({ default: module.WelcomeHeader })),
  "WelcomeHeader"
);
const RecentActivity = lazyLoadComponent(
  () => import("@/components/dashboard/RecentActivity").then(module => ({ default: module.RecentActivity })),
  "RecentActivity"
);
const SystemChatbot = lazyLoadComponent(
  () => import("@/components/chat/SystemChatbot").then(module => ({ default: module.SystemChatbot })),
  "SystemChatbot"
);

const Index = () => {
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  return (
    <DashboardLayout>
      <div className="space-y-8 px-2 py-6 w-full max-w-[1920px] mx-auto">
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
        
        <div className="grid gap-8 lg:grid-cols-7">
          <div className="lg:col-span-7">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader componentName="Dashboard Alerts" />}>
                <DashboardAlerts />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                <RecentActivity />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-3">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader componentName="System Chatbot" />}>
                <SystemChatbot />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
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