import { Outlet, useLocation } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/auth';

  if (isAuthRoute) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        <ErrorBoundary>
          <DashboardSidebar />
        </ErrorBoundary>
        
        <div className="flex flex-col lg:pl-72">
          <ErrorBoundary>
            <DashboardHeader />
          </ErrorBoundary>
          
          <main className="flex-1 py-10">
            <ErrorBoundary>
              {children || <Outlet />}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}