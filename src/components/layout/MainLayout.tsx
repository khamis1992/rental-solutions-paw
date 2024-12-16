"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className={`transition-sidebar ${sidebarOpen ? "ml-64" : "ml-16"}`}>
          <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="container mx-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};