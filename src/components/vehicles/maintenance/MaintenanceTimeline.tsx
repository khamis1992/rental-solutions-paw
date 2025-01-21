import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceTimelineProps {
  maintenanceHistory: any[];
  isLoading: boolean;
}

export const MaintenanceTimeline = ({ maintenanceHistory, isLoading }: MaintenanceTimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {maintenanceHistory.map((record) => (
        <div key={record.id} className="flex items-start gap-4 p-4 rounded-lg border">
          <div className="flex-shrink-0">{getStatusIcon(record.status)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{record.service_type}</p>
              <Badge variant="outline">{record.maintenance_categories?.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateToDisplay(new Date(record.scheduled_date))}
            </p>
            {record.cost && (
              <p className="text-sm font-medium">Cost: {formatCurrency(record.cost)}</p>
            )}
            {record.description && (
              <p className="text-sm text-muted-foreground">{record.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};