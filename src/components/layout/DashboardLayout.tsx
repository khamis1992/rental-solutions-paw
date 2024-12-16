import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container max-w-7xl mx-auto p-6 h-[calc(100vh-4rem)]">
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};