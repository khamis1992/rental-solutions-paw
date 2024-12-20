import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function DashboardLayout() {
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
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}