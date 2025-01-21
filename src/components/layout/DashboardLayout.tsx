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
      <div className="relative flex min-h-screen w-full bg-background-alt">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1200px]">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};