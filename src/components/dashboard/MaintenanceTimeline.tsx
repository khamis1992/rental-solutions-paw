import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Wrench } from "lucide-react";

interface MaintenanceEvent {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduled_date: string;
  completed_date: string | null;
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
  };
}

export const MaintenanceTimeline = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["maintenance-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('scheduled_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as MaintenanceEvent[];
    }
  });

  if (isLoading) {
    return <div>Loading maintenance timeline...</div>;
  }

  const maintenanceEvents = events || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Recent Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maintenanceEvents.length === 0 ? (
            <p className="text-muted-foreground">No recent maintenance events</p>
          ) : (
            maintenanceEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 border-l-2 border-muted pl-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        event.status === 'completed' ? 'default' :
                        event.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {event.status}
                      </Badge>
                      <span className="font-medium">{event.service_type}</span>
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {formatDateToDisplay(event.scheduled_date)}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  {event.vehicle && (
                    <p className="text-sm">
                      Vehicle: {event.vehicle.make} {event.vehicle.model} ({event.vehicle.license_plate})
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};