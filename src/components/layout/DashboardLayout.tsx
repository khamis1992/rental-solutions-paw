
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className={cn(
        "relative flex min-h-screen w-full",
        "bg-background text-foreground"
      )}>
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className={cn(
            "flex-1",
            "pt-[var(--header-height,56px)]",
            "px-4 md:px-6 lg:px-8",
            "mx-auto max-w-7xl",
            "space-y-6"
          )}>
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
