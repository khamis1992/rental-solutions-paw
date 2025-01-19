import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { AuthGuard } from "../auth/AuthGuard";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <div className="flex-1">
            <DashboardHeader />
            <main className="p-4">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}