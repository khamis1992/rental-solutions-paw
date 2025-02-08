
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnomalyMonitoring } from "@/components/analytics/AnomalyMonitoring";

const DashboardStats = lazy(() => import("@/components/dashboard/DashboardStats").then(module => ({ default: module.DashboardStats })));
const DashboardAlerts = lazy(() => import("@/components/dashboard/DashboardAlerts").then(module => ({ default: module.DashboardAlerts })));
const WelcomeHeader = lazy(() => import("@/components/dashboard/WelcomeHeader").then(module => ({ default: module.WelcomeHeader })));
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity").then(module => ({ default: module.RecentActivity })));
const SystemChatbot = lazy(() => import("@/components/chat/SystemChatbot").then(module => ({ default: module.SystemChatbot })));

const ComponentLoader = ({ componentName }: { componentName: string }) => (
  <div className="w-full space-y-4 p-4">
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

const Index = () => {
  usePerformanceMonitoring();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="fixed top-0 left-0 right-0 h-[var(--mobile-header-height)] sm:h-[var(--header-height)] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50" />
        
        <div className="pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Welcome Header Section */}
              <div className="w-full mt-4 sm:mt-6">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
                    <WelcomeHeader />
                  </Suspense>
                </ErrorBoundary>
              </div>

              {/* Dashboard Stats Section - Mobile Optimized with Snap Scroll */}
              <div className="snap-x snap-mandatory -mx-4 px-4 pb-4 overflow-x-auto flex sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 scroll-smooth touch-pan-x">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
                    <DashboardStats />
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              {/* Monitoring Section - Stacked on Mobile */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Anomaly Monitoring" />}>
                    <div className="glass transition-transform hover:scale-[1.01] active:scale-[0.99]">
                      <AnomalyMonitoring />
                    </div>
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Alerts" />}>
                    <div className="glass transition-transform hover:scale-[1.01] active:scale-[0.99]">
                      <DashboardAlerts />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              {/* Activity and Chatbot Section - Full Width on Mobile */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                      <div className="glass transition-transform hover:scale-[1.01] active:scale-[0.99]">
                        <RecentActivity />
                      </div>
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="System Chatbot" />}>
                      <div className="glass transition-transform hover:scale-[1.01] active:scale-[0.99]">
                        <SystemChatbot />
                      </div>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
