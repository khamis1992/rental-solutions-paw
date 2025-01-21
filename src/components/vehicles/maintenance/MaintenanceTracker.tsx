import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTimeline } from "./MaintenanceTimeline";
import { MaintenanceStats } from "./MaintenanceStats";
import { UpcomingMaintenance } from "./UpcomingMaintenance";

interface MaintenanceTrackerProps {
  vehicleId: string;
}

export const MaintenanceTracker = ({ vehicleId }: MaintenanceTrackerProps) => {
  const { data: maintenanceHistory, isLoading } = useQuery({
    queryKey: ["maintenance-history", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          maintenance_categories (name),
          vehicle_parts (
            part_name,
            part_number,
            quantity,
            unit_cost
          )
        `)
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <MaintenanceStats maintenanceData={maintenanceHistory || []} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceTimeline 
              maintenanceHistory={maintenanceHistory || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingMaintenance vehicleId={vehicleId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};