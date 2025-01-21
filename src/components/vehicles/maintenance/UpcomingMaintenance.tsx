import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingMaintenanceProps {
  vehicleId: string;
}

export const UpcomingMaintenance = ({ vehicleId }: UpcomingMaintenanceProps) => {
  const { data: upcomingMaintenance, isLoading } = useQuery({
    queryKey: ["upcoming-maintenance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_predictions")
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .eq("vehicle_id", vehicleId)
        .order("predicted_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

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

  return (
    <div className="space-y-4">
      {upcomingMaintenance?.map((prediction) => (
        <div key={prediction.id} className="flex items-start gap-4 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{prediction.prediction_type}</p>
              <Badge 
                variant={prediction.priority === 'high' ? 'destructive' : 'outline'}
              >
                {prediction.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Due: {formatDateToDisplay(new Date(prediction.predicted_date))}
            </p>
            {prediction.recommended_services?.map((service: string, index: number) => (
              <p key={index} className="text-sm text-muted-foreground">
                • {service}
              </p>
            ))}
            {prediction.estimated_cost && (
              <p className="text-sm font-medium">
                Estimated Cost: {prediction.estimated_cost} QAR
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};