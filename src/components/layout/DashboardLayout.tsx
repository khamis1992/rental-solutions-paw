import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultCollapsed={isMobile}>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex pt-[var(--header-height,56px)]">
          <DashboardSidebar />
          <main className="flex-1 overflow-x-hidden p-2 md:p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};