import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react"; // Changed from Timeline to History
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";

interface VehicleTimelineProps {
  vehicleId: string;
}

export const VehicleTimeline = ({ vehicleId }: VehicleTimelineProps) => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["vehicle-timeline", vehicleId],
    queryFn: async () => {
      // Fetch maintenance records
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Fetch rental records (leases)
      const { data: rentals, error: rentalsError } = await supabase
        .from("leases")
        .select(`
          *,
          profiles:customer_id (
            full_name
          )
        `)
        .eq("vehicle_id", vehicleId)
        .order("start_date", { ascending: false });

      if (rentalsError) throw rentalsError;

      // Fetch damage records
      const { data: damages, error: damagesError } = await supabase
        .from("damages")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (damagesError) throw damagesError;

      // Combine and sort all events
      const allEvents = [
        ...(maintenance?.map(m => ({
          ...m,
          type: 'maintenance',
          date: m.scheduled_date,
        })) || []),
        ...(rentals?.map(r => ({
          ...r,
          type: 'rental',
          date: r.start_date,
        })) || []),
        ...(damages?.map(d => ({
          ...d,
          type: 'damage',
          date: d.reported_date,
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return allEvents;
    },
  });

  if (isLoading) {
    return <div>Loading timeline...</div>;
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      case 'rental':
        return <Badge variant="default">Rental</Badge>;
      case 'damage':
        return <Badge variant="destructive">Damage</Badge>;
      default:
        return null;
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case 'maintenance':
        return `${event.service_type} - ${event.status}`;
      case 'rental':
        return `Rented to ${event.profiles?.full_name} - ${event.status}`;
      case 'damage':
        return event.description;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Vehicle Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={`${event.type}-${event.id}`} className="flex items-start gap-4 border-l-2 border-muted pl-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventBadge(event.type)}
                    <p className="text-sm font-medium">{getEventDescription(event)}</p>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {formatDateToDisplay(new Date(event.date))}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};