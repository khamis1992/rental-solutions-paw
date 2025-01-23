import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const DashboardStats = lazy(() => import("@/components/dashboard/DashboardStats").then(module => ({ default: module.DashboardStats })));
const DashboardAlerts = lazy(() => import("@/components/dashboard/DashboardAlerts").then(module => ({ default: module.DashboardAlerts })));
const WelcomeHeader = lazy(() => import("@/components/dashboard/WelcomeHeader").then(module => ({ default: module.WelcomeHeader })));
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity").then(module => ({ default: module.RecentActivity })));
const SystemChatbot = lazy(() => import("@/components/chat/SystemChatbot").then(module => ({ default: module.SystemChatbot })));

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

const Index = () => {
  usePerformanceMonitoring();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 h-[56px] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50" />
        
        {/* Main Content */}
        <div className="pt-[56px] pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col gap-6">
              {/* Welcome Section */}
              <div className="w-full mt-6">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
                    <div className="bg-[#9b87f5] text-white rounded-lg p-6 shadow-lg">
                      <WelcomeHeader />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>

              {/* Stats Section */}
              <div className="w-full">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <DashboardStats />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              {/* Alerts Section */}
              <div className="w-full">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Alerts" />}>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                      <DashboardAlerts />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              {/* Activity and Chatbot Section */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                      <div className="bg-white rounded-lg shadow-md p-6 h-[500px] overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <RecentActivity />
                      </div>
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <Suspense fallback={<ComponentLoader componentName="System Chatbot" />}>
                      <div className="bg-white rounded-lg shadow-md p-6 h-[500px] overflow-hidden hover:shadow-lg transition-shadow duration-200">
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