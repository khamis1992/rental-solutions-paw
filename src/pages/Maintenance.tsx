
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceAlerts } from "@/components/maintenance/MaintenanceAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Settings, Tools } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Maintenance = () => {
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
      }

      return data || [];
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-8">
        {/* Header Section with Gradient */}
        <div className="rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 p-6 shadow-sm">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Title and Breadcrumb */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span>Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tools className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Maintenance</h1>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maintenance Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <MaintenanceStats maintenanceData={maintenanceData || []} />
        
        <div className="space-y-6">
          <MaintenanceAlerts />
          <MaintenanceList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
