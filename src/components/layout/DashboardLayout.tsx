import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="relative flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="flex-1">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};