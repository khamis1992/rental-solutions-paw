import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  useEffect(() => {
    console.log("DashboardLayout mounted - Navigation structure initialized");
    
    // Verify Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1);
          
        if (error) {
          console.error("Supabase connection error:", error);
        } else {
          console.log("Supabase connection verified:", !!data);
        }
      } catch (err) {
        console.error("Failed to verify Supabase connection:", err);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};