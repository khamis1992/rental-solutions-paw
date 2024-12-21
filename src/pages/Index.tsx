import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components
const DashboardStats = lazy(() => import("@/components/dashboard/DashboardStats"));
const UpcomingRentals = lazy(() => import("@/components/dashboard/UpcomingRentals"));
const DashboardAlerts = lazy(() => import("@/components/dashboard/DashboardAlerts"));
const QuickActions = lazy(() => import("@/components/dashboard/QuickActions"));
const WelcomeHeader = lazy(() => import("@/components/dashboard/WelcomeHeader"));
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity"));
const SystemChatbot = lazy(() => import("@/components/chat/SystemChatbot"));

// Loading fallback component
const ComponentLoader = () => (
  <div className="w-full h-[200px] flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

const Index = () => {
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:px-6 md:py-8">
        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader />}>
            <WelcomeHeader />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader />}>
            <DashboardStats />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader />}>
            <QuickActions />
          </Suspense>
        </ErrorBoundary>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 lg:gap-8">
          <div className="lg:col-span-4">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <UpcomingRentals />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-3">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <DashboardAlerts />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 lg:gap-8">
          <div className="lg:col-span-4">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <RecentActivity />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-3">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <SystemChatbot />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;