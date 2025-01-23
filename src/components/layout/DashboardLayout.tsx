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
          <main className="flex-1 pt-[calc(var(--header-height,56px)+4rem)] px-6 md:px-8 lg:px-10 mx-auto max-w-7xl">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};