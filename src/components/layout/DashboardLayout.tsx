import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { AuthGuard } from "../auth/AuthGuard";

export function DashboardLayout() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}