import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerProfileManagement } from "@/components/customers/CustomerProfileManagement";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import { UserActivityMonitor } from "@/components/monitoring/UserActivityMonitor";
import { DashboardTutorial } from "@/components/onboarding/DashboardTutorial";

const lazyLoadComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => 
    importFn().catch(error => {
      console.error(`Error loading ${componentName}:`, error);
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
const QuickActions = lazyLoadComponent(
  () => import("@/components/dashboard/QuickActions").then(module => ({ default: module.QuickActions })),
  "QuickActions"
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
  const [showTutorial, setShowTutorial] = useState(false);
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  useEffect(() => {
    const isTutorialCompleted = localStorage.getItem('tutorial-dashboard-main-completed');
    if (!isTutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 px-2 py-6 w-full max-w-[1920px] mx-auto">
        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Welcome Header" />}>
            <div id="dashboard-header">
              <WelcomeHeader />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Dashboard Stats" />}>
            <div id="dashboard-stats">
              <DashboardStats />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Quick Actions" />}>
            <div id="quick-actions">
              <QuickActions />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Customer Profiles" />}>
            <CustomerProfileManagement />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="User Activity Monitor" />}>
            <UserActivityMonitor />
          </Suspense>
        </ErrorBoundary>

        <div className="grid gap-8 lg:grid-cols-7">
          <div className="lg:col-span-7">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader componentName="Dashboard Alerts" />}>
                <div id="dashboard-alerts">
                  <DashboardAlerts />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader componentName="Recent Activity" />}>
                <div id="recent-activity">
                  <RecentActivity />
                </div>
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

        <ErrorBoundary>
          <Suspense fallback={<ComponentLoader componentName="Audit Logs" />}>
            <AuditLogViewer />
          </Suspense>
        </ErrorBoundary>

        {showTutorial && <DashboardTutorial />}
      </div>
    </DashboardLayout>
  );
};

export default Index;
