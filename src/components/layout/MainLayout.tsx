"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebar } from "@/components/ui/sidebar/sidebar-context";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <DashboardSidebar />
      <div className={`transition-sidebar ${open ? "ml-64" : "ml-16"}`}>
        <DashboardHeader onMenuClick={() => setOpen(!open)} />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </>
  );
};