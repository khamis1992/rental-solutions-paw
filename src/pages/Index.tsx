
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnomalyMonitoring } from "@/components/analytics/AnomalyMonitoring";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard.types";

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

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-stats');
      if (error) throw error;
      return data as DashboardStats;
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-[var(--mobile-header-height)] sm:h-[var(--header-height)] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50" />
        
        <div className="pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="w-full mt-4 sm:mt-6">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
                    <WelcomeHeader />
                  </Suspense>
                </ErrorBoundary>
              </div>

              <div className="snap-x snap-mandatory -mx-4 px-4 pb-4 overflow-x-auto flex sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
                    <DashboardStats stats={stats || {
                      total_vehicles: 0,
                      available_vehicles: 0,
                      rented_vehicles: 0,
                      maintenance_vehicles: 0,
                      total_customers: 0,
                      active_rentals: 0,
                      monthly_revenue: 0
                    }} />
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Anomaly Monitoring" />}>
                    <AnomalyMonitoring />
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary>
                  <Suspense fallback={<ComponentLoader componentName="Dashboard Alerts" />}>
                    <DashboardAlerts />
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
