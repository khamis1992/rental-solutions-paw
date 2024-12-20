import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
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
  );
}