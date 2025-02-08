import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceAlerts } from "@/components/maintenance/MaintenanceAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">Maintenance</h1>
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