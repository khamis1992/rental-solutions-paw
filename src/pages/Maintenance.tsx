
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceAlerts } from "@/components/maintenance/MaintenanceAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Settings, Wrench } from "lucide-react";
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
      <div className="container mx-auto space-y-6 px-4 py-6 sm:py-8">
        {/* Header Section with Enhanced Mobile Gradient */}
        <div className="rounded-lg bg-gradient-to-r from-orange-50/90 to-orange-100/90 dark:from-orange-900/20 dark:to-orange-800/20 p-4 sm:p-6 shadow-sm backdrop-blur-sm border border-orange-100/50 dark:border-orange-900/50">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Title and Breadcrumb - Mobile Optimized */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Dashboard</span>
                <ChevronRight className="h-4 w-4 hidden sm:inline" />
                <span>Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-primary animate-fade-in" />
                <h1 className="text-2xl sm:text-3xl font-bold">Maintenance</h1>
              </div>
            </div>
            
            {/* Quick Actions - Touch Optimized */}
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="default"
                      className="h-10 w-10 p-2 touch-target glass-hover"
                    >
                      <Settings className="h-5 w-5" />
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
        
        <div className="animate-fade-in">
          <MaintenanceStats maintenanceData={maintenanceData || []} />
        </div>
        
        <div className="space-y-6">
          <MaintenanceAlerts />
          <MaintenanceList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
