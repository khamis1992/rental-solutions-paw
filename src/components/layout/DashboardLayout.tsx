import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="relative flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="flex-1 pt-[calc(var(--header-height,56px)+2rem)] px-4 md:px-6 lg:px-8 mx-auto max-w-7xl">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};