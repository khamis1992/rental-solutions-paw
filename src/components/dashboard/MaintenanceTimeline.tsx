import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Wrench, Clock, AlertTriangle } from "lucide-react";

interface MaintenanceEvent {
  id: string;
  vehicle_id: string;
  service_type: string;
  status: string;
  scheduled_date: string;
  description?: string;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  };
}

interface MaintenanceTimelineProps {
  events: MaintenanceEvent[];
}

export const MaintenanceTimeline = ({ events }: MaintenanceTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Wrench className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-shrink-0">{getStatusIcon(event.status)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{event.service_type}</p>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
            {event.vehicles && (
              <p className="text-sm text-muted-foreground">
                {event.vehicles.make} {event.vehicles.model} ({event.vehicles.license_plate})
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {formatDateToDisplay(new Date(event.scheduled_date))}
            </p>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No maintenance events scheduled
        </div>
      )}
    </div>
  );
};