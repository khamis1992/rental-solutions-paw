import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTimeline } from "./MaintenanceTimeline";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin } from "lucide-react";

interface Schedule {
  id: string;
  vehicle_id: string;
  customer_id: string;
  schedule_type: 'pickup' | 'dropoff';
  scheduled_time: string;
  location_address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  vehicles: {
    make: string;
    model: string;
    license_plate: string;
  };
  profiles: {
    full_name: string;
    phone_number: string;
  };
}

export const IntelligentScheduling = () => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['vehicle-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_schedules')
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          ),
          profiles (
            full_name,
            phone_number
          )
        `)
        .order('scheduled_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as Schedule[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Upcoming Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules?.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center gap-4 p-4 rounded-lg border"
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">
                    {schedule.vehicles.make} {schedule.vehicles.model}
                  </h4>
                  <Badge variant="outline">{schedule.vehicles.license_plate}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {schedule.profiles.full_name} • {schedule.schedule_type}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {schedule.location_address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={getStatusColor(schedule.status)}>
                  {schedule.status}
                </Badge>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(schedule.scheduled_time).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};