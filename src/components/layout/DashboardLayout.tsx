import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Always visible on desktop */}
      <div className="fixed left-0 top-0 z-40 h-full w-64">
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-background p-8">
          <div className="mx-auto max-w-6xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};