import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { useAuthState } from "@/hooks/use-auth-state";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";

export default function Index() {
  const { userRole, isLoading } = useAuthState();

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  // Render different dashboard based on user role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'staff') {
    return <StaffDashboard />;
  }

  // Default dashboard for other roles
  return (
    <div className="container mx-auto p-6 space-y-6">
      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-24" />}>
          <WelcomeHeader />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-48" />}>
          <QuickActions />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <DashboardStats />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}