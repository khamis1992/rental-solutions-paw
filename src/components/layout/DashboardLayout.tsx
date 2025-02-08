
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar />
        <div className={cn(
          "flex-1 transition-all duration-300",
          isMobile ? "w-full" : "w-[calc(100%-var(--sidebar-width))]"
        )}>
          <DashboardHeader />
          <main className="flex-1 pt-[var(--header-height,56px)] px-4 md:px-6 lg:px-8 mx-auto max-w-7xl">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
