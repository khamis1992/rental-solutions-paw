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
          <main className="px-4 md:px-6 lg:px-8 py-8">
            <div className="mx-auto max-w-[1200px] min-h-screen">
              <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4">
                  {children || <Outlet />}
                </div>
                <div className="lg:col-span-3">
                  {/* Sidebar content goes here */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};