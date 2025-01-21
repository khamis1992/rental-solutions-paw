import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="flex-1 pt-[var(--header-height,56px)] pl-4">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};