
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="flex-1 pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
            <div className="py-4 sm:py-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
